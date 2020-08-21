/* exported configureTripKeyForPath, getTripKeyFromUrl, setProgressBar */
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

/**
 * Go through url to retrieve the trip key. If the trip key is null,
 * redirects the user to the page where they can make a new trip
 * and have a valid trip key to reference.
 * @return String of trip key
 */
function getTripKeyFromUrl() {
  const tripKey = new URLSearchParams(location.search).get('tripKey');
  if(tripKey === null) {
    alert("tripKey not created! Create a new trip.");
    window.location.href = '/index.html';
    return "";
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
