/** Script that contains shared functions, primarily for use in the third page */

// object that communicates with the GMaps API service
/** Script that contains shared functions and variables */

// map object used in the route page 
let map; 

/**
 * Uses placeId to retrieve details like coordinates, place name, etc.
 * @param {String} placeId a textual identifier that uniquely identifies a place
 * @return {Promise} result a Place object
 */
function findPlace(placeId) {
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
  })

  return result;
}

/* exported findPlace, map, placesService */
/* global placesService*/