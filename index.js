const express = require('express');
const cors = require('cors');
const app = express();
const path = require('path');
const { Client } = require('pg');
const client = new Client({
    user: 'syncedPlay',
    host: 'localhost',
    database: 'sessions',
    password: '123',
    port: 5432,
});

//database
client.connect().then(console.log(client)); 

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

class user{
    constructor(name) {
        this.name = name;
        this.sesions = [];
    }
}

async function addSessionToDb(db_data) {
  
}

function addUserToSession(db_data) {
    
}

app.get('/sesapi', (req, res)=>{
    if (req.query.type == 'create') {
        console.log('create');
        addSessionToDb(req.query.data);
    } else if (req.query.type == 'join') {
        console.log('join');
        addUserToSession(req.query.data);
    }
    

});

app.get('/download', (req, res) => {
    var URL = req.query.URL;
    res.json({
        url: URL
    });
});