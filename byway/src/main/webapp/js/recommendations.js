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

/* global destinations, google, interests, map, placesService, showErrorMessage
    renderRecsList,  start, updatePageInfo, getRecommendations */
/* global route:writeable */
/* exported areMarkersHidden, calcMainRoute, findRegions, recs, toggleRecMarkers, loadRecommendations */

// Holds recommendations as PlaceResult objects
let recs = [];

// holds markers as google.maps.Marker objects
let markers = [];

// Measured in meters
const RADIUS_TO_SEARCH_AROUND = 1000;
const MIN_DISTANCE_FOR_STEP_PATH = 4000;

// Max recommendations per interest
const MAX_RECOMMENDATIONS = 1;

// Holds regions google.maps.LatLng objects
let regions = [];

// Boolean to determine when to toggle markers
let areMarkersHidden = false;

/**
 * Creates round-trip route with waypoints that loads onto the map.
 * Partitions the route into regions, used to load recommendations
 * around. Orders the waypoints for efficiency and updates trip logistics.
 */
function calcMainRoute() {
  addMainStopsToRegions();
  getRecommendations();
  updatePageInfo();
}

/* Saves the LatLng coords of the start point and destinations to regions array. */
function addMainStopsToRegions() {
  regions.push(start.geometry.location);
  for (let destination of destinations) {
    regions.push(destination.geometry.location);
  }
}

/**
 * Goes through steps of every leg along route to find the average location
 * between a step's start and end location. Store LatLng coords in the regions Array.
 * @param {DirectionsResult} directionResult contains directions for the trip
 */
function findRegions(directionResult) {
  const myRoute = directionResult.routes[0];
  for(let leg of myRoute.legs) {
    for(let step of leg.steps) {
      if(step.distance.value > MIN_DISTANCE_FOR_STEP_PATH) {
        const avgLat = (step.start_location.lat() + step.end_location.lat()) / 2;
        const avgLng = (step.start_location.lng() + step.end_location.lng()) / 2;
        const avgLoc = {lat: avgLat, lng: avgLng};
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
 * Go through a trip's interests and regions to find relevant places
 * using textSearch from PlacesService. Prioritize finding past results
 * loaded through sessionStorage and set an intermediate timeout between calls
 * to findPlacesWithTextSearch with delayPromise to avoid hitting a query limit.
 * Alert the user of any non-OK status codes from PlacesService.
 */
async function loadRecommendations() {
  let statuses = new Set();
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
        await delayPromise(100);
        const placesFound = await findPlacesWithTextSearch(request, statuses);
        if(placesFound !== null) {
          addRecommendations(request, placesFound);
        }
      }
    }
  }
  
   // String elements with status codes from placesService into an error message
  let errorMessage =  "Showing limited results due to: " + Array.from(statuses).join() + ".";
  if(statuses.size !== 0) showErrorMessage(errorMessage);
  renderRecsList();
  document.getElementById("loading").style.visibility = 'hidden';
}

/**
 * Use the textSearch function from PlacesService to find results
 * fitting the request. Store the result through a chain of promises.
 * If the service returns a non-OK status, reject the promise and alert the user.
 * @param {TextSearchRequest} request object with location, radius and query fields.
 * @param {Set} statuses contains all non-OK statuses
 * @return {PlaceResult[]} results or null if rejected by a status from placesService.
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
 * Places markers on the locations found from textSearch.
 * Save places found from interests around a location in sessionStorage.
 * @param {TextSearchRequest} request with unique location and interest
 * @param {PlaceResults[]} placesFound places found with PlaceResult type.
 */
function addRecommendations(request, placesFound) {
  let placesLoaded = [];
  for(let place of placesFound) {
    // prevents addition of same large place which may span various coordinates
    if(!recs.some(rec => rec.place_id === place.place_id)){
      recs.push(place);
    }
    placesLoaded.push(place);
    const showMarker = (route.some(waypoint => waypoint.place_id === place.place_id)) ? false : true;
    placeRecMarker(place, showMarker);
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
 * Places a marker onto the map at the specified location. When clicked,
 * shows information about the place. When double clicked, adds as
 * a destination and calculates a new route.
 * @param {PlaceResult} place contains information about a place
 * @param {Boolean} showMarker set on map or remove
 */
function placeRecMarker(place, showMarker) {
  const canvas = (showMarker) ? map : null;
  let infoWindow = new google.maps.InfoWindow({
    content: place.name
  });
  const image = {
    url: '/images/stopsMarker.png',
    scaledSize: new google.maps.Size(40,40)
  };
  let marker = new google.maps.Marker({
    position: place.geometry.location,
    map: canvas,
    title: place.name,
    icon: image
  });
  marker.addListener("click", () => {
    infoWindow.open(map, marker);
  });
  marker.addListener("dblclick", () => {
    route.push(place);
    marker.setMap(null);
    updatePageInfo();
  });
  markers.push(marker);
}

/**
 * Iterate through all markers and hide or show based on the 
 * boolean tracking the toggle state. Only affect rec markers,
 * not ones added through directionsService. When hiding, set markers'
 * maps to null to remove. Else, set markers' map to the map object.
 * Update boolean tracking marker visibility.
 */
function toggleRecMarkers() {
  // If currently shown, then hide with null. Else, reveal on map object.
  const canvas = (areMarkersHidden) ? map : null;
  const displayStatus = (areMarkersHidden) ? 'none' : 'inline-block';
  for (let i = 0; i < markers.length; i++) {
    if (!route.some(waypoint => waypoint.geometry.location === markers[i].position)) {
      markers[i].setMap(canvas);
    }
  }
  areMarkersHidden = !areMarkersHidden;
  document.getElementById("gmaps-btn").style.display = displayStatus;
}
