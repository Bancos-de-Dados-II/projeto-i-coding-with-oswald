import { Sequelize } from "sequelize-typescript"
import { fileURLToPath } from 'url';
import { dirname } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
console.log(process.env.DB)

const sequelize = new Sequelize({
    database: process.env.DB || "",
    password: process.env.DB_PASSWORD || "",
    username: process.env.DB_USER || "",
    host: process.env.DB_HOST || "",
    dialect: "postgres",
    models: [__dirname + "/models"]
})

export default sequelize