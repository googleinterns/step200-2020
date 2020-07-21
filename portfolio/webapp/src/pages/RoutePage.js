import Box from './Box';
import React from 'react';
import Stop from './Stop';
import Map from './Map';

import './RoutePage.scss';

export default function RoutePage() {
  return (
    <>
    <h1>Route Page</h1>
    <div className = "RoutePage">
      <div id="map"><Map/></div>
      <div id="schedule-box">
        <Box title="Schedule">
          <div><Stop name="Stop 1" /></div>
          <div><Stop name="Stop 2" /></div>
          <div><Stop name="Stop 3" /></div>
        </Box>
      </div>
      <div id="rec-box">
        <Box title="Recommendations">
            <div><Stop name="Central Park" /></div>
            <div><Stop name="MOMA" /></div>
            <div><Stop name="Times Square" /></div>
        </Box>
      </div>
    </div>
    </>
  );
}
