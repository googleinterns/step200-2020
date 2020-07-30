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


var defaultCenter = {
  lat: 40.712776,
  lng:-74.005974
};
var userlatlng = {lat:null , lng: null}

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
  createSearchBox(map,'pac-input');
  createSearchBox(map,'pac-input-2');
  getLocations(map);
  
}

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


/* fetches start location and destinations from DestinationsServlet and adds to DOM*/
function getLocations(map){
  fetch('/destinations').then(response => response.json()).then((userLocations) => {
    const container = document.getElementById('destinations-container');
    let destinationArray= userLocations.destinations;

    destinationArray.forEach((destination) => {
      const request = {
        query: destination,
        fields: ["name", "photos", "formatted_address", "rating", "business_status"]
      };
      service = new google.maps.places.PlacesService(map);
      service.findPlaceFromQuery(request, (results, status) => {
        if (status === google.maps.places.PlacesServiceStatus.OK) {
          let destinationToAdd = document.createElement('p');
          destinationToAdd.className='location';
          let destinationPhoto=document.createElement('img');
          destinationPhoto.className="destination-photo";
          destinationPhoto.src = results[0].photos[0].getUrl();
        
          let destinationInfo=document.createElement('p');
          destinationInfo.className = 'destination-info';
          destinationInfo.innerText= results[0].name;
          let destinationAddress= document.createElement('p');
          destinationAddress.innerText = results[0].formatted_address;
          destinationInfo.appendChild(destinationAddress);
          container.appendChild(destinationToAdd);
          destinationToAdd.appendChild(destinationPhoto);
          destinationToAdd.appendChild(destinationInfo);
        }
      });  
    }) 
  });
}

/* fills Start location Searchbox with previous input */
function getStartDestination(){
  fetch('/destinations').then(response => response.json()).then((userLocations) =>{
    console.log(userLocations.start);
    document.getElementById('pac-input').value = userLocations.start;
  });
}
  
/* Gets users current location */
function getCurrentAddress(){
  const geocoder = new google.maps.Geocoder();
  geocoder.geocode({ 'location': userlatlng}, (results, status) => {
    if (status === "OK") {
      if (results[0]) {
        document.getElementById('pac-input').value=results[0].formatted_address;
      } else {
          window.alert("No results found");
        }
    } else {
        window.alert("Geocoder failed due to: " + status);
      }
  });
}
