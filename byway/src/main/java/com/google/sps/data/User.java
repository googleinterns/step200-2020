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
import java.util.Collection;
import static com.google.common.base.Preconditions.checkNotNull;

/**
 * A class to make a User type, containing an optional 
 * email String and a list of trip IDs the user can have. 
 * Users that are not logged in can only have one trip ID.
 */
public final class User {

  private String email;
  private String userId;
  private ArrayList<String> tripIds;

  public User(String email, String userId, Collection<String> tripIds) {
    this.email = checkNotNull(email, "email");
    this.userId = checkNotNull(userId, "userId");
    Collection<String> validTripIds = checkNotNull(tripIds, "tripIds");
    this.tripIds = new ArrayList<>(validTripIds);
  }

  public String getEmail() {
    return this.email;
  }

  public ArrayList<String> getTripIds() {
    return new ArrayList<String>(this.tripIds);
  }

  public String getUserId() {
    return this.userId;
  }
} 