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


/*
* Sets Progress Bar to correct location based on the page number
* @param {int} pageNumber
*/
function setProgressBar(pageNumber){
  let ul = document.getElementById("progressbar");
  let items = ul.getElementsByTagName("li");
  items[pageNumber-1].className = 'active';
}

const defaultCenter = {
  lat: 40.712776,
  lng:-74.005974
};
Object.freeze(defaultCenter);
let userlatlng = {lat:null , lng: null};

/*
* Creates map and search boxes with autocomplete
*/
function initAutocomplete() {   
  const map = new google.maps.Map(document.getElementById("map"), {
    center: { lat: defaultCenter.lat, lng: defaultCenter.lng },
    zoom: 13,
    mapTypeId: "roadmap"
  });


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
  let markers = [];

  searchBox.addListener("places_changed", () => {
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
  });

}

/*
* fetches start location and destinations from DestinationsServlet and adds to DOM
*/

function getLocations(){
  getDestinations().then((userLocations) => {
    document.getElementById('start-location').innerText = "Start Location :" + userLocations.start;
    const container = document.getElementById('destinations-container');
    container.innerText = "Destinations:";
    let destinationArray= userLocations.destinations;
    destinationArray.forEach((destination) => {
      let destinationToAdd = document.createElement('p');
      destinationToAdd.innerText = destination;
      container.appendChild(destinationToAdd);
    }) 
  });
}

/* 
*fills Start location Searchbox with previously input
 */
function getStartDestination(){
  getDestinations().then((userLocations) =>{
    console.log(userLocations.start);
    document.getElementById('start-search-box').value = userLocations.start;
  });
}

/* 
* fetches data from servelt
*/
function getDestinations(){
    fetch('/api/destinations').then(response => response.json()).then((destinations)=>{
        return destinations;
    })
}
  
/* 
* Gets users current location 
*/
function getCurrentAddress(){
  const geocoder = new google.maps.Geocoder();
  geocoder.geocode({ 'location': userlatlng}, (results, status) => {
    if (status === "OK") {
      if (results[0]) {
        document.getElementById('start-search-box').value=results[0].formatted_address;
      } else {
          window.alert("No results found");
        }
    } else {
        window.alert("Geocoder failed due to: " + status);
      }
  });
}
