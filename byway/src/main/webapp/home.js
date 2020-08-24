/* global google, configureTripKeyForPath, setLogoutLink*/
/* exported placesService*/

let placesService;

// Reloads page if naviated to via back button
if(!!window.performance && window.performance.navigation.type == PerformanceNavigation.TYPE_BACK_FORWARD)
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
  setupLogoutLink();
  createPastTrip();
  document.getElementById('create-trip').addEventListener('click', () => {
    fetch('/api/createtrip', {method: 'POST'}).then((response) => response.json()).then((trip) =>{
      let tripKey = trip.keyString;
      window.location.href = configureTripKeyForPath(tripKey, "/destinations.html");
    });
  });
}

function createPastTrip(){
  fetch('/api/gettrips').then((response) => response.json()).then((tripIds) => {
    let tripNum = 1;
    tripIds.forEach(trip => {
      let isDestinationsMissing = trip.destinations.length == 0;
      let isInterestsMissing = trip.interests.length == 0;
      if(isDestinationsMissing|| isInterestsMissing) { 
        showIncompleteTrip(tripNum, trip, isDestinationsMissing, isInterestsMissing);
      } 
      else{
        showCompleteTrip(tripNum, trip)
      }
      tripNum++;
    });
  })
}

function showIncompleteTrip(tripNum, trip, isDestinationsMissing, isInterestsMissing){
  let container = document.getElementById("past-trips-container");
  let pastTrip = document.createElement('div');
  pastTrip.className = "past-trip";
  let title = document.createElement('a');
  pastTrip.append(title);
  title.innerText = "Trip #" + tripNum + ": In-Progress";
  let info =  document.createElement('p');
  if (isDestinationsMissing && isInterestsMissing){
    info.innerText = "Destinations and Interests missing";
    title.href = configureTripKeyForPath(trip.keyString, "/destinations.html")
  }
  else if (isDestinationsMissing && !isInterestsMissing){
    info.innerText = "Destinations missing";
    title.href = configureTripKeyForPath(trip.keyString, "/destinations.html")
  }
  else {
    info.innerText = "Interests missing";
    title.href = configureTripKeyForPath(trip.keyString, "/interests.html")
  }
  pastTrip.append(info);
  container.append(pastTrip);
}

function showCompleteTrip(tripNum, trip){
  let container = document.getElementById("past-trips-container");
  let pastTrip = document.createElement('div');
  pastTrip.className = "past-trip";
  let title = document.createElement('a');
  pastTrip.append(title);
  let mapContainer = document.createElement('div');
  mapContainer.className = 'map';
  mapContainer.id = "map-" + trip.keyString
  pastTrip.append(mapContainer);
  container.append(pastTrip);
  initMap(trip.start, trip.start, trip.route, trip.keyString);
  title.innerText = "Trip #" + tripNum;
  title.href = configureTripKeyForPath(trip.keyString, "/routepage.html");
}

function initMap(start, end, route, keyString) {
  const directionsService = new google.maps.DirectionsService();
  const directionsRenderer = new google.maps.DirectionsRenderer();
  let waypoints = [];
  route.forEach(destination => {
    waypoints.push({
        location: {placeId: destination },
        stopover: true
      });
  });
  let mapOptions = {
    zoom: 14,
    center: start
  }
  const tripMap = new google.maps.Map(document.getElementById('map-' + keyString), mapOptions);
  placesService = new google.maps.places.PlacesService(tripMap);
  directionsRenderer.setMap(tripMap);
  calcRoute(directionsService, directionsRenderer, start, end, waypoints);
}

function calcRoute(directionsService, directionsRenderer, start, end, waypoints) {
  let request = {
    origin:  {placeId : start},
    destination: {placeId : end},
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

