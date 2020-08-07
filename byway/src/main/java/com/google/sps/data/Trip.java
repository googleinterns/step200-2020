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

import static com.google.common.base.Preconditions.checkArgument;
import static com.google.common.base.Preconditions.checkNotNull;

import com.google.appengine.api.datastore.Entity;
import com.google.appengine.api.datastore.Key;
import com.google.appengine.api.datastore.KeyFactory;
import java.util.ArrayList;
import java.util.Collection;
import java.util.Collections;
import java.util.List;

/**
 * A class to make a Trip type, containing a specific id, destinations, interests and routes to be
 * used when updating a trip.
 */
public final class Trip {

  public static final String DATASTORE_ENTITY_KIND = "Trip";

  private final String keyString;
  private final String start;
  private final ArrayList<String> destinations;
  private final ArrayList<String> interests;
  private final ArrayList<String> route;

  public Trip(
      String keyString,
      String start,
      Collection<String> destinations,
      Collection<String> interests,
      Collection<String> route) {
    this.keyString = checkNotNull(keyString, "keyString");
    this.start = checkNotNull(start, "start");
    checkNotNull(destinations, "destinations");
    checkNotNull(interests, "interests");
    checkNotNull(route, "route");
    this.destinations = new ArrayList<String>(destinations);
    this.interests = new ArrayList<String>(interests);
    this.route = new ArrayList<String>(route);
  }

  public List<String> getInterests() {
    return Collections.unmodifiableList(this.interests);
  }

  public List<String> getRoute() {
    return Collections.unmodifiableList(this.route);
  }

  public List<String> getDestinations() {
    return Collections.unmodifiableList(this.destinations);
  }

  public String getKeyString() {
    return this.keyString;
  }

  public String getStart() {
    return this.start;
  }

  public Key getKey() {
    return KeyFactory.stringToKey(keyString);
  }

  public static Trip fromEntity(Entity tripEntity) {
    checkNotNull(tripEntity, "tripEntity");
    checkArgument(
        tripEntity.getKind().equals(DATASTORE_ENTITY_KIND),
        "Wrong Entity kind. Expected %s, received %s",
        DATASTORE_ENTITY_KIND,
        tripEntity.getKind());
    String keyString =
        checkNotNull((String) tripEntity.getProperty("keyString"), "Trip entity does not contain a key string");
    String start =
        checkNotNull(
            (String) tripEntity.getProperty("start"), "Trip entity does not contain a start");
    ArrayList<String> destinations =
        checkNotNull(
            (ArrayList<String>) tripEntity.getProperty("destinations"),
            "Trip entity does not contain destinations");
    ArrayList<String> interests =
        checkNotNull(
            (ArrayList<String>) tripEntity.getProperty("interests"),
            "Trip entity does not contain interests");
    ArrayList<String> route =
        checkNotNull(
            (ArrayList<String>) tripEntity.getProperty("route"),
            "Trip entity does not contain route");
    return new Trip(keyString, start, destinations, interests, route);
  }
}
