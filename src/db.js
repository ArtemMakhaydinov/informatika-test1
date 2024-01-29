'use strict'

const { Pool } = require('pg');

class DBConnection {
    constructor() {
        this.pool = this.connect();
    }

    connect() {
        const pool = new Pool({
            user: process.env.PG_USER,
            password: process.env.PG_PASSWORD,
            host: process.env.PG_HOST,
            port: process.env.PG_PORT,
            database: process.env.PG_DB_NAME,
        });

        pool.on('error', (err, client) => {
            console.error('Unexpected error on idle client', err);
            process.exit(-1);
        })

        return pool;
    }

    async init() {
        const client = await this.pool.connect();
        try {
            await client.query(
                `CREATE TABLE IF NOT EXISTS cars(
                    id SERIAL PRIMARY KEY,
                    model VARCHAR(256) NOT NULL
                )`
            );

            await client.query(
                `CREATE TABLE IF NOT EXISTS owners(
                    id SERIAL PRIMARY KEY,
                    name VARCHAR(256) NOT NULL
                )`
            );

            await client.query(
                `CREATE TABLE IF NOT EXISTS ownership(
                    car_id INTEGER,
                    owner_id INTEGER,
                    purchase_date DATE,
                    sale_date DATE,
                    FOREIGN KEY (car_id) REFERENCES cars (id) ON DELETE CASCADE,
                    FOREIGN KEY (owner_id) REFERENCES owners (id) ON DELETE CASCADE
                )`
            );

        } catch (err) {
            throw err;
        } finally {
            client.release();
        }
    }
}

module.exports = new DBConnection();
