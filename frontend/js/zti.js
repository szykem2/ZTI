var token = null; //token autoryzacyjny
var server = 'http://localhost:8080/trtrt'; //adres serwera z projektu
var username = null; //nazwa użytkownika
var projects = []; //tablica projektów
var pusers = []; //tablica użytkownikó
var admins = []; //tablica administratorów
var ausers = null; //użytkownicy
var project = null; //projekty
var LoginValid = false; //flaga czy login jest poprawny
var EmailValid = false; //flaga czy email jest poprawny
var PasswordValid = false; //flaga czy hasło jest poprawne
var pitems = null; //elementy

/**
 * Funkcja inicjalizująca stronę index.html
 */
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

/**
 * Funkcja inicjalizująca stronę home.html
 */
function initHome() {
    token = localStorage.getItem("token");
    
    if(token == null) {
        $(location).attr('href', 'index.html');
    }
    uname = localStorage.getItem("login");
    $("#logindiv").html(uname);
    getProjects();
}

/**
 * Funkcja hashująca hasło
 * @param {string} password hasło 
 */
function hash(password) {
    var hashObj = new jsSHA("SHA-512", "TEXT", {numRounds: 1});
    hashObj.update(password);
    var hsh = hashObj.getHash("HEX");
    return hsh;
}

/**
 * Funkcja inicjalizująca stronę item.html
 */
function initItem() {
    token = localStorage.getItem("token");
    if(token == null) {
        $(location).attr('href', 'index.html');
    }

    var type = localStorage.getItem("itemAction");
    if(type == null) {
        $(location).attr('href', 'home.html');
    }
    var userid = null;
    var approverid = null;
    var item = null;
    if(type == "view") {
        item = JSON.parse(localStorage.getItem("item"));
        userid = item.owner.id;
        approverid = item.approver.id;
        $("#itemid").val(item.itemid);
        $("#itemTitle").val(item.title);
        $("#itemTitle").prop('disabled', true);
        $("#textDesc").val(item.description);
        $("#textDesc").prop('disabled', true);
        $("#savebtn").prop('disabled', true);
        if(item.resolutiondate != null) {
            var d = new Date(item.resolutiondate)
            var datestring = d.getFullYear() + "-" + (d.getMonth()+1) + "-" + d.getDate() + " " +
            d.getHours() + ":" + d.getMinutes() + ":" + d.getSeconds();
            $("#resolved").val(datestring);
        }
        getComments(item.itemid);
    }
    else {
        $("#commentSection").attr('class', 'hidden');
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
    if(item != null) {
        d = new Date(item.creationdate)
    }
    var datestring = d.getFullYear() + "-" + (d.getMonth()+1) + "-" + d.getDate() + " " +
    d.getHours() + ":" + d.getMinutes() + ":" + d.getSeconds();
    $("#created").val(datestring);
    var html = "";
    if (userid == null || userid == -1) {
        userid = -1;
        html = "<option value='ua' selected>unassigned</option>";
    }
    else {
        html = "<option value='ua'>unassigned</option>";
    }
    for(var i=0; i < pusers.length; i++) {
        var sel = "";
        if(pusers[i].id == userid) {
            sel = "selected";
        }
        html += '<option value="'+ pusers[i].id + '" ' + sel + '>' + pusers[i].login + '</option>';
        sel = "";
    }
    $("#owner").html(html);

    if (approverid == null || approverid == -1) {
        approverid = -1;
        html = "<option value='ua' selected>unassigned</option>";
    }
    else {
        html = "<option value='ua'>unassigned</option>";
    }
    for(var i=0; i < pusers.length; i++) {
        var sel = "";
        if(pusers[i].id == approverid) {
            sel = "selected";
        }
        html += '<option value="'+ pusers[i].id + '" ' + sel + '>' + pusers[i].login + '</option>';
    }
    $("#approver").html(html);
    if(type == "view") {
        $("#owner").prop('disabled', true);
        $("#approver").prop('disabled', true);
        $("#itemType").prop('disabled', true);
        $("#comments").attr('class', "");
        var html = "<div id='editbtn' class='w3-btn w3-teal' onclick='enableEditing()'>EDIT</div>";
        $("#edt").html(html);
    }
    getItemTypes(item);
    getItemStatuses(item);
}

/**
 * Funkcja pobierająca typy elementów
 * @param {JSON} item element pracy
 */
function getItemTypes(item) {
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
                    if(item == null && response[i].typeid == 1) {
                        x = "selected";
                    }
                    else if(item != null && (response[i].typeid == item.itemtype.typeid)) {
                        x = "selected";
                    }
                    html += "<option value='" + response[i].typeid + "'" + x + ">" + response[i].type + "</option>";
                    x="";
                }
                $('#itemType').html("Users: <br />" + html);
            },
            403: function (response) {
                $('#itemType').html("could not retrieve list of users assigned to this project");
            },
            401: function (response) {
                localStorage.clear();
                localStorage.setItem("error", response.status + ": " + response.responseText);
                $(location).attr("href", "index.html");
            }
        }, success: function () {
        },
        error: function(xhr, status, error) {
            handleError(xhr, status, error, "itemType");
        }
    });
}

/**
 * Funkcja pobierająca statusy elementów
 * @param {JSON} item element pracy
 */
function getItemStatuses(item) {
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
                    if(item == null && response[i].statusid == 1) {
                        x = "selected";
                    }
                    else if(item != null && (response[i].statusid == item.itemstatus.statusid)) {
                        x = "selected";
                    }
                    html += "<option value='" + response[i].statusid + "'" + x + ">" + response[i].status + "</option>";
                    x = "";
                }
                $('#itemStatus').html("Users: <br />" + html);
            },
            403: function (response) {
                $('#itemStatus').html("could not retrieve list of users assigned to this project");
            },
            401: function (response) {
                localStorage.clear();
                localStorage.setItem("error", response.status + ": " + response.responseText);
                $(location).attr("href", "index.html");
            }
        }, success: function () {
        },
        error: function(xhr, status, error) {
            handleError(xhr, status, error, "itemStatus");
        }
    });
}

/**
 * Funkcja walidująca podany przez użytkownika adres email
 * @param {string} email adres email
 * @param {bool} disp flaga mówiąca o tym czy wyświetlić element na stronie 
 */
function validateEmail(email, disp=true) {
    if(disp) {
        $('#loadSymbolEmail').html('<i class="fa fa-spinner w3-spin" style="font-size:20px"></i>');
    }
    var re = /^[\w!#$%&'*+/=?`{|}~^-]+(?:\.[\w!#$%&'*+/=?`{|}~^-]+)*@(?:[a-zA-Z0-9-]+\.)+[a-zA-Z]{2,6}$/;
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

/**
 * Funkcja validująca sprawdzanie nazwy użytkownika
 * @param {string} uname podana nazwa użytkownika
 * @param {bool} disp flaga mówiąca o tym czy wyświetlić element na stronie 
 */
function validateUser(uname, disp=true) {
    if(disp) {
        $('#loadSymbolUname').html('<i class="fa fa-spinner w3-spin" style="font-size:20px"></i>');
    }
    if(uname.length < 5 || uname.length > 20) {
        $('#loadSymbolUname').attr('class', 'w3-red w3-center');
        $('#loadSymbolUname').html("Username should be between 5 and 20 characters");
        return;
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

/**
 * Funkcja walidująca podane hasła
 */
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
    return status;
}

/**
 * Funkcja obsługująca błędy
 * @param {XmlHttpResponse} xhr obiekt XHR
 * @param {string} status status żądania
 * @param {string} error wiadomość błędu
 * @param {string} divid id elementu o tagu div
 */
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

/**
 * Funkcja przeprowadzająca walidację oraz wysyłająca żądanie do serwera
 */
function validateAndRegister() {
    $("#rloading").attr("class", "fa fa-spinner w3-spin");
    $("#rloading").attr("style", "width:30px; height:30px; font-size:30px");
    $("#buttonReg").prop("disabled", true);
    
    var uname = document.forms["registerForm"]["username"].value;
    var pwd = hash(document.forms["registerForm"]["password"].value);
    var email = document.forms["registerForm"]["email"].value;
    if(!validatePassword()) {
        return;
    }
    $.ajax({
        url: server + "/users/register",
        type: "POST",
        data: JSON.stringify({"login": uname, "email": email, "password": pwd}),
        contentType: "application/json",
        statusCode: {
            200: function (response) {
                $('#rloading').attr('class', 'w3-green w3-center');
                $("#rloading").attr("style", "font-size:16px");
                $('#rloading').html('You are successfully registered');
                $("#buttonReg").prop("disabled", false);
            },
            409: function (response) {
                $('#rloading').attr('class', 'w3-red w3-center');
                $("#rloading").attr("style", "font-size:16px");
                $('#rloading').html("Registration error:"+response);
                $("#buttonReg").prop("disabled", false);
            },
        }, success: function () {
        },
        error: function(xhr, status, error) {
            handleError(xhr, status, error, "rloading");
        }
    });
}

/**
 * Funkjca do wylogowania
 */
function signout() {
    token = null;
    localStorage.removeItem("token");
    localStorage.removeItem("login");
    $(location).attr('href', 'index.html');
}

/**
 * Funkcja otwierająca pasek nawigacyjny
 */
function navOpen() {
    document.getElementById("main").style.marginLeft = "15%";
    document.getElementById("navbar").style.width = "15%";
    document.getElementById("navbar").style.display = "block";
    document.getElementById("openNav").style.display = 'none';
    document.getElementById("overlay").style.display = "block";
}

/**
 * Funkcja zamykająca pasek nawigacyjny
 */
function navClose() {
    document.getElementById("main").style.marginLeft = "0%";
    document.getElementById("navbar").style.display = "none";
    document.getElementById("openNav").style.display = "inline-block";
    document.getElementById("overlay").style.display = "none";
  }

/**
 * Funkcja filtrująca projekty w pasku nawigacyjnym
 */
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

/**
 * Funkcja filtrująca projekty przy proszeniu o dostęp
 */
function filterProjectsRequests() {
    var input, filter, ul, li, a, i;
    input = document.getElementById("SearchReq");
    filter = input.value.toUpperCase();
    div = document.getElementById("prReq");
    a = div.getElementsByTagName("button");
    console.log(a);
    for (i = 0; i < a.length; i++) {
        if (a[i].innerHTML.toUpperCase().indexOf(filter) > -1) {
            a[i].style.display = "";
        } else {
            document.getElementById("Desc" + i).style.display = "none";
            a[i].style.display = "none";
        }
    }
}

/**
 * Funkcja filtrująca użytkowników przy dodawaniu użytkownika
 */
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

/**
 * Funkcja filtrująca użytkowników przy dodawaniu administratora
 */
function filterAdmins() {
    var input, filter, ul, li, a, i;
    input = document.getElementById("adminSearch");
    filter = input.value.toUpperCase();
    div = document.getElementById("adminsToAdd");
    a = div.getElementsByTagName("button");
    for (i = 0; i < a.length; i++) {
        if (a[i].innerHTML.toUpperCase().indexOf(filter) > -1) {
            a[i].style.display = "";
        } else {
            a[i].style.display = "none";
        }
    }
}

/**
 * Funkcja wysyłająca rządanie o uwierzytelnianie
 */
function login() {
    $("#loading").attr("class", "fa fa-spinner w3-spin");
    $("#loading").attr("style", "width:30px; height:30px; font-size:30px");
    var uname = document.forms["loginForm"]["username"].value;
    var pwd = hash(document.forms["loginForm"]["password"].value);
    var url = server + "/users/login";

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

/**
 * Funkcja otwierająca okno usuwania projektu
 */
function pdeleteProject() {
    document.getElementById('DeleteModal').style.display='block';
}

/**
 * Funkcja otwierająca okno dodawania użytkownika
 */
function addUser() {
    document.getElementById('AddUserModal').style.display='block';
}

/**
 * Fukcja wyświetlająca użytkowników, których można dodać jako administratorów
 */
function addAdmin() {
    var searchInput = '<input class="w3-input w3-padding" type="text" placeholder="Search.." id="adminSearch" onkeyup="filterAdmins()">';
    var html = "";
    for(var i=0; i < pusers.length; i++) {
        if(!findin(pusers[i].id, admins)) {
            var xx = "";
            console.log(projects[project]);
            if(projects[project].isAdmin) {
                xx ='addAdminToProject('+projects[project].id + "," + pusers[i].id +')';
            }
            else {
                xx="";
            }
            html += '<button class="w3-btn w3-bar-item w3-bar-block w3-card w3-light-grey" style="width: 100%; margin:5px;" onclick="' + xx + '">' + pusers[i].login + "</button><br />";
            console.log(html);
        }
    }
    $('#adminsToAdd').html(searchInput + html);
    document.getElementById('AddAdminModal').style.display='block';
}

/**
 * Funkcja dodająca administratora do projektu
 * @param {int} pid identyfikator projektu
 * @param {int} userid identyfikator użytkownika
 */
function addAdminToProject(pid, userid) {
    $("#AddAdminMessage").attr("class", "fa fa-spinner w3-spin");
    $("#AddAdminMessage").attr("style", "width:30px; height:30px; font-size:30px");
    usr = null;
    for(var i = 0; i < pusers.length; i++) {
        if(pusers[i].id == userid) {
            usr = pusers[i];
            break;
        }
    }

    $.ajax({
        url: server + "/projects/" + projects[project].id + "/admins",
        type: "POST",
        headers: {
            'Authorization':token
        },
        data: JSON.stringify({"email": usr.email, "login": usr.login}),
        contentType: "application/json",
        statusCode: {
            200: function (response) {
                $('#AddAdminMessage').attr('class', 'w3-green w3-center');
                $("#AddAdminMessage").attr("style", "font-size:16px");
                $('#AddAdminMessage').html('You are successfully registered');
                location.reload();
            },
            403: function (response) {
                $('#AddAdminMessage').attr('class', 'w3-red w3-center');
                $("#AddAdminMessage").attr("style", "font-size:16px");
                $('#AddAdminMessage').html("Error:" + response);
            },
            401: function (response) {
                localStorage.clear();
                localStorage.setItem("error", response.status + ": " + response.responseText);
                $(location).attr("href", "index.html");
            }
        }, success: function () {
        },
        error: function(xhr, status, error) {
            handleError(xhr, status, error, "AddAdminMessage");
        }
    });
}

/**
 * Funkcja usuwająca projekt
 */
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

/**
 * Funkcja sprawdzająca czy w tablicy znajduje się obiekt o podanym id
 * @param {int} value identyfikator
 * @param {Array} array tablica obiektów JSON
 */
function findin(value, array) {
    for (var i=0; i < array.length; i++) {
        if (array[i].id == value) {
            return true;
        }
    }
    return false;
}

/**
 * Funkcja usuwająca użytkownika z projektu
 * @param {int} userid identyfikator użytkownika
 */
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

/**
 * Funkcja dodająca użytkownika do projektu
 * @param {int} projectid identyfikator projektu
 * @param {int} userid identyfikator użytkownika
 */
function addUserToProject(projectid, userid) {
    $("#AddUserMessage").attr("class", "fa fa-spinner w3-spin");
    $("#AddUserMessage").attr("style", "width:30px; height:30px; font-size:30px");
    usr = null;
    for(var i = 0; i < ausers.length; i++) {
        if(ausers[i].id == userid) {
            usr = ausers[i];
            break;
        }
    }
    console.log(usr);
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
            },
            401: function (response) {
                localStorage.clear();
                localStorage.setItem("error", response.status + ": " + response.responseText);
                $(location).attr("href", "index.html");
            }
        }, success: function () {
        },
        error: function(xhr, status, error) {
            handleError(xhr, status, error, "AddUserMessage");
        }
    });
}

/**
 * Funkcja pobierająca użytkowników projektu
 */
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
                html = "<div style='max-height: 230px; overflow-y: scroll;'>";
                pusers = response;
                for(var i=0; i < pusers.length; i++) {
                    var color = "#fff";
                    if(i%2 == 1) {
                        color = "#eee";
                    }
                    html += '<div class="w3-bar-item w3-border" style="width:100%;' + 'background-color:' + color + '">' + pusers[i].login;
                    console.log(projects[project]);
                    if(projects[project].isAdmin) {
                        console.log("tt");
                        html += "<div id='remUs" + pusers[i].id + "' class='fa fa-close w3-right w3-btn' style='font-size:10px' onclick='deleteUserFromProject("+pusers[i].id+")' </div></div>";
                    }
                    html += "</div>";
                }
                if(projects[project].isAdmin){
                    html += '</div><button class="w3-btn w3-block w3-green w3-section w3-padding" type="button" onclick="addUser('+projects[project].id+')">Add User to this project area</button>';
                }
                $('#pusers').html("Users: <br />" + html);
            },
            403: function (response) {
                $('#userlist').html("could not retrieve list of users assigned to this project");
            },
            401: function (response) {
                localStorage.clear();
                localStorage.setItem("error", response.status + ": " + response.responseText);
                $(location).attr("href", "index.html");
            }
        }, success: function () {
        },
        error: function(xhr, status, error) {
            handleError(xhr, status, error, "userlist");
        }
    }).done(function(){getAllUsers();});
}

/**
 * Funkcja pobierająca administratorów projektu
 */
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
                html = "<div style='max-height: 230px; overflow-y: scroll'>";
                admins = response;
                for(var i=0; i < response.length; i++) {
                    var color = "#fff";
                    if(i%2 == 1) {
                        color = "#eee";
                    }
                    html += '<div class="w3-bar-item w3-border" style="width:100%;' + 'background-color:' + color + '">' + 
                    response[i].login + "</div>";
                }
                if(projects[project].isAdmin){
                    html += '</div></div><button class="w3-btn w3-block w3-green w3-section w3-padding" type="button" onclick="addAdmin('+projects[project].id+')">Add Admin to this project area</button>';
                }
                $('#admins').html("Admins of the project: <br />" + html);
            },
            403: function (response) {
                $('#admins').html("could not retrieve list of admins assigned to this project");
            },
            401: function (response) {
                localStorage.clear();
                localStorage.setItem("error", response.status + ": " + response.responseText);
                $(location).attr("href", "index.html");
            }
        }, success: function () {
        },
        error: function(xhr, status, error) {
            handleError(xhr, status, error, "admins");
        }
    }).done(function(){getAllUsers();});
}

/**
 * Funkcja akceptująca prośbę użytkownika o dołączenie do projektu
 * @param {int} id identyfikator użytkownika
 */
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

/**
 * Funkcja odrzucająca prośbę użytkownika o dołączenie do projektu
 * @param {int} id identyfikator użytkownika
 */
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

/**
 * Funkcja pobierająca użytkowników, którzy poprosili o dostęp
 */
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
                html = "<div style='max-height: 230px; overflow-y: scroll'>";
                for(var i=0; i < response.length; i++) {
                    var color = "#fff";
                    if(i%2 == 1) {
                        color = "#eee";
                    }
                    html += '<div class="w3-bar-item w3-border" style="width:100%;' + 'background-color:' + color + '">' +
                    response[i].login;
                    html += "<div id='declineAccess" + response[i].id + "' class='fa fa-close w3-right w3-btn' alt='decline' style='font-size:10px' \
                        onclick='declineAccess("+response[i].id+")'</div></div>";
                    html += "<div id='grantAccess" + response[i].id + "' class='fa fa-arrow-right w3-right w3-btn' alt='accept' style='font-size:10px' \
                        onclick='grantAccess("+response[i].id+")'</div></div></div>";
                }
                $('#requestors').html("Requests for access:<br />" + html);
            },
            403: function (response) {
                $('#requestors').html("could not retrieve list of requestors assigned to this project");
            },
            401: function (response) {
                localStorage.clear();
                localStorage.setItem("error", response.status + ": " + response.responseText);
                $(location).attr("href", "index.html");
            }
        }, success: function () {
        },
        error: function(xhr, status, error) {
            handleError(xhr, status, error, "requestors");
        }
    }).done(function(){getAllUsers();});
}

/**
 * Funkcja pobierająca wszystkich użytkowników
 */
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
                        var xx = ""
                        if(projects[project].isAdmin) {
                            xx ='addUserToProject('+projects[project].id + "," + ausers[i].id +')';
                        }
                        else {
                            xx="";
                        }
                        html += '<button class="w3-btn w3-bar-item w3-bar-block w3-card w3-light-grey" style="width: 100%; margin:5px;" onclick="' + xx + '">' + ausers[i].login + "</button><br />";
                    }
                }
                $('#usersToAdd').html(searchInput + html);
            },
            403: function (response) {
                $('#userlist').html("could not retrieve list of user assigned to this project");
            },
            401: function (response) {
                localStorage.clear();
                localStorage.setItem("error", response.status + ": " + response.responseText);
                $(location).attr("href", "index.html");
            }
        }, success: function () {
        },
        error: function(xhr, status, error) {
            handleError(xhr, status, error, "userlist");
        }
    });
}

/**
 * Funkcja przekierowująca do widoku elementu po kliknięci na wiersz w tabeli
 * @param {int} id identyfikator elementu
 */
function goToItem(id) {
    localStorage.setItem("project", project);
    localStorage.setItem("projectid", projects[project].id);
    localStorage.setItem("users", JSON.stringify(pusers));
    localStorage.setItem("itemAction", "view");
    localStorage.setItem("item", JSON.stringify(pitems[id]));
    $(location).attr('href', 'item.html');
}

/**
 * Funkcja filtrująca elementy pracy
 */
function filterWorkItems() {
    var input, filter, table, tr, td, i;
    input = document.getElementById("tblsearch");
    filter = input.value.toUpperCase();
    table = document.getElementById("itemtbl");
    tr = table.getElementsByTagName("tr");
    for (i = 1; i < tr.length; i++) {
        tds = tr[i].getElementsByTagName("td");
        if (tds) {
            tr[i].style.display = "none";
            for(var j = 0; j < tds.length; j++) {
                if (tds[j].innerHTML.toUpperCase().indexOf(filter) > -1) {
                    tr[i].style.display = "";
                }
            }
        }
    }
}

/**
 * Funkcja pobierająca elementy pracy przypisane do projektu
 */
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
                var html = "<input type='text' id='tblsearch' onkeyup='filterWorkItems()' placeholder='Search for work items..'>\
                            <table id='itemtbl' class='w3-table-all w3-hoverable'>\
                            <thead>\
                            <tr class='w3-green'>\
                            <td> id </td> <td> type </td> <td> title </td> <td> owner </td> <td> created </td> <td> status </td>\
                            </tr></thead>";
                for(var i=0; i < pitems.length; i++) {
                    var d = new Date(pitems[i].creationdate);
                    var datestring = d.getFullYear() + "-" + (d.getMonth()+1) + "-" + d.getDate() + " " +
                    d.getHours() + ":" + d.getMinutes() + ":" + d.getSeconds();
                    var tbl = "<tr onclick='goToItem("+i+")' style='cursor:pointer'>\
                                <td>"+ pitems[i].itemid + "</td> <td>" + pitems[i].itemtype.type + "</td> <td>" + pitems[i].title + "</td>\
                                <td>" + pitems[i].owner.login + "</td> <td>" + datestring + "</td> <td>" + pitems[i].itemstatus.status + "</td>\
                               </tr>";
                    html += tbl;
                }
                $('#items').html(html + "</table>");
            },
            403: function (response) {
                $('#items').html("could not retrieve list of user assigned to this project");
            },
            401: function (response) {
                localStorage.clear();
                localStorage.setItem("error", response.status + ": " + response.responseText);
                $(location).attr("href", "index.html");
            }
        }, success: function () {
        },
        error: function(xhr, status, error) {
            handleError(xhr, status, error, "userlist");
        }
    });
}

/**
 * Funkcja pobierająca i wyświetlająca informacje o projekcie
 * @param {JSON} hrf obiekt projektu
 */
function getProjectData(hrf) {
    project = hrf.innerHTML;
    $('#hcontainer').attr('style', 'height:300px;');
    $('#ProjectMessage').attr('class', 'hidden');
    var html = 'Project data: <br />Project #' + projects[project].id + " Title: " + project + "<br />" + "Description: " + projects[project].description + 
    '<button onclick="newWorkItem()" class="w3-btn w3-block w3-blue w3-section w3-padding">Add new work item</button>';
    if(projects[project].isAdmin) {
        html += '<button onclick="pdeleteProject()" class="w3-btn w3-block w3-red w3-section w3-padding">Remove this project</button>';
    }
    $('#projcontent').html(html);
    pusers = [];
    ausers = [];
    getProjectUsers();
    getProjectAdmins();
    getProjectItems();
    if(projects[project].isAdmin) {
        getProjectRequestors();
        $('#requestors').attr("style", "height:300px;");
    }
    else {
        $('#requestors').attr("style", "height:300px; width:0px; display: none;");
		$('#requestors').attr("class", "");
		$('#projcontent').removeClass("w3-quarter").addClass("w3-third");
		$('#pusers').removeClass("w3-quarter").addClass("w3-third");
		$('#admins').removeClass("w3-quarter").addClass("w3-third");
    }
    $('#items').attr("style", "height:500px; width:100%; overflow-y: scroll;");
    navClose();
}

/**
 * Funnkcja przekierowująca do strony, gdzie użytkownik utworzy nowy element pracy
 */
function newWorkItem() {
    localStorage.setItem("project", project);
    localStorage.setItem("projectid", projects[project].id);
    localStorage.setItem("users", JSON.stringify(pusers));
    localStorage.setItem("itemAction", "new");
    $(location).attr('href', 'item.html');
}

/**
 * Funkcja pobierająca projekty
 */
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
            403: function (response) {
                $('#projects').html("could not retrieve list of projects");
            },
            401: function (response) {
                localStorage.clear();
                localStorage.setItem("error", response.status + ": " + response.responseText);
                $(location).attr("href", "index.html");
            }
        }, success: function () {
        },
        error: function(xhr, status, error) {
            handleError(xhr, status, error, "projects");
        }
    });
}

/**
 * Funkcja tworząca projekt
 */
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
                $('#projectLoading').html("Error:" + response);
            },
            409: function (response) {
                $('#projectLoading').attr('class', 'w3-red w3-center');
                $("#projectLoading").attr("style", "font-size:16px");
                $('#projectLoading').html("Such project already exists. Choose another name");
            },
            401: function (response) {
                localStorage.clear();
                localStorage.setItem("error", response.status + ": " + response.responseText);
                $(location).attr("href", "index.html");
            }
        }, success: function () {
        },
        error: function(xhr, status, error) {
            handleError(xhr, status, error, "projectLoading");
        }
    });
}

/**
 * Funkcja wyświetlająca opis projektu przy proszeniu o dostęp
 * @param {int} id identyfikator projektu
 */
function showDesc(id) {
    var divid = "Desc" + id;
    var x = document.getElementById(divid);
    if (x.className.indexOf("w3-show") == -1) {
        x.className += " w3-show";
    } else {
        x.className = x.className.replace(" w3-show", "");
    }
}

/**
 * Funkcja wysyłająca prośbę o dostęp do projektu
 * @param {int} id identifikator projektu
 * @param {int} idx identyfikator przycisku
 */
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
            401: function (response) {
                localStorage.clear();
                localStorage.setItem("error", response.status + ": " + response.responseText);
                $(location).attr("href", "index.html");
            }
        }, success: function () {
        },
        error: function(xhr, status, error) {
            handleError(xhr, status, error, "requestMessage");
        }
    });
}

/**
 * Funkcja pobierająca projekty, o dostęp do których użytkownik może prosić
 */
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
                html = "<div id='prReq'>";
                var searchInput = '<input class="w3-input w3-padding" type="text" placeholder="Search.." id="SearchReq" onkeyup="filterProjectsRequests()">'
                for(var i = 0; i < response.length; i++) {
                    html += '<button class="w3-btn w3-bar-item w3-bar-block w3-card w3-light-grey" style="width:100%" onclick=showDesc(' + i +')>' + response[i].title + "</button>";
                    html += '<div id="Desc' + i + '" class="w3-container w3-row w3-hide"><div class="w3-threequarter">\
                                <p>' + response[i].description + '</p>\
                            </div><div id="reqbtn' + i + '" class="w3-btn w3-padding-16 w3-quarter w3-green" onclick="requestAccessToProject(' + response[i].id + ',' + i + ')">Request Access</div></div>';
                }
                $('#projectsToRequest').html(searchInput + html + '</div>');
                $('#projectsToRequest').attr("style", "max-height:500px; overflow-y:scroll;");
            },
            403: function (response) {
                $('#requestMessage').attr('class', 'w3-red w3-center');
                $("#requestMessage").attr("style", "font-size:16px");
                $('#requestMessage').html("Error error:" + response);
            },
            401: function (response) {
                localStorage.clear();
                localStorage.setItem("error", response.status + ": " + response.responseText);
                $(location).attr("href", "index.html");
            }
        }, success: function () {
        },
        error: function(xhr, status, error) {
            handleError(xhr, status, error, "requestMessage");
        }
    });
}

/**
 * Funkcja dodająca nowe elementy pracy
 */
function addNewItem() {
    var projectid = document.forms["newItemForm"]["projectid"].value;
    var itemName = document.forms["newItemForm"]["itemName"].value;
    var owner = document.forms["newItemForm"]["owner"].value;
    var approver = document.forms["newItemForm"]["approver"].value;
    var type = document.forms["newItemForm"]["itemType"].value;
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
            401: function (response) {
                localStorage.clear();
                localStorage.setItem("error", response.status + ": " + response.responseText);
                $(location).attr("href", "index.html");
            }
        }, success: function () {
        },
        error: function(xhr, status, error) {
            //handleError(xhr, status, error, "requestMessage");
        }
    });
}

/**
 * Funkcja odblokowująca możliwość edycji elementu pracy
 */
function enableEditing() {
    $("#editbtn").attr('style', 'display: none');
    $("#itemTitle").prop('disabled', false);
    $("#textDesc").prop('disabled', false);
    $("#savebtn").prop('disabled', false);
    $("#owner").prop('disabled', false);
    $("#approver").prop('disabled', false);
    $("#itemType").prop('disabled', false);
    $("#itemStatus").prop('disabled', false);
    $("#savebtn").attr("onclick", "updateItem()");
    $("#delbtn").attr("class", "w3-btn w3-red w3-padding w3-right w3-margin-top");
    $("#newcomment").attr("class", "");
    $("#newcomment").attr("style", "height: 250px;");
}

/**
 * Funkcja pobierająca komentarze do zadanego elementu pracy
 * @param {int} id identyfikator elementu pracy
 */
function getComments(id) {
    $.ajax({
        url: server + "/items/" + id + "/comments",
        type: "GET",
        headers: {
            'Authorization':token
        },
        statusCode: {
            200: function (response) {
                html = "";
                for(var i = 0; i < response.length; i++) {
                    var d = new Date(response[i].created);
                    var datestring = d.getFullYear() + "-" + (d.getMonth()+1) + "-" + d.getDate() + " " +
                    d.getHours() + ":" + d.getMinutes() + ":" + d.getSeconds();
                    html += "<div id='cmt" + i + "' class='w3-sand'>\
                    <div class='w3-row w3-border w3-border-teal'><div class='w3-quarter'><div class='w3-padding w3-margin-left w3-border-bottom w3-border-right w3-border-teal w3-sand'>" + response[i].user.login + "</div>\
                    <div class='w3-padding w3-margin-left w3-border-right w3-border-teal'>" + datestring + "</div></div>\
                    <div class='w3-threequarter w3-sand w3-padding'>" + response[i].content + "</div></div></div>";
                    
                }
                $('#comments').html(html);
            },
            403: function (response) {
                $('#requestMessage').attr('class', 'w3-red w3-center');
                $("#requestMessage").attr("style", "font-size:16px");
                $('#requestMessage').html("Error error:" + response);
            },
            401: function (response) {
                localStorage.clear();
                localStorage.setItem("error", response.status + ": " + response.responseText);
                $(location).attr("href", "index.html");
            }
        }, success: function () {
        },
        error: function(xhr, status, error) {
            handleError(xhr, status, error, "requestMessage");
        }
    });
}

/**
 * Funkca aktualizująca element pracy
 */
function updateItem() {
    $("#savebtn").prop('disabled', true);
    $("#delbtn").prop('disabled', true);
    var projectid = document.forms["newItemForm"]["projectid"].value;
    var itemid = document.forms["newItemForm"]["itemid"].value;
    var itemName = document.forms["newItemForm"]["itemName"].value;
    var owner = document.forms["newItemForm"]["owner"].value;
    var approver = document.forms["newItemForm"]["approver"].value;
    var type = document.forms["newItemForm"]["itemType"].value;
    var status = document.forms["newItemForm"]["itemStatus"].value;
    var resolutiondate = null;
    var datestring = null;
    if(status == 3) {
        var d = new Date();
        var datestring = d.getFullYear() + "-" + (d.getMonth()+1) + "-" + d.getDate() + " " +
            d.getHours() + ":" + d.getMinutes() + ":" + d.getSeconds();
            $("#resolved").val(datestring);
    }
    var created = document.forms["newItemForm"]["created"].value;
    var description = document.forms["newItemForm"]["description"].value;

    $.ajax({
        url: server + "/items/" + itemid,
        type: "PUT",
        headers: {
            'Authorization':token
        },
        data: JSON.stringify({"projectid": projectid, "title": itemName, "owner": owner, "approver": approver, 
                              "itemtype": type, "itemstatus": status, "creationdate": created, "description": description, "resolutiondate": datestring}),
        contentType: "application/json",
        statusCode: {
            200: function (response) {
                $(location).attr('href', 'home.html')
            },
            403: function (response) {
                $("#reqBtn"+idx).attr('class', 'w3-btn w3-padding-16 w3-red w3-center');
                $("#reqBtn"+idx).html("An error occured.");
                $('#requestMessage').html("Error error:" + response);
            },
            401: function (response) {
                localStorage.clear();
                localStorage.setItem("error", response.status + ": " + response.responseText);
                $(location).attr("href", "index.html");
            }
        }, success: function () {
        },
        error: function(xhr, status, error) {
            //handleError(xhr, status, error, "requestMessage");
        }
    });
}

/**
 * Funkcja usuwająca element pracy
 */
function deleteItem() {
    var itemid = document.forms["newItemForm"]["itemid"].value;
    console.log(itemid);
    $.ajax({
        url: server + "/items/" + itemid,
        headers: {
            'Authorization': token,
        },
        type: "DELETE",
        success: function (){
            $(location).attr("href", "home.html");
        }
    });
}

/**
 * Funkcja dodająca komentarz
 */
function addComment() {
    var itemid = document.forms["newItemForm"]["itemid"].value;
    var txt = $("#textcmt").val();
    var d = new Date();
    var datestring = d.getFullYear() + "-" + (d.getMonth()+1) + "-" + d.getDate() + " " +
    d.getHours() + ":" + d.getMinutes() + ":" + d.getSeconds();
    $.ajax({
        url: server + "/items/" + itemid + "/comments",
        type: "POST",
        headers: {
            'Authorization':token
        },
        data: JSON.stringify({"content": txt, "created": datestring}),
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
            401: function (response) {
                localStorage.clear();
                localStorage.setItem("error", response.status + ": " + response.responseText);
                $(location).attr("href", "index.html");
            }
        }, success: function () {
        },
        error: function(xhr, status, error) {
            //handleError(xhr, status, error, "requestMessage");
        }
    });
}