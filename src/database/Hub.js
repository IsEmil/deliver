const mongoose = require("mongoose");

const schema = new mongoose.Schema({

    name: {
        type: String,
        required: true,
    },

    description: {
        type: String,
        required: true,
    },

    info: {
        owner: {
            type: String,
            required: true,
        },

        guild: {
            type: String,
            required: true,
        },

        placeId: {
            type: String,
            required: true,
        },

        token: {
            type: String,
            required: true,
        },
    },

    configuration: {
        channels: {
            purchaseChannel: {
                type: String,
                default: "0",
            },

            actionChannel: {
                type: String,
                default: "0",
            },
        },

        design: {
            testPlace: {
                type: String,
                default: "0",
            },
            
            music: {
                type: Number,
                default: 0,
            },
        },
    },

    created: {
        type: Date,
        default: Date.now,
    },

});

module.exports = mongoose.model("Hub", schema);
