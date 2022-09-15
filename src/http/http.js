const messenger = require("messenger");
const express = require("express");
const helmet = require("helmet");

const config = require("../config.js");
const app = express();

app.use(helmet());
app.use(express.json());
app.use((req, res, next) => {
    res.setHeader("X-Powered-By", "Deliver");
    next();
});

app.get("/", (_, res) => {
    res.status(200).send("OK");
});

app.get("/roblox/pay", require("./routes/roblox.pay.js"));
app.get("/client/get", require("./routes/client.get.js"));
app.get("/product/get", require("./routes/product.get.js"));


app.get("*", (_, res) => {
    res.status(404).send("Not Found");
});

module.exports = () => {
    app.listen(config.port, () => {
        console.log(`[Deliver]: Listening on port ${config.port}`);
    });
}