const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
const app = express();
const path = require('path');
const MongoClient = require('mongodb').MongoClient;
const assert = require('assert');
const ws = require('ws');


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


// Websocket
const wss = new ws.Server({
    port: 8080,
    perMessageDeflate: {
        zlibDeflateOptions: {
            chunkSize: 1024,
            memLevel: 7,
            level: 3
        },
        clientNoContextTakeover: true,
        serverNoContextTakeover: true,
        serverMaxWindowBits: 10,
        concurrencyLimit: 10,
        threshold: 1024
    }
});

var SOCKETS = [];
wss.on("connection", (wsIn, req) => {
    console.log("New Client");
    SOCKETS.push(wsIn);
    console.log(req.headers.from);
    console.log(req.headers.host);
    wsIn.on("message", (message) => {
        console.log(message);
    })
    wsIn.on("close", (code, reason) => {

    });
});




app.use(cors());
app.use(bodyParser.urlencoded({
    extended: false
}));
app.use(bodyParser.json());


//express server
app.listen(4000, () => {
    console.log('Server Works !!! At port 4000');
});






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

app.get('/room/room.css', (req, res) => {
    res.sendFile(path.join(__dirname, '/Room/room.css'));
});

app.get('/room/room.js', (req, res) => {
    res.sendFile(path.join(__dirname, '/Room/room.js'));
});

app.get('/room/*', (req, res) => {
    let id = req.url;
    id = id.slice(6, id.length);
    res.sendFile(path.join(__dirname, '/Room/room.html'))
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
    let id;
    let doc = db_data;
    let realDoc = {
        users: [{
            username: doc.username,
            ip: ip,
            appended: false,
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
        throw "room name exists";
    }
    coll.insertOne(realDoc).then((result) => {
        console.log('succesfully created a room');
        return result.insertedId;
    }).catch((err) => {
        throw err;
    });;
}

async function addUserToSession(db_data, ip) {
    let doc = db_data;

    const db = client.db(dbName);
    const coll = db.collection('rooms');
    let rom = await coll.findOne({
        'roomName': doc.roomName
    });
    //no room
    if (!rom) {
        throw "room doesnt exists";
    }
    //wrong password
    if (doc.roomPass != rom.roomPass) {
        throw "passwords dont match";
    }
    let pushData = {
        username: doc.username,
        ip: ip,
        appended = false
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

app.post('/sesapi', (req, res) => {
    if (req.query.type == 'create') {
        let id = addSessionToDb(req.body, req.ip).catch(err => {
            console.log(err);
            res.send(err);
        }).then(bam => {
            res.send(id);
        });
    } else if (req.query.type == 'join') {
        addUserToSession(req.body, req.ip).catch(err => {
            console.log(err);
            res.send(err);
        }).then(bam => {
            res.send("ok");
        });

    }

});

app.get('/sesapi', (req, res) => {
    if (req.query.type == 'getUsers') {
        let ret = getUsersOnRoom(req.body._id).then(res.send(ret));
    }
});

//returns json string with users on the room id
async function getUsersOnRoom(roomId) {
    const db = client.db(dbName);
    const coll = db.collection('rooms');
    let data = await coll.findOne({
        '_id': roomId
    });
    if (!data) {
        return -1;
    }
    return JSON.stringify(data.users);
}



app.get('/download', (req, res) => {
    var URL = req.query.URL;
    res.json({
        url: URL
    });
});