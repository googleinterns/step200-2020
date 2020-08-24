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

// holds stops and destinations
let route = [];

// holds user interests as strings
let interests = [];

// holds destinations 
let destinations = []; 
 
// object that communicates with the GMaps API service
let directionsService;
 
// object that renders display results on the map
let directionsRenderer;
 
let tripKey;

let start;
let end;
 
let map; 

if (document.readyState === 'loading') {  // Loading hasn't finished yet
  document.addEventListener('DOMContentLoaded', loadData);
} else {  // `DOMContentLoaded` has already fired
  loadData();
}
 
/** Used to restore route and recommendations upon load or refresh */
function loadData(){
  tripKey = getTripKeyFromUrl();
  getRouteOnload();
}
 
/** Initializes map on the page */
function initMap() {
  directionsService = new google.maps.DirectionsService();
  directionsRenderer = new google.maps.DirectionsRenderer();
 
  let mapOptions = {
    zoom: 14,
    center: new google.maps.LatLng(0,0)
    // center: new google.maps.LatLng(40.730610, -73.935242) // coordinates of NYC
  }
  map = new google.maps.Map(document.getElementById('map'), mapOptions);
  directionsRenderer.setMap(map);
  
}

/** Displays route containing waypoints overtop the map. */
function calcRouteWithRecs() {
  let request = {
    origin:  start.name,
    destination: end.name,
    travelMode: 'DRIVING',
    waypoints:  route.map(waypoint => ({location: waypoint.geometry.location})),
    optimizeWaypoints: true
  };
  directionsService.route(request, function(response, status) {
    if (status == 'OK') {
      directionsRenderer.setDirections(response);
      orderWaypoints(response);
      updateDistanceTime(response);
    } else {
      window.alert("Could not calculate route due to: " + status);
    }
    updateRoute();
  });
}

/** Add the start/end location back to the schedule panel
 *  TODO: Delete markers for recommended stops not selected.
 *  TODO: Disable usage after? Don't want to keep adding to list. 
 */
function generateRoute() {
  clearRoute();
  const routeList = document.getElementById('route-list');
  routeList.appendChild(createRouteButton(start));
  for(let waypoint of route){
    routeList.appendChild(createRouteButton(waypoint));
  }
  routeList.appendChild(createRouteButton(end));
}

/**
 * Reorders the elements in route list based on the optimized order of 
 * waypoints returned in the response 
 * @param {response} response response from the directions service object
 */
function orderWaypoints(response){
  let waypoint_order = response.routes[0].waypoint_order;
  let route_copy = [...route];
  for(let i = 0; i < route.length; i++){
    route[i] = route_copy[waypoint_order[i]];
  }
}

/**
 * Calculates and sums up the distance and time duration between all destinations (legs)
 * @param {response} response response from the directions service object
 * @return {'distance': number, 'hours': number, 'minutes': number}
 * distance total driving distance for whole route in kilometers, 
 * hours estimated driving time in hours, minutes estimated driving time in minutes
 */
function computeDistanceTime(response) {
  let totalDist = 0;
  let totalTime = 0;
  // full route
  let route_response = response.routes[0];

  for (let i = 0; i < route_response.legs.length; i++) {
    // in meters
    totalDist += route_response.legs[i].distance.value;
    // in seconds
    totalTime += route_response.legs[i].duration.value;
  }

  // in kilometers
  let distance = (totalDist / 1000).toFixed(2);
  let hours = Math.floor(totalTime / 3600);
  let minutes = Math.round((totalTime - hours*3600) / 60);

  return {distance, hours, minutes};
}

/**
 * Updates total distance and duration elements in HTML
 * @param {response} response response from the directions service object
 */
function updateDistanceTime(response){
  let result = computeDistanceTime(response);
  document.getElementById("distance").innerText = result.distance + "km";
  document.getElementById("duration").innerText = 
    (result.hours == 0) ? result.minutes + " mins" : result.hours + " hr " + result.minutes + " mins";
}
 
/** Clear the route panel in the html */
function clearRoute(){
  const routeList = document.getElementById('route-list');
  if(routeList != null){
    routeList.innerText = "";
  }
}
 
/** Get trip info from datastore onload */
function getRouteOnload(){
  clearRoute();
  fetch(configureTripKeyForPath(tripKey, '/api/stop'))
  .then(response => response.json())
  .then(async (trip) => {
    if(trip != null) {
      interests = trip.interests;
      try {
        let res = await findPlace(trip.start, placesService);
        start = end = res;
      } catch (error) {
        console.error("Could not retrieve a start nor end point due to: ", error);
      }

      for(let destinationId of trip.destinations){
        try{
          let destinationAsPlaceObj = await findPlace(destinationId, placesService);
          destinations.push(destinationAsPlaceObj);
        } catch (error) {
          console.error("Could not retrieve destinations due to: ", error);
        }
      }
      for(let waypointId of trip.route){
        try {
          let waypointAsPlaceObj = await findPlace(waypointId, placesService);
          route.push(waypointAsPlaceObj);
        } catch (error) {
          console.error("Could not retrieve route due to: ", error);
        }
      }
      calcMainRoute();
    } else{
      console.log("Could not retrieve any routes nor destinations associated with this trip." +
       "Please reload page and try again.");
    }
  });
}
 
/** Re-render route list synchronously */
function renderRouteList(){
  clearRoute();
  const routeList = document.getElementById('route-list');
  route.forEach((waypoint)=>{
    routeList.appendChild(createRouteButton(waypoint));
  })
}

/** Creates a button in the schedule panel in the html
 *  @param {String} waypoint a String to add as a button 
 *  @return {button} routeBtn a button showing a selected waypoint along route
 */
function createRouteButton(waypoint){
  const routeBtn = document.createElement('button');
  routeBtn.innerText = waypoint.name;
  if(!destinations.includes(waypoint)){
    routeBtn.className =  "btn stop-btn";
  } else{
    routeBtn.className =  "btn destination-btn";
  }
  routeBtn.addEventListener("click", function() {
    // only delete if the waypoint is only a stop, not a destination
    if(!destinations.includes(waypoint)){
      route = route.filter(stop => stop != waypoint);
      calcRouteWithRecs();
    }
   
  });
  return routeBtn;
}

 
/** Display new route list and store it in the datastore */
function updateRoute(){
  renderRouteList();
  fetch('/api/stop', {method: "POST", body: JSON.stringify(Array.from(route))});
}

/** Clear the recommendations panel in the html */
function clearRecs(){
  const recList = document.getElementById('rec-list');
  if(recList != null){
    // clear list
    recList.innerText = "";
  }
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
 *  @param {PlaceResult} rec contains information about a place
 *  @return {button} recBtn a button showing a recommended place
 */
function createRecButton(rec){
  const recBtn = document.createElement('button');
  recBtn.innerText = rec.name;
  recBtn.className =  "btn rec-btn";
  recBtn.addEventListener("click", function() {
    if(!route.includes(rec)){
      route.push(rec);
      calcRouteWithRecs();
    }
  });
  return recBtn;
}

/* exported calcRouteWithRecs, initMap, interests,
    generateRoute, map, renderRecsList */
/* global calcMainRoute, configureTripKeyForPath, findPlace,
    getTripKeyFromUrl, google, placesService, recs */
