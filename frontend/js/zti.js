var token = null;
var server = 'http://localhost:8080/trtrt';
var username = null;
var projects = [];
var pusers = [];
var ausers = null;
var project = null;
var LoginValid = false;
var EmailValid = false;
var PasswordValid = false;

function init() {
    token = localStorage.getItem("token");
    if(token != null) {
        $(location).attr('href', 'home.html');
    }
    error = localStorage.getItem("error") 
    if(error != null){
        document.getElementById('ErrorModal').style.display='block';
        $('#ErrMessage').html("<p>" + error + "</p>");
    }
}

function initHome() {
    token = localStorage.getItem("token");
    
    if(token == null) {
        $(location).attr('href', 'index.html');
    }
    uname = localStorage.getItem("login");
    $("#logindiv").html(uname);
    getProjects();
}

function validateEmail(email, disp=true) {
    
    if(disp) {
        $('#loadSymbolEmail').html('<i class="fa fa-spinner w3-spin" style="font-size:20px"></i>');
    }
    var re = /^(([^<>()[\]\\.,;:\s@\"]+(\.[^<>()[\]\\.,;:\s@\"]+)*)|(\".+\"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
    var valid = re.test(email);

    if(!valid) {
        $('#loadSymbolEmail').attr('class', 'w3-red w3-center');
        $('#loadSymbolEmail').html('Email structure is not correct');
    }

    if(valid) {
        $.ajax({
            url: server + "/validateEmail",
            type: "POST",
            data: JSON.stringify({"email": email}),
            contentType: "application/json",
            statusCode: {
                200: function (response) {
                    $('#loadSymbolEmail').attr('class', 'w3-green w3-center');
                    $('#loadSymbolEmail').html('Email is available');
                    EmailValid = true;
                },
                409: function (response) {
                    $('#loadSymbolEmail').attr('class', 'w3-red w3-center');
                    $('#loadSymbolEmail').html("Email already in the database");
                    EmailValid = false;
                },
            }, success: function () {
            },
            error: function(xhr, status, error) {
                $('#loadSymbolEmail').html("An error occured: " + status + ": " + error);
            }
        }).done(function() {
            if(EmailValid && LoginValid && PasswordValid) {
                $('#buttonReg').attr("disabled", false);
            }
        });
    }

    return valid;
}

function validateUser(uname, disp=true) {
    if(disp) {
        $('#loadSymbolUname').html('<i class="fa fa-spinner w3-spin" style="font-size:20px"></i>');
    }
    $.ajax({
        url: server + "/validateLogin",
        type: "POST",
        data: JSON.stringify({"login": uname}),
        contentType: "application/json",
        statusCode: {
            200: function (response) {
                $('#loadSymbolUname').attr('class', 'w3-green w3-center');
                $('#loadSymbolUname').html('Username is available');
                LoginValid = true;
            },
            409: function (response) {
                $('#loadSymbolUname').attr('class', 'w3-red w3-center');
                $('#loadSymbolUname').html("Login already in the database");
                LoginValid = false;
            },
        }, success: function () {
        },
        error: function(xhr, status, error) {
            $('#loadSymbolUname').html("An error occured: " + status + ": " + error);
        }
    }).done(function() {
        if(EmailValid && LoginValid && PasswordValid) {
            $('#buttonReg').attr("disabled", false);
        }
    });
    
}

function validatePassword() {
    var pwd = document.forms["registerForm"]["password"].value;
    var pwd2 = document.forms["registerForm"]["passwordConf"].value;
    var status = true;
    PasswordValid = false;
    $('#loadSymbolPassword').html('');
    if(!(pwd === pwd2)) {
        status = false;
        $('#loadSymbolPassword').attr('class', 'w3-red');
        $('#loadSymbolPassword').append('Passwords differ<br />');
    }

    if(pwd.length < 8 || pwd.length > 30) {
        status = false;
        $('#loadSymbolPassword').attr('class', 'w3-red w3-center');
        $('#loadSymbolPassword').append('Password size needs to be between 8 and 30 character<br />');
    }
    var regex = /^(?=.*[a-z]).+$/;
    if(!regex.test(pwd)){
        status = false;
        $('#loadSymbolPassword').attr('class', 'w3-red w3-center');
        $('#loadSymbolPassword').append('Password must contain lowercase letters<br />');
    }
    regex = /^(?=.*[A-Z]).+$/;
    if(!regex.test(pwd)){
        status = false;
        $('#loadSymbolPassword').attr('class', 'w3-red w3-center');
        $('#loadSymbolPassword').append('Password must contain uppercase letters<br />');
    }
    regex = /^(?=.*[0-9_\W]).+$/;
    if(!regex.test(pwd)){
        status = false;
        $('#loadSymbolPassword').attr('class', 'w3-red w3-center');
        $('#loadSymbolPassword').append('Password must contain numbers or special characters<br />');
    }

    if(status) {
        $('#loadSymbolPassword').attr('class', 'w3-green w3-center');
        $('#loadSymbolPassword').html('Password meets all the requirements<br />');
        PasswordValid = true;
    }
    if(EmailValid && LoginValid && PasswordValid) {
        $('#buttonReg').attr("disabled", false);
    }
    return staus;
}

function validateAndRegister() {
    $("#rloading").attr("class", "fa fa-spinner w3-spin");
    $("#rloading").attr("style", "width:30px; height:30px; font-size:30px");
    var uname = document.forms["registerForm"]["username"].value;
    var pwd = document.forms["registerForm"]["password"].value;
    var pwd2 = document.forms["registerForm"]["passwordConf"].value;
    var email = document.forms["registerForm"]["email"].value;

    $.ajax({
        url: server + "/users/register",
        type: "POST",
        data: JSON.stringify({"login": uname, "email": email, "password": pwd, "login": uname, "login": uname}),
        contentType: "application/json",
        statusCode: {
            200: function (response) {
                $('#rloading').attr('class', 'w3-green w3-center');
                $("#rloading").attr("style", "font-size:16px");
                $('#rloading').html('You are successfully registered');
            },
            409: function (response) {
                $('#rloading').attr('class', 'w3-red w3-center');
                $("#rloading").attr("style", "font-size:16px");
                $('#rloading').html("Registration error:"+response);
            },
        }, success: function () {
        },
        error: function(xhr, status, error) {
            $('#rloading').html("An error occured: " + status + ": " + error);
        }
    });
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
    $("#loading").attr("class", "fa fa-spinner w3-spin");
    $("#loading").attr("style", "width:30px; height:30px; font-size:30px");
    var uname = document.forms["loginForm"]["username"].value;
    var pwd = document.forms["loginForm"]["password"].value;
    var url = server + "/users/login";
    //TODO: hash the password
    $.ajax({
        url: url,
        type: "POST",
        data: JSON.stringify([{"login": uname, "password": pwd}]),
        contentType: "application/json",
        dataType: "json",
        statusCode: {
            200: function (response) {
                token = response.token;
                localStorage.setItem("token", response.token);
                localStorage.setItem("login", uname);
                $(location).attr('href', 'home.html');
            },
            401: function (response) {
                $('#loginError').attr('class', 'w3-red w3-center');
                $('#loginError').html("Login or password invalid");
                $("#loading").attr("class", "");
                $("#loading").attr("style", "");
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
    $.ajax({
        url: server + "/projects/" + projects[project].id,
        headers: {
            'Authorization':token,
        },
        type: "DELETE",
        success: function (){
            location.reload();
        }
    });
}
/*
headers: {
            'Authorization':token,
        },
success: function () {
        },
        error: function(xhr, status, error) { 
            $('#userlist').html("An error occured: " + status + ": " + error);
        }
*/

function findin(value, array) {
    for (var i=0; i < array.length; i++) {
        if (array[i].id == value) {
            return true;
        }
    }
    return false;
}

function deleteUserFromProject(userid) {
    $(location).attr('href', 'home.html');
    console.log("delete user " + project);
    $.ajax({
        url: server + "/projects/" + projects[project].id + "/users/" + userid,
        headers: {
            'Authorization':token,
        },
        type: "DELETE",
        success: function (){
            location.reload();
        }
    });
}

function addUserToProject(projectid, userid) {
    $("#projectLoading").attr("class", "fa fa-spinner w3-spin");
    $("#projectLoading").attr("style", "width:30px; height:30px; font-size:30px");
    usr = null;
    for(var i = 0; i < ausers.length; i++) {
        if(ausers[i].id == userid) {
            usr = ausers[i];
            break;
        }
    }

    $.ajax({
        url: server + "/projects/" + projects[project].id + "/users",
        type: "POST",
        headers: {
            'Authorization':token
        },
        data: JSON.stringify({"email": usr.email, "login": usr.login}),
        contentType: "application/json",
        statusCode: {
            200: function (response) {
                $('#AddUserMessage').attr('class', 'w3-green w3-center');
                $("#AddUserMessage").attr("style", "font-size:16px");
                $('#AddUserMessage').html('You are successfully registered');
                location.reload();
            },
            403: function (response) {
                $('#AddUserMessage').attr('class', 'w3-red w3-center');
                $("#AddUserMessage").attr("style", "font-size:16px");
                $('#AddUserMessage').html("Error error:" + response);
                //TODO: if token expired or not provided return to index.html
            },
        }, success: function () {
        },
        error: function(xhr, status, error) {
            $('#AddUserMessage').attr('class', 'w3-red w3-center');
            $("#AddUserMessage").attr("style", "font-size:16px");
            $('#AddUserMessage').html("An error occured: " + status + ": " + error);
        }
    });
}

function getProjectUsers() {
    var url = server + '/projects/' + projects[project].id + '/users';
    console.log(url);
    $.ajax({
        url: url,
        headers: {
            'Authorization':token,
        },
        type: "GET",
        dataType: 'json',
        statusCode: {
            200: function (response) {
                html = "";
                pusers = response;
                for(var i=0; i < pusers.length; i++) {
                    html += '<div class="w3-bar-item w3-bar-block w3-card w3-light-grey">' + pusers[i].login + "<div id='remUs" + pusers[i].id + "' class='fa fa-close w3-right w3-btn' style='font-size:10px' onclick='deleteUserFromProject("+pusers[i].id+")'";
                    html += '</div></div></div>';
                }
                console.log(html);
                html += '<button class="w3-btn w3-block w3-green w3-section w3-padding" type="button" onclick="addUser('+projects[project].id+')">Add User to this project area</button>';
                console.log(html);
                $('#pusers').html(html);
            },
            401: function (response) {
                $('#userlist').html("could not retrieve list of users assigned to this project");
            },
            403: function (response) {
                localStorage.setItem("error", "response");
                localStorage.removeItem("token");
                $(location).attr('href', 'index.html');
            }
        }, success: function () {
        },
        error: function(xhr, status, error) { 
            $('#userlist').html("An error occured: " + status + ": " + error);
        }
    }).done(function(){getAllUsers();});
}

function getAllUsers() {
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
                        html += '<button class="w3-btn w3-bar-item w3-bar-block w3-card w3-light-grey" onclick="addUserToProject('+projects[project].id + "," + ausers[i].id +')">' + ausers[i].login + "</button><br />"; //TODO: change userid with username and add fancy div to look good
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
}

function getProjectData(hrf) {
    project = hrf.innerHTML;
    $('#hcontainer').attr('class', '');
    $('#ProjectMessage').attr('class', 'hidden');
    var html = 'Project #' + projects[project].id + " Title: " + project + "<br />" + "Description: " + projects[project].description + '<br /><button onclick="pdeleteProject()" class="w3-btn w3-block w3-red w3-section w3-padding">Remove this project</button>';
    $('#projcontent').html(html);
    pusers = [];
    ausers = [];
    getProjectUsers();
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
                    var item = {"id": response[i].id, "description": response[i].description};
                    projects[response[i].title] = item;
                    html += beginLink + response[i].title + "</a>";
                }
                $('#loadingProject').attr('class', '');
                $('#loadingProject').attr('style', '');
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

function createProject() {
    $("#projectLoading").attr("class", "fa fa-spinner w3-spin");
    $("#projectLoading").attr("style", "width:30px; height:30px; font-size:30px");
    var project = document.forms["createProjectForm"]["projName"].value;
    var description = document.forms["createProjectForm"]["projDesc"].value;

    $.ajax({
        url: server + "/projects",
        type: "POST",
        headers: {
            'Authorization':token
        },
        data: JSON.stringify({"name": project, "description": description}),
        contentType: "application/json",
        statusCode: {
            200: function (response) {
                $('#projectLoading').attr('class', 'w3-green w3-center');
                $("#projectLoading").attr("style", "font-size:16px");
                $('#projectLoading').html('You are successfully registered');
                location.reload();
            },
            403: function (response) {
                $('#projectLoading').attr('class', 'w3-red w3-center');
                $("#projectLoading").attr("style", "font-size:16px");
                $('#projectLoading').html("Error error:" + response);
                //TODO: if token expired or not provided return to index.html
            },
        }, success: function () {
        },
        error: function(xhr, status, error) {
            $('#projectLoading').attr('class', 'w3-red w3-center');
            $("#projectLoading").attr("style", "font-size:16px");
            $('#projectLoading').html("An error occured: " + status + ": " + error);
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