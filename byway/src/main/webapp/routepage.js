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

 
// copies of recommendations and selected stops, stored as sets for synchronous updating
let recs = new Set();
let stops = new Set();
 
// location representations of stops array
let waypoints = new Set();
 
// object that communicates with the GMaps API service
let directionsService;
 
// object that renders display results on the map
let directionsRenderer;
 
// TODO: get from Trip key
let start;
let end;
 
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
  directionsService = new google.maps.DirectionsService();
  directionsRenderer = new google.maps.DirectionsRenderer();
  start = "Chelsea Market";
  end = "Chelsea Market";
 
  let mapOptions = {
    zoom: 14,
    center: new google.maps.LatLng(40.730610, -73.935242) // coordinates of NYC
  }
  const map = new google.maps.Map(document.getElementById('map'), mapOptions);
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

function calcRoute() {
  let request = {
    origin:  start,
    destination: end,
    travelMode: 'DRIVING',
    waypoints: Array.from(waypoints),
    optimizeWaypoints: true
  };
  directionsService.route(request, function(response, status) {
    if (status == 'OK') {
      directionsRenderer.setDirections(response);
      computeTotalDistance(response);
    } else {
      window.alert("Could not calculate route due to: " + status);
    }
  });
}

/**
 * Calculates and sums up the distance and time duration between all destinations (legs)
 * @param {response} result response from the directions service object
 */
function computeTotalDistance(result) {
  let totalDist = 0;
  let totalTime = 0;
  // full route
  let route = result.routes[0];
  for (let i = 0; i < route.legs.length; i++) {
    // in meters
    totalDist += route.legs[i].distance.value;
    // in seconds
    totalTime += route.legs[i].duration.value;
  }

  totalDist = (totalDist / 1000).toFixed(2);
  let hours = Math.floor(totalTime / 3600);
  let minutes = Math.round((totalTime - hours*3600) / 60);
 
  document.getElementById("distance").innerText = totalDist + "km";
  document.getElementById("duration").innerText = 
    (hours == 0) ? minutes + " mins" : hours + " hr " + minutes + " mins";
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
    if(stopsResponse != null){
      stopsResponse.forEach((stop)=>{
        stops.add(stop);
        waypoints.add({location:stop});
      });
    }
    renderStopsList();
    calcRoute();
  });
}
 
/** Re-render stop list synchronously */
function renderStopsList(){
  clearStops();
  const stopList = document.getElementById('stop-list');
  stops.forEach((stop)=>{
    stopList.appendChild(createStopButton(stop));
  })
}

 
/** Creates a button in the schedule panel in the html
 *  @param {String} stop a String to add as a button 
 *  @return {button} stopBtn a button showing a selected stop
 */
function createStopButton(stop){
  const stopBtn = document.createElement('button');
  stopBtn.innerText = stop;
  stopBtn.className =  "btn rec-btn";
  stopBtn.addEventListener("click", function() {
    // remove place from stops and waypoints set
    stops.delete(stop);
    waypoints = new Set([...waypoints].filter(waypoint => waypoint.location != stop));
    calcRoute();
    updateStops();
  });
  return stopBtn;
}

 
/** Add stop to or delete stop from the stoplist in javascript and in the datastore */
function updateStops(){
  renderStopsList();
  fetch('/api/stop', {method: "POST", body: JSON.stringify(Array.from(stops))});
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
      recs.add(rec);
    })
    renderRecsList();
  })
}
 
/** Re-render recs list synchronously */
function renderRecsList(){
  clearRecs();
  const recsList = document.getElementById('rec-list');
  recs.forEach((rec)=>{
    recsList.appendChild(createRecButton(rec));
  });
}
 
/** Creates a button in the recommendations panel in the html 
 *  @param {String} rec a String to add as a button 
 *  @return {button} recBtn a button showing a recommended place
 */
function createRecButton(rec){
  const recBtn = document.createElement('button');
  recBtn.innerText = rec;
  recBtn.className =  "btn rec-btn";
  recBtn.addEventListener("click", function() {
    // TODO: add to recs later for better visuals on html
    stops.add(rec);
    //  if new place, add it to the selected stops and redraw route
    if(!Array.from(waypoints).find(waypoint => waypoint.location === rec)){
      waypoints.add({location:rec});
      calcRoute();
      updateStops();
    }
  });
  return recBtn;
}

/* exported initMap */
/* global google */