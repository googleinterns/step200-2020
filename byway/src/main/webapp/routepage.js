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


// copies of recommendations and selected stops, stored as arrays
// for synchronous updating
let recs = [];
let stops = [];
let map;
let randomLocation;
let placesService;
const RADIUS = 1000; // Measured in meters

if (document.readyState === 'loading') {  // Loading hasn't finished yet
  document.addEventListener('DOMContentLoaded', load);
} else {  // `DOMContentLoaded` has already fired
  load();
}

/** Used to restore stops and recommendations upon load or refresh */
function load(){
  getRecs();
  getStops();
}

function initMap() {
  let directionsService = new google.maps.DirectionsService();
  let directionsRenderer = new google.maps.DirectionsRenderer();
  let start = new google.maps.LatLng(37.7699298, -122.4469157);
  let end = new google.maps.LatLng(37.7683909618184, -122.51089453697205);
  let mapOptions = {
    zoom: 14,
    center: start
  }
  map = new google.maps.Map(document.getElementById('map'), mapOptions);
  directionsRenderer.setMap(map);
  /** 
  document.getElementById("route").addEventListener("click", function() {
    // calcRoute(directionsService, directionsRenderer, start, end);
    loadRecommendations();
  }); */
   placesService = new google.maps.places.PlacesService(map);
  loadRecommendations();
}
// seems like it should just be called at the initial load w init()... how do we constrain this
function loadRecommendations() {
  console.log("loadrecs()");
  randomLocation = new google.maps.LatLng(33.4806, -112.1864);
  
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
  console.log("add recs");
  if (status == google.maps.places.PlacesServiceStatus.OK) {
    let maxRecommendations = 3;
    let numRecommendations = 0;
    for (let i = 0; i < results.length; i++) {
      if(fitsInRadius(results[i], 100000)) {
        console.log(results[i].name);
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

/** Displays route overtop the map */
function calcRoute(directionsService, directionsRenderer, start, end) {
  let request = {
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

/** Get the new list of stops from datastore onload */
function getStops(){
  const stopList = document.getElementById('stop-list');

  if(stopList != null){
    stopList.innerText = ""; // clear list
  }

  fetch('/api/stop')
  .then(response => response.json())
  .then((stopsResponse) => {
    stopsResponse.forEach((stop)=>{
      stops.push(stop);
      var btn = document.createElement('button');
      btn.id = stop.id;
      btn.innerText = stop.placename;
      btn.setAttribute("class", "btn rec-btn");
      btn.addEventListener("click", function() {
        deleteFromStops(stop); 
      });
     stopList.appendChild(btn);
    })
  })
}

/** Get the new list of stops locally */
function getStopsList(){
  const stopList = document.getElementById('stop-list');

  if(stopList != null){
    // clear list
    stopList.innerText = ""; 
  }

  // re-render list synchronously
  stops.forEach((stop)=>{
    var btn = document.createElement('button');
    btn.innerText = stop.placename
    btn.setAttribute("class", "btn rec-btn");
    btn.addEventListener("click", function() {
      deleteFromStops(stop); 
    });
    stopList.appendChild(btn);
  })
}

/** Add stop locally and to datastore */
function addToStops(stop){
  deleteFromRecs(stop); 

  // add to stops array locally in js
  stops.push(stop);
  getStopsList();

  // add to datastore
  const params = new URLSearchParams();
  params.append("text", stop.placename);
  params.append("action", "add");
  fetch('/api/stop', {method: 'POST', body: params});
}

/** Delete stop locally and from datastore*/
function deleteFromStops(stop){
  addToRecs(stop); 

  // delete from stops array locally in js
  stops = stops.filter(function(stopObj){
    return stopObj.placename != stop.placename;
  })
  getStopsList();

  // delete from datastore
  const params = new URLSearchParams();
  params.append("text", stop.placename);
  params.append("action", "remove");
  fetch('/api/stop', {method: 'POST', body: params});
}

/** Get the new list of recommendations from servlet onload */
function getRecs() {
  const recList = document.getElementById('rec-list');
  if(recList != null){
    recList.innerText = ""; // clear list
  }
  fetch('/api/recs')
  .then(response => response.json())
  .then((recommendations) => {
    recommendations.forEach((rec)=>{
      // populate local js array initially
      recs.push(rec);
      var btn = document.createElement('button');
      btn.id = rec.id;
      btn.innerText = rec.placename;
      btn.setAttribute("class", "btn rec-btn");
      btn.addEventListener("click", function() {
        addToStops(rec); 
      });
     recList.appendChild(btn);
    })
  })
}

/** Get the new list of recommendations locally */
function getRecsList(){
  const recsList = document.getElementById('rec-list');
  recsList.innerText = ""; // clear list
  // re-render list synchronously
  recs.forEach((rec)=>{
    var btn = document.createElement('button');
    btn.innerText = rec.placename
    btn.setAttribute("class", "btn rec-btn");
    btn.addEventListener("click", function() {
      addToStops(rec);
    });
    recsList.appendChild(btn);
  })
}

/** Add recommendation locally*/
function addToRecs(rec){
  recs.push(rec);
  getRecsList();
  const params = new URLSearchParams();
  params.append("text", rec.placename);
}

/** Delete recommendation locally */
function deleteFromRecs(rec){
  recs = recs.filter(function(r){
    return r.placename != rec.placename;
  })
  getRecsList();
}

/* exported initMap*/
/* global google */