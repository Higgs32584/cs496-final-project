const bcrypt = require('bcryptjs');

const SALT_ROUNDS = 10;

/*
hash a password with a random, per-password salt.
the salt is stored inside the returned hash, so nothing else needs to be saved.
*/
exports.hashPassword = function(pass){
    return bcrypt.hashSync(pass, SALT_ROUNDS);
}

/*
check a plain-text password against a stored hash.
also works for hashes made with the old fixed salt, since bcrypt hashes carry their salt.
*/
exports.checkPassword = function(pass, hashedpass){
    if(typeof pass !== 'string' || typeof hashedpass !== 'string')
    {
        return false;
    }
    return bcrypt.compareSync(pass, hashedpass);
}
