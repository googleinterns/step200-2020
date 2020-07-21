import Box from './Box';
import React from 'react';
import Rec from './Rec';
import Map from './Map';
import Stop from './Stop';
import TravelTime from './TravelTime';

import './RoutePage.scss';

class RoutePage extends React.Component{
  constructor(props) {
    super(props);
    this.state = {stop: "?"};
  }

  addToSched = () =>{
    console.log("changing state");
    this.setState({mystate: "ur mom's house"});
  };
 // {this.addToSched("Central Park")}
  render(){  
  return (
    <>
    <h1>Route Page</h1>
    <div className = "RoutePage">
      <div id="map"><Map/></div>
      <div id="schedule-box">
        <Box title="Schedule">
          <div><Stop name={this.state.stop} travel="1 hr 30 mins" /></div>
          <div><Stop name="Stop 2" spent="20 mins" travel="46 mins"/></div>
          <div><Stop name="Stop 3" spent="1h 10 mins" /></div>
        </Box>
        <TravelTime time="1 hr 30 mins"/>
      </div>
      <div id="rec-box">
        <Box title="Recommendations">
            <div><Rec name="Central Park" toAdd={this.addToSched}/></div>
            <div><Rec name="MOMA" /></div>
            <div><Rec name="Times Square" /></div>
        </Box>
      </div>
    </div>
    </>
  );
  }
}
export default RoutePage;