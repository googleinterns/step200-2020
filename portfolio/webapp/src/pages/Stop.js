import React from 'react';

import './Stop.scss';

class Stop extends React.Component{
  // add state w title field
  render() {
      return(
        <div className = "Stop">
          <div className = "stop-outline">
            <div id = "name">
              <h4>Central Park</h4>
            </div>
          </div>
        </div>
      )
  }
  

}

export default Stop;