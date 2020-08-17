window.onload = function(){ 
  fetch("/api/login").then(response => response.json()).then((login) =>{
  if (login.isLoggedIn) {
    let loginLink = document.createElement("a");
    loginLink.id = "login-button";
    loginLink.href = "/home.html";
    loginLink.innerText = "GO TO MY TRIPS";
    let container = document.getElementById("login-link");
    container.append(loginLink);
  }
  else{
    let loginLink = document.createElement("a");
    loginLink.id = "login-button";
    loginLink.href = login.url;
    loginLink.innerText = "LOGIN";
    let container = document.getElementById("login-link");
    container.href = login.url;
    container.append(loginLink);
  }
  });
}