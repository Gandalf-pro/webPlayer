// var jquery = require("jquery");
var player = require('video.js');

//code for video player



//code for show list
// $('.show-list').append('<li><a href="https://www.dizibox.pw/the-100-6-sezon-2-bolum-izle/">6.Sezon 2.Bölüm</a></li>');
async function getShowList() {
    let url = 'http://' + window.location.host + '/sesapi';
    let data = {'_id':1};
    let shows = await fetch(url + '?type=getShows&data=' + JSON.stringify(data));
    pushShowsToList(shows);
}

function pushShowsToList(shows) {
    for (let i = 0; i < shows.lenght; i++){
        shows[i].name;
        shows[i].link;
    }
}



//code for userlist





//maybe chat


