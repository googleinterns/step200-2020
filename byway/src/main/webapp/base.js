/* exported setProgressBar */
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

