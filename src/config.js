require("dotenv").config();

module.exports = exports = {

    token: process.env.TOKEN,
    mongo: process.env.MONGODB,
    port: 3000,
    loader: 0,
    guild: "1015369415879032964",

    embeds: {
        colors: {
            default: "#2f3136",
            primary: "#4752c4",
            success: "#359553",
            danger: "#d53b3e"
        }
    }
}