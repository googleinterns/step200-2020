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

/* global getTripKeyFromUrl, configureTripKeyForNextPage */

let interestsChosen = new Set();
let tripKey;

if(document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', loadContent);
} else {
  loadContent();
}

/**
 * Loads the content of the page by loading the trip
 * key of the user and the buttons with interests
 * they can select.
 */
function loadContent() {
  configureTripKey();
  loadButtonsWithInterests();
}

/* Gets the trip key from the url and sets it for the next page. */
function configureTripKey() {
  tripKey = getTripKeyFromUrl();
  configureTripKeyForNextPage(tripKey, "/generator.html");
}

/** 
 * Check if a button's value is stored in the set interestsChosen.
 * Remove from the set and remove the active class if the interest
 * was previously chosen and add if the interest was not included.
 * @param {String} place text value of the button's interest
 * @param {Element} elem tracks the current button element chosen.
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

/**
 * Display all the buttons onscreen with independent onClick events.
 * Load interest values through a fetch request.
 */
function loadButtonsWithInterests() {
  setProgressBar(2);
  fetchPlaces(tripKey)
  .then((places) => {
    let buttonSection = document.getElementById("interests-section");
    places.forEach((place) => {
      let button = createButtonForPlace(place);
      buttonSection.appendChild(button);
    });
  });
}

/**
 * Creates a button element that contains the text of an
 * interest. When clicked, it updates the active status to indicate
 * if it is currently selected or not.
 * @param {String} place text value of the button's interest
 * @returns ButtonElement
 */
function createButtonForPlace(place) {
  let button = document.createElement("button");
  button.innerText = place;
  button.addEventListener('click', () => {
      updateStatus(place, button);
      fetchPlaces(tripKey, interestsChosen);
  });
  button.className = "interestBtn";
  return button;
}

/**
 * Gets all potential interests from server to load or sets the user's
 * specific interests for their trip with tripKey. userInterests
 * may be any type that is convertible to an array via Array.from. It will
 * be sent to the server as JSON in the post body.
 * @param {String} tripKey value for tripKey
 * @param {Array} [userInterests] interests selected by user
 */
function fetchPlaces(tripKey, /* optional */ userInterests) {
  const url = '/api/places?' + new URLSearchParams({tripKey}).toString();
  if(userInterests === undefined) {
      return fetch(url).then(response => response.json());
  }
  return fetch(url, {method: 'POST', body: JSON.stringify(Array.from(userInterests))});
}
