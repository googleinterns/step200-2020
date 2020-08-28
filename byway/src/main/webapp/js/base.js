/** Script that contains functions shared and used across all pages */

/* exported configureTripKeyForPath, getTripKeyFromUrl, setProgressBar, setupLogoutLink, findPlace */

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
  let tripKey = getTripKeyFromUrl();
  document.getElementById('choose-destinations-progress-bar').href = configureTripKeyForPath(tripKey, '/destinations.html');
  document.getElementById('choose-interests-progress-bar').href = configureTripKeyForPath(tripKey, '/interests.html');
  document.getElementById('view-route-progress-bar').href = configureTripKeyForPath(tripKey, '/routepage.html');
}

/** 
 * Sets up LogoutLink if user logged in
 * Sends alert and redirects to login page if user is not logged in
 */
function setupLogoutLink(){
    fetch("/api/login").then(response => response.json()).then((loginStatus) =>{
    if (loginStatus.isLoggedIn) {
      let logoutLink = document.createElement("a");
      logoutLink.id = "logout-button";
      logoutLink.href = loginStatus.url;
      logoutLink.innerText = "LOGOUT";
      let container = document.getElementById("logout-link");
      container.append(logoutLink);
    }
    else{
        alert("User not logged in! Please login.");
        window.location.href = '/index.html';    
    }
  });
}

/**
 * Go through url to retrieve the trip key. If the trip key is null,
 * redirects the user to the page where they can make a new trip
 * and have a valid trip key to reference.
 * @return String of trip key
 */
function getTripKeyFromUrl() {
  const tripKey = new URLSearchParams(location.search).get('tripKey');
  if(tripKey === null) {
    alert("Invalid Trip. Redirecting to home page.");
    window.location.href = '/index.html';
    return undefined;
  } else {
    return tripKey;
  }
}

/**
 * Uses the trip key passed in to create a modified path from
 * the path parameter.
 * @param {String} tripKey unique value for a trip
 * @param {String} path to send tripKey across
 * @return String of path with tripKey in query params
 */
function configureTripKeyForPath(tripKey, path) {
  return path + "?" + new URLSearchParams({tripKey}).toString();
}

/**
 * Uses placeId to send a request to the placesService to retrieve details like coordinates and place name
 * @param {String} placeId a textual identifier that uniquely identifies a place
 * @param {Places Service Object} placesService object that communicates with the Places API service
 * @return {Promise} result a Place Result object with fields name, geometry, id, etc.
 */
function findPlace(placeId, placesService) {
  const request = {
    placeId: placeId,
    fields: ['name', 'geometry', 'place_id', 'photos', 'formatted_address']
  }
  const result = new Promise((resolve, reject) => {
    placesService.getDetails(request, (result, status) => {
      if(status == "OK") {
        resolve(result);
      } else {
        alert("Status: " + status);
        reject(new Error("Could not retrieve place result object from request."));
      }
    })
  })

  return result;
}

