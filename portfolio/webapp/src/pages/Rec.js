import React from 'react';

import './Rec.scss';

class Rec extends React.Component{
  constructor(props){
    super(props);
  }
  render() {
      return(
        <div class= "Rec">
          <button className = "rec-outline" onclick={this.props.toAdd}>
            <h4>{this.props.name}</h4>
          </button>
        </div>
      )
  }
  

}

export default Rec;