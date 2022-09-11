const discord = require("discord.js");
const mongoose = require("mongoose");

const config = require("./config.js");
const shardingManager = new discord.ShardingManager("./src/bot/bot.js", { token: config.token });

shardingManager.on("shardCreate", (shard) => {
    console.log(`[Deliver]: Launched shard ${shard.id}`);
});

shardingManager.spawn();
