import Box from './Box';
import React from 'react';
import Rec from './Rec';
import Map from './Map';
import Stop from './Stop';
import TravelTime from './TravelTime';

import './RoutePage.scss';

export default function RoutePage() {
  return (
    <>
    <h1>Route Page</h1>
    <div className = "RoutePage">
      <div id="map"><Map/></div>
      <div id="schedule-box">
        <Box title="Schedule">
          <div><Stop name="Stop 1"/></div>
          <div><Stop name="Stop 2" /></div>
          <div><Stop name="Stop 3" /></div>
        </Box>
        <TravelTime time="1 hr 30 mins"/>
      </div>
      <div id="rec-box">
        <Box title="Recommendations">
            <div><Rec name="Central Park" /></div>
            <div><Rec name="MOMA" /></div>
            <div><Rec name="Times Square" /></div>
        </Box>
      </div>
    </div>
    </>
  );
}
