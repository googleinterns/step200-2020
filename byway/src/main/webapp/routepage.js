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

if (document.readyState === 'loading') {  // Loading hasn't finished yet
  document.addEventListener('DOMContentLoaded', getRecs());
} else {  // `DOMContentLoaded` has already fired
  getRecs();
}

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
  document.getElementById("stop-list").addEventListener("focus", function() {
    calcRoute(directionsService, directionsRenderer, start, end);
  });
}

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

/* Get the new list of stops upon user selection */
function getStops(){
  console.log("in get stops!")
  const stopList = document.getElementById('stop-list');
  if(stopList != null){
        stopList.innerHTML = ""; // clear list
    }
  fetch('/api/stop')
  .then(response => response.json())
  .then((stops) => {
    stops.forEach((stop)=>{
      console.log(stop.placename);
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
    /**
    // clear list of buttons, not just text so can't use innerText
    stopList.innerHTML = ""; 
    for(let i = 0; i < stops.length; i++) {
      var btn = document.createElement('button');
      btn.id = `stopList${i}`;
      btn.innerHTML = stops[i];
      btn.setAttribute("class", "btn rec-btn");
      btn.addEventListener("click", function() {
        deleteFromStops(stops[i]);
      });
      stopList.appendChild(btn);
    }
  })
   */


/* Add stop to the ArrayList in the servlet */
function addToStops(stop){
  deleteFromRecs(stop); 
  console.log("delete from recs");
  const params = new URLSearchParams();
  params.append("text", stop.placename);
  params.append("action", "add");
  fetch('/api/stop', {method: 'POST', body: params})
    .then(() => getStops()); // re-render list
  console.log("add" + stop.placename + "to the stops");
}

/* Delete stop from the ArrayList in the servlet */
function deleteFromStops(stop){
  addToRecs(stop); 
  const params = new URLSearchParams();
  params.append("text", stop);
  params.append("action", "remove");
  fetch('/api/stop', {method: 'POST', body: params})
    .then(() => getStops()); // re-render list
}
/* Get the new list of recommendations upon load and user selection */
function getRecs() {
  const recList = document.getElementById('rec-list');
  if(recList != null){
    recList.innerHTML = ""; // clear list
  }
  fetch('/api/recs')
  .then(response => response.json())
  .then((recs) => {
    recs.forEach((stop)=>{
      var btn = document.createElement('button');
      btn.id = stop.id;
      btn.innerText = stop.placename;
      btn.setAttribute("class", "btn rec-btn");
      btn.addEventListener("click", function() {
        addToStops(stop); 
      });
     recList.appendChild(btn);
      
    })
  })
}

/* Add place back to recommendations list in the servlet */
function addToRecs(stop){
  const params = new URLSearchParams();
  params.append("text", stop);
  params.append("action", "add");
  fetch('/api/recs', {method: 'POST', body: params})
    .then(() => getRecs());
}


/* Delete stop from recommendations list in the servlet */
function deleteFromRecs(stop){
  const params = new URLSearchParams();
  params.append("text", stop);
  params.append("id", stop.id);
  params.append("action", "remove");
  fetch('/api/recs', {method: 'POST', body: params})
    .then(() => getRecs());
}

/* exported initMap*/
/* global google */
