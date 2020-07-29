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

/* exported initAutocomplete, getCurrentAddress */
/* global google, setProgressBar */


const defaultCenter = Object.freeze({
  lat: 40.712776,
  lng:-74.005974
});

let userlatlng = {lat:null , lng: null};

function initializeDestinationsPage(){
    initAutocomplete(); 
    setProgressBar(1); 
    fetchDestinations().then(response => {
      updateLocations(response);
      updateStartDestination(response);
    });
    
}
/*
* Creates map and search boxes with autocomplete
*/
function initAutocomplete() {   
  const map = new google.maps.Map(document.getElementById("map"), {
    center: { lat: defaultCenter.lat, lng: defaultCenter.lng },
    zoom: 13,
    mapTypeId: "roadmap"
  });

  //navigator is an HTML geolocation API variable to get information about the users current location
  if (navigator.geolocation) {
    navigator.geolocation.getCurrentPosition(function(position) {
      userlatlng = {
        lat: position.coords.latitude,
        lng: position.coords.longitude
      };
      map.setCenter(userlatlng);
    }, function() {
         map.setCenter(defaultCenter);
        });
  } 
  else {
    window.alert("Geolocation failed");
  }
  // Create the search boxes and link them to the UI elements.
  const START_SEARCH_BOX = 'start-search-box';
  const DESTINATIONS_SEARCH_BOX= 'destinations-search-box';
  createSearchBox(map,START_SEARCH_BOX);
  createSearchBox(map,DESTINATIONS_SEARCH_BOX);
  
}

/*
 * Creates a search box
 * @param {google.maps.Map} map
 * @param {string} container
 */
function createSearchBox(map,container){
  const start = document.getElementById(container);
  const searchBox = new google.maps.places.SearchBox(start);

   map.addListener("bounds_changed", () => {
    searchBox.setBounds(map.getBounds());
  });
  
  searchBox.addListener("places_changed", () => {
    addMarker(searchBox,map);
  });
}

function addMarker(searchBox,map){
    let markers = [];
    const places = searchBox.getPlaces();

    if (places.length == 0) {
      return;
    }
    // Clear out the old markers.
    markers.forEach(marker => {
      marker.setMap(null);
    });
    markers = [];
    // For each place, get the icon, name and location.
    const bounds = new google.maps.LatLngBounds();
    places.forEach(place => {
      if (!place.geometry) {
        console.log("Returned place contains no geometry");
        return;
      }
      const icon = {
        url: place.icon,
        size: new google.maps.Size(71, 71),
        origin: new google.maps.Point(0, 0),
        anchor: new google.maps.Point(17, 34),
        scaledSize: new google.maps.Size(25, 25)
      };
      // Create a marker for each place.
      markers.push(
        new google.maps.Marker({
          map,
          icon,
          title: place.name,
          position: place.geometry.location
        })
      );

      if (place.geometry.viewport) {
        // Only geocodes have viewport.
        bounds.union(place.geometry.viewport);
      } else {
        bounds.extend(place.geometry.location);
      }
    });
    map.fitBounds(bounds);
}

/*
* fetches start location and destinations from DestinationsServlet and adds to DOM
*/
function updateLocations(locationData){
    document.getElementById('start-location').innerText = "Start Location :" + locationData.start;
    const container = document.getElementById('destinations-container');
    container.innerText = "Destinations:";
    let destinationArray= locationData.destinations;
    destinationArray.forEach((destination) => {
      let destinationToAdd = document.createElement('p');
      destinationToAdd.innerText = destination;
      container.appendChild(destinationToAdd);
    }) 
}

/* 
* fills Start location Searchbox with previously input
*/
function updateStartDestination(locationData){
    if (locationData.start == null){
      document.getElementById('start-search-box').value = "";
    }
    else{
      document.getElementById('start-search-box').value = locationData.start;
    }
}

/* 
* fetches data from servlet
*/
function fetchDestinations(){
  return fetch('/api/destinations').then(response => response.json());
}

/* 
* Gets users current location 
*/
function getCurrentAddress(){
  const geocoder = new google.maps.Geocoder();
  geocoder.geocode({ 'location': userlatlng}, (results, status) => {
    if (status === "OK") {
      if (results[0]) {
          console.log(results[0].formatted_address);
        document.getElementById("start-search-box").value=results[0].formatted_address;
      } else {
          window.alert("No results found");
        }
    } else {
        window.alert("Geocoder failed due to: " + status);
      }
  });
}

/* 
* add event listener for submit button
*/
window.onload = function(){
  document.getElementById('user-input-form').addEventListener('submit', (event) => {
    event.preventDefault();
    const formData = new URLSearchParams();
    formData.append('start-location', document.getElementById('start-search-box').value); 
    formData.append('destinations', document.getElementById('destinations-search-box').value);  
    fetch('/api/destinations', {method: 'POST', body:formData}).then(() => {
      fetchDestinations().then(response => {
        updateLocations(response);
        updateStartDestination(response);
      });
    });
  });
}

document.addEventListener('DOMContentLoaded', initializeDestinationsPage)
    

