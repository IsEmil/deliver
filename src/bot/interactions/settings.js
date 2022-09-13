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

    let Embed = new EmbedBuilder()
        .setTitle("Hub")
        .setDescription("Select what you want to edit.")
        .setColor(config.embeds.colors.default);
    return await interaction.reply({
        embeds: [Embed],
        components: [
            new ActionRowBuilder()
                .addComponents(
                    new SelectMenuBuilder()
                        .setCustomId('hub_editor')
                        .setPlaceholder('Nothing selected')
                        .setMaxValues(1)
                        .setMinValues(1)
                        .addOptions(
                            {
                                label: 'Hub Name',
                                description: `Current Value: ${hubRecord.name}`,
                                value: 'name',
                            },
                            {
                                label: 'Hub Description',
                                description: `Current Value: ${hubRecord.description}`,
                                value: 'description',
                            },
                            {
                                label: 'Hub Place Id',
                                description: `Current Value: ${hubRecord.info.placeId}`,
                                value: 'placeid',
                            },
                            {
                                label: 'Purchase Channel',
                                description: `Current Value: ${hubRecord.configuration.channels.purchaseChannel}`,
                                value: 'purchase',
                            },
                            {
                                label: 'Action Channel',
                                description: `Current Value: ${hubRecord.configuration.channels.actionChannel}`,
                                value: 'action',
                            },
                            {
                                label: 'Design Test Place',
                                description: `Current Value: ${hubRecord.configuration.design.testPlace}`,
                                value: 'testplace',
                            },
                            {
                                label: 'Design Music',
                                description: `Current Value: ${hubRecord.configuration.design.music}`,
                                value: 'music',
                            },
                        ),
                )
        ]
    }).then(async (msg) => {
        await msg.awaitMessageComponent({ filter: (i) => i.user.id === interaction.user.id, time: 60_000, componentType: ComponentType.SelectMenu }).then(async (menuResponse) => {
            menuResponse.values.forEach(async (customId) => {
                switch (customId) {
                    case 'name':
                        const modal = new ModalBuilder()
                            .setCustomId('setupModal')
                            .setTitle('Edit Hub')
                        modal.addComponents(
                            new ActionRowBuilder()
                                .addComponents(
                                    new TextInputBuilder()
                                        .setCustomId('Hub Name')
                                        .setLabel("What do you wish to call your hub?")
                                        .setStyle(TextInputStyle.Short)
                                        .setRequired(true)
                                )
                        );

                        await menuResponse.showModal(modal);

                        await interaction.awaitModalSubmit({ filter: i => i.user.id === interaction.user.id, time: 60000 }).then(async (modalResponse) => {
                            let hubName = modalResponse.fields.getTextInputValue('Hub Name');

                            await Hub.updateOne(
                                {
                                    _id: hubRecord._id,
                                },
                                {
                                    $set: {
                                        name: hubName,
                                    }
                                }
                            );

                            console.log(`[Deliver]: Hub "${hubRecord.name}" name has been changed to "${hubName}" in "${hubRecord._id}"`);

                            let Embed = new EmbedBuilder()
                                .setTitle("Updated Successful")
                                .setDescription("Your hub has been updated!")
                                .setColor(config.embeds.colors.success);
                            await modalResponse.reply({
                                embeds: [Embed]
                            });
                        }).catch(async (err) => {
                            console.error(err)
                            return null
                        });
                        break;
                    case 'description':
                        const modal2 = new ModalBuilder()
                            .setCustomId('setupModal')
                            .setTitle('Edit Hub')
                        modal2.addComponents(
                            new ActionRowBuilder()
                                .addComponents(
                                    new TextInputBuilder()
                                        .setCustomId('Hub Description')
                                        .setLabel("What do you wish the hub description to be?")
                                        .setStyle(TextInputStyle.Paragraph)
                                        .setRequired(true)
                                )
                        );

                        await menuResponse.showModal(modal2);

                        await interaction.awaitModalSubmit({ filter: i => i.user.id === interaction.user.id, time: 60000 }).then(async (modalResponse) => {
                            let hubDescription = modalResponse.fields.getTextInputValue('Hub Description');

                            await Hub.updateOne(
                                {
                                    _id: hubRecord._id,
                                },
                                {
                                    $set: {
                                        name: hubDescription,
                                    }
                                }
                            );

                            console.log(`[Deliver]: Hub "${hubRecord.name}" description has been changed to "${hubDescription}" in "${hubRecord._id}"`);

                            let Embed = new EmbedBuilder()
                                .setTitle("Updated Successful")
                                .setDescription("Your hub has been updated!")
                                .setColor(config.embeds.colors.success);
                            await modalResponse.reply({
                                embeds: [Embed]
                            });
                        }).catch(async (err) => {
                            console.error(err)
                            return null
                        });
                        break;
                    case 'placeid':
                        const modal3 = new ModalBuilder()
                            .setCustomId('setupModal')
                            .setTitle('Edit Hub')
                        modal3.addComponents(
                            new ActionRowBuilder()
                                .addComponents(
                                    new TextInputBuilder()
                                        .setCustomId('Hub Place Id')
                                        .setLabel("What is the place id of the hub?")
                                        .setStyle(TextInputStyle.Short)
                                        .setRequired(true)
                                )
                        );

                        await menuResponse.showModal(modal3);

                        await interaction.awaitModalSubmit({ filter: i => i.user.id === interaction.user.id, time: 60000 }).then(async (modalResponse) => {
                            let hubPlaceId = modalResponse.fields.getTextInputValue('Hub Place Id');

                            await Hub.updateOne(
                                {
                                    _id: hubRecord._id,
                                },
                                {
                                    $set: {
                                        "info.placeId": hubPlaceId,
                                    }
                                }
                            );

                            console.log(`[Deliver]: Hub "${hubRecord.name}" place id has been changed to "${hubPlaceId}" in "${hubRecord._id}"`);

                            let Embed = new EmbedBuilder()
                                .setTitle("Updated Successful")
                                .setDescription("Your hub has been updated!")
                                .setColor(config.embeds.colors.success);
                            await modalResponse.reply({
                                embeds: [Embed]
                            });
                        }).catch(async (err) => {
                            console.error(err)
                            return null
                        });
                        break;
                    case 'testplace':
                        const modal4 = new ModalBuilder()
                            .setCustomId('setupModal')
                            .setTitle('Edit Hub')
                        modal4.addComponents(
                            new ActionRowBuilder()
                                .addComponents(
                                    new TextInputBuilder()
                                        .setCustomId('Hub Test Place')
                                        .setLabel("What is the test place id?")
                                        .setStyle(TextInputStyle.Short)
                                        .setRequired(true)
                                )
                        );

                        await menuResponse.showModal(modal4);

                        await interaction.awaitModalSubmit({ filter: i => i.user.id === interaction.user.id, time: 60000 }).then(async (modalResponse) => {
                            let hubTestPlace = modalResponse.fields.getTextInputValue('Hub Test Place');

                            await Hub.updateOne(
                                {
                                    _id: hubRecord._id,
                                },
                                {
                                    $set: {
                                        "configuration.design.testPlace": hubTestPlace,
                                    }
                                }
                            );

                            console.log(`[Deliver]: Hub "${hubRecord.name}" test place has been changed to "${hubTestPlace}" in "${hubRecord._id}"`);

                            let Embed = new EmbedBuilder()
                                .setTitle("Updated Successful")
                                .setDescription("Your hub has been updated!")
                                .setColor(config.embeds.colors.success);
                            await modalResponse.reply({
                                embeds: [Embed]
                            });
                        }).catch(async (err) => {
                            console.error(err)
                            return null
                        });
                        break;
                    case 'music':
                        const modal5 = new ModalBuilder()
                            .setCustomId('setupModal')
                            .setTitle('Edit Hub')
                        modal5.addComponents(
                            new ActionRowBuilder()
                                .addComponents(
                                    new TextInputBuilder()
                                        .setCustomId('Hub Music')
                                        .setLabel("What is the music id?")
                                        .setStyle(TextInputStyle.Short)
                                        .setRequired(true)
                                )
                        );

                        await menuResponse.showModal(modal5);

                        await interaction.awaitModalSubmit({ filter: i => i.user.id === interaction.user.id, time: 60000 }).then(async (modalResponse) => {
                            let hubMusic = modalResponse.fields.getTextInputValue('Hub Music');

                            await Hub.updateOne(
                                {
                                    _id: hubRecord._id,
                                },
                                {
                                    $set: {
                                        "configuration.design.music": hubMusic,
                                    }
                                }
                            );

                            console.log(`[Deliver]: Hub "${hubRecord.name}" music has been changed to "${hubMusic}" in "${hubRecord._id}"`);

                            let Embed = new EmbedBuilder()
                                .setTitle("Updated Successful")
                                .setDescription("Your hub has been updated!")
                                .setColor(config.embeds.colors.success);
                            await modalResponse.reply({
                                embeds: [Embed]
                            });
                        }).catch(async (err) => {
                            console.error(err)
                            return null
                        });
                        break;
                    case 'purchase':
                        let Embed3 = new EmbedBuilder()
                            .setTitle("Purchase Channel")
                            .setDescription("Mention the channel you want to use for purchase logs.")
                            .setColor(config.embeds.colors.default);
                        menuResponse.reply({
                            embeds: [Embed3]
                        }).then(async (messageReply) => {
                            menuResponse.channel.awaitMessages({ max: 1, filter: (m) => m.author.id === interaction.user.id && m.mentions.channels.size > 0, errors: ["time"], time: 60000 }).then(async (collected) => {
                                await Hub.updateOne(
                                    {
                                        _id: hubRecord._id,
                                    },
                                    {
                                        $set: {
                                            "configuration.channels.purchaseChannel": collected.first().mentions.channels.first().id,
                                        }
                                    }
                                );

                                let Embed = new EmbedBuilder()
                                    .setTitle("Updated Successful")
                                    .setDescription("Your hub has been updated!")
                                    .setColor(config.embeds.colors.success);
                                collected.first().reply({
                                    embeds: [Embed]
                                })
                            }).catch(async (err) => {
                                console.log(err)
                                let Embed = new EmbedBuilder()
                                    .setTitle("Error")
                                    .setDescription("An error has occured, please try again later.")
                                    .setColor(config.embeds.colors.danger);
                                return await messageReply.reply({
                                    embeds: [Embed]
                                });
                            });
                        });
                        break;
                    case 'action':
                        let Embed4 = new EmbedBuilder()
                            .setTitle("Action Channel")
                            .setDescription("Mention the channel you want to use for action logs.")
                            .setColor(config.embeds.colors.default);
                        menuResponse.reply({
                            embeds: [Embed4]
                        }).then(async (messageReply) => {
                            menuResponse.channel.awaitMessages({ max: 1, filter: (m) => m.author.id === interaction.user.id && m.mentions.channels.size > 0, errors: ["time"], time: 60000 }).then(async (collected) => {
                                await Hub.updateOne(
                                    {
                                        _id: hubRecord._id,
                                    },
                                    {
                                        $set: {
                                            "configuration.channels.actionChannel": collected.first().mentions.channels.first().id,
                                        }
                                    }
                                );

                                let Embed = new EmbedBuilder()
                                    .setTitle("Updated Successful")
                                    .setDescription("Your hub has been updated!")
                                    .setColor(config.embeds.colors.success);
                                collected.first().reply({
                                    embeds: [Embed]
                                })
                            }).catch(async (err) => {
                                console.log(err)
                                let Embed = new EmbedBuilder()
                                    .setTitle("Error")
                                    .setDescription("An error has occured, please try again later.")
                                    .setColor(config.embeds.colors.danger);
                                return await messageReply.reply({
                                    embeds: [Embed]
                                });
                            });
                        });
                        break;
                }
            });
        }).catch(async (err) => {
            console.log(err)
            let Embed = new EmbedBuilder()
                .setTitle("Error")
                .setDescription("An error has occured, please try again later.")
                .setColor(config.embeds.colors.danger);
            return await msg.reply({
                embeds: [Embed]
            });
        });
    });
}

module.exports = {
    data: new SlashCommandBuilder()
        .setName('settings')
        .setDescription('Change settings of your Hub')
        .setDefaultMemberPermissions(PermissionFlagsBits.Administrator),
    execute: run
};