'use strict'

require('dotenv').config();
const http = require('node:http');
const service = require('./service');

const PORT = process.env.PORT || 3000;

const routing = {
    '/': `<a href = "/all"> <span>All records</span> </a> </br>
        <a href = "/owners"> <span>All owners</span> </a> </br>
        <a href = "/ownership"> <span>All ownership</span> </a> </br>
        <a href = "/cars"> <span>All cars</span> </a> </br>
        <a href = "/date?date=2002-1-1"> <span>Owners on 2002-01-01</span> </a> </br>
        <a href = "/date?date=2005-02-10"> <span>Owners on 2005-02-10</span> </a> </br>`,
    '/cars': async () => await service.getAllCars(),
    '/owners': async () => await service.getAllOwners(),
    '/ownership': async () => await service.getAllOwnership(),
    '/all': async () => await service.getAllRecords(),
    '/date': async (param) => await service.getOwnersOnDate(param.date),
    '/api/cars': async () => await service.getAllCars(),
    '/api/owners': async () => await service.getAllOwners(),
    '/api/ownership': async () => await service.getAllOwnership(),
    '/api/all': async () => await service.getAllRecords(),
    '/api/date': async (param) => await service.getOwnersOnDate(param.date),
};

const types = {
    string: (s) => s,
    function: (fn, params) => fn(...params),
    undefined: () => 'Not found.',
};

const HTMLtableBuilder = (data) => {
    const keys = Object.keys(data[0]);
    let htmlString = '<table><tr>';
    for (const key of keys) {
        htmlString += `<th>${key}</th>`
    };

    htmlString += '</tr>'
    for (const record of data) {
        htmlString += '<tr>';
        for (const key of keys) {
            htmlString += `<td>${record[key]}</td>`
        };
        htmlString += '</tr>';
    };

    htmlString += '</table>';
    return htmlString;
};

const router = async (req, res) => {
    const url = req.url.split('?')[0];
    const isApi = url.split('/')[1] === 'api';
    let params = [];
    if (req.url.includes('?')) {
        const paramsString = req.url.split('?')[1];
        params = paramsString.split('&')
            .map(param => {
                const [key, value] = param.split('=');
                return { [key]: value };
            });
    }
    const route = routing[url];
    const type = typeof route;
    const serializer = types[type];
    const data = await serializer(route, params);
    if (isApi || data instanceof Error) return JSON.stringify(data);
    if (typeof data !== 'object') return data;
    if (!data.length) return 'Not found.';
    return HTMLtableBuilder(data)
};

http.createServer(async (req, res) => {
    const data = await router(req, res);
    res.end(data);
}).listen(PORT, () => {
    console.log(`Server is running on ${PORT}`);
});
