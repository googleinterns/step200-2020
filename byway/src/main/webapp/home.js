let placesService;

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
      let tripKey = trip.keyString
      window.location.href = configureTripKeyForPath(tripKey, "destinations.html") 
    });
  });
}

function createPastTrip(){
  fetch('/api/gettrips').then((response) => response.json()).then((tripIds) => {
    let tripNum = 1;
    tripIds.forEach(trip => {
      let container = document.getElementById("past-trips-container");
      let pastTrip = document.createElement('div');
      pastTrip.className = "past-trip";
      let title = document.createElement('a');
      pastTrip.append(title);
      let isDestinationsMissing = trip.destinations.length == 0;
      let isInterestsMissing = trip.interests.length == 0;
      let tripKey = trip.keyString;
      if(isDestinationsMissing|| isInterestsMissing) { //TODO: check if interests or route is empty too
        title.innerText = "Trip #" + tripNum + ": In-Progress";
        let info =  document.createElement('p');
        if (isDestinationsMissing && isInterestsMissing){
          info.innerText = "Destinations and Interests missing";
          title.href = configureTripKeyForPath(tripKey, "destinations.html")
        }
        else if (isDestinationsMissing && !isInterestsMissing){
          info.innerText = "Destinations missing";
          title.href = configureTripKeyForPath(tripKey, "destinations.html")
        }
        else {
          title.innerText = trip.destinations
          info.innerText = "Interests missing";
          title.href = configureTripKeyForPath(tripKey, "interests.html")
        }
        pastTrip.append(info);
        container.append(pastTrip);
      } 
      else{
        let mapContainer = document.createElement('div');
        mapContainer.className = 'map';
        mapContainer.id = "map-" + trip.keyString;
        pastTrip.append(mapContainer);
        container.append(pastTrip);
        initMap(trip.start, trip.start, trip.destinations, trip.keyString);
        title.innerText = "Trip #" + tripNum;
        title.href = configureTripKeyForPath(tripKey, "routepage.html")
      }
      tripNum++;
    });
  })
}

function initMap(start, end, destinations, keyString) {
  const directionsService = new google.maps.DirectionsService();
  const directionsRenderer = new google.maps.DirectionsRenderer();
  waypoints = [];
  destinations.forEach(destination => {
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

