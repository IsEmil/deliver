const express = require("express");

const Hub = require("../../database/Hub");
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
    if (hasProperty(req.query, "client") && hasProperty(req.query, "hub") && hasProperty(req.query, "token")) {
        let hubRecord = await Hub.findOne({
            _id: req.query.hub
        }).exec();

        if (!hubRecord) {
            return res.status(200).send({ status: 400, message: "Bad Request" });
        };

        let productRecord = await Product.find({
            hub: hubRecord._id,
        }).exec();

        if (hubRecord.info.token !== req.query.token) {
            return res.status(200).send({ status: 403, message: "NOT_AUTHENTICATED" });
        };

        return res.status(200).send({ status: 200, message: "OK", data: productRecord });
    } else {
        res.status(200).send({ status: 400, message: "Bad Request" });
    }
};