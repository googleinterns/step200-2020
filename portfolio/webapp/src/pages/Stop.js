import React from 'react';

import './Stop.scss';

class Rec extends React.Component{
  constructor(props){
    super(props);
  }
  render() {
      return(
        <div className = "Stop">
          <div className = "stop-outline">
            <h4>{this.props.name}</h4>
          </div>
        </div>
      )
  }
}

export default Rec;