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

/**
 * Adds a random greeting to the page.
 */
function addRandomGreeting() {
  const greetings =
      ['Hello world!', '¡Hola Mundo!', '你好，世界！', 'Bonjour le monde!'];

  // Pick a random greeting.
  const greeting = greetings[Math.floor(Math.random() * greetings.length)];

  // Add it to the page.
  const greetingContainer = document.getElementById('greeting-container');
  greetingContainer.innerText = greeting;
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
     document.getElementById("route").addEventListener("click", function() {
    calcRoute(directionsService, directionsRenderer, start, end);
  });
}

function calcRoute(directionsService, directionsRenderer, start, end) {
  console.log('getting route');
  var request = {
      origin:  start,
      destination: end,
      travelMode: 'DRIVING'
  };
  directionsService.route(request, function(response, status) {
    if (status == 'OK') {
      directionsRenderer.setDirections(response);
    }
  });
}
function foo(stop){
    console.log("moo");
    // call post
    console.log(stop);
}

function getRecs() {
 const recList = document.getElementById('rec-list');

  console.log("here");
  fetch('/data')
  .then(response => response.json())
  .then((recs) => {
    for(let i = 0; i < recs.length; i++) {
        const btn = document.createElement('button');
        btn.id = `recList${i}`;
        // btn.className = 'list-group-item list-group-item-action';
        btn.innerHTML = recs[i];
        btn.addEventListener("click", function() {
        console.log(recs[i]);});
        recList.appendChild(btn);
    }
  })
}

/** 
function createCommentElement(stop){
    const commentElement = document.createElement("li");
    const textElement = document.createElement("span");
    textElement.innerText = comment.text;
    commentElement.appendChild(textElement);
    return commentElement;
}
*/