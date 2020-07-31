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

let recs = [];
let stops = [];

if (document.readyState === 'loading') {  // Loading hasn't finished yet
  document.addEventListener('DOMContentLoaded', getRecs());
} else {  // `DOMContentLoaded` has already fired
  getRecs();
}

/** Displays the map */
function initMap() {
  var directionsService = new google.maps.DirectionsService();
  var directionsRenderer = new google.maps.DirectionsRenderer();
  var start = new google.maps.LatLng(37.7699298, -122.4469157);
  var end = new google.maps.LatLng(37.7683909618184, -122.51089453697205);
  var mapOptions = {
    zoom: 14,
    center: start
  }
  var map = new google.maps.Map(document.getElementById('map'), mapOptions);
  directionsRenderer.setMap(map);
  document.getElementById("stop-list").addEventListener("click", function() {
    calcRoute(directionsService, directionsRenderer, start, end);
  });
}

/** Displays route overtop the map */
function calcRoute(directionsService, directionsRenderer, start, end) {
  var request = {
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

/** Get the new list of stops from servlet upon user selection */
function getStops(){
  console.log("getStops()")
  const stopList = document.getElementById('stop-list');
  if(stopList != null){
        stopList.innerHTML = ""; // clear list
    }
  fetch('/api/stop')
  .then(response => response.json())
  .then((stops) => {
    stops.forEach((stop)=>{
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
// TODO: Make into generic function w params
function getStopsList(){
    console.log("getStopsList()");
  const stopList = document.getElementById('stop-list');
  stopList.innerHTML = ""; // clear list
  // re-render list but not asynchronously 
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

/** Add stop to the datastore in servlet */
function addToStops(stop){
  console.log("addToStops()");
  console.log(stop.placename);
  console.log(stop.id);
  deleteFromRecs(stop); 
  // modify stops array
  stops.push(stop);
  getStopsList();

  // add to datastore
  const params = new URLSearchParams();
  params.append("text", stop.placename);
  params.append("id", stop.id);
  params.append("action", "add");
  fetch('/api/stop', {method: 'POST', body: params})
   // .then(() => getStops()); 
}

/** Delete stop from the datastore in the servlet */
function deleteFromStops(stop){
  console.log("deleteFromStops()");
  console.log(stop.placename);
  console.log(stop.id);
  addToRecs(stop); 
  stops = stops.filter(function(stopObj){
    return stopObj.placename != stop.placename;
  })
  getStopsList();
  const params = new URLSearchParams();
  params.append("text", stop.placename);
  params.append("id", stop.id);
  params.append("action", "remove");
  fetch('/api/stop', {method: 'POST', body: params})
    //.then(() => getStops()); // re-render list
  console.log("end of delete from stops");
}

/** Get the new list of recommendations from servlet upon load and user selection */
function getRecs() {
  console.log("getRecs()");
  const recList = document.getElementById('rec-list');
  if(recList != null){
    recList.innerHTML = ""; // clear list
  }
  fetch('/api/recs')
  .then(response => response.json())
  .then((recommendations) => {
    recommendations.forEach((rec)=>{
      
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
function getRecsList(){
  console.log("new rec list");
  const recsList = document.getElementById('rec-list');
  recsList.innerHTML = ""; // clear list
  // re-render list but not asynchronously 
  recs.forEach((stop)=>{
    
    var btn = document.createElement('button');
    btn.innerText = stop.placename
    btn.setAttribute("class", "btn rec-btn");
    btn.addEventListener("click", function() {
      addToStops(stop);
    });
    recsList.appendChild(btn);
  })
}

/** Add place back to recommendations datastore in the servlet */
function addToRecs(stop){
  console.log("addToRecs()");
  recs.push(stop);
  getRecsList();
  const params = new URLSearchParams();
  params.append("text", stop.placename);
  console.log(stop.placename);
  /**
  params.append("id", stop.id);
  params.append("action", "add");
  fetch('/api/recs', {method: 'POST', body: params})
    //.then(() => getRecs()); */
}

/** Delete stop from recommendations list in the servlet */
function deleteFromRecs(stop){
  console.log("deleting from recs" + stop.placename);
  recs = recs.filter(function(rec){
    return rec.placename != stop.placename;
  })
  console.log(recs);
  getRecsList();
  // unnecessary deletion on the backend
  //const params = new URLSearchParams();
  //params.append("text", stop.placename);
  //params.append("id", stop.id);
  //params.append("action", "remove");
  //fetch('/api/recs', {method: 'POST', body: params})
    // .then(() => getRecs());
}

/* exported initMap*/
/* global google */
