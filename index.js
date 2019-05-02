const express = require('express');
const cors = require('cors');
const app = express();
const path = require('path');
const MongoClient = require('mongodb').MongoClient;
const assert = require('assert');


//database
const dbUrl = 'mongodb://localhost:27017';
const dbName = 'syncedPlay';

const client = new MongoClient(dbUrl);
const connection = client.connect().then((result) => {
    console.log('connected to mongo db');
}).catch((err) => {
    throw err;
});

//database
// MongoClient.connect(dbUrl, function (err, client) {
//     assert.equal(null, err);
//     console.log("Connected successfully to mongo db server");
//     const db = client.db(dbName);
//     db.collection('rooms');

//     client.close;
// });

//express server
app.listen(4000, () => {
    console.log('Server Works !!! At port 4000');
});


app.use(cors());






app.get('/script.js', (req, res) => {
    res.sendFile(path.join(__dirname + '/script.js'));
});

app.get('/galaxy.jpeg', (req, res) => {
    res.sendFile(path.join(__dirname + '/galaxy.jpeg'));
});

app.get('/style.css', (req, res) => {
    res.sendFile(path.join((__dirname + '/style.css')));
});

//index page
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname + '/index.html'));
});

app.get('/sessions', (req, res) => {
    res.sendFile(path.join(__dirname + '/SessionsPages/Sessions.html'));
});

app.get('/sessions.js', (req, res) => {
    res.sendFile(path.join(__dirname, '/SessionsPages/sessions.js'));
});

app.get('/sessions.css', (req, res) => {
    res.sendFile(path.join(__dirname, '/SessionsPages/sessions.css'));
});




async function addVideoToRoom(dataInfo, video) {
    const db = client.db(dbName);
    const coll = db.collection('rooms');
    var filtr;
    //if the room has a id
    try {
        if (dataInfo._id) {
            filtr = {
                '_id': dataInfo._id
            };
            //id the room has name
        } else {
            filtr = {
                '_id': dataInfo._id
            };
        }
        await coll.update(filtr, {
            $addToSet: {
                'srcs': video
            }
        });
    } catch (error) {
        console.log(error);
    }


}

async function popVideoFromRoom(dataInfo, video) {
    const db = client.db(dbName);
    const coll = db.collection('rooms');
    var filtr;
    try {
        //if the room has a id
    if (dataInfo._id) {
        filtr = {
            '_id': dataInfo._id
        };
        //id the room has name
    } else {
        filtr = {
            '_id': dataInfo._id
        };
    }
    await coll.update(filtr, {
        $pull: {
            'srcs': video
        }
    });
    } catch (error) {
        console.log(error);      
    }
}


async function addSessionToDb(db_data, ip) {
    let doc = JSON.parse(db_data);
    let realDoc = {
        users: [{
            username: doc.username,
            ip: ip,
            admin: true
        }],
        roomName: doc.roomName,
        roomPass: doc.roomPass,
        srcs: []
    };
    const db = client.db(dbName);
    const coll = db.collection('rooms');
    let coun = await coll.find({
        'roomName': doc.roomName
    }).count();
    if (coun > 0) {
        console.error('name exists');
        return;
    }
    coll.insertOne(realDoc).then((result) => {
        console.log('succesfully created a room');
    }).catch((err) => {
        throw err;
    });;
}

async function addUserToSession(db_data, ip) {
    let doc = JSON.parse(db_data);

    const db = client.db(dbName);
    const coll = db.collection('rooms');
    let rom = await coll.findOne({
        'roomName': doc.roomName
    });
    //no room
    if (!rom) {
        console.error('room doesnt exists');
        return;
    }
    //wrong password
    if (doc.roomPass != rom.roomPass) {
        console.error('passwords dont match');
        return;
    }
    let pushData = {
        username: doc.username,
        ip: ip
    };
    rom.users.push(pushData);
    rom = rom.users;

    //update the db
    coll.updateOne({
        roomName: doc.roomName
    }, {
        $set: {
            'users': rom
        }
    }).then((result) => {
        console.log('login succesful updated the db');
    }).catch((err) => {
        throw err;
    });

}

app.get('/sesapi', (req, res) => {
    if (req.query.type == 'create') {
        addSessionToDb(req.query.data, req.ip);
    } else if (req.query.type == 'join') {
        console.log('join');
        addUserToSession(req.query.data, req.ip);
    }


});

app.get('/download', (req, res) => {
    var URL = req.query.URL;
    res.json({
        url: URL
    });
});