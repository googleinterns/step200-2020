import React from 'react';

import './Stop.scss';

class Stop extends React.Component{
  constructor(props){
    super(props);
  }
  render() {
      return(
        <div className = "Stop">
          <div className = "stop-outline">
            <div id = "name">
              <h4>{this.props.name}</h4>
            </div>
          </div>
        </div>
      )
  }
  

}

export default Stop;