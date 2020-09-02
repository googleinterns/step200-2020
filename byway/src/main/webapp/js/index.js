if (document.readyState === 'loading') {  // Loading hasn't finished yet
  document.addEventListener('DOMContentLoaded', initializeLoginPage)
} 
else{
  initializeLoginPage();
}

function initializeLoginPage(){ 
  fetch("/api/login").then(response => response.json()).then((login) =>{
    let loginLink = document.createElement("a");
    loginLink.id = "login-button";
    if (login.isLoggedIn) {
      loginLink.href = "/home.html";
      loginLink.innerText = "GO TO MY TRIPS";
    }
    else{
      loginLink.href = login.url;
      loginLink.innerText = "LOGIN";
    }
    let container = document.getElementById("login-link");
    container.append(loginLink);
  });
}