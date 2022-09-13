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
    if (hasProperty(req.body, "data")) {
        if (hasProperty(req.body.data, "order")) {
            let order = req.body.data.order;
            botSpeaker.request("SHOPPY_PURCHASE", JSON.stringify({
                
            }), () => { });

            return res.status(200).send({ status: 200, message: "OK" });
        } else {
            res.status(200).send({ status: 200, message: "Not Paid" });
        }
    } else {
        res.status(400).send({ status: 400, message: "Bad Request" });
    }
};