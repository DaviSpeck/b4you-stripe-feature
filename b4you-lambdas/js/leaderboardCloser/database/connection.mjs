import { Sequelize } from 'sequelize';

export function createSequelize() {
    return new Sequelize({
        database: process.env.MYSQL_DATABASE,
        host: process.env.MYSQL_HOST,
        username: process.env.MYSQL_USERNAME,
        password: process.env.MYSQL_PASSWORD,
        port: Number(process.env.MYSQL_PORT) || 3306,
        dialect: 'mysql',
        logging: false,
    });
}