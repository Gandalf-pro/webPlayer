// var jquery = require("jquery");
// var videojs = require('video.js');



var roomId;
var url_field = document.querySelector('#url_input');
var name_field = document.querySelector('#name_input');
var video_add_button = document.querySelector('#input_button');

function setID() {
    roomId = window.location.pathname;
    roomId = roomId.slice(6, roomId.length);
}
setID();


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

var player = setPlayerUp("https://s322myt.storage.yandex.net/rdisk/70b696cea229b4ce144ee9eace1af0e73568a4393b86cd45cc0e33fd5bb6edc2/5d561fad/lGRReZ2Fw2ikMfQtRgob-sW8RqeEWb7FimXh2l0fNVcVe60Q63arV34wn2PX4T-6iB2qiiYqMbkmyiOjWXG1LA==?uid=0&filename=Theboys101.mp4&disposition=attachment&hash=&limit=0&content_type=video%2Fmp4&owner_uid=0&fsize=2723866734&hid=5b32e4cc56e6fdcf8036c25a989fb49f&media_type=video&tknv=v2&etag=37a59896ca24f30406d84228b30ca307&rtoken=avk9HWUpWIDR&force_default=no&ycrid=na-297c9d8f856c7f7406dfa59336dce603-downloader8f&ts=5903364d58540&s=008698c99671a3bb89bdb4f265521aaa50a875246e1cd49df91301176fe9d9a3&pb=U2FsdGVkX1_9eey2WAqrLzAdfFhp58ts7ik9fj9Nwbvd-QAktr07F-wlVC8C4ZbgdxZq5WoPerMsGEoyTQqmCdksb43LideLWmUcDqVpx44");




//code for show list
// $('.show-list').append('<li><a href="https://www.dizibox.pw/the-100-6-sezon-2-bolum-izle/">6.Sezon 2.Bölüm</a></li>');
async function getShowList() {
    let url = window.location.protocol + window.location.host + '/sesapi';
    let data = {
        '_id': roomId
    };
    let showList = await fetch(url + '?type=getShows&data=' + JSON.stringify(data));
    pushShowsToList(showList);
}

var shows = [];

function addShow(name) {
    let addText = `<li><button onclick="bambum(this)">${name}</button></li>`;
    $('#show_input').append(addText);
}

function pushShowsToList(shows_i) {
    shows = JSON.parse(shows_i);
    for (let i = 0; i < shows.length; i++) {
        addShow(shows[i].name);
    }
}

function changeShow(arg) {
    player.src(shows[shows.findIndex({
        name: arg.innerHTML
    })].url);
    player.volume(0.2);
}


function clearFields() {
    url_field.value = "";
    name_field.value = "";
}

//add url to list
async function addUrl() {
    let url = window.location.protocol + '/show?type=add';
    if (url_field.value.length < 3 || name_field.value.length < 2) {
        alert('fill out the fields');
        return;
    }
    //make server requests
    let show = {
        name: name_field.value,
        url: url_field.value
    };
    let send = {
        '_id': roomId,
        'show': show
    };
    let res = await fetch(url, {
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify(send),
        method: "POST"
    });
    let respText = await res.text();
    console.log(respText);
    if (respText == 'ok') {
        addShow(show.name);
    }
}




//code for userlist
async function getUserList() {
    let url = window.location.protocol + '/sesapi';
    let data = {
        '_id': roomId
    };
    let showList = await fetch(url + '?type=getUsers&data=' + JSON.stringify(data));
    if (!showList) {
        console.log(showList);
        return showList;
    }
    return await showList.json();
}

var users = [];

function removeUser(name) {
    $(`#user_input #${name}`).remove();
}

function addUser(name) {
    let addText = `<li id=${name}><button onclick="bambum(this)">${name}</button></li>`;
    $('#user_input').append(addText);
}

function pushUsersToList(users_i) {
    if (!users) {
        users.push(users_i);
    } else {
        users.push(users_i);
    }
    for (let i = 0; i < users.length; i++) {
        addUser(users[i].username);
    }
}
getUserList().then(res => {
    console.log(`Pushing users:${res.users}`);
    pushUsersToList(res.users);
});



//trial code
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
        } else if (parsed.type == 'chat') {

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
            type: "player",
            play: play,
            pause: pause,
            time: player.currentTime(),
            buffer: player.bufferedPercent()
        }
    } else if (buffer) {
        data = {
            type: "player",
            play: play,
            pause: pause,
            buffer: player.bufferedPercent()
        }
    } else if (time) {
        data = {
            type: "player",
            play: play,
            pause: pause,
            time: player.currentTime(),
        }
    }
    ws.send(JSON.stringify(data));
}


player.on("seeking", (event) => {
    console.log('seeking');
    sendData(false, false, true, true)
});

player.on("pause", (event) => {
    console.log('paused');
    sendData(false, true, true, true);
});

player.on("play", (event) => {
    console.log('started');
    sendData(true, false, true, true);
});