import Box from './Box';
import React from 'react';
import Stop from './Stop';

import { GoogleMap, LoadScript } from '@react-google-maps/api';

const containerStyle = {
  width: '600px',
  height: '500px'
};
 
const center = {
  lat: -34.397,
  lng: 150.644
};
 
export default function Map() {
  const [map, setMap] = React.useState(null)
 
  const onLoad = React.useCallback(function callback(map) {
    const bounds = new window.google.maps.LatLngBounds();
    map.fitBounds(bounds);
    setMap(map)
  }, [])
 
  const onUnmount = React.useCallback(function callback(map) {
    setMap(null)
  }, [])
  console.log(center.lat);
  console.log(center.lng);
  return (
    <LoadScript
      googleMapsApiKey="AIzaSyAOKxla4a0mvW0OhagpQb4NSRwFndKMNIg">
      <GoogleMap
        mapContainerStyle={containerStyle}
        center={center}
        zoom={1}
        onLoad={onLoad}
        onUnmount={onUnmount}
      >
        { /* Child components, such as markers, info windows, etc. */ }
        <></>
      </GoogleMap>
    </LoadScript>
  )
}
 
// export default React.memo(Map)
// export default Map;