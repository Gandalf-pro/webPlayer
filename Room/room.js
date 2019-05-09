// var jquery = require("jquery");
// var videojs = require('video.js');

var id;
function setID() {
    id = window.location.pathname;
    id = id.slice(6, id.length);
}
setID();    

    
//code for video player
function setPlayerUp(sourceUrl) {
    let options = {
        controls: true,
        autoplay: false,
        preload: 'auto',
        fluid:true,
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
    let url = 'http://' + window.location.host + '/sesapi';
    let data = {
        '_id': 1
    };
    let shows = await fetch(url + '?type=getShows&data=' + JSON.stringify(data));
    pushShowsToList(shows);
}

function pushShowsToList(shows) {
    for (let i = 0; i < shows.lenght; i++) {
        shows[i].name;
        shows[i].link;
    }
}



//code for userlist





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
sfgh();