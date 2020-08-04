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

if(document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', loadContent);
} else {
  loadContent();
}

/**
 * Loads the content of the page by loading buttons
 * and the form tracking buttons selected.
 */
function loadContent() {
  loadButtons();
  loadForm();
}

/**
 * Sets properties to the interest form on the html
 * page. Handles submit event to keep user on the
 * same page and send information.
 */
function loadForm() {
  let interestsForm = document.getElementById('interests-form');
  interestsForm.addEventListener('submit', () => {
    let interestsAsJSONString = JSON.stringify(Array.from(interestsChosen));
    let params = new URLSearchParams();
    params.append("interests", interestsAsJSONString);
    fetch('/api/places', {method: 'POST', body: params});
  })
}

let interestsChosen = new Set();

/** 
 * Track the interests chosen in an array according to their current
 * status. Toggle their status afterwards.
 * @param {Element elem} tracks the current button element chosen.
 */
function updateStatus(place, elem) {
  if(interestsChosen.has(place)) {
    interestsChosen.delete(place);
    elem.classList.remove('active');
  } else {
    interestsChosen.add(place);
    elem.classList.add('active');
  }
}

/** Display all the buttons onscreen with independent onClick events. */
function loadButtons() {
  fetch('/api/places')
  .then(response => response.json())
  .then((places) => {
    let buttonSection = document.getElementById("interests-section");
    places.forEach((place) => {
      let button = createButtonForPlace(place);
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
function createButtonForPlace(place) {
  let button = document.createElement("button");
  button.innerText = place;
  button.addEventListener('click', () => updateStatus(place, button));
  button.className = "btn";
  return button;
}
