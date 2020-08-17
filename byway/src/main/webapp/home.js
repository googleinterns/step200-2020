if (document.readyState === 'loading') {  // Loading hasn't finished yet
  document.addEventListener('DOMContentLoaded', initializeHomePage)
} 
else{
  initializeHomePage();
}

function initializeHomePage(){
  fetch('/api/gettrips');
  document.getElementById('create-trip').addEventListener('click', () => {
    fetch('/api/createtrip', {method: 'POST'}).then((response) => response.json()).then((trip) =>{
      window.location.href = '/destinations.html?tripKey=' + trip.keyString;  
    });
  });
}
