/* exported setProgressBar, getTripIdFromUrl, configureTripIdForNextPage */
/** 
* Sets Progress Bar to correct location based on the page number
* @param {int} pageNumber
*/
function setProgressBar(pageNumber){
  let ul = document.getElementById("progressbar");
  let items = ul.getElementsByTagName("li");
  for(let i=0; i < pageNumber;i++){
    items[i].className = 'active';
  }
}

function setLogoutLink(){
    fetch("/api/login").then(response => response.json()).then((login) =>{
    if (login.isLoggedIn) {
      let logoutLink = document.createElement("a");
      logoutLink.id = "logout-button";
      logoutLink.href = login.url;
      logoutLink.innerText = "LOGOUT";
      let container = document.getElementById("logout-link");
      container.append(logoutLink);
    }
  });
}

/**
 * Go through url to retrieve the trip key.
 * @return String of trip key
 */
function getTripKeyFromUrl() {
  return new URLSearchParams(location.search).get('tripKey');
}

/**
 * Sets the trip key passed in to the next page, specified
 * by the nextPagePath. If the trip key is null, redirects the
 * user to the page where they can make a new trip and have
 * a valid trip key to reference.
 * Note: Requires an element in the document with id "next-button"
 * with an href attribute, e.g. an 'a' tag.
 * @param {String} tripKey unique value for a trip
 * @param {String} nextPagePath HTTP path for next page
 */
function configureTripKeyForNextPage(tripKey, nextPagePath) {
  if(tripKey === null) {
    // Send back to page where a trip can be made
    alert("tripKey not created! Create a new trip.");
    window.location.href = '/index.html';
  } else {
    return nextPagePath + "?" + new URLSearchParams({tripKey}).toString();
  }
}