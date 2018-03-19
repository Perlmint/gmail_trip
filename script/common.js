require("bluebird-global");
const { readFile, writeFile, stat, mkdir } = require("fs");
const { dirname } = require("path");
const { parse, stringify } = require("csv");
const fetch = require('node-fetch');
const { promisify } = require("bluebird");

const readFileAsync = promisify(readFile);
function statAsync(path) {
    return new Promise((resolve, reject) => {
        stat(path, (err, stats) => {
            if (err) {
                if (err.name === "ENOENT") {
                    resolve(false);
                } else {
                    reject(err);
                }
            } else {
                resolve(true);
            }
        });
    });
}
const writeFileAsync = promisify(writeFile);
const mkdirAsync = promisify(mkdir);
/**
 * @param {string} path 
 */
function existsAsync(path) {
    return statAsync(path).then(() => true, () => false);
}

/**
 * @param {string} etagPath cached etag path
 * @param {string} dataPath cached data path
 * @param {string} url data source url
 * @returns {Promise<string>}
 */
function fetchItemWithCache(etagPath, dataPath, url) {
    const headers = {};

    const cacheDir = dirname(etagPath);
    return existsAsync(cacheDir).then(
        exists => exists || mkdirAsync(cacheDir)
    ).thenReturn(Promise.all([
        existsAsync(etagPath),
        existsAsync(dataPath)
    ]).then(exists => (exists[0] && exists[1]) ? readFileAsync(
            etagPath, { encoding: "utf-8" }
        ).then(
            etag => headers["If-None-Match"] = etag
        ) : Promise.resolve()
    )).then(() => fetch(url, {
        headers
    }).then(resp => {
        if (resp.status === 304) {
            return readFileAsync(dataPath, { encoding: "utf-8" });
        }
        const etag = resp.headers.get("ETag");
        return Promise.all([
            resp.text(),
            writeFileAsync(etagPath, etag)
        ]).then(data => writeFileAsync(dataPath, data[0]).thenReturn(data));
    }));
}

/**
 * @param {string} data 
 */
function csvParse(data) {
    return new Promise((resolve, reject) => {
        parse(data, {
            escape: '\\',
        }, (err, d) => {
            if (err) {
                reject(err);
            } else {
                resolve(d);
            }
        });
    });
}

/**
 * @param {any} data 
 * @returns {Promise<string>}
 */
function csvStringify(data) {
    return new Promise((resolve, reject) => {
        stringify(data, (err, out) => {
            if (err) {
                reject(err);
            } else {
                resolve(out);
            }
        })
    });
}

module.exports = {
    fetchItemWithCache,
    readFileAsync,
    writeFileAsync,
    statAsync,
    existsAsync,
    csvParse,
    csvStringify,
};