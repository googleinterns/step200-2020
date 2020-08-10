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

if(document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', initialize);
} else {
  initialize();
}

let map;
let placesService;

// Measured in meters
let RADIUS = 1000;
let MIN_DISTANCE = 5000;

let interests = ["park"];
let regions = [];

/**
 * Initializes the webpage with a map and a random location.
 * Sets up Directions services and loads recommendations
 * based on user interests.
 */
function initialize() {
  // Modified version of Justine's implementation
  var directionsService = new google.maps.DirectionsService();
  var directionsRenderer = new google.maps.DirectionsRenderer();
  var start = new google.maps.LatLng(33.451645, -112.063580);
  var end = new google.maps.LatLng(34.165704, -118.288232);
  var mapOptions = {
    zoom: 14,
    center: start
  }
  map = new google.maps.Map(document.getElementById('map'), mapOptions);
  directionsRenderer.setMap(map);
  document.getElementById("route").addEventListener("click", () => {
    calcRoute(directionsService, directionsRenderer, start, end);
  });
  placesService = new google.maps.places.PlacesService(map);
}

/**
 * Creates a route between two points and loads onto map.
 * Shows markers at the starting point of a step. Loads
 * recommendations centered around these points.
 * @param {DirectionsService directionsService} handles finding
 * the directions between points
 * @param {DirectionsRenderer directionsRenderer} renders the route
 * @param {LatLng start} starting point location
 * @param {LatLng end} ending point location
 */
function calcRoute(directionsService, directionsRenderer, start, end) {
  var request = {
      origin:  start,
      destination: end,
      travelMode: 'DRIVING'
  };
  directionsService.route(request, function(response, status) {
    if (status == 'OK') {
      directionsRenderer.setDirections(response);
      //computeTotalDistance(response);
      showSteps(response);
      loadRecommendations();
    } else {
      window.alert("Could not calculate route due to: " + status);
    }
  });
}

/**
 * Creates a marker at the starting point of a step
 * along the route.
 * @param {DirectionsResult directionResult} contains data
 * on directions from one step to another
 */
function showSteps(directionResult) {
  const myRoute = directionResult.routes[0].legs[0];
  for(let i = 0; i < myRoute.steps.length; i++) {
    let avgLat = (myRoute.steps[i].start_location.lat() + myRoute.steps[i].end_location.lat()) / 2;
    let avgLng = (myRoute.steps[i].start_location.lng() + myRoute.steps[i].end_location.lng()) / 2;
    let avgLoc = {lat: avgLat, lng: avgLng};
    if(myRoute.steps[i].distance.value > MIN_DISTANCE) {
      regions.push(myRoute.steps[i].start_location);
    }
  }
  console.log("size of regions: " + regions.length);
}

/**
 * Finds the travel distance along the route.
 * @param {DirectionsResult response} path of directions
 */
function computeTotalDistance(response) {
  let totalDist = 0;
  let route = response.routes[0];
  for (i = 0; i < route.legs.length; i++) {
    totalDist += route.legs[i].distance.value; // Measured in meters
  }
  totalDist = totalDist / 1000;
  console.log("total distance is: " + totalDist + " km");
}

/**
 * Set a timeout to delay the browser.
 * @param {Number delayMs} number of milliseconds
 */
function delayPromise(delayMs) {
  return new Promise(resolve => setTimeout(resolve, delayMs));
}

/**
 * Go through a user's interests and search for places
 * fitting those interests around the regions previously
 * made using textSearch.
 */
async function loadRecommendations() {
  for(interest of interests) {
    for(region of regions) {
      await delayPromise(250);
      let request = {
        location: region,
        map: map,
        query: interest
      }
      const results = await new Promise(resolve => {
        placesService.textSearch(request, (result, status) => {
          if(status == "OK") {
            resolve(result);
          } else if(status == "OVER_QUERY_LIMIT") {
            alert("Showing limited results");
          } else {
            alert("Status: " + status);
          }
        });
      });
      addRecommendations(results);
    }
  }
}

/**
 * Places markers on the locations found from textSearch.
 * Temporarily limit the amount of suggestions.
 * TODO: Load all results, but have a list that limits the results
 * shown rather than limiting the results being loaded.
 * @param {PlaceResults[] results} places found with PlaceResult type.
 */
function addRecommendations(results) {
  let maxRecommendations = 1;
  let numRecommendations = 0;
  for (let i = 0; i < results.length; i++) {
    console.log(results[i].name);
    placeMarker(results[i]);
    numRecommendations++;
    if(numRecommendations == maxRecommendations) {
      break;
    }
  }
}

/**
 * Places a marker onto the map at the specified location.
 * @param {PlaceResult place} Object containing information
 * about a place
 */
function placeMarker(place) {
  new google.maps.Marker({
    position: place.geometry.location,
    map: map,
    title: place.name
  });
}
