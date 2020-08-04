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

import java.util.ArrayList;

/**
 * A class to make a Trip type, containing
 * a specific id, destinations, interests and routes 
 * to be used when updating a trip.
 */
public final class Trip {

  private String id;
  private String start;
  private ArrayList<String> destinations;
  private ArrayList<String> interests;
  private ArrayList<String> route;

  public Trip(String id, String start, ArrayList<String> destinations,
              ArrayList<String> interests, ArrayList<String> route) {
    this.id = id;
    this.start = start;
    this.destinations = destinations;
    this.interests = interests;
    this.route = route;
  }

  public ArrayList<String> getInterests() {
      return this.interests;
  }

  public ArrayList<String> getRoute() {
      return this.route;
  }

  public ArrayList<String> getDestinations() {
    return this.destinations;
  }

  public String getTripId() {
      return this.id;
  }

  public String getStart() {
      return this.start;
  }
} 