// Copyright 2019 Google LLC
//
// Licensed under the Apache License, Version 2.0 (the "License");
// you may not use this file except in compliance with the License.
// You may obtain a copy of the License at
//
//     https://www.apache.org/licenses/LICENSE-2.0
//
// Unless required by applicable law or agreed to in writing, software
// distributed under the License is distributed on an "AS IS" BASIS,
// WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
// See the License for the specific language governing permissions and
// limitations under the License.

document.addEventListener('DOMContentLoaded', loadButtons());

let selected = [];

/** Convert selected array into JSON to send to server. */
function passData() {
  var data = document.getElementById("data");
  data.value = JSON.stringify(selected);
}

/** 
 * Track the selected interests in an array according to their status. 
 * @param {Element elem} tracks the current button element chosen.
 */
function checkStatus(elem) {
  if(elem.className.includes("active")) {
    selected.push(elem.innerText);
  } else {
    selected = selected.filter(function(interest) {
      return interest !== elem.innerText;
    });
  }
}

/** 
 * Update the class of the buttons to change their style.
 * @param {Element elem} tracks the current button element chosen.
 */
function switchStatus(elem) {
  let switchClass = (elem.className.includes("active")? "btn": "btn active");
  elem.className = switchClass;
  checkStatus(elem);
}

/** Display all the buttons onscreen with independent onClick events. */
function loadButtons() {
  fetch('/api/places')
  .then(response => response.json())
  .then((places) => {
    let buttonSection = document.getElementById("interests");
    places.forEach((place) => {
      let button = setButton(place);
      buttonSection.appendChild(button);
    });
  });
}

/**
 * Creates a button element that contains the place of
 * interest. When clicked, it switches status and indicates
 * to the user if selected or deselected.
 * @param {String place} contains the text of place of interest.
 * @returns ButtonElement
 */
function setButton(place) {
  let button = document.createElement("button");
  button.innerText = place;
  button.addEventListener('click', function(e) {
    switchStatus(e.target);
  });
  button.className = "btn";
  return button;
}
