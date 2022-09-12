const mongoose = require("mongoose");

const schema = new mongoose.Schema({

    hub: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Hub",
        required: true
    },

    name: {
        type: String,
        required: true,
    },

    description: {
        type: String,
        required: true,
    },

    icon: {
        type: String,
        default: "0",
    },

    category: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Category",
        defualt: null,
    },

    devProduct: {
        type: String,
        required: true,
    },

    file: {
        type: { // 0: none, 1: file, 2: message, 3: link
            type: String,
            default: "0",
        },

        target: {
            type: String,
            default: "None",
        },
    },

    created: {
        type: Date,
        default: Date.now,
    },

});

module.exports = mongoose.model("Product", schema);
