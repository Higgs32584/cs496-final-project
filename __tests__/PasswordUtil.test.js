const bcrypt = require('bcryptjs');
const passUtil = require('../util/PasswordUtil');

test('A hashed password can be checked against the original', function(){
    let hashed = passUtil.hashPassword('phils pw');

    expect(hashed).not.toBe('phils pw');
    expect(passUtil.checkPassword('phils pw', hashed)).toBe(true);
    expect(passUtil.checkPassword('not phils pw', hashed)).toBe(false);
});

test('Hashing the same password twice gives different hashes', function(){
    // each hash has its own random salt, so equal passwords can not be spotted in the database
    expect(passUtil.hashPassword('phils pw')).not.toBe(passUtil.hashPassword('phils pw'));
});

test('Passwords hashed the old way, with one fixed salt, still work', function(){
    // accounts made before the salt became random have hashes like this one
    let oldSalt = '$2b$04$abcdefghijklmnopqrstuu';
    let oldHash = bcrypt.hashSync('phils pw', oldSalt);

    expect(passUtil.checkPassword('phils pw', oldHash)).toBe(true);
    expect(passUtil.checkPassword('not phils pw', oldHash)).toBe(false);
});

test('Checking something that is not text fails instead of throwing', function(){
    let hashed = passUtil.hashPassword('phils pw');

    expect(passUtil.checkPassword(undefined, hashed)).toBe(false);
    expect(passUtil.checkPassword({$ne: null}, hashed)).toBe(false);
    expect(passUtil.checkPassword('phils pw', null)).toBe(false);
    // a stored password that is not a hash at all never matches
    expect(passUtil.checkPassword('phils pw', 'phils pw')).toBe(false);
});
