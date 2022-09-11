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

/**
 * @description The function executed when a command is invoked
 * @param {Interactions} interaction
 * @param {GuildMember} member 
 * @param {Client} client
 */
async function run(interaction, member, client) {
  const cpuUsage = await osUtils.cpu.usage(100);
  const cpuCores = osUtils.cpu.count();

  console.log(cpuUsage, cpuCores);

  let Embed = new EmbedBuilder()
    .setTitle("Information")
    .setThumbnail(client.user.avatarURL())
    .addFields(
      { name: "Ping", value: `${client.ws.ping}ms`, inline: true },
      { name: "Shards", value: `${client.shard.ids[0]}`, inline: true },
      { name: "CPU", value: `${cpuUsage}% (${cpuCores} cores)`, inline: true },
      { name: "Version", value: `${require("../../../package.json").version}`, inline: true },
      { name: "Library", value: "Discord.js V14", inline: true },
    )
    .setColor(config.embeds.colors.default);
  interaction.reply({
    embeds: [Embed]
  });
}

module.exports = {
  data: new SlashCommandBuilder()
    .setName('info')
    .setDescription('Get information about the bot'),
  execute: run
};