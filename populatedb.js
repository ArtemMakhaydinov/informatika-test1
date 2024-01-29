'use strict'

require('dotenv').config();
const db = require('./src/db');

const cars = [
    'Toyota Corola',
    'Mitsubishi Lancer',
    'Ford Focus',
    'Volkswagen Golf',
    'Lexus GS300',
];

const owners = [
    'Jay Gatsby',
    'Humbert Humbert',
    'Sherlock Holmes',
    'Peter Pan',
    'Harry Potter',
    'Huckleberry Finn',
];

const ownerships = [
    {
        car: 0,
        owner: 0,
        purchaseDate: '2001-1-1',
        saleDate: '2001-9-9',
    },
    {
        car: 0,
        owner: 1,
        purchaseDate: '2001-9-9',
        saleDate: '2005-3-10',
    },
    {
        car: 0,
        owner: 2,
        purchaseDate: '2005-3-10',
        saleDate: '2010-12-1',
    },
    {
        car: 1,
        owner: 2,
        purchaseDate: '2003-2-2',
        saleDate: '2006-10-10',
    },
    {
        car: 1,
        owner: 3,
        purchaseDate: '2006-10-10',
    },
    {
        car: 2,
        owner: 2,
        purchaseDate: '2000-1-28',
        saleDate: '2003-1-18',
    },
    {
        car: 4,
        owner: 4,
        purchaseDate: '2002-8-20',
    },
    {
        car: 2,
        owner: 3,
        purchaseDate: '2003-1-18',
    },
];

const createRecords = async (cars, owners, ownerships) => {
    await db.init();
    const { pool } = db;
    const client = await pool.connect();
    const carIds = [];
    const ownersIds = [];
    for (const car of cars) {
        const record = await client.query(
            `INSERT INTO cars (model)
            VALUES ($1)
            RETURNING *`,
            [car]
        );
        console.log(record.rows[0]);
        carIds.push(record.rows[0].id);
    };

    for (const owner of owners) {
        const record = await client.query(
            `INSERT INTO owners (name)
            VALUES ($1)
            RETURNING *`,
            [owner]
        );
        console.log(record.rows[0]);
        ownersIds.push(record.rows[0].id);
    };

    for (const ownership of ownerships) {
        const carId = carIds[ownership.car];
        const ownerId = ownersIds[ownership.owner];
        const { purchaseDate, saleDate } = ownership;
        const record = await client.query(
            `INSERT INTO ownership (car_id, owner_id, purchase_date, sale_date)
            VALUES ($1, $2, $3, $4)
            RETURNING *`,
            [carId, ownerId, purchaseDate, saleDate]
        );
        console.log(record.rows[0]);
    };
    
    client.release();
};

const init = async () => {
    const { pool } = db;
    try {
        await createRecords(cars, owners, ownerships);
    } catch (err) {
        console.error(err);
    } finally {
        pool.end();
    }
};

init();
