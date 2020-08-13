/* exported setProgressBar, getTripIdFromUrl, setTripIdFor */
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
 * Go through url to retrieve the trip id.
 * @returns String of trip ID
 */
function getTripIdFromUrl() {
  return new URLSearchParams(location.search).get('tripId');
}

/**
 * Sets the trip Id passed in to the next page, specified
 * by the filename. If the trip Id is null, redirects the
 * user to the page where they can make a new trip and have
 * a valid trip Id to reference.
 * Note: Requires an element in the document with id "next-button"
 * with an href attribute, e.g. an 'a' tag.
 */
function setTripIdFor(tripId, filename) {
  if(tripId === null) {
    // Send back to page where a trip can be made
    alert("tripId not created! Create a new trip.");
    window.location.href = '/index.html';
  } else {
    let nextPage = document.getElementById("next-button");
    nextPage.href = filename + "?" + new URLSearchParams({tripId}).toString();
  }
}
