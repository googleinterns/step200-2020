let map;
let service;
let randomLocation;

function initialize() {
  loadMap();
  fetch('/generator')
  .then(response => response.json())
  .then((elem) => {
    elem.forEach(placeType => {
      let request = {
        location: randomLocation,
        radius: '500',
        query: placeType
      }
      service.textSearch(request, callback);
    });
  });
}

function callback(results, status) {
  if (status == google.maps.places.PlacesServiceStatus.OK) {
    for (var i = 0; i < results.length; i++) {
      console.log(results[i]);
    }
  }
}

function loadMap() {
  randomLocation = new google.maps.LatLng(33.5, -112.26);

  map = new google.maps.Map(document.getElementById('map'), {
      center: randomLocation,
      zoom: 15
  });

  service = new google.maps.places.PlacesService(map);
}
