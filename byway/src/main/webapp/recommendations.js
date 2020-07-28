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

let map;
let service;
let randomLocation;
let RADIUS = 1000;

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
  service = new google.maps.places.PlacesService(map);
  loadRecommendations();
}

/**
 * Calls a Servlet to find a user's interests and
 * uses a text search to find places fitting those
 * loaded entires.
 */
function loadRecommendations() {
  fetch('/api/generator')
  .then(response => response.json())
  .then((interests) => {
    interests.forEach(placeType => {
      console.log(placeType);
      let request = {
        location: randomLocation,
        radius: RADIUS,
        query: placeType
      }
      service.textSearch(request, callback);
    });
  });
}

/**
 * Checks the response from PlacesService and creates markers
 * on the locations found from the request.
 * @param {Array results} contains the results of the request.
 * @param {PlacesServiceStatus status} contains the service status
 * of the request.
 */
function callback(results, status) {
  if (status == google.maps.places.PlacesServiceStatus.OK) {
    let length = maxLength(results.length);
    let markerCounter = 0;
    for (let i = 0; i < results.length; i++) {
      if(fitsInRadius(results[i], RADIUS)) {
        createMarker(results[i]);
        markerCounter++;
      }
      if(markerCounter > length) {
        break;
      }
    }
  } else {
    alert("Our services are currently down. Oops!");
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
 * Finds an integer length by comparing the passed-in length
 * of an array with a recommended length, 3, and limits the
 * length returned.
 * @param {int resultsLength} length of an Array
 * @returns integer value
 */
function maxLength(resultsLength) {
  if(resultsLength > 3) {
    return 3;
  } else {
    return resultsLength;
  }
}

/**
 * Places a marker onto the map at the specified location.
 * @param {Request place} holds information about the found query.
 */
function createMarker(place) {
  var marker = new google.maps.Marker({
    position: place.geometry.location,
    map: map,
    title: place.name
  });
}
