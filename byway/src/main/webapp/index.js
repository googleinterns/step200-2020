window.onload = function(){ 
  fetch("/login").then(response => response.json()).then((login) =>{
  if (status == false) {
    let loginLink= document.createElement("a");
    loginLink.id = "login-button";
    loginLink.href = login.url;
    loginLink.innerText= "LOGIN";
    let container = document.getElementById("login-link");
    container.href = login.url;
    container.append(loginLink);
  }
  else{
    window.location.href = "/destinations.html";
  }
  });
}