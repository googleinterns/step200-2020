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
  document.addEventListener('DOMContentLoaded', getRecs);
} else {  // `DOMContentLoaded` has already fired
  getRecs();
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

function addToStops(stop){
  console.log("add" + stop.placename + "to the ArrayList in the servlet");
}

function getRecs() {
  fetch('/api/recs')
  .then(response => response.json())
  .then((recs) => {
    const recList = document.getElementById('rec-list');
    recList.innerText = ""; // clear old comments 
    recs.forEach((stop) => {
      let btn = document.createElement("button");
      btn.innerText = stop.placename;
      btn.setAttribute("class", "btn rec-btn");
      btn.addEventListener("click", function() {
        addToStops(stop);
      });
      recList.appendChild(btn);
    });
  });
}

/* exported initMap */
/* global google */