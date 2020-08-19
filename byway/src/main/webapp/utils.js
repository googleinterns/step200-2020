/** Script that contains shared functions and variables*/

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
 * @return {Promise} result a Place Result object with fields name, geometry, id, etc.
 */
function findPlace(placeId) {
  console.log(placeId);
  const request = {
    placeId: placeId,
    fields: ['name', 'geometry', 'place_id', 'photos', 'formatted_address']
  }
  const result = new Promise((resolve, reject) => {
    placesService.getDetails(request, (result, status) => {
      if(status == "OK") {
        resolve(result);
      } else {
        alert("Status: " + status);
        reject(new Error("Could not retrieve place result object from request."));
      }
    })
  }).catch(error => {
    alert(error);
  });

  return result;
}

/* exported findPlace, map, directionService, directionsRenderer */