require('dotenv').config(); // get the env variables
const mongoose = require('mongoose');

// keep the mongoose 6 behavior explicitly (also silences the mongoose 7 warning)
mongoose.set('strictQuery', true);

/*
get the connection string for a database.
'test' gives the test database, anything else gives the main one.
*/
exports.getUri = function(dbwhere){
    if(dbwhere === 'test')
    {
        return process.env.TESTDB_URI;
    }
    return process.env.DB_URI;
}

/*
which database the server should use.
the main database is only used in production, or when DB_TARGET=main is set.
*/
exports.getServerTarget = function(){
    if(process.env.DB_TARGET)
    {
        return process.env.DB_TARGET === 'test' ? 'test' : 'main';
    }
    return process.env.NODE_ENV === 'production' ? 'main' : 'test';
}

exports.connect = async function(dbwhere){
    let uri = exports.getUri(dbwhere);
    if(!uri)
    {
        let name = dbwhere === 'test' ? 'TESTDB_URI' : 'DB_URI';
        throw new Error(`${name} is not set. Add it to the .env file (see .env.example).`);
    }
    await mongoose.connect(uri);
}
exports.disconnect = async function(){
    await mongoose.connection.close();
}
