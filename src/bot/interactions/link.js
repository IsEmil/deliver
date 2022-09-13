const {
    ContextMenuCommandBuilder,
    ApplicationCommandType,
    SlashCommandBuilder,
    ActionRowBuilder,
    ButtonBuilder,
    ButtonStyle,
    SelectMenuBuilder,
    ModalBuilder,
    Interactions,
    GuildMember,
    EmbedBuilder,
    ComponentType,
} = require('discord.js');
const axios = require("axios");

const config = require('../../config.js');
const Client = require("../../database/Client");

/**
 * @description The function executed when a command is invoked
 * @param {Interactions} interaction
 * @param {GuildMember} member 
 */
async function run(interaction, member) {
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
     * @returns {String} The Roblox username
     */
    const getAccount = async (userId) => {
        const response = await axios.get(`https://verify.eryn.io/api/user/${userId}`);

        if (response.data["status"] == "ok") {
            return response.data
        } else {
            throw new Error("Invalid Roblox response or invalid user id");
        }
    };

    /**
     * @param {GuildMember} member A Roblox user id
     * @returns {String} The Roblox username
     */
    const linkAccount = async (member) => {
        const response = await axios.get(`https://verify.eryn.io/api/user/${member.user.id}`);

        if (response.data["status"] == "ok") {
            let clientNew = new Client({
                discord: member.user.id,
                roblox: response.data["robloxId"],
            });

            await clientNew.save();

            console.log(`[Deliver]: Linked ${member.user.id} to ${response.data["robloxId"]}`);

            return { ok: true, data: response.data }
        } else {
            throw new Error("Invalid Roblox response or invalid user id");
        }
    };

    await Client.findOne({
        discord: member.user.id
    }).then(async (clientResponse) => {
        if (clientResponse) {
            let Embed = new EmbedBuilder()
                .setTitle("Warning")
                .setDescription(`You appear to be already linked to [${await getRobloxUsername(clientResponse.roblox)}](https://www.roblox.com/users/${clientResponse.roblox}/profile). Would you like to change the Roblox account you are linked to?`)
                .setColor(config.embeds.colors.warning);
            return interaction.reply({
                embeds: [Embed],
                components: [
                    new ActionRowBuilder()
                        .addComponents(
                            new ButtonBuilder()
                                .setCustomId('link_accept')
                                .setLabel('Yes')
                                .setStyle(ButtonStyle.Success),
                            new ButtonBuilder()
                                .setCustomId('link_decline')
                                .setLabel('No')
                                .setStyle(ButtonStyle.Danger),
                        )
                ]
            }).then((m) => {
                m.awaitMessageComponent({
                    filter: (i) => i.user.id === member.user.id && ComponentType.Button,
                    time: 60_000 // 60s
                }).then(async (interactionResponse) => {
                    switch (interactionResponse.customId) {
                        case 'link_accept':
                            getAccount(member.user.id).then(async (response) => {
                                await Client.updateOne(
                                    {
                                        _id: clientResponse._id
                                    },
                                    {
                                        $set: {
                                            roblox: response.robloxId
                                        }
                                    }
                                );

                                let Embed = new EmbedBuilder()
                                    .setTitle("Verified")
                                    .setThumbnail(`https://www.roblox.com/headshot-thumbnail/image?userId=${response.robloxId}&width=420&height=420&format=png`)
                                    .setDescription(`You have been successfully linked to the Roblox user [${response.robloxUsername}](https://www.roblox.com/users/${response.robloxId}/profile)`)
                                    .setColor(config.embeds.colors.success);
                                return await interaction.editReply({
                                    embeds: [Embed],
                                    components: []
                                });
                            }).catch(async () => {
                                let Embed = new EmbedBuilder()
                                    .setTitle("Error")
                                    .setDescription("An unexpected error occurred whilst trying to communicate with RoVer Api. Please try again")
                                    .setColor(config.embeds.colors.danger);
                                return await interaction.editReply({
                                    embeds: [Embed],
                                    components: []
                                });
                            });
                            break
                        case 'link_decline':
                            let Embed = new EmbedBuilder()
                                .setTitle("Error")
                                .setDescription("Prompt has been cancelled.")
                                .setColor(config.embeds.colors.danger);
                            await interaction.editReply({
                                embeds: [Embed],
                                components: []
                            });
                            break;
                    }
                }).catch(async (err) => {
                    let Embed = new EmbedBuilder()
                        .setTitle("Error")
                        .setDescription("You took too long to respond.")
                        .setColor(config.embeds.colors.danger);
                    return await m.reply({
                        embeds: [Embed]
                    });
                });
            });
        } else {
            let Embed = new EmbedBuilder()
                .setTitle("Working")
                .setDescription("Please wait")
                .setColor(config.embeds.colors.warning);
            return await interaction.reply({
                embeds: [Embed]
            }).then(async () => {
                linkAccount(member).then(async (msg) => {
                    if (msg.ok) {
                        let Embed = new EmbedBuilder()
                            .setTitle("Verified")
                            .setThumbnail(`https://www.roblox.com/headshot-thumbnail/image?userId=${msg.data.robloxId}&width=420&height=420&format=png`)
                            .setDescription(`You have been successfully linked to the Roblox user [${msg.data.robloxUsername}](https://www.roblox.com/users/${msg.data.robloxId}/profile)`)
                            .setColor(config.embeds.colors.success);
                        return await interaction.editReply({
                            embeds: [Embed]
                        });
                    }
                }).catch(async () => {
                    let Embed = new EmbedBuilder()
                        .setTitle("Error")
                        .setDescription("An unexpected error occurred whilst trying to communicate with RoVer Api. Please try again")
                        .setColor(config.embeds.colors.danger);
                    return await interaction.reply({
                        embeds: [Embed]
                    });
                });
            })
        }
    }).catch(async (err) => {
        console.log(err)
        let Embed = new EmbedBuilder()
            .setTitle("Error")
            .setDescription("An unexpected error occurred whilst trying to communicate with the MongoDB. Please try again")
            .setColor(config.embeds.colors.danger);
        return await interaction.reply({
            embeds: [Embed]
        });
    });
}

module.exports = {
    data: new SlashCommandBuilder()
        .setName('link')
        .setDescription('Link your Roblox account to Deliver'),
    execute: run
};