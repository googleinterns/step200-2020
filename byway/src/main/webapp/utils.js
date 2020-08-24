/** Script that contains shared functions and variables*/

/**
 * Uses placeId to retrieve details like coordinates, place name, etc.
 * @param {String} placeId a textual identifier that uniquely identifies a place
<<<<<<< HEAD
 * @param {Places Service Object} placesService object that communicates with the Places API service
 * @return {Promise} result a Place Result object with fields name, geometry, id, etc.
 */
function findPlace(placeId, placesService) {
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

/* exported findPlace */

