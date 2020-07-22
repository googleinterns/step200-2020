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

var selected = [];

/**
 * Adds a random greeting to the page.
 */
function addRandomGreeting() {
  const greetings =
      ['Hello world!', '¡Hola Mundo!', '你好，世界！', 'Bonjour le monde!'];

  // Pick a random greeting.
  const greeting = greetings[Math.floor(Math.random() * greetings.length)];

  // Add it to the page.
  const greetingContainer = document.getElementById('greeting-container');
  greetingContainer.innerText = greeting;
}

/** Track the selected interests in an array according to their status. */
function checkStatus(elem) {
    if(elem.className === "btnActive") {
        selected.push(elem.innerText);
    } else {
        selected = selected.filter(function(interest) {
            return interest !== elem.innerText;
        });
    }
}

/** Update the class of the buttons to change their style. */
function switchStatus(elem) {
    var switchClass = (elem.className === "btn"? "btnActive": "btn");
    elem.className = switchClass;
    checkStatus(elem);
}

/** Display all the buttons onscreen with independent onClick events. */
function loadButtons() {
    var buttonSection = document.getElementById("interests");
    var data = ["leo", "oel", "greg", "larry", "bob"];
    for(var i = 0; i < 5; i++) {
        var button = document.createElement("button");
        button.innerHTML = data[i];
        button.setAttribute("onClick", "switchStatus(this)");
        button.setAttribute("class", "btn");
        buttonSection.appendChild(button);
    }
}
