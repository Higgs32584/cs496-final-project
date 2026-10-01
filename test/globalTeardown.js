/*
    runs once after all of the tests. stops the in-memory MongoDB server.
*/
module.exports = async function()
{
    if(globalThis.__MONGOD__)
    {
        await globalThis.__MONGOD__.stop();
    }
};
