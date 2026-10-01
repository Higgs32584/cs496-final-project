/*
    runs once before all of the tests.
    starts a temporary MongoDB server in memory, so the DAO tests never
    touch a real database and do not need a `.env` file or a network connection.
    the first run downloads the MongoDB binary, which can take a minute.
*/
const { MongoMemoryServer } = require('mongodb-memory-server');

module.exports = async function()
{
    const mongod = await MongoMemoryServer.create();
    globalThis.__MONGOD__ = mongod;
    // read by `test/setupEnv.js` in every test file
    process.env.MONGO_MEMORY_URI = mongod.getUri();
};
