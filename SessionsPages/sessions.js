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
        sessionName: session.value,
        sessionPassword: password.value
    }
    console.log(data);
    return data;
}

//create a session
createButton.addEventListener('click', () => {
    let url = 'http://' + window.location.host + '/sesapi';
    let data = getDataReady();
    if (data != null) {
        fetch(url + '?type=create&data=' + JSON.stringify(data));
    }
});

//login a session
loginButton.addEventListener('click', () => {
    let url = 'http://' + window.location.host + '/sesapi';
    let data = getDataReady();
    if (data != null) {
        fetch(url + '?type=join&data=' + JSON.stringify(data));
    }
});