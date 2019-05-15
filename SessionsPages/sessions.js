var createButton = document.querySelector('.create_button');
var loginButton = document.querySelector('.login_button');
var username = document.querySelector('.username_input');
var session = document.querySelector('.session_name_input');
var password = document.querySelector('.session_password_input');






function getDataReady() {
    if (username.value.length < 1) {
        alert('enter a username');
        return;
    }
    if (session.value.length < 1) {
        alert('enter a session name');
        return;
    }
    let data = {
        username: username.value,
        roomName: session.value,
        roomPass: password.value
    }
    console.log(data);
    return data;
}

//create a session
// createButton.addEventListener('click', () => {
//     let url = 'http://' + window.location.host + '/sesapi';
//     let data = getDataReady();
//     if (data != null) {
//         fetch(url + '?type=create&data=' + JSON.stringify(data));
//     }
// });

createButton.addEventListener('click',() => {
    let url = window.location.protocol + '/sesapi';
    const data = getDataReady();
    if (data != null) {
        fetch(url + '?type=create', {
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(data),
            method: "POST"
        }).then(res => {
            res.text().then(val => {
                console.log(val);
                gotoRoomId(val);
            })
        });
    }
});

function gotoRoomId(id) {
    id = id.replace(/\"/g, "");
    let loc ="/room/" + id;
    window.location.href = loc;    
}





loginButton.addEventListener('click', () => {
    let url = window.location.protocol + '/sesapi';
    let data = getDataReady();
    if (data != null) {
        let res = fetch(url + '?type=join',{
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(data),
            method: "POST"
        }).then(res => {
            res.text().then(val => {
                console.log(val);
                gotoRoomId(val);
            })
        });
    }
});