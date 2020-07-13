import React from 'react';


class Comment extends React.Component{
  constructor() {
    super()
    this.state = { comments: [] }
  }

  componentDidMount(){
      fetch('/data')
      .then(response => response.json())
      .then((comments) => {
         this.setState({comments:comments});

      });
    }

  render() {
      return(
          <div>
            <ul>
              {this.state.comments.map((comment,i) =>
                <li key={i}>{comment}</li>
              )}
            </ul>
          </div>
      )
  }
  

}

export default Comment;