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
let RADIUS = 1000; // Measured in meters
let interests = ["bank", "park"];
let destinations = [];

/**
 * Initializes the webpage with a map and a random location.
 * Sets up Directions services and loads recommendations
 * based on user interests.
 */
function initialize() {
  // Modified version of Justine's implementation
  var directionsService = new google.maps.DirectionsService();
  var directionsRenderer = new google.maps.DirectionsRenderer();
  var start = new google.maps.LatLng(37.7699298, -122.4469157);
  var end = new google.maps.LatLng(37.7683909618184, -122.51089453697205);
  destinations.push(start);
  destinations.push(end);
  var mapOptions = {
    zoom: 14,
    center: start
  }
  map = new google.maps.Map(document.getElementById('map'), mapOptions);
  directionsRenderer.setMap(map);
  document.getElementById("route").addEventListener("click", () =>
    calcRoute(directionsService, directionsRenderer, start, end)
  );
  placesService = new google.maps.places.PlacesService(map);
  loadRecommendations();
}

/* Creates a route between two points and loads onto map. */
function calcRoute(directionsService, directionsRenderer, start, end) {
  var request = {
      origin:  start,
      destination: end,
      travelMode: 'DRIVING'
  };
  directionsService.route(request, function(response, status) {
    if (status == 'OK') {
      directionsRenderer.setDirections(response);
    } else {
      window.alert("Could not calculate route due to: " + status);
    }
  });
}

/**
 * Go through a user's interests and find places
 * fitting the interests with the textSearch method.
 */
function loadRecommendations() {
  interests.forEach(placeType => {
      console.log(placeType);
      destinations.forEach((destination) => {
        let request = {
          location: destination,
          radius: RADIUS,
          query: placeType
        };
        placesService.textSearch(request, addRecommendations);
      });
  });
}

/**
 * Checks the response from PlacesService and creates markers
 * on the locations found from the request. Temporarily limit
 * the amount of markers added.
 * TODO: Load all results, but have a list that limits the results
 * shown rather than limiting the results being loaded.
 * @param {PlaceResults[] results} places found with PlaceResult type.
 * @param {PlacesServiceStatus status} status of PlacesService request.
 */
function addRecommendations(results, status) {
  if (status == google.maps.places.PlacesServiceStatus.OK) {
    let maxRecommendations = 3;
    let numRecommendations = 0;
    for (let i = 0; i < results.length; i++) {
      console.log(results[i].formatted_address);
      placeMarker(results[i]);
      numRecommendations++;
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
