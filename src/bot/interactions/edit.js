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

    let Embed = new EmbedBuilder()
        .setTitle("Product")
        .setDescription("Select what you want to edit.")
        .setColor(config.embeds.colors.default);
    return await interaction.reply({
        embeds: [Embed],
        components: [
            new ActionRowBuilder()
                .addComponents(
                    new SelectMenuBuilder()
                        .setCustomId('product_editor')
                        .setPlaceholder('Nothing selected')
                        .setMaxValues(1)
                        .setMinValues(1)
                        .addOptions(
                            {
                                label: 'Product Name',
                                description: `Current Value: ${productRecord.name}`,
                                value: 'name',
                            },
                            {
                                label: 'Product Description',
                                description: `Current Value: ${productRecord.description}`,
                                value: 'description',
                            },
                            {
                                label: 'Product Icon',
                                description: `Current Value: ${productRecord.icon}`,
                                value: 'icon',
                            },
                            {
                                label: 'Product Category',
                                description: `Current Value: ${productRecord.category}`,
                                value: 'category',
                            },
                            {
                                label: 'Product Developer Roblox',
                                description: `Current Value: ${productRecord.devProduct}`,
                                value: 'devproduct',
                            },
                            {
                                label: 'Product Purchasable',
                                description: `Current Value: ${productRecord.purchasable}`,
                                value: 'purchasable',
                            },
                            {
                                label: 'Product File',
                                description: `Current Value: ${productRecord.name}.rbxm`,
                                value: 'file',
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
                            .setTitle('Edit Product')
                        modal.addComponents(
                            new ActionRowBuilder()
                                .addComponents(
                                    new TextInputBuilder()
                                        .setCustomId('Product Name')
                                        .setLabel("What do you wish to call your product?")
                                        .setStyle(TextInputStyle.Short)
                                        .setRequired(true)
                                )
                        );

                        await menuResponse.showModal(modal);

                        await interaction.awaitModalSubmit({ filter: i => i.user.id === interaction.user.id, time: 60000 }).then(async (modalResponse) => {
                            let productName = modalResponse.fields.getTextInputValue('Product Name');

                            await Product.updateOne(
                                {
                                    _id: productRecord._id,
                                },
                                {
                                    $set: {
                                        name: productName,
                                    }
                                }
                            );

                            console.log(`[Deliver]: Product "${productRecord.name}" name has been changed to "${productName}" in "${hubRecord._id}"`);

                            let Embed = new EmbedBuilder()
                                .setTitle("Updated Successful")
                                .setDescription("Your product has been updated!")
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
                            .setTitle('Edit Product')
                        modal2.addComponents(
                            new ActionRowBuilder()
                                .addComponents(
                                    new TextInputBuilder()
                                        .setCustomId('Product Description')
                                        .setLabel("What do you wish the description to be?")
                                        .setStyle(TextInputStyle.Paragraph)
                                        .setRequired(true)
                                )
                        );

                        await menuResponse.showModal(modal2);

                        await interaction.awaitModalSubmit({ filter: i => i.user.id === interaction.user.id, time: 60000 }).then(async (modalResponse) => {
                            let productDescription = modalResponse.fields.getTextInputValue('Product Description');

                            await Product.updateOne(
                                {
                                    _id: productRecord._id,
                                },
                                {
                                    $set: {
                                        description: productDescription,
                                    }
                                }
                            );

                            console.log(`[Deliver]: Product "${productRecord.name}" description has been changed to "${productDescription}" in "${hubRecord._id}"`);

                            let Embed = new EmbedBuilder()
                                .setTitle("Updated Successful")
                                .setDescription("Your product has been updated!")
                                .setColor(config.embeds.colors.success);
                            await modalResponse.reply({
                                embeds: [Embed]
                            });
                        }).catch(async (err) => {
                            console.error(err)
                            return null
                        });
                        break;
                    case 'icon':
                        const modal3 = new ModalBuilder()
                            .setCustomId('setupModal')
                            .setTitle('Edit Product')
                        modal3.addComponents(
                            new ActionRowBuilder()
                                .addComponents(
                                    new TextInputBuilder()
                                        .setCustomId('Product Icon')
                                        .setLabel("What do you wish the icon to be?")
                                        .setStyle(TextInputStyle.Short)
                                        .setRequired(true)
                                )
                        );

                        await menuResponse.showModal(modal3);

                        await interaction.awaitModalSubmit({ filter: i => i.user.id === interaction.user.id, time: 60000 }).then(async (modalResponse) => {
                            let productIcon = modalResponse.fields.getTextInputValue('Product Icon');

                            await Product.updateOne(
                                {
                                    _id: productRecord._id,
                                },
                                {
                                    $set: {
                                        icon: productIcon,
                                    }
                                }
                            );

                            console.log(`[Deliver]: Product "${productRecord.name}" icon has been changed to "${productIcon}" in "${hubRecord._id}"`);

                            let Embed = new EmbedBuilder()
                                .setTitle("Updated Successful")
                                .setDescription("Your product has been updated!")
                                .setColor(config.embeds.colors.success);
                            await modalResponse.reply({
                                embeds: [Embed]
                            });
                        }).catch(async (err) => {
                            console.error(err)
                            return null
                        });
                        break;
                    case 'category':
                        const modal4 = new ModalBuilder()
                            .setCustomId('setupModal')
                            .setTitle('Edit Product')
                        modal4.addComponents(
                            new ActionRowBuilder()
                                .addComponents(
                                    new TextInputBuilder()
                                        .setCustomId('Product Category')
                                        .setLabel("What category will product be in?")
                                        .setStyle(TextInputStyle.Short)
                                        .setRequired(true)
                                )
                        );

                        await menuResponse.showModal(modal4);

                        await interaction.awaitModalSubmit({ filter: i => i.user.id === interaction.user.id, time: 60000 }).then(async (modalResponse) => {
                            let productCategory = modalResponse.fields.getTextInputValue('Product Category');

                            await Product.updateOne(
                                {
                                    _id: productRecord._id,
                                },
                                {
                                    $set: {
                                        category: productCategory,
                                    }
                                }
                            );

                            console.log(`[Deliver]: Product "${productRecord.name}" category has been changed to "${productCategory}" in "${hubRecord._id}"`);

                            let Embed = new EmbedBuilder()
                                .setTitle("Updated Successful")
                                .setDescription("Your product has been updated!")
                                .setColor(config.embeds.colors.success);
                            await modalResponse.reply({
                                embeds: [Embed]
                            });
                        }).catch(async (err) => {
                            console.error(err)
                            return null
                        });
                        break;
                    case 'devproduct':
                        const modal5 = new ModalBuilder()
                            .setCustomId('setupModal')
                            .setTitle('Edit Product')
                        modal5.addComponents(
                            new ActionRowBuilder()
                                .addComponents(
                                    new TextInputBuilder()
                                        .setCustomId('Product Developer Id')
                                        .setLabel("What is the Roblox developer id?")
                                        .setStyle(TextInputStyle.Short)
                                        .setRequired(true)
                                )
                        );

                        await menuResponse.showModal(modal5);

                        await interaction.awaitModalSubmit({ filter: i => i.user.id === interaction.user.id, time: 60000 }).then(async (modalResponse) => {
                            let productDevId = modalResponse.fields.getTextInputValue('Product Developer Id');

                            await Product.updateOne(
                                {
                                    _id: productRecord._id,
                                },
                                {
                                    $set: {
                                        devProduct: productDevId,
                                    }
                                }
                            );

                            console.log(`[Deliver]: Product "${productRecord.name}" developer product has been changed to "${productDevId}" in "${hubRecord._id}"`);

                            let Embed = new EmbedBuilder()
                                .setTitle("Updated Successful")
                                .setDescription("Your product has been updated!")
                                .setColor(config.embeds.colors.success);
                            await modalResponse.reply({
                                embeds: [Embed]
                            });
                        }).catch(async (err) => {
                            console.error(err)
                            return null
                        });
                        break;
                    case 'purchasable':
                        let Embed = new EmbedBuilder()
                            .setTitle("Purchasable")
                            .setDescription("Do you wish to make this product purchasable?")
                            .setColor(config.embeds.colors.default);
                        await menuResponse.reply({
                            embeds: [Embed],
                            components: [
                                new ActionRowBuilder()
                                    .addComponents(
                                        new ButtonBuilder()
                                            .setCustomId('accept')
                                            .setLabel('Yes')
                                            .setStyle(ButtonStyle.Success),
                                        new ButtonBuilder()
                                            .setCustomId('decline')
                                            .setLabel('No')
                                            .setStyle(ButtonStyle.Danger),
                                    )
                            ],
                            fetchReply: true
                        }).then(async (mess) => {
                            mess.awaitMessageComponent({ filter: (i) => i.user.id === interaction.user.id && i.isButton(), time: 60_000 }).then(async (buttonResponse) => {
                                switch (buttonResponse.customId) {
                                    case 'accept':
                                        await Product.updateOne(
                                            {
                                                _id: productRecord._id,
                                            },
                                            {
                                                $set: {
                                                    purchasable: true,
                                                }
                                            }
                                        );

                                        console.log(`[Deliver]: Product "${productRecord.name}" purchasable has been changed to "enabled" in "${hubRecord._id}"`);

                                        let Embed = new EmbedBuilder()
                                            .setTitle("Updated Successful")
                                            .setDescription("Your product has been updated!")
                                            .setColor(config.embeds.colors.success);
                                        await buttonResponse.reply({
                                            embeds: [Embed]
                                        });
                                        break;
                                    case 'decline':
                                        await Product.updateOne(
                                            {
                                                _id: productRecord._id,
                                            },
                                            {
                                                $set: {
                                                    purchasable: false,
                                                }
                                            }
                                        );

                                        console.log(`[Deliver]: Product "${productRecord.name}" purchasable has been changed to "disabled" in "${hubRecord._id}"`);

                                        let Embed2 = new EmbedBuilder()
                                            .setTitle("Updated Successful")
                                            .setDescription("Your product has been updated!")
                                            .setColor(config.embeds.colors.success);
                                        await buttonResponse.reply({
                                            embeds: [Embed2]
                                        });
                                        break;
                                }
                            }).catch(async (err) => {
                                console.log(err)
                                let Embed = new EmbedBuilder()
                                    .setTitle("Error")
                                    .setDescription("An error has occured, please try again later.")
                                    .setColor(config.embeds.colors.danger);
                                return await mess.reply({
                                    embeds: [Embed]
                                });
                            });
                        })
                        break;
                    case 'file':
                        let Embed3 = new EmbedBuilder()
                            .setTitle("File")
                            .setDescription("What type of file do you want customers to get?")
                            .setColor(config.embeds.colors.default);
                        await menuResponse.reply({
                            embeds: [Embed3],
                            components: [
                                new ActionRowBuilder()
                                    .addComponents(
                                        new ButtonBuilder()
                                            .setCustomId('message')
                                            .setLabel('Message')
                                            .setStyle(ButtonStyle.Secondary),
                                        new ButtonBuilder()
                                            .setCustomId('link')
                                            .setLabel('Link')
                                            .setStyle(ButtonStyle.Secondary),
                                    )
                            ],
                            fetchReply: true
                        }).then(async (mess) => {
                            mess.awaitMessageComponent({ filter: (i) => i.user.id === interaction.user.id && i.isButton(), time: 60_000 }).then(async (buttonResponse) => {
                                switch (buttonResponse.customId) {
                                    case 'message':
                                        let Embed3 = new EmbedBuilder()
                                            .setTitle("Message")
                                            .setDescription("What message do you want customers to get?")
                                            .setColor(config.embeds.colors.default);
                                        buttonResponse.reply({
                                            embeds: [Embed3],
                                            components: []
                                        }).then(async (messageReply) => {
                                            buttonResponse.channel.awaitMessages({ max: 1, filter: (m) => m.author.id === interaction.user.id, errors: ["time"], time: 60000 }).then(async (collected) => {
                                                await Product.updateOne(
                                                    {
                                                        _id: productRecord._id,
                                                    },
                                                    {
                                                        $set: {
                                                            "file.type": "1",
                                                            "file.target": collected.first().content,
                                                        }
                                                    }
                                                );

                                                let Embed = new EmbedBuilder()
                                                    .setTitle("Updated Successful")
                                                    .setDescription("Your product has been updated!")
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
                                                return await mess.reply({
                                                    embeds: [Embed]
                                                });
                                            });

                                        });
                                        break;
                                    case 'link':
                                        let Embed12 = new EmbedBuilder()
                                            .setTitle("File")
                                            .setDescription("What link/file do you want customers to get?")
                                            .setColor(config.embeds.colors.default)
                                            .setFooter({ text: 'You have to attach a file for this prompt' });
                                        buttonResponse.reply({
                                            embeds: [Embed12],
                                            components: []
                                        }).then(async (messageReply) => {
                                            buttonResponse.channel.awaitMessages({ max: 1, filter: (m) => m.author.id === interaction.user.id && m.attachments.first(), errors: ["time"], time: 60000 }).then(async (collected) => {
                                                await Product.updateOne(
                                                    {
                                                        _id: productRecord._id,
                                                    },
                                                    {
                                                        $set: {
                                                            "file.type": "2",
                                                            "file.target": collected.first().attachments.first().url,
                                                        }
                                                    }
                                                );

                                                let Embed = new EmbedBuilder()
                                                    .setTitle("Updated Successful")
                                                    .setDescription("Your product has been updated!")
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
                                                return await mess.reply({
                                                    embeds: [Embed]
                                                });
                                            });

                                        });
                                        break;
                                }
                            }).catch(async (err) => {
                                console.log(err)
                                let Embed = new EmbedBuilder()
                                    .setTitle("Error")
                                    .setDescription("An error has occured, please try again later.")
                                    .setColor(config.embeds.colors.danger);
                                return await mess.reply({
                                    embeds: [Embed]
                                });
                            });
                        })
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
        .setName('edit')
        .setDescription('Edit a product.')
        .addStringOption(option =>
            option.setName('productname')
                .setDescription('The product you wish to transfer')
                .setRequired(true)
        )
        .setDefaultMemberPermissions(PermissionFlagsBits.Administrator),
    execute: run
};