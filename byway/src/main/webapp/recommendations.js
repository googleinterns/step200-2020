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

/**
 * Loads the webpage with a map and uses
 * GeneratorServlet.java to find and show 
 * recommended locations based on servlet data.
 */
function initialize() {
  loadMap();
  fetch('/generator')
  .then(response => response.json())
  .then((interests) => {
    interests.forEach(placeType => {
      console.log(placeType);
      // let request = {
      //   location: randomLocation,
      //   radius: '500',
      //   query: placeType
      // }
      // service.textSearch(request, callback);
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
    for (let i = 0; i < results.length; i++) {
      //createMarker(results[i]);
    }
  } else {
    alert("Our services are currently down. Oops!");
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

/**
 * Creates a google.maps.Maps instance and initializes
 * global variables.
 */
function loadMap() {
  //randomLocation = new google.maps.LatLng(33.5, -112.26);

  /*map = new google.maps.Map(document.getElementById('map'), {
      center: randomLocation,
      zoom: 15
  });*/

  //service = new google.maps.places.PlacesService(map);
}
