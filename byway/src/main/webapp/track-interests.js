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

let interestsChosen = new Set();
let tripQuery;

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
  loadId();
  loadButtons();
  loadForm();
}

/* Parse url to retrieve the trip id. */
function loadId() {
  let params = new URLSearchParams(location.search);
  tripQuery = "tripId=" + params.get('tripId');
}

/**
 * Sets properties to the interest form on the html
 * page. Handles submit event to keep user on the
 * same page and send information.
 */
function loadForm() {
  let interestsForm = document.getElementById('interests-form');
  interestsForm.addEventListener('submit', (event) => {
    event.preventDefault();
    fetchPlaces(tripQuery, interestsChosen);
  });
}

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
  fetchPlaces(tripQuery)
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
  button.className = "interestBtn";
  return button;
}

/**
 * Gets all potential interests from server to load or sets the user's
 * specific interests for their specific trip with tripQuery. userInterests
 * may be any type that is convertible to an array via Array.from. It will
 * be sent to the server as JSON in the post body.
 */
function fetchPlaces(tripQuery, /* optional */ userInterests) {
  const url = '/api/places?' + tripQuery;
  const fetchArgs = {method: 'GET'};
  if (userInterests !== undefined) {
    fetchArgs.method = 'POST';
    fetchArgs.body = JSON.stringify(Array.from(userInterests));
  }
  return fetch(url, fetchArgs).then(response => response.json());
}
