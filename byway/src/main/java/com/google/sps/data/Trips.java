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

package com.google.sps.data;

import com.google.appengine.api.datastore.Entity;

/**
 * A class to make a Trip type, containing
 * a specific id, destinations, interests and routes 
 * to be used when updating a trip.
 */
public final class Trip{

  private long id;
  private final ArrayList<String> destinations;
  private final ArrayList<String> interests;
  private final ArrayList<String> route;

  public Trip(long id, ArrayList<String> destinations) {
    this.id = id;
    this.destinations = destinations;
    this.interests = null;
    this.route = null;
  }

  public void setInterestsFor(long id, ArrayList<String> interests){
    if(this.id == id) {
      this.interests = interests;
    } else {
      // Indicate illegal action somehow?
      return;
    }
  }

  public void setRouteFor(long id, ArrayList<String> route) {
    if(this.id == id) {
      this.route = route;
    } else {
      // Indicate illegal action somehow?
      return;
    }
  }

  public ArrayList<String> getInterests() {
      return this.interests;
  }

  public ArrayList<String> getRoute() {
      return this.route;
  }
} 