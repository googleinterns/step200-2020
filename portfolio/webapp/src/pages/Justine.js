import React from 'react';

import './Justine.scss';
import Comment from './Comment';
import CommentForm from './CommentForm'

// export default function Justine() {
class Justine extends React.Component{
  render(){
  return (
     <>
     <div class = "Justine">
      <h1>hi im Justine</h1>
      <div class = "content">
      <h2 class="center">About</h2>
      <p>Welcome to my portfolio!</p>
      <p>My name is Justine and I am an incoming third year student in Software Engineering. 
          I study at the University of Alberta, in my hometown of Edmonton, Canada. Technically it's my
          secondary hometown as I am originally from Manila, Philippines and my family immigrated to Canada 
          when I was 8 years old. I have dabbled in many areas of CS but I really enjoy web dev and Java dev. 
          Currently I am a STEP intern at Google, and I am excited to learn more about Javascript and web dev in general. 
          Other areas of interest are machine learning and computer vision. </p>
      <p>In my free time I like to relax by playing acoustic guitar and playing Overcooked! and CS:GO with my friends. 
          In pre-Corona times I also liked trying new restaurants in my city with friends.
          A fun fact about myself is that I can play five instruments: piano, guitar, tenor saxophone, ukulele, and harmonica.
           But I can't play the last 3 very well. Other things I'm interested in are
          trivia (I played on my high school's team and I'd love to be on Jeopardy! someday), makeup, and cooking.
      </p>
      
      <Comment />
      <CommentForm />
      </div>
      </div>
      
      
      
    </>
  );}
}
export default Justine;