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
const Client = require("../../database/Client");
const Product = require("../../database/Product");

/**
 * @description The function executed when a command is invoked
 * @param {Interaction} interaction
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

    const user = interaction.options.getUser('user');
    let clientRecord = await Client.findOne({
        discord: user.id,
    }).exec();

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

    const match = clientRecord.purchases.find((p) => {
        const pId = p.product;
        return pId.toString() === productRecord._id.toString();
    });

    if (!match) {
        let Embed = new EmbedBuilder()
            .setTitle("Error")
            .setDescription("This user doesn't own this product.")
            .setColor(config.embeds.colors.danger);
        return await interaction.reply({
            embeds: [Embed]
        });
    }

    await Client.updateOne({
        _id: clientRecord._id,
    }, {
        $pull: {
            purchases: { _id: match._id },
        },
    });

    console.log(`[Deliver]: Product revoked "${productName}" from "${clientRecord._id}" in "${hubRecord._id}"`);

    let Embed = new EmbedBuilder()
        .setTitle("Revoked")
        .setDescription("You have successfully revoked the product from user.")
        .setColor(config.embeds.colors.success);
    return await interaction.reply({
        embeds: [Embed]
    });
}

module.exports = {
    data: new SlashCommandBuilder()
        .setName('remove')
        .setDescription('Revoke a product.')
        .addUserOption(option =>
            option.setName('user')
                .setDescription('The user who you wish to revoke the product from.')
                .setRequired(true)
        )
        .addStringOption(option =>
            option.setName('productname')
                .setDescription('The product you wish to revoke')
                .setRequired(true)
        )
        .setDefaultMemberPermissions(PermissionFlagsBits.Administrator),
    execute: run
};