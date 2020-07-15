import React from 'react';
import { Redirect } from 'react-router-dom';

class CommentForm extends React.Component{
  constructor() {
    super()
    this.state = {redirect:false}
  }
  handleSubmit(event){
    this.setState({redirect:true});
    event.preventDefault();
  }
  render() {
    const { redirect } = this.state;

    if (redirect) {
      return <Redirect to='/justine'/>;
    }

    return(
      <div class="content">
        <form method="POST" action="/data" id = "commentSection" onSubmit = {this.handleSubmit}>
          <p class="center">Leave Justine a comment:</p>
            <input class="center" id="textbox" name="text" type="text"/>
            <div class="center">
              <input class="commentbtn btn btn-sm btn-outline-primary" type="submit"/>
            </div>
        </form> 
       </div>
      )
    
  }
  

}

export default CommentForm;