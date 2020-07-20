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
          <p>Comment Section:</p>
            <ul>
              {this.state.comments.map((comment,i) =>
                <li key={i}>{comment.text}</li>
              )}
            </ul>
          </div>
      )
  }
  

}

export default Comment;