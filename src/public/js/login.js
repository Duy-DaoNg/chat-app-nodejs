

function setCookie(cname, cvalue, exdays) {
    const d = new Date();
    d.setTime(d.getTime() + (exdays * 24 * 60 * 60 * 1000));
    let expires = "expires="+d.toUTCString();
    document.cookie = cname + "=" + cvalue + ";" + expires + ";path=/";
  }
  
function getCookie(cname) {
let name = cname + "=";
let ca = document.cookie.split(';');
for(let i = 0; i < ca.length; i++) {
    let c = ca[i];
    while (c.charAt(0) == ' ') {
    c = c.substring(1);
    }
    if (c.indexOf(name) == 0) {
    return c.substring(name.length, c.length);
    }
}
return "";
}

window.addEventListener("load", (event) => {
    const loginsec=document.querySelector('.login-section')
    const loginlink=document.querySelector('.login-link')
    const registerlink=document.querySelector('.register-link')
    const showsidebar=document.querySelector('.hidden-sidebar')
    const menubtn=document.querySelector('.menu-icon')
    const blanksidebar=document.querySelector('.blank-sidebar')
    registerlink.addEventListener('click', () => {
        loginsec.classList.add('active')
    })
    loginlink.addEventListener('click', () => {
        loginsec.classList.remove('active')
    })
    menubtn.addEventListener('click', () => {
        showsidebar.classList.remove('hidden')
    })
    blanksidebar.addEventListener('click', () => {
        showsidebar.classList.add('hidden')
    })
    loginBtn = document.querySelector('.login-btn')

    loginBtn.addEventListener('click', (e) => {
        e.preventDefault()
        const username = document.forms['login']['username'].value
        const password = document.forms['login']['password'].value
        $.ajax({
            url: '/login',
            type: 'POST',
            data: {
                email: username,
                password: password
            }
        })
        .then(data => {
            setCookie('username', decodeURIComponent(getCookie('username')), 1)
            window.location.href = '/chat'
        })
        .catch((error) => {
            alert('invalid username or password')
        })
    })
    signupBtn = document.querySelector('.register-btn')
    signupBtn.addEventListener('click', (e) => {
        e.preventDefault()
        const username = document.forms['register']['username'].value
        const email = document.forms['register']['email'].value
        const password = document.forms['register']['password'].value
        $.ajax({
            url: '/register',
            type: 'POST',
            data: {
                email,
                username,
                password
            }
        })
        .then(data => {
            alert('Registration successful')
            document.querySelector('.login-link').click()
        })
        .catch((error) => {
            alert('invalid username or email')
        })
    })
})