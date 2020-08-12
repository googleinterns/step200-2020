window.onload = function(){
  fetch('/api/gettrips');
  document.getElementById('create-trip').addEventListener('click', () => {
    fetch('/api/createtrip', {method: 'POST'}).then((response) => response.json()).then((tripKey) =>{
      window.location.href = '/destinations.html?tripKey=' + tripKey;  
    });
  });
}