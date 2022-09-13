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

    const modal = new ModalBuilder()
        .setCustomId('setupModal')
        .setTitle('Setup Product')
    modal.addComponents(
        new ActionRowBuilder()
            .addComponents(
                new TextInputBuilder()
                    .setCustomId('Product Name')
                    .setLabel("What do you wish to call your product?")
                    .setStyle(TextInputStyle.Short)
                    .setRequired(true)
            ),
        new ActionRowBuilder()
            .addComponents(
                new TextInputBuilder()
                    .setCustomId('Product Description')
                    .setLabel("What do you wish the description to be?")
                    .setStyle(TextInputStyle.Paragraph)
                    .setRequired(false)
            ),
        new ActionRowBuilder()
            .addComponents(
                new TextInputBuilder()
                    .setCustomId('Product Developer Id')
                    .setLabel("What is the Roblox developer id?")
                    .setStyle(TextInputStyle.Short)
                    .setRequired(true)
            )
    );

    await interaction.showModal(modal);

    await interaction.awaitModalSubmit({ filter: i => i.user.id === interaction.user.id, time: 60000 }).then(async (modalResponse) => {
        let productName = modalResponse.fields.getTextInputValue('Product Name');
        let productDescription = modalResponse.fields.getTextInputValue('Product Description') === "" ? "New Product!!" : modalResponse.fields.getTextInputValue('Product Description')
        let productDevId = modalResponse.fields.getTextInputValue('Product Developer Id');

        let product = new Product({
            name: productName,
            description: productDescription,
            devProduct: productDevId,
            hub: hubRecord._id,
        });

        await product.save();
        
        console.log(`[Deliver]: New product created "${productName}" in "${hubRecord._id}"`);

        let Embed = new EmbedBuilder()
            .setTitle("Product Successful")
            .setDescription("Your product has been created! You can now modify your product by using `/edit`.")
            .setColor(config.embeds.colors.success);
        await modalResponse.reply({
            embeds: [Embed]
        });
    }).catch(async (err) => {
        console.error(err)
        return null
    });
}

module.exports = {
    data: new SlashCommandBuilder()
        .setName('create')
        .setDescription('Create a new product')
        .setDefaultMemberPermissions(PermissionFlagsBits.Administrator),
    execute: run
};