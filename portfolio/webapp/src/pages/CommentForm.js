import React from 'react';
import { Redirect } from 'react-router-dom';

class CommentForm extends React.Component{
  constructor() {
    super()
    this.state = {messageToUser: "please enter a comment", comment:""}
    this.handleChange = this.handleChange.bind(this);
    this.handleSubmit = this.handleSubmit.bind(this);
  }
  handleChange(event){
      this.setState({comment:event.target.value});
  }

  handleSubmit(event){
    event.preventDefault();
    this.setState({messageToUser:"thanks for posting!"});
    alert("submit following comment:" + this.state.comment);
    
    // params.append("text",this.state.comment);
    let params = {text:this.state.comment}
    fetch('/data', {method: 'POST', body:JSON.stringify(params)})
    .then(this.handleChange());
  }

  render() {
    
    return(
      <div class="content">
        <p>{this.state.messageToUser}</p>
        <form onSubmit = {this.handleSubmit}>
          <p class="center">Leave Justine a comment:</p>
            <input class="center" id="textbox" name="text" value={this.state.comment} type="text" onChange={this.handleChange}/>
            <div class="center">
              <input class="commentbtn btn btn-sm btn-outline-primary" type="submit" />
            </div>
        </form> 
       </div>
      )
    
  }
  

}

export default CommentForm;