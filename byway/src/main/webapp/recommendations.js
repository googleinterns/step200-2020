// Copyright 2019 Google LLC
//
// Licensed under the Apache License, Version 2.0 (the "License");
// you may not use this file except in compliance with the License.
// You may obtain a copy of the License at
//
//     https://www.apache.org/licenses/LICENSE-2.0
//
// Unless required by applicable law or agreed to in writing, software
// distributed under the License is distributed on an "AS IS" BASIS,
// WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
// See the License for the specific language governing permissions and
// limitations under the License.

/* global google */
/* global interest:writable, leg:writable, place:writable, region:writable, step: writable */

if(document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', initServices);
} else {
  initServices();
}

let map;
let placesService;

// Measured in meters
const RADIUS_TO_SEARCH_AROUND = 1000;
const MIN_DISTANCE_FOR_STEP_PATH = 4000;

const interests = ["park"];
let destinations = new Set();

// Contains google.maps.LatLng objects.
// Used as a center point to search around a region.
let regions = [];

/**
 * Initializes the webpage with a map and other google
 * services. Creates a route between two endpoints.
 * Note: Temp setup to mimic a route between two endpoints.
 * TODO: Link/adapt with Justine's third page, which handles
 * initializing the map and other google services.
 */
function initServices() {
  // Modified version of Justine's implementation
  let directionsService = new google.maps.DirectionsService();
  let directionsRenderer = new google.maps.DirectionsRenderer();
  const start = new google.maps.LatLng(37.7699298, -122.4469157);
  const end = new google.maps.LatLng(37.7683909618184, -122.51089453697205);
  const mapOptions = {
    zoom: 14,
    center: start
  }
  addDestinations(start, end);
  map = new google.maps.Map(document.getElementById('map'), mapOptions);
  directionsRenderer.setMap(map);
  document.getElementById("route").addEventListener("click", () => {
    calcRoute(directionsService, directionsRenderer, start, end);
  });
  placesService = new google.maps.places.PlacesService(map);
}

/**
 * Add start and end points of the route to regions to search around.
 * Temporary set up to mimic adding several endpoints between legs.
 * @param {google.maps.LatLng} start coordinate of route's startpoint
 * @param {google.maps.LatLng} end coordinate of route's endpoint
 */
function addDestinations(start, end) {
  destinations.add(start);
  destinations.add(end);
  regions.push(...destinations);
}

/**
 * Creates a route between two points and loads onto the map.
 * Finds points along the path to load the regions Array.
 * Loads recommendations centered around these points.
 * @param {DirectionsService} directionsService finds directions
 * @param {DirectionsRenderer} directionsRenderer renders the route
 * @param {LatLng} start starting point location
 * @param {LatLng} end ending point location
 */
function calcRoute(directionsService, directionsRenderer, start, end) {
  resetUserAlerts();
  const request = {
      origin:  start,
      destination: end,
      travelMode: 'DRIVING'
  };
  directionsService.route(request, function(result, status) {
    if (status == 'OK') {
      directionsRenderer.setDirections(result);
      findRegions(result);
      loadRecommendations();
    } else {
      alert("Could not calculate route due to: " + status);
    }
  });
}

/* Resets the alerts found in a previous attempt to load recommendations. */
function resetUserAlerts() {
  document.getElementById("message-container").style.visibility = 'hidden';
  document.getElementById("general-message").style.visibility = 'hidden';
  let statusesContainer = document.getElementById("statuses");
  while(statusesContainer.hasChildNodes()) {
    statusesContainer.removeChild(statusesContainer.firstChild);
  }
  statusesContainer.style.visibility = 'hidden';
}

/**
 * Goes through steps of every leg along route to find the average location
 * between a step's start and end location. Store these points
 * in the regions Array.
 * @param {DirectionsResult} directionResult contains directions
 * for the route made.
 */
function findRegions(directionResult) {
  const myRoute = directionResult.routes[0];
  for(leg of myRoute.legs) {
    for(step of leg.steps) {
      const avgLat = (step.start_location.lat() + step.end_location.lat()) / 2;
      const avgLng = (step.start_location.lng() + step.end_location.lng()) / 2;
      const avgLoc = {lat: avgLat, lng: avgLng};
      if(step.distance.value > MIN_DISTANCE_FOR_STEP_PATH) {
        regions.push(avgLoc);
      }
    }
  }
}

/**
 * Set a timeout to delay the browser.
 * @param {Number} delayMs number of milliseconds
 * @return empty promise after delayMs milliseconds passed
 */
function delayPromise(delayMs) {
  return new Promise(resolve => setTimeout(resolve, delayMs));
}

/**
 * Go through a user's interests and search for places
 * fitting those interests. Search around the regions
 * previously found using textSearch. Prioritize finding
 * past results loaded through sessionStorage to avoid calling
 * textSearch repeatedly from the PlacesService.
 */
async function loadRecommendations() {
  let statuses = new Set();
  for(interest of interests) {
    for(region of regions) {
      const request = {
        location: region,
        radius: RADIUS_TO_SEARCH_AROUND,
        query: interest
      }
      const recommendationsSaved = sessionStorage.getItem(JSON.stringify(request));
      if(recommendationsSaved !== null) {
        addRecommendations(request, JSON.parse(recommendationsSaved));
      } else{
        // Set an intermediate timeout between calls to findPlacesWithTextSearch
        // to prevent hitting the query limit from the google maps API
        await delayPromise(250);
        const placesFound = await findPlacesWithTextSearch(request, statuses);
        if(placesFound !== null) {
          addRecommendations(request, placesFound);
        }
      }
    }
  }
  alertUser(statuses);
}

/**
 * Use the textSearch function from PlacesService to find the results
 * fitting the request object passed in. Convert callback function into
 * a chain of promises to return the result directly. If the service
 * returns a status other than OK, reject the promise and alert the user.
 * @param {TextSearchRequest} request object with location, radius and query fields.
 * @return PlaceResult[] results or null if rejected by a status from placesService.
 */
function findPlacesWithTextSearch(request, statuses) {
  return new Promise((resolve, reject) => {
    placesService.textSearch(request, (result, status) => {
      if(status === "OK") {
        resolve(result);
      } else {
        reject(new Error(status));
      }
    });
  }).catch(err => {
    statuses.add(err.message);
    return null;
  });
}

/**
 * Reveals status codes if there was an issue with a request.
 * TODO: Make a class to indicate as a "warning" and make text red.
 * Also, organize on front end.
 * @param {Set} statuses String elements with status codes from placesService
 */
function alertUser(statuses) {
  document.getElementById("message-container").style.visibility = 'visible';
  document.getElementById("general-message").style.visibility = 'visible';
  let statusesContainer = document.getElementById("statuses");
  statusesContainer.style.visibility = 'visible';
  for(status of statuses) {
    let statusElement = document.createElement('ul');
    statusElement.innerText = status;
    statusesContainer.appendChild(statusElement);
  }
}

/**
 * Places markers on the locations found from textSearch.
 * Temporarily limit the amount of suggestions. Keep track of
 * places found from interests around a location with savePlacesFromInterests function.
 * TODO: Store more results and limit on UI with option to "show more"
 * @param {TextSearchRequest} request with unique location and interest
 * @param {PlaceResults[]} results places found with PlaceResult type.
 */
function addRecommendations(request, placesFound) {
  const MAX_RECOMMENDATIONS = 1;
  let placesLoaded = [];
  for (place of placesFound) {
    placeMarker(place);
    placesLoaded.push(place);
    if(placesLoaded.length == MAX_RECOMMENDATIONS) {
      break;
    }
  }
  savePlacesFromInterests(request, placesLoaded)
}

/**
 * Saves the places generated from interest and location in sessionStorage as key/value pairs.
 * @param {TextSearchRequest} request with unique location and interest
 * @param {PlaceResults[]} placesLoaded List of places related to interest
 */
function savePlacesFromInterests(request, placesLoaded) {
  sessionStorage.setItem(JSON.stringify(request), JSON.stringify(placesLoaded));
}

/**
 * Places a marker onto the map at the specified location.
 * @param {PlaceResult} place contains information about a place
 */
function placeMarker(place) {
  let infoWindow = new google.maps.InfoWindow({
    content: place.name
  });
  const image = {
    url: '/images/stopsMarker.png',
    scaledSize: new google.maps.Size(40,40)
  };
  let marker = new google.maps.Marker({
    position: place.geometry.location,
    map,
    title: place.name,
    icon: image
  });
  marker.addListener("click", () => {
    infoWindow.open(map, marker);
  });
}
