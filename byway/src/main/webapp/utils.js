function delayPromise(delayMs) {
  return new Promise(resolve => setTimeout(resolve, delayMs));
}

async function findPlace(placeId) {
  await delayPromise(250);
  const request = {
    placeId: placeId,
    fields: ['name', 'geometry']
  }
  const result = await new Promise(resolve => {
    placesService.getDetails(request, (result, status) => {
      if(status == "OK") {
       console.log(result);
       return result;
      } else {
        alert("Status: " + status);
      }
    })
  });
  
}

/* export findPlace */