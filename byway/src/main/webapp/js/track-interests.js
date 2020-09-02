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

/* global configureTripKeyForPath, getTripKeyFromUrl, setProgressBar, setupLogoutLink*/
/* exported filterInterests */

let newInterests = new Set();
let interestsSaved = new Set();
const tripKey = getTripKeyFromUrl();

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
async function loadContent() {
  let nextPage = document.getElementById("next-button");
  nextPage.href = configureTripKeyForPath(tripKey, "/routepage.html");
  await getTripInterests();
  loadButtonsWithInterests();
  setupLogoutLink();
}

/** 
 * Check if a button's value is stored in the set newInterests.
 * Remove from the set and remove the active class if the interest
 * was previously chosen and add if the interest was not included.
 * @param {String} place text value of the button's interest
 * @param {Element} elem tracks the current button element chosen.
 */
function updateStatus(place, elem) {
  if(newInterests.has(place)) {
    newInterests.delete(place);
    elem.classList.remove('active');
  } else {
    newInterests.add(place);
    elem.classList.add('active');
  }
}

/**
 * Finds the list of interests that were set for the trip.
 * If it is a new trip, no interests are listed. If the trip
 * had previously-saved interests, return them.
 * @return promise containing the list of interests
 */
function getTripInterests() {
  return fetchInterests(tripKey)
    .then((interests) => {
    for (let interest of interests) {
      interestsSaved.add(interest);
    }
  });
}

/**
 * Display all the buttons onscreen with independent onClick events.
 * Load interest values through a fetch request.
 */
function loadButtonsWithInterests() {
  setProgressBar(2);
  fetch(configureTripKeyForPath(tripKey, "/api/places"))
  .then(response => response.json())
  .then((places) => {
    let buttonSection = document.getElementById("interests-buttons");
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
      fetchInterests(tripKey, newInterests);
  });
  button.className = "interestBtn";
  if (interestsSaved.has(place)) updateStatus(place, button);
  return button;
}

/* Hide or display list of interests to match user input as a zero-indexed substring. */
function filterInterests() {
  const searchField = document.getElementById("search-interest");
  const searchValue = searchField.value.toLowerCase();
  const interestBtnsElement = document.getElementById("interests-buttons");
  let interestBtns = interestBtnsElement.getElementsByClassName("interestBtn");
  for (let i = 0; i < interestBtns.length; i++) {
    const btnValue = interestBtns[i].innerText;
    if (btnValue.toLowerCase().indexOf(searchValue) > -1) {
      interestBtns[i].style.display = "inline";
    } else {
      interestBtns[i].style.display = "none";
    }
  }
}

/**
 * Gets past interests or sets the interests through a server for a
 * specific trip using tripKey. These two requests are differentiated
 * by an optional userInterests parameter. userInterests may be any
 * type that is convertible to an array via Array.from. It will
 * be sent to the server as JSON in the post body.
 * @param {String} tripKey value for tripKey
 * @param {Array} [userInterests] interests selected by user
 */
function fetchInterests(tripKey, /* optional */ userInterests) {
  const url = configureTripKeyForPath(tripKey, "/api/interests");
  if(userInterests === undefined) {
      return fetch(url).then(response => response.json());
  }
  return fetch(url, {method: 'POST', body: JSON.stringify(Array.from(userInterests))});
}
