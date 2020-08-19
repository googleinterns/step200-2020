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

 
// copies of recommendations and route, stored as sets for synchronous updating
let recs = [];

// holds stops and destinations
let route = [];

// holds destinations 
let destinations = []; 
 
 /** 
// object that communicates with the GMaps API service
let directionsService;
 
// object that renders display results on the map
let directionsRenderer;

let map; 
let placesService;
 */

let start = "";
let end = "";
 


if (document.readyState === 'loading') {  // Loading hasn't finished yet
  document.addEventListener('DOMContentLoaded', loadData);
} else {  // `DOMContentLoaded` has already fired
  loadData();
}
 
/** Used to restore route and recommendations upon load or refresh */
function loadData(){
  getRecsOnload();
  getRouteOnload();
}
 /**
/** Initializes map on the page 
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
  placesService = new google.maps.places.PlacesService(map);
  
} */

/** Displays route containing waypoints overtop the map. */
function calcRoute() {
  console.log("calcroute");
  console.log(route);
  let request = {
    origin:  start,
    destination: end,
    travelMode: 'DRIVING',
    waypoints:  route.map(waypoint => ({location: waypoint.name})),
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

/** Add the starting location back to the schedule panel
 *  TODO: Delete markers for recommended stops not selected.
 *  TODO: Disable usage after? Don't want to keep adding to list. 
 */
function generateRoute() {
  route.splice(0,0,start);
  route.splice(route.length, 0, end);
  console.log(route);
  renderRouteList();
}

async function testUtils(){
  let res = await findPlace('ChIJ4zGFAZpYwokRGUGph3Mf37k');
  console.log(res.name);
  console.log(res.place_id);
  console.log(res.geometry);
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
 * @return {number, number, number} distance total driving distance for whole route, 
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
  fetch('/api/stop')
  .then(response => response.json())
  .then(async (trip) => {
    if(trip != null){
      let res = await findPlace(trip.start);
      start = end = res.name;
      console.log("start " + start);
      // destinations = trip.destinations;
      // route.push(...trip.route)
      for(destination of trip.destinations){
        let destinationAsPlaceObj = await findPlace(destination);
        console.log("destination: " + destinationAsPlaceObj.name);
        destinations.push(destinationAsPlaceObj);
      }
      for(waypoint of trip.route){
        let waypointAsPlaceObj = await findPlace(waypoint);
        console.log("waypoint: " + waypointAsPlaceObj.name);
        route.push(waypointAsPlaceObj);
      }
      calcRoute();
    }
    else{
      console.log("Could not retrieve any routes nor destinations associated with this trip. Please reload page and try again.");
    }
  });
}
 
/** Re-render route list synchronously */
function renderRouteList(){
  clearRoute();
  console.log("destinations" + destinations.map(waypoint => waypoint.name));
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
  // if(!destinations.includes(waypoint)){
  if(destinations.some(destination => destination.name === waypoint.name)){
    console.log("destination");
    routeBtn.className =  "btn destination-btn";
  } else {
    console.log("stop");
    routeBtn.className =  "btn stop-btn";
  }
  routeBtn.addEventListener("click", function() {
    // only delete if the waypoint is only a stop, not a destination
    // if(!destinations.includes(waypoint)){
    if(!destinations.some(destination => destination.name === waypoint.name)){
      route = route.filter(stop => stop.name != waypoint.name);
      calcRoute();
    }
   
  });
  return routeBtn;
}

 
/** Display new route list and store it in the datastore */
function updateRoute(){
  renderRouteList();
  // route.map(waypoint => ({location: waypoint.name}))
  console.log("putting into stops " + route.map(waypoint => waypoint.place_id));
  fetch('/api/stop', {method: "POST", body: JSON.stringify(route.map(waypoint => waypoint.place_id))});
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
  .then(async (recommendations) => {
    for (rec of recommendations){
        let res = await findPlace(rec);
        // console.log(res);
        recs.push(res);
    }
  }).then(() => renderRecsList())
  
    /** 
    await Promise.resolve(recommendations.forEach(async (rec) =>{
        let res = await findPlace(rec);
        console.log(res);
        recs.push(res);
    })
    */
  // )}).then(() => {renderRecsList(); } )
  
  /** 
  }).then(() => {
      console.log("in chain");
      console.log(recs);
      renderRecsList();
  }); */
}
 
/** Re-render recs list synchronously */
function renderRecsList(){
  console.log("render");
  console.log(recs);
  console.log(recs[0]);
  console.log(recs[1]);
  clearRecs();
  const recsList = document.getElementById('rec-list');
  recs.forEach((rec)=>{
    console.log("here");
    recsList.appendChild(createRecButton(rec));
  });
}
 
/** Creates a button in the recommendations panel in the html 
 *  @param {String} rec a String to add as a button 
 *  @return {button} recBtn a button showing a recommended place
 */
function createRecButton(rec){
  const recBtn = document.createElement('button');
  console.log("create rec");
  recBtn.innerText = rec.name;
  recBtn.className =  "btn rec-btn";
  recBtn.addEventListener("click", function() {
    if(!route.includes(rec)){
      route.push(rec);
      calcRoute();
    }
  });
  return recBtn;
}
/**
async function findPlace(placeId) {
  
  await delayPromise(250);
  const request = {
    placeId: placeId,
    fields: ['name', 'geometry']
  }
  const result = await new Promise(resolve => {
    placesService.getDetails(request, (result, status) => {
      if(status == "OK") {
        console.log('result');
        console.log(result);
        resolve(result);
        
      } else {
        alert("Status: " + status)
      }
    })
  });
  
}
 */
/* exported initMap, generateRoute */
/* global google */