// var jquery = require("jquery");
// var videojs = require('video.js');

var id;
var url_field = document.querySelector('#url_input');
var name_field = document.querySelector('#name_input');

function setID() {
    id = window.location.pathname;
    id = id.slice(6, id.length);
}
setID();


//add url to list
function addUrl() {
    if (url_field.value.lenght < 3 || name_field.value.lenght < 2) {
        alert('fill out the fields');
        return;
    }
    //make server requests
    let show = {
        name: name_field.value,
        url: url_field
    };
    
}

//code for video player
function setPlayerUp(sourceUrl) {
    let options = {
        controls: true,
        autoplay: false,
        preload: 'auto',
        fluid: true,
        sources: [{
            src: sourceUrl,
            type: 'video/mp4'
        }]
    };
    let p = videojs('player', options);
    p.volume(0.2);
    return p;

}

var player = setPlayerUp("https://user-content-hot-154.molyusercontentstage.me/xqx2pxo2kvokjiqbtfzcnpcaxsqrap7yqpptn4nk6wn25z26vcmhfkocuula/v.mp4");




//code for show list
// $('.show-list').append('<li><a href="https://www.dizibox.pw/the-100-6-sezon-2-bolum-izle/">6.Sezon 2.Bölüm</a></li>');
async function getShowList() {
    let url = window.location.protocol + window.location.host + '/sesapi';
    let data = {
        '_id': id
    };
    let showList = await fetch(url + '?type=getShows&data=' + JSON.stringify(data));
    pushShowsToList(showList);
}

var shows = [];

function addShow(name) {
    $('#show_input').append('<li><a href="#" onclick="changeShow(this)">' + name + '</a></li>');
}

function pushShowsToList(shows_i) {
    shows = JSON.parse(shows_i);
    for (let i = 0; i < shows.lenght; i++) {
        addShow(shows[i].name);
    }
}

function changeShow(arg) {
    player.src(shows[shows.findIndex({ name: arg.innerHTML })].url);
    player.volume(0.2);
}

//code for userlist
async function getUserList() {
    let url = window.location.protocol + window.location.host + '/sesapi';
    let data = {
        '_id': id
    };
    let showList = await fetch(url + '?type=getUsers&data=' + JSON.stringify(data));
    pushUsersToList(showList);
}

var users = [];

function addUser(name) {
    $('#user_input').append('<li><a href="#">' + name + '</a></li>');
}

function pushUsersToList(users_i) {
    users = JSON.parse(users_i);
    for (let i = 0; i < users.lenght; i++) {
        addUser(users[i].name);
    }
}




//maybe chat
function bumbam(arg) {
    console.log(arg.innerHTML);
    console.log(player.currentSrc());
    player.src("https://user-content-hot-154.molyusercontentstage.me/xqx2pxo2kvokjiqbtfzcnpcaxsqrap7yqpptn4nk6wn25z26vcmhfkocuula/v.mp4");
    player.volume(0.2);
}

// Websocket
function sfgh() {
    const ws = new WebSocket("ws://localhost:8080");
    ws.onopen = () => {
        ws.send("hello");
        ws.close(1000, "bye");
    }
}
