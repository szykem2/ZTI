function init() {
    console.log("init");
}

function login() {
    console.log("login");
}

function validateAndRegister() {
    console.log("register");
}

function signout() {
    console.log('sign out');
}

function w3_open() {
    document.getElementById("main").style.marginLeft = "15%";
    document.getElementById("navbar").style.width = "15%";
    document.getElementById("navbar").style.display = "block";
    document.getElementById("openNav").style.display = 'none';
    document.getElementById("overlay").style.display = "block";
  }

function w3_close() {
    document.getElementById("main").style.marginLeft = "0%";
    document.getElementById("navbar").style.display = "none";
    document.getElementById("openNav").style.display = "inline-block";
    document.getElementById("overlay").style.display = "none";
  }

function filterProjects() {
    var input, filter, ul, li, a, i;
    input = document.getElementById("projectSearch");
    filter = input.value.toUpperCase();
    div = document.getElementById("projects");
    a = div.getElementsByTagName("a");
    for (i = 0; i < a.length; i++) {
        if (a[i].innerHTML.toUpperCase().indexOf(filter) > -1) {
            a[i].style.display = "";
        } else {
            a[i].style.display = "none";
        }
    }
  }