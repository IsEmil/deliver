const { default: axios } = require("axios");
const messenger = require("messenger");
const express = require("express");

var botSpeaker = messenger.createSpeaker(40000);

const Hub = require("../../database/Hub");
const Client = require("../../database/Client");
const Product = require("../../database/Product");

/**
 * Checks if an object has a property
 * @param {*} obj 
 * @param {String} property 
 * @returns {Boolean}
 */
const hasProperty = (obj, property) => {
    return Object.hasOwnProperty.bind(obj)(property);
};

/**
 * A route
 * @param {express.Request} req 
 * @param {express.Response} res 
 */
module.exports = async (req, res) => {
    if (hasProperty(req.query, "client") && hasProperty(req.query, "hub") && hasProperty(req.query, "product") && hasProperty(req.query, "token")) {
        let hubRecord = await Hub.findOne({
            _id: req.query.hub
        }).exec();

        if (!hubRecord) {
            return res.status(200).send({ status: 400, message: "Bad Request" });
        };

        let productRecord = await Product.findOne({
            _id: req.query.product
        }).exec();

        if (!productRecord) {
            return res.status(200).send({ status: 400, message: "Bad Request" });
        };

        let clientRecord = await Client.findOne({
            _id: req.query.client
        }).exec();

        if (!clientRecord) {
            return res.status(200).send({ status: 400, message: "Bad Request" });
        };

        const purchaseObject = clientRecord.purchases.create({
            product: productRecord._id,
            hub: hubRecord._id,
        });

        clientRecord.purchases.push(purchaseObject);
        await clientRecord.save();

        if (productRecord.roles !== "0") {
            botSpeaker.request("PURCHASE_RANK", JSON.stringify({
                client: clientRecord,
                product: productRecord,
                hub: hubRecord
            }), () => { });
        }

        botSpeaker.request("ROBLOX_PURCHASE", JSON.stringify({
            client: clientRecord,
            product: productRecord,
            hub: hubRecord
        }), () => { });

        return res.status(200).send({ status: 200, message: "OK" });
    } else {
        res.status(200).send({ status: 400, message: "Bad Request" });
    }
};