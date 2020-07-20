import React from 'react';


import './Box.scss';
class Box extends React.Component{
  // add state w title field
  render() {
      return(
        <div className = "Box">
          <div className = "box-outline">
            <div id = "title">
              <h3>Recommendations</h3>
            </div>
          </div>
        </div>
      )
  }
  

}

export default Box;