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
        localStorage.removeItem("error");
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

function initItem() {
    token = localStorage.getItem("token");
    
    if(token == null) {
        $(location).attr('href', 'index.html');
    }
    uname = localStorage.getItem("login");
    $("#logindiv").html(uname);

    pusers = JSON.parse(localStorage.getItem("users"));
    projectid = localStorage.getItem("projectid");
    project = localStorage.getItem("project");
    localStorage.removeItem("users");
    localStorage.removeItem("project");
    $("#project").val(project);
    $("#projectid").val(projectid);
    
    var d = new Date();
    var datestring = d.getFullYear() + "-" + (d.getMonth()+1) + "-" + d.getDate() + " " +
    d.getHours() + ":" + d.getMinutes() + ":" + d.getSeconds();
    $("#created").val(datestring);
    html = "<option value='ua' selected>unassigned</option>";
    for(var i=0; i < pusers.length; i++) {
        html += '<option value="'+ pusers[i].id + '">' + pusers[i].login + '</option>';
    }
    $("#owner").html(html);
    $("#approver").html(html);
    getItemTypes();
    getItemStatuses();
}

function getItemTypes() {
    $.ajax({
        url: server + "/items/itemtypes",
        headers: {
            'Authorization':token,
        },
        type: "GET",
        dataType: 'json',
        statusCode: {
            200: function (response) {
                html = "";
                for(var i=0; i < response.length; i++) {
                    var x = ""
                    if(response[i].typeid == 1) {
                        x = "selected";
                    }
                    html += "<option value='" + response[i].typeid + "'" + x + ">" + response[i].type + "</option>";
                    x="";
                }
                $('#itemType').html("Users: <br />" + html);
            },
            401: function (response) {
                $('#itemType').html("could not retrieve list of users assigned to this project");
            },
            403: function (response) {

            }
        }, success: function () {
        },
        error: function(xhr, status, error) {
            handleError(xhr, status, error, "itemType");
        }
    });
}

function getItemStatuses() {
    $.ajax({
        url: server + "/items/itemstatus",
        headers: {
            'Authorization':token,
        },
        type: "GET",
        dataType: 'json',
        statusCode: {
            200: function (response) {
                html = "";
                for(var i=0; i < response.length; i++) {
                    var x = ""
                    if(response[i].statusid == 1) {
                        x = "selected";
                    }
                    html += "<option value='" + response[i].statusid + "'" + x + ">" + response[i].status + "</option>";
                    x = "";
                }
                $('#itemStatus').html("Users: <br />" + html);
            },
            401: function (response) {
                $('#itemStatus').html("could not retrieve list of users assigned to this project");
            },
            403: function (response) {

            }
        }, success: function () {
        },
        error: function(xhr, status, error) {
            handleError(xhr, status, error, "itemStatus");
        }
    });
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
                handleError(xhr, status, error, "loadSymbolEmail");
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
            handleError(xhr, status, error, "loadSymbolUname");
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

function handleError(xhr, status, error, divid) {
    $('#' + divid).attr('class', 'w3-red w3-center');
    $('#' + divid).attr("style", "font-size:16px");
    if (xhr.readyState == 4) {
        $('#' + divid).html("An error occured: " + xhr.statusCode + ": " + xhr.status);
    }
    else if (xhr.readyState == 0) {
        $('#' + divid).html("Network connection error");
    }
    else {
        $('#' + divid).html("An error occured: " + status + ": " + error);
    }
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
            handleError(xhr, status, error, "rloading");
        }
    });
}

function signout() {
    token = null;
    localStorage.removeItem("token");
    localStorage.removeItem("login");
    $(location).attr('href', 'index.html');
}

function navOpen() {
    document.getElementById("main").style.marginLeft = "15%";
    document.getElementById("navbar").style.width = "15%";
    document.getElementById("navbar").style.display = "block";
    document.getElementById("openNav").style.display = 'none';
    document.getElementById("overlay").style.display = "block";
  }

function navClose() {
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
        data: JSON.stringify({"login": uname, "password": pwd}),
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
            handleError(xhr, status, error, "loginError");
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
                $('#AddUserMessage').html("Error:" + response);
                //TODO: if token expired or not provided return to index.html
            },
        }, success: function () {
        },
        error: function(xhr, status, error) {
            handleError(xhr, status, error, "AddUserMessage");
        }
    });
}

function getProjectUsers() {
    var url = server + '/projects/' + projects[project].id + '/users';
    $.ajax({
        url: url,
        headers: {
            'Authorization':token,
        },
        type: "GET",
        dataType: 'json',
        statusCode: {
            200: function (response) {
                html = "<div style='-y: scroll;'>";
                pusers = response;
                for(var i=0; i < pusers.length; i++) {
                    html += '<div class="w3-bar-item w3-bar-block w3-card w3-light-grey" style="width:100%">' + 
                        pusers[i].login + 
                        "<div id='remUs" + pusers[i].id + "' class='fa fa-close w3-right w3-btn' style='font-size:10px' \
                        onclick='deleteUserFromProject("+pusers[i].id+")'</div></div></div>";
                }
                html += '</div><button class="w3-btn w3-block w3-green w3-section w3-padding" type="button" onclick="addUser('+projects[project].id+')">Add User to this project area</button>';
                $('#pusers').html("Users: <br />" + html);
            },
            401: function (response) {
                $('#userlist').html("could not retrieve list of users assigned to this project");
            },
            403: function (response) {

            }
        }, success: function () {
        },
        error: function(xhr, status, error) {
            handleError(xhr, status, error, "userlist");
        }
    }).done(function(){getAllUsers();});
}

function getProjectAdmins() {
    var url = server + '/projects/' + projects[project].id + '/admins';
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
                for(var i=0; i < response.length; i++) {
                    html += '<div class="w3-bar-item w3-bar-block w3-card w3-light-grey" style="width:100%">' + 
                    response[i].login + "</div>";
                }
                $('#admins').html("Admins of the project: <br />" + html);
            },
            401: function (response) {
                $('#admins').html("could not retrieve list of admins assigned to this project");
            },
            403: function (response) {

            }
        }, success: function () {
        },
        error: function(xhr, status, error) {
            handleError(xhr, status, error, "admins");
        }
    }).done(function(){getAllUsers();});
}

function grantAccess(id) {
    $.ajax({
        url: server + "/requests/" + projects[project].id + "/" + id,
        headers: {
            'Authorization':token,
        },
        type: "POST",
        contentType: "text/plain",
        success: function (){
            getProjectRequestors();
            getProjectUsers();
        }
    });
}

function declineAccess(id) {
    $.ajax({
        url: server + "/requests/" + projects[project].id + "/" + id,
        headers: {
            'Authorization':token,
        },
        type: "DELETE",
        success: function (){
            getProjectRequestors();
        }
    });
}

function getProjectRequestors() {
    var url = server + '/requests/' + projects[project].id;
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
                for(var i=0; i < response.length; i++) {
                    html += '<div class="w3-bar-item w3-bar-block w3-card w3-light-grey" style="width:100%">' + 
                    response[i].login;
                    html += "<div id='declineAccess" + response[i].id + "' class='fa fa-close w3-right w3-btn' alt='decline' style='font-size:10px' \
                        onclick='declineAccess("+response[i].id+")'</div></div>";
                    html += "<div id='grantAccess" + response[i].id + "' class='fa fa-arrow-right w3-right w3-btn' alt='accept' style='font-size:10px' \
                        onclick='grantAccess("+response[i].id+")'</div></div></div>";
                }
                $('#requestors').html("Requests for access:<br />" + html);
            },
            401: function (response) {
                $('#requestors').html("could not retrieve list of requestors assigned to this project");
            },
            403: function (response) {

            }
        }, success: function () {
        },
        error: function(xhr, status, error) {
            handleError(xhr, status, error, "requestors");
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
                        html += '<button class="w3-btn w3-bar-item w3-bar-block w3-card w3-light-grey" style="width: 100%; margin:5px;" onclick="addUserToProject('+projects[project].id + "," + ausers[i].id +')">' + ausers[i].login + "</button><br />";
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
            handleError(xhr, status, error, "userlist");
        }
    });
}

function goToItem(id) {
    console.log(id);
}

function getProjectItems() {
    $.ajax({
        url: server + "/items/" + projects[project].id,
        headers: {
            'Authorization':token,
        },
        type: "GET",
        statusCode: {
            200: function (response) {
                pitems = response;
                var html = "<table class='w3-table-all w3-hoverable'>\
                            <thead>\
                            <tr class='w3-green'>\
                            <td> id </td> <td> type </td> <td> title </td> <td> owner </td> <td> created </td> <td> status </td>\
                            </tr></thead>";
                //var searchInput = '<input class="w3-input w3-padding" type="text" placeholder="Search.." id="userSearch" onkeyup="filterUsers()">'
                for(var i=0; i < pitems.length; i++) {
                    var d = new Date(pitems[i].creationdate);
                    var datestring = d.getFullYear() + "-" + (d.getMonth()+1) + "-" + d.getDate() + " " +
                    d.getHours() + ":" + d.getMinutes() + ":" + d.getSeconds();
                    var tbl = "<tr onclick='goToItem("+pitems[i].itemid+")' style='cursor:pointer'>\
                                <td>"+ pitems[i].itemid + "</td> <td>" + pitems[i].itemtype.type + "</td> <td>" + pitems[i].title + "</td>\
                                <td>" + pitems[i].owner.login + "</td> <td>" + datestring + "</td> <td>" + pitems[i].itemstatus.status + "</td>\
                               </tr>";
                    html += tbl;
                }
                $('#items').html(html + "</table>");
            },
            401: function (response) {
                $('#items').html("could not retrieve list of user assigned to this project");
            },
        }, success: function () {
        },
        error: function(xhr, status, error) {
            handleError(xhr, status, error, "userlist");
        }
    });
}

function getProjectData(hrf) {
    project = hrf.innerHTML;
    $('#hcontainer').attr('style', 'height:300px;');
    $('#ProjectMessage').attr('class', 'hidden');
    var html = 'Project data: <br />Project #' + projects[project].id + " Title: " + project + "<br />" + "Description: " + projects[project].description + 
    '<button onclick="newWorkItem()" class="w3-btn w3-block w3-blue w3-section w3-padding">Add new work item</button>' +
    '<button onclick="pdeleteProject()" class="w3-btn w3-block w3-red w3-section w3-padding">Remove this project</button>';
    $('#projcontent').html(html);
    pusers = [];
    ausers = [];
    getProjectUsers();
    getProjectAdmins();
    getProjectItems();
    if(projects[project].isAdmin) {
        getProjectRequestors();
        $('#requestors').attr("style", "height:300px; overflow-y: scroll;");
        $('#items').attr("style", "height:500px; width:100%;");
    }
    else {
        $('#requestors').attr("style", "height:300px; display: none; overflow-y: scroll;");
    }
    navClose();
}

function newWorkItem() {
    localStorage.setItem("project", project);
    localStorage.setItem("projectid", projects[project].id);
    localStorage.setItem("users", JSON.stringify(pusers));
    $(location).attr('href', 'item.html');
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
                    var item = {"id": response[i].id, "description": response[i].description, "isAdmin": response[i].admin};
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
            handleError(xhr, status, error, "projects");
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
            handleError(xhr, status, error, "projectLoading");
        }
    });
}

function showDesc(id) {
    var divid = "Desc" + id;
    var x = document.getElementById(divid);
    if (x.className.indexOf("w3-show") == -1) {
        x.className += " w3-show";
    } else {
        x.className = x.className.replace(" w3-show", "");
    }
}

function requestAccessToProject(id, idx) {

    $("#reqBtn"+idx).attr("class", "fa fa-spinner w3-spin");
    $("#reqBtn"+idx).attr("style", "width:30px; height:30px; font-size:30px");

    $.ajax({
        url: server + "/requests/" + id,
        type: "POST",
        headers: {
            'Authorization':token
        },
        contentType: "text/plain",
        statusCode: {
            200: function (response) {
                document.getElementById('RequestAccessModal').style.display='none';
                $('#requestMessage').attr('class', 'w3-green w3-center');
                $("#requestMessage").attr("style", "font-size:16px");
            },
            403: function (response) {
                $("#reqBtn"+idx).attr('class', 'w3-btn w3-padding-16 w3-red w3-center');
                $("#reqBtn"+idx).html("An error occured.");
                $('#requestMessage').html("Error error:" + response);
            },
        }, success: function () {
        },
        error: function(xhr, status, error) {
            handleError(xhr, status, error, "requestMessage");
        }
    });
}

function requestAccess() {
    document.getElementById('RequestAccessModal').style.display='block';
    $("#requestMessage").attr("class", "fa fa-spinner w3-spin");
    $("#requestMessage").attr("style", "width:30px; height:30px; font-size:30px");

    $.ajax({
        url: server + "/requests",
        type: "GET",
        headers: {
            'Authorization':token
        },
        statusCode: {
            200: function (response) {
                $('#requestMessage').attr('class', 'w3-green w3-center');
                $("#requestMessage").attr("style", "font-size:16px");
                html = "";
                for(var i = 0; i < response.length; i++) {
                    html += '<button class="w3-btn w3-bar-item w3-bar-block w3-card w3-light-grey" style="width:100%" onclick=showDesc(' + i +')>' + response[i].title + "</button><br />";
                    html += '<div id="Desc' + i + '" class="w3-container w3-row w3-hide"><div class="w3-threequarter">\
                                <p>' + response[i].description + '</p>\
                            </div><div id="reqbtn' + i + '" class="w3-btn w3-padding-16 w3-quarter w3-green" onclick="requestAccessToProject(' + response[i].id + ',' + i + ')">Request Access</div></div></div>';
                }
                $('#projectsToRequest').html(html);
            },
            403: function (response) {
                $('#requestMessage').attr('class', 'w3-red w3-center');
                $("#requestMessage").attr("style", "font-size:16px");
                $('#requestMessage').html("Error error:" + response);
            },
        }, success: function () {
        },
        error: function(xhr, status, error) {
            handleError(xhr, status, error, "requestMessage");
        }
    });
}

function addNewItem() {
    var projectid = document.forms["newItemForm"]["projectid"].value;
    var itemName = document.forms["newItemForm"]["itemName"].value;
    var owner = document.forms["newItemForm"]["owner"].value;
    var approver = document.forms["newItemForm"]["approver"].value;
    var type = document.forms["newItemForm"]["type"].value;
    var created = document.forms["newItemForm"]["created"].value;
    var description = document.forms["newItemForm"]["description"].value;
    var v = projectid + " " + itemName + " " + owner + " " + approver + " " + type + " " + created + " " + description
    console.log(v);

    $.ajax({
        url: server + "/items",
        type: "POST",
        headers: {
            'Authorization':token
        },
        data: JSON.stringify({"projectid": projectid, "title": itemName, "owner": owner, "approver": approver, 
                              "type": type, "creationDate": created, "description": description}),
        contentType: "application/json",
        statusCode: {
            200: function (response) {
                $(location).attr('href', 'home.html')
            },
            403: function (response) {
                /*$("#reqBtn"+idx).attr('class', 'w3-btn w3-padding-16 w3-red w3-center');
                $("#reqBtn"+idx).html("An error occured.");
                $('#requestMessage').html("Error error:" + response);*/
            },
        }, success: function () {
        },
        error: function(xhr, status, error) {
            //handleError(xhr, status, error, "requestMessage");
        }
    });
}