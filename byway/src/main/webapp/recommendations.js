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

/* global destinations, directionsRenderer, directionsService, end,
    google, map, orderWaypoints, renderRecsList, route, start, updateDistanceTime */
/* exported calcMainRoute, recs */

if(document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', initServices);
} else {
  initServices();
}

// Holds recommendations as PlaceResult objects
let recs = [];

let placesService;

// Measured in meters
const RADIUS_TO_SEARCH_AROUND = 1000;
const MIN_DISTANCE_FOR_STEP_PATH = 4000;

const interests = ["park"];

// Contains google.maps.LatLng objects.
// Used as a center point to search around a region.
let regions = [];

/* Initializes the webpage with a google PlacesService instance. */
function initServices() {
  placesService = new google.maps.places.PlacesService(map);
}

/**
 * Creates a route between two points and loads onto the map.
 * Finds points along the path to load the regions Array.
 * Loads recommendations centered around these points.
 */
function calcMainRoute() {
  resetUserAlerts();
  const request = {
    origin:  start.name,
    destination: end.name,
    travelMode: 'DRIVING',
    waypoints:  route.map(waypoint => ({location: waypoint.geometry.location})),
    optimizeWaypoints: true
  };
  addMainStopsToRegions();
  directionsService.route(request, function(result, status) {
    if (status == 'OK') {
      directionsRenderer.setDirections(result);
      findRegions(result);
      loadRecommendations();
      orderWaypoints(result);
      updateDistanceTime(result);
    } else {
      alert("Could not calculate route due to: " + status);
    }
  });
}

/* Saves the LatLng coords of the start point and destinations to regions array. */
function addMainStopsToRegions() {
  regions.push(start.geometry.location);
  for (let destination of destinations) {
    regions.push(destination.geometry.location);
  }
}

/* Resets the alerts found in a previous attempt to load recommendations. */
function resetUserAlerts() {
  let msgContainer = document.getElementById("message-container");
  msgContainer.style.visibility = 'hidden';
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
  for(let leg of myRoute.legs) {
    for(let step of leg.steps) {
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
  let statuses = [];
  for(let interest of interests) {
    for(let region of regions) {
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
  if(statuses.length !== 0) alertUser(statuses);
  renderRecsList();
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
 * @param {Array} statuses String elements with status codes from placesService
 */
function alertUser(statuses) {
  let msgContainer = document.getElementById("message-container");
  msgContainer.style.visibility = 'visible';
  const allStatuses = formatStatusMessages(statuses);
  msgContainer.innerText = "Showing limited results due to: " + allStatuses;
}

/**
 * Go through status messages and add punctuation to make a sentence.
 * @param {Array} statuses String elements with status codes from placesService
 * @return String with punctuation as it lists all status codes.
 */
function formatStatusMessages(statuses) {
  if(statuses.length < 1) return "";
  let statusMsg = "";
  for(let i = 0; i < statuses.length - 1; i++) {
    statusMsg += statuses[i] + ", ";
  }
  statusMsg += statuses[statuses.length - 1] + ".";
  return statusMsg;
}

/**
 * Places markers on the locations found from textSearch.
 * Temporarily limit the amount of suggestions. Keep track of
 * places found from interests around a location with savePlacesFromInterests function.
 * TODO: Store more results and limit on UI with option to "show more"
 * @param {TextSearchRequest} request with unique location and interest
 * @param {PlaceResults[]} placesFound places found with PlaceResult type.
 */
function addRecommendations(request, placesFound) {
  const MAX_RECOMMENDATIONS = 1;
  let placesLoaded = [];
  for(let place of placesFound) {
    placeMarker(place);
    recs.push(place);
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
