const {
    ContextMenuCommandBuilder,
    ApplicationCommandType,
    SlashCommandBuilder,
    ActionRowBuilder,
    ButtonBuilder,
    ButtonStyle,
    SelectMenuBuilder,
    ModalBuilder,
    Interaction,
    GuildMember,
    Client,
    EmbedBuilder,
    TextInputBuilder,
    TextInputStyle,
    ComponentType,
    PermissionFlagsBits,
} = require('discord.js');
const uuid = require('uuid');
const fs = require('fs');

const config = require('../../config.js');
const Hub = require("../../database/Hub");

/**
 * @description The function executed when a command is invoked
 * @param {Interaction} interaction
 * @param {GuildMember} member 
 * @param {Client} client
 */
async function run(interaction, member, client) {
    let hubRecord = await Hub.findOne({
        "info.guild": `${interaction.guild.id}`
    }).exec();

    if (hubRecord) {
        let Embed = new EmbedBuilder()
            .setTitle("Danger")
            .setDescription("You have an existing hub in this server. Do you wish to continue by deleting your current hub?")
            .setColor(config.embeds.colors.danger);
        return await interaction.reply({
            embeds: [Embed],
            components: [
                new ActionRowBuilder()
                    .addComponents(
                        new ButtonBuilder()
                            .setCustomId('accept')
                            .setLabel('Setup new hub')
                            .setStyle(ButtonStyle.Danger),
                        new ButtonBuilder()
                            .setCustomId('decline')
                            .setLabel('Cancel')
                            .setStyle(ButtonStyle.Secondary),
                    )
            ],
            fetchReply: true
        }).then((buttonMessage) => {
            buttonMessage.awaitMessageComponent({ filter: (i) => ComponentType.Button && i.user.id === interaction.user.id, time: 60_000 }).then(async (btn) => {
                switch (btn.customId) {
                    case "accept":
                        await Hub.deleteOne({
                            _id: hubRecord._id
                        });

                        const modal = new ModalBuilder()
                            .setCustomId('setupModal')
                            .setTitle('Setup Deliver')
                        modal.addComponents(
                            new ActionRowBuilder()
                                .addComponents(
                                    new TextInputBuilder()
                                        .setCustomId('Hub Name')
                                        .setLabel("What do you wish to call your hub?")
                                        .setStyle(TextInputStyle.Short)
                                        .setRequired(true)
                                ),
                            new ActionRowBuilder()
                                .addComponents(
                                    new TextInputBuilder()
                                        .setCustomId('Hub Description')
                                        .setLabel("What do you wish the hub description to be?")
                                        .setStyle(TextInputStyle.Paragraph)
                                        .setRequired(false)
                                ),
                            new ActionRowBuilder()
                                .addComponents(
                                    new TextInputBuilder()
                                        .setCustomId('Hub Place Id')
                                        .setLabel("What is the place id of the hub?")
                                        .setStyle(TextInputStyle.Short)
                                        .setRequired(true)
                                )
                        );

                        await btn.showModal(modal);

                        await interaction.awaitModalSubmit({ filter: i => i.user.id === interaction.user.id, time: 60000 }).then(async (modalResponse) => {
                            let hubName = modalResponse.fields.getTextInputValue('Hub Name');
                            let hubDescription = modalResponse.fields.getTextInputValue('Hub Description') === "" ? "New Hub!!" : modalResponse.fields.getTextInputValue('Hub Description')
                            let hubPlaceId = modalResponse.fields.getTextInputValue('Hub Place Id');

                            let token = uuid.v4();

                            let hub = new Hub({
                                name: hubName,
                                description: hubDescription,
                                info: {
                                    owner: `${interaction.guild.ownerId}`,
                                    guild: `${interaction.guild.id}`,
                                    placeId: hubPlaceId,
                                    token: token
                                }
                            });

                            await hub.save();

                            console.log(`[Deliver]: Hub "${hubName}" created in "${interaction.guild.name} (${interaction.guild.id})"!`);

                            // Thanks to Joshyyy#4795 for the help with this!
                            let hubSample = fs.readFileSync(`${__dirname}/../../assets/DeliverHub.rbxlx`).toString("utf-8");
                            hubSample = hubSample.replace("LOADER_ID", config.loader);
                            hubSample = hubSample.replace("SECRET_KEY", token);
                            hubSample = hubSample.replace("HUB_ID", hub._id);

                            console.log(`[Deliver]: Hub File created for "${hub._id}"!`);

                            let Embed = new EmbedBuilder()
                                .setTitle("Setup Successful")
                                .setDescription("Your hub has been created. You can now modify your hub by using `/settings`.\n\n**Please download the attached roblox hub file and publish to a roblox game.**")
                                .setColor(config.embeds.colors.success);
                            await modalResponse.reply({
                                embeds: [Embed],
                                files: [
                                    {
                                        name: `${hub._id}.rbxlx`,
                                        attachment: Buffer.from(hubSample, "utf-8")
                                    }
                                ]
                            });
                        }).catch(async (err) => {
                            console.error(err)
                            return null
                        });
                        break;
                }
            });
        })
    }

    const modal = new ModalBuilder()
        .setCustomId('setupModal')
        .setTitle('Setup Deliver')
    modal.addComponents(
        new ActionRowBuilder()
            .addComponents(
                new TextInputBuilder()
                    .setCustomId('Hub Name')
                    .setLabel("What do you wish to call your hub?")
                    .setStyle(TextInputStyle.Short)
                    .setRequired(true)
            ),
        new ActionRowBuilder()
            .addComponents(
                new TextInputBuilder()
                    .setCustomId('Hub Description')
                    .setLabel("What do you wish the hub description to be?")
                    .setStyle(TextInputStyle.Paragraph)
                    .setRequired(false)
            ),
        new ActionRowBuilder()
            .addComponents(
                new TextInputBuilder()
                    .setCustomId('Hub Place Id')
                    .setLabel("What is the place id of the hub?")
                    .setStyle(TextInputStyle.Short)
                    .setRequired(true)
            )
    );

    await interaction.showModal(modal);

    await interaction.awaitModalSubmit({ filter: i => i.user.id === interaction.user.id, time: 60000 }).then(async (modalResponse) => {
        let hubName = modalResponse.fields.getTextInputValue('Hub Name');
        let hubDescription = modalResponse.fields.getTextInputValue('Hub Description') === "" ? "New Hub!!" : modalResponse.fields.getTextInputValue('Hub Description')
        let hubPlaceId = modalResponse.fields.getTextInputValue('Hub Place Id');

        let token = uuid.v4();

        let hub = new Hub({
            name: hubName,
            description: hubDescription,
            info: {
                owner: `${interaction.guild.ownerId}`,
                guild: `${interaction.guild.id}`,
                placeId: hubPlaceId,
                token: token
            }
        });

        await hub.save();

        console.log(`[Deliver]: Hub "${hubName}" created in "${interaction.guild.name} (${interaction.guild.id})"!`);

        // Thanks to Joshyyy#4795 for the help with this!
        let hubSample = fs.readFileSync(`${__dirname}/../../assets/DeliverHub.rbxlx`).toString("utf-8");
        hubSample = hubSample.replace("LOADER_ID", config.loader);
        hubSample = hubSample.replace("SECRET_KEY", token);
        hubSample = hubSample.replace("HUB_ID", hub._id);

        console.log(`[Deliver]: Hub File created for "${hub._id}"!`);

        let Embed = new EmbedBuilder()
            .setTitle("Setup Successful")
            .setDescription("Your hub has been created. You can now modify your hub by using `/settings`.\n\n**Please download the attached roblox hub file and publish to a roblox game.**")
            .setColor(config.embeds.colors.success);
        await modalResponse.reply({
            embeds: [Embed],
            files: [
                {
                    name: `${hub._id}.rbxlx`,
                    attachment: Buffer.from(hubSample, "utf-8")
                }
            ]
        });
    }).catch(async (err) => {
        console.error(err)
        return null
    });
}

module.exports = {
    data: new SlashCommandBuilder()
        .setName('setup')
        .setDescription('Setup the bot')
        .setDefaultMemberPermissions(PermissionFlagsBits.Administrator),
    execute: run
};