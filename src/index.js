const messenger = require("messenger");
const discord = require("discord.js");
const mongoose = require("mongoose");
const axios = require("axios");

const config = require("./config.js");
const httpListen = messenger.createListener(40000);
const shardingManager = new discord.ShardingManager("./src/bot/bot.js", { token: config.token });

shardingManager.on("shardCreate", (shard) => {
    console.log(`[Deliver]: Launched shard ${shard.id}`);
});

httpListen.on("ROBLOX_PURCHASE", (m, data) => {
    shardingManager.broadcastEval((client, context) => {
        /**
         * @param {Number} userId A Roblox user id
         * @returns {String} The Roblox username
         */
        const getRobloxUsername = async (userId) => {
            const response = await axios.get(`https://api.roblox.com/users/${userId}`);

            if (response.data.Username) {
                return response.data.Username;
            } else {
                throw new Error("Invalid Roblox response or invalid user id");
            }
        };

        /**
         * @param {Number} userId A Discord user id
         * @returns {String} The Discord username
         */
        const getDiscordUsername = async (userId) => {
            const response = await axios.get(`https://discord.com/api/v10/users/${userId}`, { headers: { authorization: `Bot ${config.token}` } });

            if (response.data.username) {
                return `${response.data.username}#${response.data.discriminator}`;
            } else {
                throw new Error("Invalid Discord response or invalid user id");
            }
        };

        let PurchaseReceipt = new discord.EmbedBuilder()
            .setTitle("Purchase Receipt")
            .setTimestamp(new Date())
            .setColor(config.embeds.colors.default)
            .setDescription(`Thank you for your purchase at ${data.hub.name}\n\nAny product information/files will be sent below shortly.`)
            .setThumbnail(`https://www.roblox.com/headshot-thumbnail/image?userId=${data.client.roblox}&width=420&height=420&format=png`)
            .addField("Product", data.product.name, true);
        client.users.fetch(data.client.discord).then((user) => {
            user.send({ embeds: [PurchaseReceipt] }).then(async () => {
                switch (data.product.file.type) {
                    case "1":
                        let MessageEmbed = new discord.EmbedBuilder()
                            .setTitle("Product Message")
                            .setDescription(`For the product: ${data.product.name}\n\`\`\`${data.product.file.target}\`\`\``)
                            .setColor(config.embeds.colors.default);
                        await user.send({
                            embeds: [MessageEmbed]
                        });
                        break;
                    case "2":
                        let FileEmbed = new discord.EmbedBuilder()
                            .setTitle("Product Link")
                            .setDescription(`For the product: ${data.product.name}\n\n[${data.product.file.target}](${data.product.file.target})`)
                            .setColor(config.embeds.colors.default);
                        await user.send({
                            embeds: [FileEmbed]
                        });
                        break;
                }
            }).catch(() => { });
        }).catch(() => { });

        if (data.hub.configuration.channels.purchaseChannel.length > 0) {
            client.guilds.fetch(data.hub.info.guild).then((guild) => {
                if (guild.available) {
                    guild.channels.fetch(data.hub.configuration.channels.purchaseChannel).then(async (purchaseChannel) => {
                        purchaseChannel.send({
                            embeds: [
                                new discord.EmbedBuilder()
                                    .setTitle("New Purchase")
                                    .setTimestamp(new Date())
                                    .setColor(config.embeds.colors.default)
                                    .setThumbnail(`https://www.roblox.com/headshot-thumbnail/image?userId=${data.client.roblox}&width=420&height=420&format=png`)
                                    .setDescription("A new purchase has been made. Please see below for details")
                                    .addFields(
                                        { name: "Roblox User", value: `[${await getRobloxUsername(data.client.roblox)}](https://www.roblox.com/users/${data.client.roblox}/profile) (${data.user.robloxId})`, inline: true },
                                        { name: "Discord User", value: `${await getDiscordUsername(data.client.discord)} (${data.client.discord})`, inline: true },
                                        { name: "Product", value: `\`${data.product.name}\``, inline: true },
                                    )
                            ]
                        })
                    }).catch(() => { });
                }
            }).catch(() => { });
        }
        m.reply(true);
    }, { shard: 0, context: { data: data } });
});

shardingManager.spawn();
