/*
    runs at the start of every test file, before any of its code.
    points both database URIs at the in-memory server from `globalSetup.js`.
    each test file gets its own database, so files running at the same time
    cannot interfere with each other.
*/
const crypto = require('crypto');

process.env.NODE_ENV = 'test';

const dbName = 'test_' + crypto.randomBytes(6).toString('hex');
const uri = process.env.MONGO_MEMORY_URI + dbName;

// dotenv never overrides variables that are already set, so these win over the .env file
process.env.TESTDB_URI = uri;
process.env.DB_URI = uri;
