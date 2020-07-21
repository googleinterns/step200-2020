import Box from './Box';
import React from 'react';
import Stop from './Stop';

import { GoogleMap, LoadScript } from '@react-google-maps/api';

const containerStyle = {
  width: '500px',
  height: '600px'
};
 
const center = {
  lat: 40.7128,
  lng: -74.0060
};
 
export default class Map extends React.Component {
  
  constructor(props) {
    super(props);
    this.state = {
      map: null,
    };
  }

  render() {
    return (
      <LoadScript
        googleMapsApiKey="AIzaSyAOKxla4a0mvW0OhagpQb4NSRwFndKMNIg">
        <GoogleMap
          mapContainerStyle={containerStyle}
          center={center}
          zoom={8}
          onLoad={map => this.setState({map})}
          onUnmount={() => this.setState({map: null})} />
      </LoadScript>
    )
  }
}
