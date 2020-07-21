import React from 'react';

import './Stop.scss';

class Rec extends React.Component{
  constructor(props){
    super(props);
  }
  render() {
      return(
        <div className = "column Stop">
        <div class="row">
          <div class = "stop-outline">
            <h4>{this.props.name}</h4>
          </div>
          <div class= "time-spent">
            <h4>{this.props.spent}</h4>
          </div>
        </div>
        <div class="row">
          <div class = "line"></div>
          <div class= "time-travel">
            <h4>{this.props.travel}</h4>
          </div>
        </div>
        
        </div>
      )
  }
}

export default Rec;