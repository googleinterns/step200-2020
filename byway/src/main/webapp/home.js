if(!!window.performance && window.performance.navigation.type == 2)
{
    window.location.reload();
}

if (document.readyState === 'loading') {  // Loading hasn't finished yet
  document.addEventListener('DOMContentLoaded', initializeHomePage)
} 
else{
  initializeHomePage();
}

function initializeHomePage(){
  setLogoutLink();
  createPastTrip();
  document.getElementById('create-trip').addEventListener('click', () => {
    fetch('/api/createtrip', {method: 'POST'}).then((response) => response.json()).then((trip) =>{
      window.location.href = configureTripKeyForNextPage(trip.keyString, '/destinations.html') 
    });
  });
}

function createPastTrip(){
  fetch('/api/gettrips').then((response) => response.json()).then((tripIds) => {
    tripIds.forEach(trip => {
      let container = document.getElementById("past-trips-container");
      let pastTrip = document.createElement('div');
      pastTrip.className = "past-trip";
      let title = document.createElement('a');
      let isDestinationsMissing = trip.destinations.length == 0;
      let isInterestsMissing = trip.interests.length == 0;
      if(isDestinationsMissing|| isInterestsMissing) { //TODO: check if interests or route is empty too
        title.innerText = "Trip In-Progress";
        let info =  document.createElement('p');
        if (isDestinationsMissing && isInterestsMissing){
          info.innerText = "Destinations and Interests missing";
          title.href = configureTripKeyForNextPage(trip.keyString, '/destinations.html') 
        }
        else if (isDestinationsMissing && !isInterestsMissing){
          info.innerText = "Destinations missing";
          title.href = configureTripKeyForNextPage(trip.keyString, '/destinations.html') 
        }
        else {
          title.innerText = trip.destinations
          info.innerText = "Interests missing";
          title.href = configureTripKeyForNextPage(trip.keyString, 'interests.html') 
        }
        pastTrip.append(title);
        pastTrip.append(info);
        container.append(pastTrip);
      } 
      else{
        title.innerText = trip.destinations
        title.href = configureTripKeyForNextPage(trip.keyString, '/routepage.html') 
        pastTrip.append(title);
        let map = document.createElement('div');
        map.className = 'map';
        map.id = "map-" + trip.keyString;
        pastTrip.append(map);
        container.append(pastTrip);
        initMap(trip.start, trip.start, trip.destinations, trip.keyString); 
      }
    });
  })
}

function initMap(start, end, destinations, keyString) {
  const directionsService = new google.maps.DirectionsService();
  const directionsRenderer = new google.maps.DirectionsRenderer();
  waypoints = [];
  destinations.forEach(destination => {
    waypoints.push({
        location: destination,
        stopover: true
      });
  });
  let mapOptions = {
    zoom: 14,
    center: start
  }
  const map = new google.maps.Map(document.getElementById('map-' + keyString), mapOptions);
  directionsRenderer.setMap(map);
  calcRoute(directionsService, directionsRenderer, start, end, waypoints);
}

function calcRoute(directionsService, directionsRenderer, start, end, waypoints) {
  let request = {
    origin:  start,
    destination: end,
    waypoints: waypoints,
    travelMode: 'DRIVING',
    optimizeWaypoints: true
  };
  directionsService.route(request, function(response, status) {
    if (status == 'OK') {
      directionsRenderer.setDirections(response);
    } else {
      window.alert("Could not calculate route due to: " + status);
    }
  });
}

