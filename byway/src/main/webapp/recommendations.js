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

/**
 * Initializes the webpage with a map and random location
 */
function initialize() {
  randomLocation = new google.maps.LatLng(33.4806, -112.1864);
  map = new google.maps.Map(document.getElementById('map'), {
      center: randomLocation,
      zoom: 15
  });
  //placesService = new google.maps.places.PlacesService(map);
}