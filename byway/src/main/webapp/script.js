function setProgressBar(pageNumber){
  let ul = document.getElementById("progressbar");
  let items = ul.getElementsByTagName("li");
  for(i=0; i<pageNumber;i++){
    items[i].className = 'active';
  }
  
}