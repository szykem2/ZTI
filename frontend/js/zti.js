var token = null;
var server = 'http://192.168.0.88:3000';
var username = null;
var projects = [];
var pusers = [];
var ausers = null;
var project = null;

function init() {
    token = localStorage.getItem("token");
    if(token != null) {
        $(location).attr('href', 'home.html');
    }
}

function initHome() {
    token = localStorage.getItem("token");
    
    if(token == null) {
        $(location).attr('href', 'index.html');
        //TODO: show comunicate of expired session
    }
    uname = localStorage.getItem("login");
    $("#logindiv").html(uname);
    //TODO: get all the content
    getProjects();
}

function validateEmail(email, disp=true) {
    
    if(disp) {
        $('#loadSymbolEmail').html('<i class="fa fa-spinner w3-spin" style="font-size:20px"></i>');
    }
    var re = /^(([^<>()[\]\\.,;:\s@\"]+(\.[^<>()[\]\\.,;:\s@\"]+)*)|(\".+\"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
    var valid = true;
    //TODO: add validation on server using endpoint /validateEmail assign result to valid variable
    if(disp) {
        if(!valid) {
            $('#loadSymbolEmail').attr('class', 'w3-red');
            $('#loadSymbolEmail').html('Email already used');
        }
        else {
            $('#loadSymbolEmail').attr('class', 'w3-green');
            $('#loadSymbolEmail').html('Email is available');
        }
    }
    return re.test(email) && valid;
}

function validateUser(uname, disp=true) {
    if(disp) {
        $('#loadSymbolUname').html('<i class="fa fa-spinner w3-spin" style="font-size:20px"></i>');
    }
    var valid = false;
    //TODO: add validation on server using endpoint /validateUsername assign result to valid variable
    if(disp) {
        if(!valid) {
            $('#loadSymbolUname').attr('class', 'w3-red');
            $('#loadSymbolUname').html('Username already used');
        }
        else {
            $('#loadSymbolUname').attr('class', 'w3-green');
            $('#loadSymbolUname').html('Username is available');
        }
    }
}

function aError(message) {

}

function validatePassword() {
    var pwd = document.forms["registerForm"]["password"].value;
    var pwd2 = document.forms["registerForm"]["passwordConf"].value;
    var status = true;
    $('#loadSymbolPassword').html('');
    if(!(pwd === pwd2)) {
        status = false;
        $('#loadSymbolPassword').attr('class', 'w3-red');
        $('#loadSymbolPassword').append('Passwords differ<br />');
    }

    if(pwd.length < 8 || pwd.length > 30) {
        status = false;
        $('#loadSymbolPassword').attr('class', 'w3-red');
        $('#loadSymbolPassword').append('Password size needs to be between 8 and 30 character<br />');
    }
    var regex = /^(?=.*[a-z]).+$/;
    if(!regex.test(pwd)){
        status = false;
        $('#loadSymbolPassword').attr('class', 'w3-red');
        $('#loadSymbolPassword').append('Password must contain lowercase letters<br />');
    }
    regex = /^(?=.*[A-Z]).+$/;
    if(!regex.test(pwd)){
        status = false;
        $('#loadSymbolPassword').attr('class', 'w3-red');
        $('#loadSymbolPassword').append('Password must contain uppercase letters<br />');
    }
    regex = /^(?=.*[0-9_\W]).+$/;
    if(!regex.test(pwd)){
        status = false;
        $('#loadSymbolPassword').attr('class', 'w3-red');
        $('#loadSymbolPassword').append('Password must contain numbers or special characters<br />');
    }

    if(status) {
        $('#loadSymbolPassword').attr('class', 'w3-green');
        $('#loadSymbolPassword').html('Password meets all the requirements<br />');
    }
}

function validateAndRegister() {
    var uname = document.forms["registerForm"]["username"].value;
    var pwd = document.forms["registerForm"]["password"].value;
    var pwd2 = document.forms["registerForm"]["passwordConf"].value;
    var email = document.forms["registerForm"]["email"].value;
    if(!validateEmail(email, false)) {
        aError('Invalid email');
        return;
    }
    if(!(pwd === pwd2)) {
        aError('Passwords differ');
        return;
    }
    validateUsername(uname, false);
    //TODO: hash the password
    //TODO: Register user using endpoint /register
}

function signout() {
    token = null;
    localStorage.removeItem("token");
    localStorage.removeItem("login");
    $(location).attr('href', 'index.html');
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

function filterUsers() {
    var input, filter, ul, li, a, i;
    input = document.getElementById("userSearch");
    filter = input.value.toUpperCase();
    div = document.getElementById("usersToAdd");
    a = div.getElementsByTagName("button");
    for (i = 0; i < a.length; i++) {
        if (a[i].innerHTML.toUpperCase().indexOf(filter) > -1) {
            a[i].style.display = "";
        } else {
            a[i].style.display = "none";
        }
    }
}

function login() {
    var uname = document.forms["loginForm"]["username"].value;
    var pwd = document.forms["loginForm"]["password"].value;
    var url = server + "/login"; //switch to /users/login
    //TODO: hash the password
    $.ajax({
        url: url,
        type: "GET", //TODO: Switch to post when server is done
        data: {"userid": 1}, //TODO: replace it with username and password when server is done
        dataType: "json",
        statusCode: {
            200: function (response) {
                token = response.token;
                localStorage.setItem("token", response.token);
                localStorage.setItem("login", uname);
                $(location).attr('href', 'home.html');
            },
            401: function (response) {
                $('#loginError').html("Login or password invalid");
            },
        }, success: function () {
        },
        error: function(xhr, status, error) { 
            $('#loginError').html("An error occured: " + status + ": " + error);
        }
    });
}

function pdeleteProject() {
    document.getElementById('DeleteModal').style.display='block';
}

function addUser() {
    document.getElementById('AddUserModal').style.display='block';
}

function deleteProject() {
    $(location).attr('href', 'home.html');
    console.log("delete project " + project);
    
    /*$.ajax({
        url: url,
        headers: {
            'Authorization':token,
        },
        type: "DELETE",
        dataType: 'json',
        data: {projectid: projects[project].id},
        success: function () {
        },
        error: function(xhr, status, error) { 
            $('#userlist').html("An error occured: " + status + ": " + error);
        }
    });*/
}

function findin(value, array) {
    for (var i=0; i < array.length; i++) {
        if (array[i].userid == value) {
            return true;
        }
    }
    return false;
}

function getProjectData(hrf) {
    project = hrf.innerHTML;
    $('#hcontainer').attr('class', '');
    $('#ProjectMessage').attr('class', 'hidden');
    var html = 'Project #' + projects[project].id + " Title: " + project + "<br />" + "Description: " + projects[project].description + '<br /><button onclick="pdeleteProject()" class="w3-btn w3-block w3-red w3-section w3-padding">Remove this project</button>';
    $('#projcontent').html(html);
    var url = server + '/users_projects'; //switch to //project/{id}/users
    pusers = [];
    $.ajax({
        url: url,
        headers: {
            'Authorization':token,
        },
        type: "GET",
        dataType: 'json',
        data: {projectid: projects[project].id},
        statusCode: {
            200: function (response) {
                html = "";
                pusers = response;
                for(var i=0; i < pusers.length; i++) {
                    html += '<div class="w3-bar-item w3-bar-block w3-card w3-light-grey">' + pusers[i].userid + "</div>"; //TODO: change userid with username and add fancy div to look good
                }
                html += '<button class="w3-btn w3-block w3-green w3-section w3-padding" type="button" onclick="addUser('+projects[project].id+')">Add User to this project area</button>';
                $('#pusers').html(html);
            },
            401: function (response) {
                $('#userlist').html("could not retrieve list of users assigned to this project");
            },
        }, success: function () {
        },
        error: function(xhr, status, error) { 
            $('#userlist').html("An error occured: " + status + ": " + error);
        }
    });

    ausers = [];

    $.ajax({
        url: server + "/users",
        headers: {
            'Authorization':token,
        },
        type: "GET",
        statusCode: {
            200: function (response) {
                ausers = response;
                var html = "";
                var searchInput = '<input class="w3-input w3-padding" type="text" placeholder="Search.." id="userSearch" onkeyup="filterUsers()">'

                for(var i=0; i < ausers.length; i++) {
                    if(!findin(ausers[i].id, pusers)) {

                        html += '<button class="w3-btn w3-bar-item w3-bar-block w3-card w3-light-grey" onclic="addUserToProject('+projects[project].id + "," + ausers[i].id +')">' + ausers[i].id + "</button><br />"; //TODO: change userid with username and add fancy div to look good
                    }
                }
                
                $('#usersToAdd').html(searchInput + html);
            },
            401: function (response) {
                $('#userlist').html("could not retrieve list of user assigned to this project");
            },
        }, success: function () {
        },
        error: function(xhr, status, error) { 
            $('#userlist').html("An error occured: " + status + ": " + error);
        }
    });

    w3_close();
}

function getProjects() {
    projects = []
    var url = server + "/projects";
    var searchInput = '<input class="w3-input w3-padding" type="text" placeholder="Search.." id="projectSearch" onkeyup="filterProjects()">'
    var beginLink = '<a class="w3-bar-item w3-button" href="#" onclick="getProjectData(this)">';

    $.ajax({
        url: url,
        headers: {
            'Authorization':token,
        },
        type: "GET",
        statusCode: {
            200: function (response) {
                var html = "";
                for(var i = 0 ; i < response.length; i++) {
                    var item = {"id": response[i].projectid, "description": response[i].description};
                    projects[response[i].title] = item;
                    html += beginLink + response[i].title + "</a>";
                }
                $('#projects').html(searchInput + html);
            },
            401: function (response) {
                $('#projects').html("could not retrieve list of projects");
            },
        }, success: function () {
        },
        error: function(xhr, status, error) { 
            $('#projects').html("An error occured: " + status + ": " + error);
        }
    });
}


/*
  $.ajax({url: "demo_test.txt",       
    success: function(data, textStatus, xhr) {
        console.log(xhr.status);
    },
    complete: function(xhr, textStatus) {
        console.log(xhr.status);
    } 
});*/

/*

$.ajax({
    //beforeSend: function(request) {
    //    request.setRequestHeader("Authority", authorizationToken);
    //},
    url: server,
    headers: {
        'Authorization':'Basic xxxxxxxxxxxxx',
        'X_CSRF_TOKEN':'xxxxxxxxxxxxxxxxxxxx',
        'Content-Type':'application/json'
    },
   type: "POST",
   data: dataToSave,
   statusCode: {
      200: function (response) {
         alert('1');
         AfterSavedAll();
      },
      201: function (response) {
         alert('1');
         AfterSavedAll();
      },
      400: function (response) {
         alert('1');
         bootbox.alert('<span style="color:Red;">Error While Saving Outage Entry Please Check</span>', function () { });
      },
      404: function (response) {
         alert('1');
         bootbox.alert('<span style="color:Red;">Error While Saving Outage Entry Please Check</span>', function () { });
      }
   }, success: function () {
      alert('1');
   },
});

*/