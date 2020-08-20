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
/* global google, setProgressBar, getTripKeyFromUrl, configureTripKeyForPath */


const defaultCenter = Object.freeze({
  lat: 40.712776,
  lng:-74.005974
});

let userlatlng = {lat:null , lng: null};
let map;

function initializeDestinationsPage(){
  initAutocomplete(); 
  setProgressBar(1); 
  fetchDestinations().then(response => {
    updateLocations(response);
    updateStartDestination(response);
  }); 
}

const tripKey = getTripKeyFromUrl();
let placesService;

/**
* Creates map and search boxes with autocomplete
*/
function initAutocomplete() {   
  map = new google.maps.Map(document.getElementById("map"), {
    center: { lat: defaultCenter.lat, lng: defaultCenter.lng },
    zoom: 13,
    mapTypeId: "roadmap"
  });
  placesService = new google.maps.places.PlacesService(map);

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
  createSearchBox('start-search-box');
  createSearchBox('destinations-search-box'); 
}

/** 
 * Creates a search box
 * @param {string} container
 */
function createSearchBox(container){
  const start = document.getElementById(container);
  const searchBox = new google.maps.places.SearchBox(start);

   map.addListener("bounds_changed", () => {
    searchBox.setBounds(map.getBounds());
  });
  
  searchBox.addListener("places_changed", () => {
    addMarker(searchBox);
  });
}

function addMarker(searchBox){
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

/** 
* fetches destinations from DestinationsServlet and adds to DOM
 * @param {json object} locationData
*/

function updateLocations(locationData){
    const container = document.getElementById('destinations-container');
    container.innerText = "";
    let destinationArray = locationData.destinations;
    destinationArray.forEach((destination) => {
      const request = {
        placeId: destination,
        fields: ["name", "photos", "formatted_address"]
      };
      placesService.getDetails(request, (place, status) => {
        if (status === google.maps.places.PlacesServiceStatus.OK) {
          addLocationToDom(place, container);
        }
        else{
          alert("Location Invalid:" + status);
          
        }
      });  
    }) 
}

/** 
* adds Users Input Destinations to DOM with image and address
* @param {Place object} place
* @param {HTML element}  container
*/
function addLocationToDom(place,container){
  let destinationToAdd = document.createElement('div');
  destinationToAdd.className = 'location';
  
  let destinationPhoto = document.createElement('img');
  destinationPhoto.src = place.photos[0].getUrl();
  let destinationInfo = document.createElement('p');
  destinationInfo.className = 'destination-info';
  let destinationName = document.createElement('p');
  destinationName.innerText = place.name;
  let destinationAddress= document.createElement('p');
  destinationAddress.innerText = place.formatted_address;

  destinationInfo.appendChild(destinationName);
  destinationInfo.appendChild(destinationAddress);

  container.append(destinationToAdd);
  destinationToAdd.appendChild(destinationPhoto);
  destinationToAdd.appendChild(destinationInfo);
}

/** 
* fetches start destination from DestinationsServlet and 
* fills start-search-box with users previouslt input start
* @param {json object} locationData
*/
function updateStartDestination(locationData){
    if (locationData.start == "" || locationData.start == null){
      document.getElementById('start-search-box').value = "";
    }
    else{
      const request = {
        placeId: locationData.start,
        fields: ["formatted_address"]
      };
      placesService.getDetails(request, (place, status) => {
        if (status === google.maps.places.PlacesServiceStatus.OK) {
          document.getElementById('start-search-box').value = place.formatted_address;
        }
        else{
          alert("Location Invalid:" + status);
        }
      });
    }
}

/**
* fetches data from servlet
*/
function fetchDestinations(){
    
  return fetch(configureTripKeyForPath(tripKey, "/api/destinations")).then(response => response.json());
}

/** 
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
/** 
* add event listener for submit button
*/
window.onload = function(){
  
  let nextButton = document.getElementById('next-button');
  nextButton.addEventListener('click', () => {
      nextButton.href = configureTripKeyForPath(tripKey, '/interests.html');
  });
  document.getElementById('user-input-form').addEventListener('submit', (event) => {
    event.preventDefault();
    savePlaceId();
  });
}

/** 
* gets User Input from search box and sends the Place Id of user input to the server
* elementName indicates which search box to get from, param indicates which param to save as
* @param {String} elementName
*/
function savePlaceId(){
  let formData = new FormData();

  const destRequest = {
    query: String(document.getElementById("destinations-search-box").value),
    fields: ["place_id"]
  };
  const startRequest = {
    query: String(document.getElementById("start-search-box").value),
    fields: ["place_id"]
  };

  let promise = new Promise((resolve) => {
    placesService.findPlaceFromQuery(destRequest, (results, status) => {
    console.log(status);
      if (status === google.maps.places.PlacesServiceStatus.OK) {
        formData.append("destinations-search-box", results[0].place_id);
        resolve("done");
      }
    });
  });

  promise.then(() => { 
    placesService.findPlaceFromQuery(startRequest, (results, status) => {
      console.log(status);
      if (status === google.maps.places.PlacesServiceStatus.OK) {
        formData.append("start-search-box", results[0].place_id);
        fetch(configureTripKeyForPath(tripKey, '/api/destinations'), {method: 'POST', body:formData})
        .then((response)=>
          response.json())
        .then(locationData => {
          updateLocations(locationData);
          updateStartDestination(locationData);
        }); 
      }
      else{
        alert("Location Invalid:" + status);
      }
    });
  });
}

if (document.readyState === 'loading') {  // Loading hasn't finished yet
  document.addEventListener('DOMContentLoaded', initializeDestinationsPage)
} 
else{
  initializeDestinationsPage();
}


    

