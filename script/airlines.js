const { fetchItemWithCache, writeFileAsync, csvParse, csvStringify } = require("./common");
const { join } = require("path");

const SRC_URL = "https://github.com/jpatokal/openflights/raw/master/data/airlines.dat";
const CACHE_ETAG_PATH = join(__dirname, "..", ".cache", "airlines.etag.txt");
const CACHE_PATH = join(__dirname, "..", ".cache", "airlines.csv");
const OUT_PATH = join(__dirname, "..", "src", "airlines.csv");

fetchItemWithCache(
    CACHE_ETAG_PATH,
    CACHE_PATH,
    SRC_URL,
).then(
    data => csvParse(data),
).then(
    data => data.map(d => ({
        name: d[1],
        code: d[3],
    })).filter(d => d.code !== "" && d.code !== "-"),
).then(
    csvStringify
).then(
    data => writeFileAsync(OUT_PATH, data)
);