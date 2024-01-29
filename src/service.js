'use strict'

const db = require('./db');

class Service {
    constructor() {
        this.onLoad = db.init();
        this.pool = db.pool;
    }

    async getAllCars() {
        try {
            const cars = await this.pool.query('SELECT * FROM cars');
            return cars.rows;
        } catch (err) {
            return err;
        }
    }

    async getAllOwners() {
        try {
            const owners = await this.pool.query('SELECT * FROM owners');
            return owners.rows;
        } catch (err) {
            return err;
        }
    }

    async getAllOwnership() {
        try {
            const ownership = await this.pool.query('SELECT * FROM ownership');
            return ownership.rows;
        } catch (err) {
            return err;
        }
    }

    async getAllRecords() {
        try {
            const records = await this.pool.query(
                `SELECT * FROM owners
                FULL OUTER JOIN ownership ON owners.id = owner_id
                FULL OUTER JOIN cars ON car_id = cars.id
                ORDER BY owners.id`
            );
            return records.rows;
        } catch (err) {
            return err;
        }
    }

    async getOwnersOnDate(date) {
        try {
            const records = await this.pool.query(
                `SELECT owners.name, cars.model FROM owners
                JOIN ownership ON owners.id = owner_id
                JOIN cars ON cars.id = car_id
                WHERE purchase_date < CAST ($1 AS DATE) 
                AND (sale_date > CAST ($1 AS DATE) OR sale_date IS NULL)
                ORDER BY owners.name`,
                [date]
            )
            return records.rows;
        } catch (err) {
            return err;
        }
    }
}

module.exports = new Service();
