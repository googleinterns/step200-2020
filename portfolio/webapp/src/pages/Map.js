import Box from './Box';
import React from 'react';
import Stop from './Stop';

import { GoogleMap, LoadScript } from '@react-google-maps/api';

const containerStyle = {
  width: '450px',
  height: '450px'
};
 
const center = {
  lat: -3.745,
  lng: -38.523
};
 
function Map() {
  const [map, setMap] = React.useState(null)
 
  const onLoad = React.useCallback(function callback(map) {
    const bounds = new window.google.maps.LatLngBounds();
    map.fitBounds(bounds);
    setMap(map)
  }, [])
 
  const onUnmount = React.useCallback(function callback(map) {
    setMap(null)
  }, [])
 
  return (
    <LoadScript
      googleMapsApiKey="AIzaSyBg6D1U0U2L7VlbKH7Bkh-ds6wdUaLzroM">
      <GoogleMap
        mapContainerStyle={containerStyle}
        center={center}
        zoom={10}
        onLoad={onLoad}
        onUnmount={onUnmount}
      >
        { /* Child components, such as markers, info windows, etc. */ }
        <></>
      </GoogleMap>
    </LoadScript>
  )
}
 
export default React.memo(Map)