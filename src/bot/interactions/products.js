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
    Client,
    EmbedBuilder,
} = require('discord.js');
const osUtils = require("node-os-utils");

const config = require('../../config.js');
const Hub = require("../../database/Hub");
const Product = require("../../database/Product");

/**
 * @description The function executed when a command is invoked
 * @param {Interactions} interaction
 * @param {GuildMember} member 
 * @param {Client} client
 */
async function run(interaction, member, client) {
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

    let productRecord = await Product.find({
        hub: hubRecord._id,
    }).exec();

    const productString = productRecord.map((p) => {
        const { name } = p;
        return `${name}`;
    }).join("\n");

    if (productString.length === 0) {
        let Embed = new EmbedBuilder()
            .setTitle("Products List")
            .addFields(
                { name: "Hub ID", value: `${hubRecord._id}`, inline: true },
                { name: "Products", value: `None`, inline: true },
            )
            .setColor(config.embeds.colors.default);
        return await interaction.reply({
            embeds: [Embed]
        });
    }

    let Embed = new EmbedBuilder()
        .setTitle("Products List")
        .addFields(
            { name: "Hub ID", value: `${hubRecord._id}`, inline: true },
            { name: "Products", value: `${productString}`, inline: true },
        )
        .setColor(config.embeds.colors.default);
    return await interaction.reply({
        embeds: [Embed]
    });
}

module.exports = {
    data: new SlashCommandBuilder()
        .setName('products')
        .setDescription('Get list of products'),
    execute: run
};