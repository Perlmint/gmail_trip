const { fetchItemWithCache, writeFileAsync, csvParse, csvStringify } = require("./common");
const { join } = require("path");

const SRC_URL = "https://github.com/jpatokal/openflights/raw/master/data/airports.dat";
const CACHE_ETAG_PATH = join(__dirname, "..", ".cache", "airports.etag.txt");
const CACHE_PATH = join(__dirname, "..", ".cache", "airports.csv");
const OUT_PATH = join(__dirname, "..", "src", "airports.csv");

fetchItemWithCache(
    CACHE_ETAG_PATH,
    CACHE_PATH,
    SRC_URL,
).then(
    data => csvParse(data),
).then(
    data => data.map(d => ({
        name: d[1],
        code: d[4],
        timezone: d[11],
    })).filter(d => d.code !== "" && d.code !== "-"),
).then(
    csvStringify
).then(
    data => writeFileAsync(OUT_PATH, data)
);