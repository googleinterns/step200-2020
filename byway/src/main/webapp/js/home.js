
/* global google, configureTripKeyForPath, setupLogoutLink, findPlace, showErrorMessage, computeRouteForTrip*/
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

/**
 * Initiliazes users past trips and sets up logout link
 */
function initializeHomePage(){
  setupLogoutLink();
  loadPastTrip();
  document.getElementById('create-trip').addEventListener('click', () => {
    fetch('/api/createtrip', {method: 'POST'})
    .then((response) => response.json())
    .then((trip) =>{
      let tripKey = trip.keyString;
      window.location.href = configureTripKeyForPath(tripKey, "/destinations.html");
    });
  });
}

/**
 * For each of user's past trips, creates a div with either a complete trip or a trip missing some inputs
 */
function loadPastTrip(){
  fetch('/api/gettrips')
  .then((response) => response.json())
  .then((tripIds) => {
    let tripNum = 1;
    tripIds.forEach(trip => {
      let isDestinationsMissing = trip.destinations.length == 0;
      let isInterestsMissing = trip.interests.length == 0;
      if (isDestinationsMissing|| isInterestsMissing){
        showIncompleteTrip(tripNum, trip, isDestinationsMissing, isInterestsMissing);
      }
      else{
        showCompleteTrip(trip);
      }
      tripNum++;
    });
  })
}

/**
 * Creates div indicating which inputs are missing for specific trip
 * @param {Number} tripNum
 * @param {Trip} trip
 * @param {boolean} isDestinationsMissing
 * @param {boolean} isInterestsMissing
 */
function showIncompleteTrip(tripNum, trip, isDestinationsMissing, isInterestsMissing){
  let container = document.getElementById("past-trips-container");
  let pastTrip = document.createElement('div');
  pastTrip.className = "past-trip";
  let title = document.createElement('a');
  title.id = "title-" + trip.keyString;
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

/**
 * Creates a div containing a map and title for complete trip
 * @param {Number} tripNum 
 * @param {Trip} trip
 */
async function showCompleteTrip(trip){
  let container = document.getElementById("past-trips-container");
  let pastTrip = document.createElement('div');
  pastTrip.className = "past-trip";
  let title = document.createElement('a');
  title.id = "title-" + trip.keyString;
  title.innerText = "Your Trip To:"
  pastTrip.append(title);
  let mapContainer = document.createElement('div');
  mapContainer.className = 'map';
  mapContainer.id = "map-" + trip.keyString;
  pastTrip.append(mapContainer);
  container.append(pastTrip);
  initMap(trip.start, trip.start, trip.route, trip.keyString);
  let titleString = await constructTripTitle(trip, trip.keyString);
  title.innerText += titleString;
  title.href = configureTripKeyForPath(trip.keyString, "/routepage.html");
}


/**
 * Updates the title of specifice trip
 * @param {Trip} trip
 * @param {String} keyString trip's key as a string
 */
async function constructTripTitle(trip, keyString){
  let title ="";
  for(let destination of trip.destinations) {
     for(let i = 0; i<5; i++){
      try{
        let placeInfo = await findPlace(destination, placesService);
        title += placeInfo.name + "|";
        break;
      } catch(error){
        if (error.status === google.maps.DirectionsStatus.OVER_QUERY_LIMIT){
          await delayPromise(1000);  
        }
      }
    }
  }
  if (title == ""){
    showErrorMessage("Could not construct title of Trip" +keyString);
  }
  else{
    return title;
  }
}


/**
 * Initializes a map 
 * @param {String} start placeId as string
 * @param {String} end placeId as string
 * @param {ArrayList<String>} route arraylist of placeIds as strings
 * @param {String} keyString key of trip as string
 */
async function initMap(start, end, route, keyString) {
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
    center: new google.maps.LatLng(0,0)
  }
  const tripMap = new google.maps.Map(document.getElementById('map-' + keyString), mapOptions);
  placesService = new google.maps.places.PlacesService(tripMap);
  directionsRenderer.setMap(tripMap);
  await setRoute(directionsService, directionsRenderer, start, end, waypoints);
}

/**
 * Sets directions on map
 * @param {DirectionsService} directionsService
 * @param {DirectionsRenderer} directionsRenderer
 * @param {String} start placeId as string
 * @param {String} end placeId as string
 * @param {Array} [waypoints] array of waypoint objects
 */
async function setRoute(directionsService, directionsRenderer, start, end, waypoints){
  for(let i = 0; i<5; i++){
    try{
      let result = await computeRouteForTrip(directionsService, start, end, waypoints)
      directionsRenderer.setDirections(result);
      return;
    } catch(error){
      if (error.status === google.maps.DirectionsStatus.OVER_QUERY_LIMIT){
        await delayPromise(1000);
      }
    }
  }
 showErrorMessage("Could not construct route");
}

/** Function to stagger loading of past trips to prevent over query limit */
function delayPromise(delayMs) {
  return new Promise(resolve => setTimeout(resolve, delayMs));
}



 


