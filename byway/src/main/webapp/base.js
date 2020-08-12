/* exported setProgressBar, getTripFromUrl */
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
 * Parse url to retrieve the trip id and load the next page with it.
 * @returns String of trip ID
 */
function getTripIdFromUrl() {
  return new URLSearchParams(location.search).get('tripId');
}
