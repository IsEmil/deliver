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

    const match = clientRecord.purchases.find((purchase) => {
        const purchaseProduct = purchase.product.toString();

        return purchaseProduct === productRecord.toString();
    });

    if (match) {
        let Embed = new EmbedBuilder()
            .setTitle("Error")
            .setDescription("Client already owns specified product")
            .setColor(config.embeds.colors.danger);
        return await interaction.reply({
            embeds: [Embed]
        });
    }

    const purchaseObject = clientRecord.purchases.create({
        product: productRecord._id,
        hub: hubRecord._id,
    });

    clientRecord.purchases.push(purchaseObject);
    await clientRecord.save();

    console.log(`[Deliver]: Product granted "${productName}" to "${clientRecord._id}" in "${hubRecord._id}"`);

    let GrantEmbed = new EmbedBuilder()
        .setTitle("Product Granted")
        .addFields({ name: "Product", value: productName })
        .setDescription("You have been granted a product. Any product information/files will be sent below shortly.")
        .setColor(config.embeds.colors.default);
    await user.send({
        embeds: [GrantEmbed]
    });

    switch (productRecord.file.type) {
        case "1":
            let MessageEmbed = new EmbedBuilder()
                .setTitle("Product Message")
                .setDescription(`For the product: ${product.name}\n\`\`\`${product.file.target}\`\`\``)
                .setColor(config.embeds.colors.default);
            user.send({
                embeds: [MessageEmbed]
            });
            break;
        case "2":
            let FileEmbed = new EmbedBuilder()
                .setTitle("Product Link")
                .setDescription(`For the product: ${product.name}\n\n[${product.file.target}](${product.file.target})`)
                .setColor(config.embeds.colors.default);
            user.send({
                embeds: [FileEmbed]
            });
            break;
    }

    let Embed = new EmbedBuilder()
        .setTitle("Granted")
        .setDescription("You have successfully granted a user the product.")
        .setColor(config.embeds.colors.success);
    return await interaction.reply({
        embeds: [Embed]
    });
}

module.exports = {
    data: new SlashCommandBuilder()
        .setName('grant')
        .setDescription('Grant a product.')
        .addUserOption(option =>
            option.setName('user')
                .setDescription('The user who you wish to give the product to')
                .setRequired(true)
        )
        .addStringOption(option =>
            option.setName('productname')
                .setDescription('The product you wish to give')
                .setRequired(true)
        )
        .setDefaultMemberPermissions(PermissionFlagsBits.Administrator),
    execute: run
};