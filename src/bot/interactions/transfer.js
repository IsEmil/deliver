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

    const recipient = interaction.options.getUser('recipient');
    let recipientRecord = await Client.findOne({
        discord: recipient.id,
    }).exec();

    if (!recipientRecord) {
        return await interaction.reply({
            embeds: [
                new EmbedBuilder()
                    .setColor(config.embeds.colors.danger)
                    .setTitle("Error")
                    .setDescription("Recipient isn't linked.")
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

    const matchClient = clientRecord.purchases.find((p) => {
        const pId = p.product;
        return pId.toString() === productRecord._id.toString();
    });

    if (!matchClient) {
        let Embed = new EmbedBuilder()
            .setTitle("Error")
            .setDescription("This user doesn't own this product.")
            .setColor(config.embeds.colors.danger);
        return await interaction.reply({
            embeds: [Embed]
        });
    }

    const matchRecipient = recipientRecord.purchases.find((p) => {
        const pId = p.product;
        return pId.toString() === productRecord._id.toString();
    });

    if (matchRecipient) {
        let Embed = new EmbedBuilder()
            .setTitle("Error")
            .setDescription("Recipient already own this product.")
            .setColor(config.embeds.colors.danger);
        return await interaction.reply({
            embeds: [Embed]
        });
    }

    await Client.updateOne({
        _id: clientRecord._id,
    }, {
        $pull: {
            purchases: { _id: matchClient._id },
        },
    });

    const purchaseObject = recipientRecord.purchases.create({
        product: productRecord._id,
        hub: hubRecord._id,
    });

    recipientRecord.purchases.push(purchaseObject);
    await recipientRecord.save();

    let GrantEmbed = new EmbedBuilder()
        .setTitle("Product Transferred")
        .addFields({ name: "Product", value: productName })
        .setDescription("You have been transferred a product. Any product information/files will be sent below shortly.")
        .setColor(config.embeds.colors.default);
    await recipient.send({
        embeds: [GrantEmbed]
    });

    switch (productRecord.file.type) {
        case "1":
            let MessageEmbed = new EmbedBuilder()
                .setTitle("Product Message")
                .setDescription(`For the product: ${product.name}\n\`\`\`${product.file.target}\`\`\``)
                .setColor(config.embeds.colors.default);
            await recipient.send({
                embeds: [MessageEmbed]
            });
            break;
        case "2":
            let FileEmbed = new EmbedBuilder()
                .setTitle("Product Link")
                .setDescription(`For the product: ${product.name}\n\n[${product.file.target}](${product.file.target})`)
                .setColor(config.embeds.colors.default);
            await recipient.send({
                embeds: [FileEmbed]
            });
            break;
    }

    console.log(`[Deliver]: Product transferred "${productName}" from "${clientRecord._id}" to "${recipientRecord._id}" in "${hubRecord._id}"`);

    let Embed = new EmbedBuilder()
        .setTitle("Transferred")
        .setDescription("You have successfully transferred the product from user.")
        .setColor(config.embeds.colors.success);
    return await interaction.reply({
        embeds: [Embed]
    });
}

module.exports = {
    data: new SlashCommandBuilder()
        .setName('transfer')
        .setDescription('Transfer a product.')
        .addUserOption(option =>
            option.setName('user')
                .setDescription('The user who you wish to transfer the product from')
                .setRequired(true)
        )
        .addStringOption(option =>
            option.setName('productname')
                .setDescription('The product you wish to transfer')
                .setRequired(true)
        )
        .addUserOption(option =>
            option.setName('recipient')
                .setDescription('The user who you wish to transfer the product to')
                .setRequired(true)
        )
        .setDefaultMemberPermissions(PermissionFlagsBits.Administrator),
    execute: run
};