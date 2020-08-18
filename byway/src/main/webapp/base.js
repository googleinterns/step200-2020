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
 * Go through url to retrieve the trip id.
 * @returns String of trip ID
 */
function getTripIdFromUrl() {
  return new URLSearchParams(location.search).get('tripId');
}

/**
 * Sets the trip Id passed in to the next page, specified
 * by the nextPagePath. If the trip Id is null, redirects the
 * user to the page where they can make a new trip and have
 * a valid trip Id to reference.
 * Note: Requires an element in the document with id "next-button"
 * with an href attribute, e.g. an 'a' tag.
 * @param {String} tripId unique value for a trip
 * @param {String} nextPagePath HTTP path for next page
 */
function configureTripIdForNextPage(tripId, nextPagePath) {
  if(tripId === null) {
    // Send back to page where a trip can be made
    alert("tripId not created! Create a new trip.");
    window.location.href = '/index.html';
  } else {
    let nextPage = document.getElementById("next-button");
    nextPage.href = nextPagePath + "?" + new URLSearchParams({tripId}).toString();
  }
}
