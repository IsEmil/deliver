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
} = require('discord.js');

const config = require('../../config.js');
const Hub = require("../../database/Hub");
const Client = require("../../database/Client");

/**
 * @description The function executed when a command is invoked
 * @param {Interactions} interaction
 * @param {GuildMember} member 
 */
async function run(interaction, member) {
    let hubRecord = await Hub.findOne({
        "info.guild": `${interaction.guild.id}`
    }).exec();

    if (!hubRecord) {
        return await interaction.reply({
            embeds: [
                new EmbedBuilder()
                    .setColor(config.embeds.colors.danger)
                    .setTitle("Error")
                    .setDescription("This server doesn't have a hub setup.")
            ]
        });
    }

    let mention = member.user;
    if (interaction.options.getUser('user')) {
        mention = interaction.options.getUser('user');
    }

    let clientRecord = await Client.findOne({
        discord: mention.id,
    }).populate("purchases.product").exec();

    if (!clientRecord) {
        return await interaction.reply({
            embeds: [
                new EmbedBuilder()
                    .setColor(config.embeds.colors.danger)
                    .setTitle("Error")
                    .setDescription("This user isn't linked.")
            ]
        });
    }

    const purchases = clientRecord.purchases.filter((p) => {
        const id = hubRecord._id;
        return p.hub.toString() === id.toString();
    });

    const purchaseString = purchases.map((p) => {
        const { name } = p.product;
        return `- ${name}`;
    }).join("\n");

    if (purchases.length === 0) {
        return await interaction.reply({
            embeds: [
                new EmbedBuilder()
                    .setColor(config.embeds.colors.default)
                    .setTitle(`${mention.username}'s Profile`)
                    .addFields(
                        { name: "Discord Id", value: clientRecord.discord, inline: true },
                        { name: "Roblox Id", value: clientRecord.roblox, inline: true },
                        { name: "Purchases", value: `No purchases` },
                    )
                    .setThumbnail(`https://www.roblox.com/headshot-thumbnail/image?userId=${clientRecord.roblox}&width=420&height=420`)
            ]
        });
    }

    return await interaction.reply({
        embeds: [
            new EmbedBuilder()
                .setColor(config.embeds.colors.default)
                .setTitle(`${mention.username}'s Profile`)
                .addFields(
                    { name: "Discord Id", value: clientRecord.discord, inline: true },
                    { name: "Roblox Id", value: clientRecord.roblox, inline: true },
                    { name: "Purchases", value: `${purchaseString}` },
                )
                .setThumbnail(`https://www.roblox.com/headshot-thumbnail/image?userId=${clientRecord.roblox}&width=420&height=420`)
        ]
    });
}

module.exports = {
    data: new SlashCommandBuilder()
        .setName('account')
        .setDescription('View your account')
        .addUserOption(option =>
            option.setName('user')
                .setDescription('The user\'s account you wish to view')
                .setRequired(false)
        ),
    execute: run
};