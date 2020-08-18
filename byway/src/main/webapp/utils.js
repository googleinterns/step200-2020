// object that communicates with the GMaps API service
let directionsService;
 
// object that renders display results on the map
let directionsRenderer;

// map object used in the route page
let map; 

// object that communicates with the Places API service
let placesService;


/**
 * Uses placeId to retrieve details like coordinates, place name, etc.
 * @param {String} placeId a textual identifier that uniquely identifies a place
 * @return {Promise} result a Place object
 */
function findPlace(placeId) {
  const request = {
    placeId: placeId,
    fields: ['name', 'geometry', 'place_id']
  }
  const result = new Promise((resolve, reject) => {
    placesService.getDetails(request, (result, status) => {
        if(status == "OK") {
          resolve(result);
        } else {
          alert("status: " + status);
          reject(result);
        }
    })
  });
  return result;
}

/** Initializes map on the page */
function initMap() {
  directionsService = new google.maps.DirectionsService();
  directionsRenderer = new google.maps.DirectionsRenderer();
 
  let mapOptions = {
    zoom: 14,
    // arbitrary center as it will get recentered to the route 
    center: new google.maps.LatLng(0,0)
  }
  map = new google.maps.Map(document.getElementById('map'), mapOptions);
  directionsRenderer.setMap(map);
  placesService = new google.maps.places.PlacesService(map);
  
}

/* export findPlace, initMap */