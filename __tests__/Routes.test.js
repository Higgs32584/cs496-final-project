/*
    tests for the server as a whole: real routes, real sessions, real DAOs,
    and the in-memory test database. these check the things the controller
    and DAO tests cannot, like which routes exist and who is allowed to use them.
*/
const request = require('supertest');
const mongoose = require('mongoose');
const fs = require('fs');
const path = require('path');

const dbcon = require('../model/DBConnection');
const { createApp } = require('../app');

const app = createApp({ logging: false });
const testImage = path.join(__dirname, '../util/mocks/internet_blues.jpg');

const normalAccount = { username: 'jakob', email: 'dusker@hotspot.net', password: 'something else' };
const adminAccount = { username: 'billy', email: 'thekid@hotshot.net', password: 'something' };

// agents keep their cookies between requests, like a browser does
let visitor;
let normalUser;
let admin;

async function registerAndLogin(account)
{
    let agent = request.agent(app);
    await agent.post('/saveuser').send(account).expect(200);
    await agent.post('/dologin').send({ email: account.email, password: account.password }).expect(200);
    return agent;
}

beforeAll(async function(){
    await dbcon.connect('test');

    visitor = request.agent(app);
    normalUser = await registerAndLogin(normalAccount);

    // there is no route that makes an admin, so it has to be done in the database directly
    let newAdmin = request.agent(app);
    await newAdmin.post('/saveuser').send(adminAccount).expect(200);
    await mongoose.connection.collection('users').updateOne({ email: adminAccount.email }, { $set: { admin: 1 } });
    await newAdmin.post('/dologin').send({ email: adminAccount.email, password: adminAccount.password }).expect(200);
    admin = newAdmin;
});

afterAll(async function(){
    await mongoose.connection.dropDatabase();
    await dbcon.disconnect();
});

describe('Accounts', function(){
    test('The password is stored hashed and never sent back', async function(){
        let stored = await mongoose.connection.collection('users').findOne({ email: normalAccount.email });
        expect(stored.password).not.toBe(normalAccount.password);

        let response = await normalUser.get('/getlogged').expect(200);
        expect(response.body.email).toBe(normalAccount.email);
        expect(response.body.password).toBeNull();
    });

    test('Registering can not make an admin', async function(){
        await visitor.post('/saveuser')
            .send({ username: 'sneaky', email: 'sneaky@hotspot.net', password: 'let me in', admin: 1 })
            .expect(200);
        let stored = await mongoose.connection.collection('users').findOne({ email: 'sneaky@hotspot.net' });
        expect(stored.admin).toBe(0);
    });

    test('Logging in with the wrong password fails', async function(){
        await request(app).post('/dologin')
            .send({ email: normalAccount.email, password: 'not the password' })
            .expect(401);
    });

    test('Logging in with a query object instead of text fails', async function(){
        await request(app).post('/dologin')
            .send({ email: { $ne: null }, password: { $ne: null } })
            .expect(401);
    });

    test('A visitor is not logged in', async function(){
        await visitor.get('/getlogged').expect(401);
    });

    test('Updating an account changes the password that logs in', async function(){
        let account = { username: 'changer', email: 'changer@hotspot.net', password: 'first password' };
        let agent = await registerAndLogin(account);

        let response = await agent.post('/updateuser')
            .send({ username: 'changed', password: 'second password' })
            .expect(202);
        expect(response.body.username).toBe('changed');
        expect(response.body.password).toBeNull();

        await request(app).post('/dologin').send({ email: account.email, password: 'first password' }).expect(401);
        await request(app).post('/dologin').send({ email: account.email, password: 'second password' }).expect(200);
    });

    test('Updating an account requires being logged in', async function(){
        await visitor.post('/updateuser').send({ username: 'nobody' }).expect(401);
    });

    test('Users can delete their own account but not someone else\'s', async function(){
        let account = { username: 'leaver', email: 'leaver@hotspot.net', password: 'goodbye all' };
        let agent = await registerAndLogin(account);
        let me = (await agent.get('/getlogged')).body;
        let other = (await normalUser.get('/getlogged')).body;

        await agent.delete('/user/' + other._id).expect(403);
        await agent.delete('/user/' + me._id).expect(204);
        // the account is gone and so is the login
        await agent.get('/getlogged').expect(401);
        await request(app).post('/dologin').send({ email: account.email, password: account.password }).expect(401);
    });
});

describe('Meetings', function(){
    let meetingID;

    test('Only an admin can create a meeting', async function(){
        let meeting = { date: new Date().toISOString(), topic: 'a topic', content: 'some content' };
        await visitor.post('/savemeeting').send(meeting).expect(401);
        await normalUser.post('/savemeeting').send(meeting).expect(401);
    });

    test('An admin can create a meeting with an image', async function(){
        let response = await admin.post('/savemeeting')
            .field('date', new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString())
            .field('speaker', 'mr. monkey')
            .field('topic', 'why bananas are healthy for you')
            .field('location', 'the top of a tree')
            .field('content', 'in this meeting, we discuss the health benefits of bananas')
            .attach('meetingImage', testImage)
            .expect(200);

        meetingID = response.body._id;
        expect(response.body.topic).toBe('why bananas are healthy for you');
        expect(response.body.img.contentType).toBe('image/jpeg');
        // images are sent as base64 text
        expect(response.body.img.data).toBe(fs.readFileSync(testImage).toString('base64'));
    });

    test('Uploading a file that is not an image is rejected', async function(){
        await admin.post('/savemeeting')
            .field('topic', 'a topic')
            .field('content', 'some content')
            .attach('meetingImage', Buffer.from('this is not an image'), { filename: 'notes.txt', contentType: 'text/plain' })
            .expect(415);
    });

    test('A meeting with missing or bad information is rejected', async function(){
        // the topic and content are required
        await admin.post('/savemeeting').send({ speaker: 'nobody' }).expect(400);
        await admin.post('/savemeeting')
            .send({ date: 'not a date', topic: 'a topic', content: 'some content' })
            .expect(400);
        // the server must still be running afterwards
        await visitor.get('/allmeetings').expect(200);
    });

    test('Anyone can read meetings', async function(){
        let upcoming = await visitor.get('/upcomingmeetings').expect(200);
        expect(upcoming.body.length).toBe(1);
        await visitor.get('/pastmeetings').expect(200);
        await visitor.get('/allmeetings').expect(200);
        let single = await visitor.get('/meeting/' + meetingID).expect(200);
        expect(single.body.speaker).toBe('mr. monkey');
    });

    test('Reading a meeting with an ID that is not valid gives a 404', async function(){
        await visitor.get('/meeting/not-a-real-id').expect(404);
        await visitor.get('/meeting/' + new mongoose.Types.ObjectId()).expect(404);
    });

    test('Searching finds the meeting', async function(){
        let found = await visitor.post('/searchmeetings').send({ search: 'bananas' }).expect(200);
        expect(found.body.length).toBe(1);
        await visitor.post('/searchmeetings').send({ search: 'zeppelins' }).expect(404);
        await visitor.post('/searchmeetings').send({ search: { $ne: null } }).expect(404);
    });

    test('Only an admin can update a meeting, and the image is kept', async function(){
        let changes = { _id: meetingID, topic: 'why bananas are bad for you', content: 'new content' };
        await normalUser.post('/updatemeeting').send(changes).expect(401);

        let response = await admin.post('/updatemeeting').send(changes).expect(202);
        expect(response.body.topic).toBe('why bananas are bad for you');
        expect(response.body.speaker).toBe('mr. monkey');
        expect(response.body.img.title).toBe('internet_blues.jpg');
    });

    test('Updating a meeting that does not exist gives a 404', async function(){
        await admin.post('/updatemeeting').send({ topic: 'no id at all', content: 'content' }).expect(404);
        await admin.post('/updatemeeting')
            .send({ _id: String(new mongoose.Types.ObjectId()), topic: 'a topic', content: 'content' })
            .expect(404);
    });

    test('Only an admin can delete a meeting', async function(){
        await visitor.delete('/meeting/' + meetingID).expect(401);
        await normalUser.delete('/meeting/' + meetingID).expect(401);
        await admin.delete('/meeting/' + meetingID).expect(204);
        await visitor.get('/meeting/' + meetingID).expect(404);
    });
});

describe('Speakers', function(){
    let speaker = {
        name: 'Test Speaker',
        phone: '123-456-7890',
        email: 'test@example.com',
        mailing_address: '123 Main St',
        specialty: 'Testing'
    };
    let speakerID;

    test('Only an admin can create a speaker', async function(){
        await visitor.post('/savespeaker').send(speaker).expect(401);
        await normalUser.post('/savespeaker').send(speaker).expect(401);

        let response = await admin.post('/savespeaker').send(speaker).expect(200);
        speakerID = response.body._id;
        expect(response.body.name).toBe(speaker.name);
    });

    test('A speaker with the same email can not be created twice', async function(){
        await admin.post('/savespeaker').send(speaker).expect(409);
    });

    test('Updating a speaker changes that speaker and no other', async function(){
        let second = await admin.post('/savespeaker')
            .send({ name: 'Second Speaker', email: 'second@example.com', specialty: 'Waiting' })
            .expect(200);

        await normalUser.post('/editspeaker').send({ _id: second.body._id, name: 'Hacked' }).expect(401);
        let response = await admin.post('/editspeaker')
            .send({ _id: second.body._id, name: 'Renamed Speaker', email: 'second@example.com', specialty: 'Waiting' })
            .expect(202);
        expect(response.body.name).toBe('Renamed Speaker');

        let first = await visitor.get('/speaker/' + speakerID).expect(200);
        expect(first.body.name).toBe(speaker.name);

        // an update without an ID must not change anything
        await admin.post('/editspeaker').send({ name: 'Nobody' }).expect(404);
        let all = await visitor.get('/allspeakers').expect(200);
        expect(all.body.map(s => s.name).sort()).toEqual(['Renamed Speaker', 'Test Speaker']);
    });

    test('Only an admin can delete a speaker', async function(){
        await visitor.delete('/speaker/' + speakerID).expect(401);
        await normalUser.delete('/speaker/' + speakerID).expect(401);
        await admin.delete('/speaker/' + speakerID).expect(202);
        await visitor.get('/speaker/' + speakerID).expect(404);
        await admin.delete('/speaker/not-a-real-id').expect(404);
    });
});

describe('News', function(){
    let postID;

    test('Only an admin can create a news post', async function(){
        let post = { title: 'a title', description: 'a description' };
        await visitor.post('/savenewspost').send(post).expect(401);
        await normalUser.post('/savenewspost').send(post).expect(401);

        let response = await admin.post('/savenewspost')
            .field('date', String(Date.now()))
            .field('title', 'GRAND posting')
            .field('description', 'fleentstones!?')
            .field('link', 'https://youtu.be/nF-xdiL7Nr0')
            .attach('newsImages', testImage)
            .attach('newsImages', testImage)
            .expect(200);

        postID = response.body._id;
        expect(response.body.images.length).toBe(2);
        expect(response.body.link).toBe('https://youtu.be/nF-xdiL7Nr0');
    });

    test('Anyone can read news', async function(){
        let all = await visitor.get('/getnews').expect(200);
        expect(all.body.length).toBe(1);
        await visitor.get('/news/' + postID).expect(200);
        await visitor.get('/news/not-a-real-id').expect(404);
    });

    test('Updating a news post keeps its images and can remove its link', async function(){
        await normalUser.post('/updatenewspost').send({ _id: postID, title: 'Hacked' }).expect(401);

        await admin.post('/updatenewspost')
            .field('_id', postID)
            .field('title', 'calmer posting')
            .field('description', 'fleentstones!?')
            .field('link', '')
            .expect(204);

        let response = await visitor.get('/news/' + postID).expect(200);
        expect(response.body.title).toBe('calmer posting');
        expect(response.body.link).toBe('');
        expect(response.body.images.length).toBe(2);
    });

    test('Only an admin can delete a news post', async function(){
        await visitor.delete('/news/' + postID).expect(401);
        await normalUser.delete('/news/' + postID).expect(401);
        await admin.delete('/news/' + postID).expect(204);
        await visitor.get('/news/' + postID).expect(404);
    });
});
