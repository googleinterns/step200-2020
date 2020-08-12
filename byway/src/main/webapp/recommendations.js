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
/* global step:writable, interest:writable, region:writable, result:writable */

if(document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', initServices);
} else {
  initServices();
}

let map;
let placesService;

// Measured in meters
const RADIUS = 1000;
const MIN_DISTANCE = 4000;

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
 * @param {DirectionsService directionsService} finds directions
 * @param {DirectionsRenderer directionsRenderer} renders the route
 * @param {LatLng start} starting point location
 * @param {LatLng end} ending point location
 */
function calcRoute(directionsService, directionsRenderer, start, end) {
  const request = {
      origin:  start,
      destination: end,
      travelMode: 'DRIVING'
  };
  directionsService.route(request, function(response, status) {
    if (status == 'OK') {
      directionsRenderer.setDirections(response);
      findRegions(response);
      loadRecommendations();
    } else {
      alert("Could not calculate route due to: " + status);
    }
  });
}

/**
 * Goes through steps along route to find the average location
 * between a step's start and end location. Store these points
 * in the regions Array.
 * @param {DirectionsResult directionResult} contains directions
 * for the route made.
 */
function findRegions(directionResult) {
  const myRoute = directionResult.routes[0].legs[0];
  for(step of myRoute.steps) {
    const avgLat = (step.start_location.lat() + step.end_location.lat()) / 2;
    const avgLng = (step.start_location.lng() + step.end_location.lng()) / 2;
    const avgLoc = {lat: avgLat, lng: avgLng};
    if(step.distance.value > MIN_DISTANCE) {
      regions.push(avgLoc);
    }
  }
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
 * fitting those interests. Search around the regions
 * previously found using textSearch.
 */
async function loadRecommendations() {
  for(interest of interests) {
    for(region of regions) {
      await delayPromise(250);
      const request = {
        location: region,
        radius: RADIUS,
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
 * TODO: Store more results and limit on UI with option to "show more"
 * @param {PlaceResults[] results} places found with PlaceResult type.
 */
function addRecommendations(results) {
  const MAX_RECOMMENDATIONS = 1;
  let numRecommendations = 0;
  for (result of results) {
    placeMarker(result);
    numRecommendations++;
    if(numRecommendations == MAX_RECOMMENDATIONS) {
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
