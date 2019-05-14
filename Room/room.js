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

var player = setPlayerUp("https://transfer.nilkop.tk/cf/eemsye342ufa.mp4");




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
    $('#show_input').append('<button onclick="bambum(this)">'+name+'</button>');
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
    $('#user_input').append('<button onclick="bambum(this)">'+name+'</button>');
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

function bambum(arg) {
    console.log(arg.innerHTML);
}

// Websocket
var ws;
function openConnection() {
    let url = "ws://" + window.location.hostname + ":8080";
    ws = new WebSocket(url);
    // ws.onopen = () => {
    //     ws.send("hello");
    //     ws.close(1000, "bye");
        
    // }

}
openConnection();
var yayo;
ws.onmessage = (message) => {
    yayo = message;
    let parsed = JSON.parse(message.data);
    if (parsed) {
        if (parsed.type == 'player') {
            handlePlayerReq(parsed);
        }
    }
};

function handlePlayerReq(data) {
    if (data.play) {
        player.play();
    } else if (data.pause) {
        player.pause();
    }
    if (data.time) {
        let dif = Math.abs(player.currentTime() - data.time);
        if (dif > 5) {
            player.currentTime(data.time);
        }
    }
}

function sendData(play, pause, time, buffer) {
    let data;
    if (buffer && time) {
        data = {
            type:"player",
            play: play,
            pause: pause,
            time: player.currentTime(),
            buffer:player.bufferedPercent()
        }
    } else if (buffer) {
        data = {
            type:"player",
            play: play,
            pause: pause,
            buffer:player.bufferedPercent()
        }
    } else if (time) {
        data = {
            type:"player",
            play: play,
            pause: pause,
            time: player.currentTime(),
        }
    }
    ws.send(JSON.stringify(data));
}


player.on("seeking", (event) => {
    console.log('seeking');
    sendData(false,false,true,true)
});

player.on("pause", (event) => {
    console.log('paused');
    sendData(false, true, true, true);
});

player.on("play", (event) => {
    console.log('started');
    sendData(true, false, true, true);
});
