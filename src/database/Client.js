const mongoose = require("mongoose");

const Purchase = new mongoose.Schema({

    product: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Product",
        required: true,
    },

    hub: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Hub",
        required: true,
    },

    created: {
        type: Date,
        default: Date.now,
    },

});

const Staff = new mongoose.Schema({

    role: {
        type: String,
        required: true,
    },

    hub: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Hub",
        required: true,
    },

    created: {
        type: Date,
        default: Date.now,
    },

});

const schema = new mongoose.Schema({

    roblox: {
        type: String,
        required: true,
    },

    discord: {
        type: String,
        required: true,
    },

    purchases: [Purchase],

    staffs: [Staff],

    created: {
        type: Date,
        default: Date.now,
    },

});

module.exports = mongoose.model("Client", schema);
