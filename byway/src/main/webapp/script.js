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

var map;
var directionsRenderer;
var directionsService;
var start;
var end;
var waypts=[];

function initMap() {
  directionsService = new google.maps.DirectionsService();
  directionsRenderer = new google.maps.DirectionsRenderer();
  // start = new google.maps.LatLng(37.7699298, -122.4469157);
  // end = new google.maps.LatLng(37.7683909618184, -122.51089453697205);
  start = "111 8th Ave, New York, NY";
  end = "Yonkers, NY"
  var mapOptions = {
    zoom: 14,
    // NYC coords
    center:  new google.maps.LatLng(40.730610, -73.935242)
  }
  map = new google.maps.Map(document.getElementById('map'), mapOptions);
  directionsRenderer.setMap(map);
  document.getElementById("stop-list").addEventListener("focus", function() {
    calcRoute(directionsService, directionsRenderer, start, end);
  });
}

function calcRoute() {
  console.log('getting route');
  var request = {
    origin:  start,
    destination: end,
    travelMode: 'DRIVING',
    waypoints: waypts
  };
  directionsService.route(request, function(response, status) {
    if (status == 'OK') {
      directionsRenderer.setDirections(response);
    } else {
      window.alert("Could not calculate route due to: " + status);
    }
  });
}

/* Add a new waypoint to the request when a new stop is added to the schedule.*/
function modifyMap(stop){
  waypts.push({location:stop});
  calcRoute();
}

/* Get the new list of stops upon user selection */
function getStops(){
  const stopList = document.getElementById('stop-list');
  fetch('/stop')
  .then(response => response.json())
  .then((stops) => {
    // clear list of buttons, not just text so can't use innerText
    stopList.innerHTML = ""; 
    for(let i = 0; i < stops.length; i++) {
      var btn = document.createElement('button');
      btn.id = `stopList${i}`;
      btn.innerHTML = stops[i];
      btn.setAttribute("class", "btn btn-info");
      btn.addEventListener("click", function() {
        deleteFromStops(stops[i]);
      });
      stopList.appendChild(btn);
    }
  })
}

function remove(stop){
  let obj = waypts.find(x => x.location === stop);
  let index = waypts.indexOf(obj);
  if (index > -1) {
    waypts.splice(index, 1);
  }
  console.log(index);
  console.log(waypts);
}

/* Add stop to the ArrayList in the servlet */
function addToStops(stop){
  // add a new waypoint to the request when a new stop is added to the schedule
  waypts.push({location:stop});
  calcRoute();
  deleteFromRecs(stop);
  const params = new URLSearchParams();
  params.append("text", stop);
  params.append("action", "add");
  fetch('/stop', {method: 'POST', body: params})
    .then(() => getStops()); // re-render list
}

/* Delete stop from the ArrayList in the servlet */
function deleteFromStops(stop){
  // remove waypoint from the request when a new stop is removed from the schedule
  remove(stop);
  calcRoute();
  addToRecs(stop); 
  const params = new URLSearchParams();
  params.append("text", stop);
  params.append("action", "remove");
  fetch('/stop', {method: 'POST', body: params})
    .then(() => getStops()); // re-render list
}

/* Get the new list of recommendations upon load and user selection */
function getRecs() {
 const recList = document.getElementById('rec-list');
  fetch('/recs')
  .then(response => response.json())
  .then((recs) => {
    recList.innerHTML = ""; // clear list
    for(let i = 0; i < recs.length; i++) {
      var btn = document.createElement('button');
      btn.id = `recList${i}`;
      btn.innerText = recs[i];
      btn.setAttribute("class", "btn btn-warning");
      btn.addEventListener("click", function() {
        addToStops(recs[i]);
      });
        recList.appendChild(btn);
    }
  })
}

/* Add place back to recommendations list in the servlet */
function addToRecs(stop){
  const params = new URLSearchParams();
  params.append("text", stop);
  params.append("action", "add");
  fetch('/recs', {method: 'POST', body: params})
    .then(() => getRecs());
}

/* Delete stop from recommendations list in the servlet */
function deleteFromRecs(stop){
  const params = new URLSearchParams();
  params.append("text", stop);
  params.append("action", "remove");
  fetch('/recs', {method: 'POST', body: params})
    .then(() => getRecs());
}


