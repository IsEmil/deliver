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
const Product = require("../../database/Product");

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

    const productName = interaction.options.getString('productname');
    let productRecord = await Product.findOne({
        hub: hubRecord._id,
        name: productName,
    }).exec();

    if (!productRecord) {
        return await interaction.reply({
            embeds: [
                new EmbedBuilder()
                    .setColor(config.embeds.colors.danger)
                    .setTitle("Error")
                    .setDescription("This product doesn't exist.")
            ]
        });
    }

    await Product.deleteOne({
        _id: productRecord._id
    });

    console.log(`[Deliver]: Product deleted "${productName}" in "${hubRecord._id}"`);

    let Embed = new EmbedBuilder()
        .setTitle("Deleted Successful")
        .setDescription("Your product has been deleted!")
        .setColor(config.embeds.colors.success);
    return await interaction.reply({
        embeds: [Embed]
    });
}

module.exports = {
    data: new SlashCommandBuilder()
        .setName('delete')
        .setDescription('Delete a existing product')
        .addStringOption(option =>
            option.setName('productname')
                .setDescription('The name of the product to delete')
                .setRequired(true)
        )
        .setDefaultMemberPermissions(PermissionFlagsBits.Administrator),
    execute: run
};