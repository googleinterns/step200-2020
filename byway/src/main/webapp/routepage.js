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
let recs = new Set;
let stops = new Set;
// location representations of stops array
let waypoints = [];
let directionsService;
let directionsRenderer;
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
  start = "111 8th Ave, New York, NY";
  end = "Yonkers, NY";
  let mapOptions = {
    zoom: 14,
    center: new google.maps.LatLng(40.730610, -73.935242) // coordinates of NYC
  }
  let map = new google.maps.Map(document.getElementById('map'), mapOptions);
  directionsRenderer.setMap(map);
  /** 
  document.getElementById("stop-list").addEventListener("focus", function() {
    calcRoute(directionsService, directionsRenderer, start, end);
  });*/
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
// function calcRoute(directionsService, directionsRenderer, start, end) {
function calcRoute() {
  let request = {
    origin:  start,
    destination: end,
    travelMode: 'DRIVING',
    waypoints
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
    if(stopsResponse == null){
      stopsResponse.forEach((stop)=>{
        stops.add(stop);
        waypoints.push({location:stop});
      });
    }
    calcRoute();
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
    /** 
    stops = stops.filter(function(stopObj){
    return stopObj != stop;
    })*/
    stops = new Set([...stops].filter(stopObj => stopObj!= stop));
    let obj = waypoints.find(x => x.location === stop);
    let index = waypoints.indexOf(obj);
    if (index > -1) {
      waypoints.splice(index, 1);
    }
    console.log(waypoints);
    updateStops(stop);
    calcRoute();

  });
  stopList.appendChild(btn);
}

/** Add stop to or delete stop from the stoplist in javascript and in the datastore
 *  @param {String} stop a String to add or delete
 */
function updateStops(){
  renderStopsList();
  let stopsAsJSONString = JSON.stringify(Array.from(stops));
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
      recs.add(rec);
    })
    renderRecsList();
    calcRoute();
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
    stops.add(rec);
    let obj = waypoints.find(x => x.location === rec);
    let index = waypoints.indexOf(obj);
    console.log("index " + index);
    console.log(waypoints);

    if(index === -1){
      console.log("not already in waypoints");
      waypoints.push({location:rec});
      updateStops(rec);
      calcRoute();
    } else{
      console.log("already in wy");
    }
    
  });
  recsList.appendChild(btn);
}

/* exported initMap */
/* global google */