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
 * A class to make a User type, containing an optional 
 * email String and a list of trip IDs the user can have. 
 * Users that are not logged in can only have one trip ID.
 */
public final class User{

  private String email;
  private ArrayList<long> tripIds;

  public User(long tripId) {
    ArrayList<long> singleTrip = new ArrayList<>();
    singleTrip.add(tripId);
    this.email = "";
    this.tripIds = singleTrip;
  }

  public User(String email, ArrayList<long> tripIds) {
    this.email = email;
    this.tripIds = tripIds;
  }

  public User(String email) {
    this.email = email;
    this.tripIds = new ArrayList<>();
  }

  public Trip(long id, ArrayList<String> destinations,
              ArrayList<String> interests, ArrayList<String> route) {
    configureTrip(id, destinations, interests, route);
  }

  public ArrayList<String> getEmail() {
      return this.email;
  }

  public ArrayList<String> getTripIds() {
      return this.tripIds;
  }
} 