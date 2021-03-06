const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
const app = express();
const path = require('path');
const Mongo = require('mongodb');
const MongoClient = Mongo.MongoClient;
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
    mathTheIp(req.connection.remoteAddress).then((ret) => {
        let socket = {
            socket: wsIn,
            ip: req.connection.remoteAddress,
            room: ret.roomName,
            roomId: ret.roomId
        };
        SOCKETS.push(socket);
    });



    wsIn.on("message", (message) => {
        console.log(message + " from:" + req.connection.remoteAddress);
        let parsed = JSON.parse(message);
        if (parsed) {
            if (parsed.type == 'player') {
                handlePlayerReq(parsed, req.connection.remoteAddress, SOCKETS.find(x => x.socket == wsIn).room);
            }
        }
    });

    wsIn.on("close", (code, reason) => {
        console.log('closed connection with code:' + code + ' because:' + reason);
        let index = SOCKETS.findIndex(x => x.socket == wsIn);
        removeUserFromDb(SOCKETS[index].room, SOCKETS[index].ip);
        //remove socket from the array
        SOCKETS.splice(index, 1);
    });

});

//removes user from databse
async function removeUserFromDb(roomName, userIp) {
    const db = client.db(dbName);
    const coll = db.collection('rooms');
    let ja = await coll.findOne({
        'roomName': roomName
    });
    let id = ja._id;
    let ret = await coll.updateOne(ja, {
        $pull: {
            users: {
                ip: userIp
            }
        }
    });
    let len = ja.users.length;
    if (len <= ret.result.ok) {
        coll.deleteOne({
            '_id': id
        });
    }
}

//returns a room id based on the ip of the client
async function mathTheIp(ip) {
    const db = client.db(dbName);
    const coll = db.collection('rooms');
    let ret = await coll.findOne({
        "users.ip": ip
    });
    return {
        roomName: ret.roomName,
        roomId: ret._id
    };
}


function sendData(data, room) {
    for (let i = 0; i < SOCKETS.length; i++) {
        if (SOCKETS[i].room == room) {
            SOCKETS[i].socket.send(data);
        }
    }
}

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

app.get('/room/:id', async (req, res) => {
    let id = req.params.id;
    if (await idExists(id)) {
        res.sendFile(path.join(__dirname, '/Room/room.html'));
    } else {
        res.status(404).send("Cant find your room");
    }
});



app.post('/show', async (req, res) => {
    if (req.query.type == 'add') {
        addVideoToRoom(req.body, req.body.show);
        res.send("ok");
    } else if (req.query.type == 'del') {
        popVideoFromRoom(req.body, req.body.show);
        res.send("ok");
    }

});

//video object has a name and a url field
async function addVideoToRoom(dataInfo, video) {
    const db = client.db(dbName);
    const coll = db.collection('rooms');
    var filtr;
    //if the room has a id
    try {
        if (dataInfo._id) {
            filtr = {
                '_id': Mongo.ObjectId(dataInfo._id)
            };
            let reth = await coll.updateOne(filtr, {
                $push: {
                    'srcs': video
                }
            });
        }
    } catch (error) {
        console.log(error);
    }


}

async function idExists(id) {
    try {
        id = Mongo.ObjectId(id);
    } catch (error) {
        return false;
    }
    const db = client.db(dbName);
    const coll = db.collection('rooms');
    return await coll.findOne({
        '_id': id
    });

}

async function popVideoFromRoom(dataInfo, video) {
    const db = client.db(dbName);
    const coll = db.collection('rooms');
    var filtr;
    try {
        //if the room has a id
        if (dataInfo._id) {
            filtr = {
                '_id': Mongo.ObjectId(dataInfo._id)
            };
            await coll.updateOne(filtr, {
                $pull: {
                    'srcs': video
                }
            });
        }
    } catch (error) {
        console.log(error);
    }
}


async function addSessionToDb(db_data, ip) {
    let doc = db_data;
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
        throw "room name exists";
    }
    let resp = await coll.insertOne(realDoc);
    return resp.insertedId;

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
    };
    rom.users.push(pushData);
    let id = rom._id;
    rom = rom.users;


    //update the db
    let resss = await coll.updateOne({
        roomName: doc.roomName
    }, {
        $set: {
            'users': rom
        }
    });
    console.log(id);
    return id;

}

app.post('/sesapi', async (req, res) => {
    if (req.query.type == 'create') {
        let id = await addSessionToDb(req.body, req.ip).catch(err => {
            console.log(err);
            res.send(err);
        });
        res.redirect("/room/" + id);
    } else if (req.query.type == 'join') {
        let id = await addUserToSession(req.body, req.ip).catch(err => {
            console.log(err);
            res.send(err);
        });
        res.send(id);
    }

});

app.get('/sesapi', async (req, res) => {
    if (req.query.type == 'getUsers') {
        let gotId = JSON.parse(req.query.data);
        console.log(`Geting the users on room id:${gotId._id}`);
        let ret = await getUsersOnRoom(gotId._id);
        let dataSend = {
            "users": ret
        };
        res.send(dataSend);
    }
});

//returns json string with users on the room id
async function getUsersOnRoom(roomId) {
    const db = client.db(dbName);
    const coll = db.collection('rooms');
    let data = await coll.findOne({
        '_id': Mongo.ObjectId(roomId)
    });
    if (!data) {
        console.log("cant find users");
        return "false";
    }
    return JSON.stringify(data.users);
}



app.get('/download', (req, res) => {
    var URL = req.query.URL;
    res.json({
        url: URL
    });
});



//websocket handling
function sendDataToRoom(room, data, exclude) {
    for (let i = 0; i < SOCKETS.length; i++) {
        if (SOCKETS[i].room == room && SOCKETS[i].ip != exclude) {
            SOCKETS[i].socket.send(data);
        }
    }
}

function handlePlayerReq(data, exclude, room) {
    let str = '{ \"type\":\"player\",';
    if (data.play) {
        str += '\"play\":true,';
    }
    if (data.pause) {
        str += '\"pause\":true,';
    }
    if (data.time) {
        str += '\"time\":' + data.time + ',';
    }
    if (data.buffer) {
        str += '\"buffer\":' + data.buffer + ',';
    }
    str = str.slice(0, -1);
    str += '}';
    sendDataToRoom(room, str, exclude);
}