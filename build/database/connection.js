"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const sequelize_typescript_1 = require("sequelize-typescript");
const sequelize = new sequelize_typescript_1.Sequelize({
    database: process.env.DB_NAME,
    dialect: "mysql",
    username: process.env.DB_USERNAME,
    password: process.env.DB_PASSWORD,
    host: process.env.DB_HOST,
    port: Number(process.env.DB_PORT),
    models: [__dirname + "/models"],
});
sequelize
    .authenticate()
    .then(() => {
    console.log("Connected");
})
    .catch((err) => {
    console.log(err);
});
sequelize.sync({ force: false }).then(() => {
    console.log("Synced!!");
});
exports.default = sequelize;
