import React from 'react';

import './TravelTime.scss';

class TravelTime extends React.Component{
 
  render() {
      return(
        <div className = "TravelTime">
          <div className = "time-outline">
            <div className = "title">
              <p>Estimated Travel Time:</p>
            </div>
            <div className= "time-field">
              <p>{this.props.time}</p>
            </div>
          </div>
        </div>
      )
  }
}

export default TravelTime;