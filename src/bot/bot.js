const {
    Client,
    Routes,
    GatewayIntentBits,
    EmbedBuilder,
    ActivityType,
} = require("discord.js");
const { REST } = require('@discordjs/rest');
const mongoose = require("mongoose");
const path = require("path");
const fs = require("fs");

const config = require("../config.js");
const client = new Client({
    intents: [
        GatewayIntentBits.Guilds,
        GatewayIntentBits.DirectMessages
    ]
});

let commandMap = new Map();

/**
 * @description Loads all available commands
 */
function loadCommands() {
    const commandsPath = path.join(__dirname, 'interactions');
    const commandFiles = fs.readdirSync(commandsPath).filter(file => file.endsWith('.js'));

    for (const file of commandFiles) {
        try {
            const filePath = path.join(commandsPath, file);
            const command = require(filePath);
            commandMap.set(command.data.name, command);
            console.log(`[Deliver]: Loaded command '${command.data.name}.js'`);
        } catch (err) {
            console.log(err);
        }
    }
}

/**
 * @description Loads all slash commands
 */
function deployCommands() {
    const commands = [];
    const commandsPath = path.join(__dirname, 'interactions');
    const commandFiles = fs.readdirSync(commandsPath).filter(file => file.endsWith('.js'));

    for (const file of commandFiles) {
        const filePath = path.join(commandsPath, file);
        const command = require(filePath);
        commands.push(command.data.toJSON());
    }

    const rest = new REST({ version: '9' }).setToken(config.token);

    rest.put(Routes.applicationGuildCommands(client.user.id, config.guild), { body: commands }).then(() => {
        console.log('[Deliver]: Successfully registered application commands.')
    }).catch((err) => {
        console.log(err)
    });
}

client.on("ready", () => {
    console.log("[Deliver]: Client Ready");
    console.log(`[Deliver]: Shard ${client.shard.ids[0]} online`);

    // status
    // 0: hubs, 1: verified users, 2: purchases, 3: website
    let statusNumber = 0;

    setInterval(() => {
        switch (statusNumber) {
            case 0:
                client.user.setPresence({ activities: [{ name: `over -1 hubs`, type: ActivityType.Watching }] });
                break;
            case 1:
                client.user.setPresence({ activities: [{ name: `over ${client.shard.ids[0]} shards`, type: ActivityType.Watching }] });
                break;
            case 2:
                client.user.setPresence({ activities: [{ name: `over deliverrbx.com`, type: ActivityType.Watching }] });
                break;
        }

        statusNumber = statusNumber + 1 > 2 ? 0 : statusNumber + 1;
    }, 5000);
});

client.on("interactionCreate", (interaction) => {
    if (interaction.isCommand()) {
        if (commandMap.has(interaction.commandName)) {
            try {
                const command = commandMap.get(interaction.commandName);

                // execute
                command.execute(interaction, interaction.member, client);
            } catch (e) {
                console.log(`Error in command ${interaction.commandName} (or middleware): ${e}`);
                interaction.reply({
                    embeds: [
                        new EmbedBuilder()
                            .setTitle("Error")
                            .setDescription(`An error occurred executing the \`${interaction.commandName}\` command Please try again later.`)
                            .setColor(config.embeds.colors.danger)
                    ]
                });
            }
        } else {
            interaction.reply({
                embeds: [
                    new EmbedBuilder()
                        .setTitle("Error")
                        .setDescription(`Unknown Command - ID: \`${interaction.commandId}\``)
                        .setColor(config.embeds.colors.danger)
                ], ephemeral: true
            });
        }
    }
});

mongoose.connect(config.mongo, {
    useNewUrlParser: true,
}).then(() => {
    console.log("[Deliver]: Connected To Database");
    client.login(config.token).then(() => {
        console.log("[Deliver]: Logged In");
        deployCommands();
        loadCommands();
    }).catch((err) => {
        console.log(err)
    });
}).catch((err) => {
    console.log("[Deliver]: Error Connecting To Database");
});
