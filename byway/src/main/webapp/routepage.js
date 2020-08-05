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


// copies of recommendations and selected stops, stored as arrays for synchronous updating
let recs = [];
let stops = []; // TODO: Make set to avoid duplicates

if (document.readyState === 'loading') {  // Loading hasn't finished yet
  document.addEventListener('DOMContentLoaded', loadData);
} else {  // `DOMContentLoaded` has already fired
  loadData();
}

/** Used to restore stops and recommendations upon load or refresh */
function loadData(){
  getRecsOnload();
  getStopsOnload();
}

/** Initializes map on the page */
function initMap() {
  let directionsService = new google.maps.DirectionsService();
  let directionsRenderer = new google.maps.DirectionsRenderer();
  let start = new google.maps.LatLng(37.7699298, -122.4469157);
  let end = new google.maps.LatLng(37.7683909618184, -122.51089453697205);
  let mapOptions = {
    zoom: 14,
    center: start
  }
  let map = new google.maps.Map(document.getElementById('map'), mapOptions);
  directionsRenderer.setMap(map);
  document.getElementById("route").addEventListener("click", function() {
    calcRoute(directionsService, directionsRenderer, start, end);
  });
}

/** 
 * Displays route containing waypoints overtop the map.
 * TODO: Add in code from routeDir to change route in real-time
 * based on what's in the schedule panel
 * @param {DirectionsService} directionsService object that communicates with the GMaps API service
 * @param {DirectionsRenderer} directionsRenderer object that renders display results on the map
 * @param {String} start starting point of route
 * @param {String} end ending point of route. TODO: In the final implementation, just have 
 * start as start and end are the same
 */
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

/** Clear the stops panel in the html */
function clearStops(){
  const stopList = document.getElementById('stop-list');
  if(stopList != null){
    stopList.innerText = "";
  }
}

/** Get the new list of stops from datastore onload */
function getStopsOnload(){
  clearStops();
  fetch('/api/stop')
  .then(response => response.json())
  .then((stopsResponse) => {
    stopsResponse.forEach((stop)=>{
      stops.push(stop);
    });
    renderStopsList();
  });
}

/** Re-render stop list synchronously */
function renderStopsList(){
  clearStops();
  stops.forEach((stop)=>{
    renderStop(stop);
  })
}

/** Render stop list  
 *  @param {String} stop a String to add as a button in the schedule panel in the html
 */
function renderStop(stop){
  const stopList = document.getElementById('stop-list');
  let btn = document.createElement('button');
  btn.innerText = stop;
  btn.className =  "btn rec-btn";
  btn.addEventListener("click", function() {
    // TODO: delete from recs later for better visuals on html
    stops = stops.filter(function(stopObj){
    return stopObj != stop;
    })
    updateStops(stop);
  });
  stopList.appendChild(btn);
}

/** Add stop to or delete stop from the stoplist in javascript and in the datastore
 *  @param {String} stop a String to add or delete
 */
function updateStops(stop){
  renderStopsList();
  let stopsAsJSONString = JSON.stringify(stops);
  let params = new URLSearchParams();
  params.append("stops", stopsAsJSONString);
  fetch('/api/stop', {method: 'POST', body:params});
}

/** Clear the recommendations panel in the html */
function clearRecs(){
  const recList = document.getElementById('rec-list');
  if(recList != null){
    // clear list
    recList.innerText = "";
  }
}

/** Get the new list of recommendations from servlet onload */
function getRecsOnload() {
  clearRecs();
  fetch('/api/recs')
  .then(response => response.json())
  .then((recommendations) => {
    recommendations.forEach((rec)=>{
      recs.push(rec);
    })
    renderRecsList();
  })
}

/** Re-render recs list synchronously */
function renderRecsList(){
  clearRecs();
  recs.forEach((rec)=>{
    renderRec(rec);
  })
}

/** Render stop list  
 *  @param {String} rec a String to add as a button in the recommendations panel in the html
 */
function renderRec(rec){
  const recsList = document.getElementById('rec-list');
  let btn = document.createElement('button');
  btn.innerText = rec;
  btn.className =  "btn rec-btn";
  btn.addEventListener("click", function() {
    // TODO: add to recs later for better visuals on html
    stops.push(rec);
    updateStops(rec);
  });
  recsList.appendChild(btn);
}

/* exported initMap */
/* global google */

