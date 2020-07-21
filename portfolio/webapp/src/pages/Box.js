import React from 'react';


import './Box.scss';
class Box extends React.Component{
  // add state w title field
  render() {
      return(
        <div className = "Box">
          <div className = "box-outline">
            <div id = "title">
              <h3>{this.props.title}</h3>
            </div>
            <div>{this.props.children}</div>
          </div>
        </div>
      )
  }
  

}

export default Box;