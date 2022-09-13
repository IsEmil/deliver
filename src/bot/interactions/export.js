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
const tmp = require('tmp');
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
    if (interaction.guild.ownerId !== interaction.user.id) return await interaction.reply({
        embeds: [
            new EmbedBuilder()
                .setColor(config.embeds.colors.danger)
                .setTitle("Error")
                .setDescription("You must be the owner of this server to use this command.")
        ]
    });

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
        hub: hubRecord._id
    }).exec();

    let data = JSON.stringify({ hub: hubRecord, products: productRecord, clients: null });
    let file = tmp.fileSync();

    fs.writeFileSync(file.name, data);

    await interaction.user.send({
        embeds: [
            new EmbedBuilder()
                .setColor(config.embeds.colors.default)
                .setTitle("Export")
                .setDescription("Here is your export file.")
        ]
    }).then(async (msg) => {
        await interaction.user.send({
            files: [
                {
                    name: `${hubRecord._id}.json`,
                    attachment: file.name
                }
            ]
        });

        await interaction.reply({
            embeds: [
                new EmbedBuilder()
                    .setColor(config.embeds.colors.default)
                    .setTitle("DM's")
                    .setDescription("Check your DM's for the export file.")
            ],
            components: [
                new ActionRowBuilder()
                    .addComponents(
                        new ButtonBuilder()
                            .setLabel('Jump to message')
                            .setURL(msg.url)
                            .setStyle(ButtonStyle.Link),
                    )
            ]
        });
    })
}

module.exports = {
    data: new SlashCommandBuilder()
        .setName('export')
        .setDescription('Export your hub data')
        .setDefaultMemberPermissions(PermissionFlagsBits.Administrator),
    execute: run
};