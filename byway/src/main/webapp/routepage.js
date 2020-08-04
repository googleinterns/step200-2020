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
    stopList.innerText = ""; // clear list
  }
}

/** Render stop list  */
function renderStop(stop){
  const stopList = document.getElementById('stop-list');
  // add to stop array in the js 
  
  let btn = document.createElement('button');
  btn.id = stop.id;
  btn.innerText = stop.placename;
  btn.className =  "btn rec-btn";
  btn.addEventListener("click", function() {
    deleteFromStops(stop); 
  });
  stopList.appendChild(btn);
}

/** Get the new list of stops from datastore onload */
function getStopsOnload(){
  console.log("getstopsOnloda");
  clearStops();
  fetch('/api/stop')
  .then(response => response.json())
  .then((stopsResponse) => {
    stopsResponse.forEach((stop)=>{
      stops.push(stop);
      // renderStops(stop);
    });
    renderStopsList();
  });
  
}

/** Get the new list of stops locally */
function renderStopsList(){
  console.log("renderstoplist");
  clearStops();
  // re-render list synchronously
  stops.forEach((stop)=>{
    renderStop(stop);
  })
}

/** Add stop locally and to datastore */
function addToStops(stop){
  deleteFromRecs(stop); 
  // add to stops array locally in js
  stops.push(stop);
  renderStopsList();

  // add to datastore
  const params = new URLSearchParams();
  params.append("text", stop.placename);
  params.append("action", "add");
  fetch('/api/stop', {method: 'POST', body: params});
}

/** Delete stop locally and from datastore*/
function deleteFromStops(stop){
  addToRecs(stop); 
  console.log("delete " + stop.placename);
  // delete from stops array locally in js
  stops = stops.filter(function(stopObj){
    return stopObj.placename != stop.placename;
  })
  renderStopsList();

  // delete from datastore
  const params = new URLSearchParams();
  params.append("text", stop.placename);
  params.append("action", "remove");
  fetch('/api/stop', {method: 'POST', body: params});
}

/** Clear the recommendations panel in the html */
function clearRecs(){
  const recList = document.getElementById('rec-list');
  if(recList != null){
    recList.innerText = ""; // clear list
  }
}

/** Render recommendations list */
function renderRec(rec){
  console.log("renderrec");
  const recsList = document.getElementById('rec-list');
  let btn = document.createElement('button');
  btn.id = rec.id;
  btn.innerText = rec.placename;
  btn.className =  "btn rec-btn";
  btn.addEventListener("click", function() {
    addToStops(rec); 
  });
  recsList.appendChild(btn);
}

/** Get the new list of recommendations from servlet onload */
function getRecsOnload() {
  console.log("getRecsOnloda");
  clearRecs();
  fetch('/api/recs')
  .then(response => response.json())
  .then((recommendations) => {
    recommendations.forEach((rec)=>{
      recs.push(rec);
      console.log("pushed")
      // renderRecs(rec);
    })
    renderRecsList();
  })
  
}

/** Get the new list of recommendations locally */
function renderRecsList(){
  console.log("renderrecslist");
  clearRecs();
  // re-render list synchronously
  console.log(recs);
  recs.forEach((rec)=>{
    console.log("in foreach");
    renderRec(rec);
  })
}

/** Add recommendation locally*/
function addToRecs(rec){
  recs.push(rec);
  renderRecsList();
}

/** Delete recommendation locally */
function deleteFromRecs(rec){
  recs = recs.filter(function(r){
    return r.placename != rec.placename;
  })
  renderRecsList();
}

/* exported initMap */
/* global google */

