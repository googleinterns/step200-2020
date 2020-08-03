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
let randomLocation;
const RADIUS = 1000; // Measured in meters

/**
 * initializes the webpage with a map and loads
 * recommendations based on user interest.
 */
function initialize() {
  randomLocation = new google.maps.LatLng(33.4806, -112.1864);
  map = new google.maps.Map(document.getElementById('map'), {
      center: randomLocation,
      zoom: 15
  });
  placesService = new google.maps.places.PlacesService(map);
  loadRecommendations();
}

/**
 * Calls a Servlet to find a user's interests and
 * uses a text search to find places fitting those
 * loaded entires.
 */
function loadRecommendations() {
  fetch('/api/generator')
  .then(response => {
    // Temporary setup. Send either to login screen
    // or back to homepage to restart.
    if(response.status === 404) {
      alert("You don't seem to be logged in");
      return;
    } else {
      return response.json()
    }
  })
  .then((interests) => {
    interests.forEach(placeType => {
      console.log(placeType);
      let request = {
        location: randomLocation,
        radius: RADIUS,
        query: placeType
      }
      placesService.textSearch(request, addRecommendations);
    });
  });
}

/**
 * Checks the response from PlacesService and creates markers
 * on the locations found from the request. Temporarily limit
 * the markers added.
 * TODO: Load all results, but have a list that limits the results
 * shown rather than limiting the results being loaded.
 * @param {Array results} contains the results of the request.
 * @param {PlacesServiceStatus status} contains the service status
 * of the request.
 */
function addRecommendations(results, status) {
  if (status == google.maps.places.PlacesServiceStatus.OK) {
    let maxRecommendations = 3;
    let numRecommendations = 0;
    for (let i = 0; i < results.length; i++) {
      if(fitsInRadius(results[i], RADIUS)) {
        placeMarker(results[i]);
        numRecommendations++;
      }
      if(numRecommendations == maxRecommendations) {
        break;
      }
    }
  } else {
    alert("Status: " + status +
          "\nOur services are currently down. Oops!");
  }
}

/**
 * Determines if a result fits inside of a
 * predetermined radius range.
 * @param {PlaceResult result} contains information about the location
 * @param {int radius} specified range
 * @returns boolean
 */
function fitsInRadius(result, radius) {
  let currentLocation = result.geometry.location;
  let distanceBetweenEnds =
    google.maps.geometry.spherical.computeDistanceBetween(currentLocation, randomLocation);
  return distanceBetweenEnds < radius;
}

/**
 * Places a marker onto the map at the specified location.
 * @param {Request place} holds information about the found query.
 */
function placeMarker(place) {
  new google.maps.Marker({
    position: place.geometry.location,
    map: map,
    title: place.name
  });
}
