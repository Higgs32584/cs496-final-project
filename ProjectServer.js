// starts the server: connects to the database, then listens for requests.
// the application itself (middleware and routes) is built in `app.js`
require('dotenv').config(); // for the values from the .env file
const session = require('express-session'); // for session management
const MongoDBStore = require('connect-mongodb-session')(session); // for session storage

const dbcon = require('./model/DBConnection'); // for connecting to the database
const { createApp } = require('./app');

/*
    which database to use. the test database is used by default, and the main
    one is used when NODE_ENV=production or DB_TARGET=main is set in the .env file.
*/
const dbTarget = dbcon.getServerTarget();

// setting up localhost
let hostname = process.env.HOST || "localhost";
let port = process.env.PORT || 4000;

async function start()
{
    // connecting to database
    await dbcon.connect(dbTarget);

    // for storing sessions in mongoDB, in the same database as everything else
    const mongoDBstore = new MongoDBStore({
        uri: dbcon.getUri(dbTarget),
        collection: 'sessions'
    });
    mongoDBstore.on('error', function(error)
    {
        console.error('Session store error:', error);
    });

    const app = createApp({ sessionStore: mongoDBstore });

    app.listen(port, hostname,
        function()
        {
            console.log(`Server running in ${hostname}:${port} (${dbTarget} database)`);
        }
    );
}

start().catch(function(error)
{
    console.error('Could not start the server:');
    console.error(error.message);
    process.exit(1);
});
