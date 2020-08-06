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
import static com.google.common.base.Preconditions.checkArgument;
import static com.google.common.base.Preconditions.checkNotNull;
import java.util.Collection;
import java.util.Collections;
import java.util.ArrayList;

/**
 * A class to make a Trip type, containing
 * a specific id, destinations, interests and routes 
 * to be used when updating a trip.
 */
public final class Trip {

  public static final String DATASTORE_ENTITY_KIND = "Trip";

  private final String id;
  private final String start;
  private final ArrayList<String> destinations;
  private final ArrayList<String> interests;
  private final ArrayList<String> route;

  public Trip(String id, String start, Collection<String> destinations,
              Collection<String> interests, Collection<String> route) {
    this.id = checkNotNull(id, "id");
    this.start = checkNotNull(start, "start");
    Collection<String> validDestinations = checkNotNull(destinations, "destinations");
    Collection<String> validInterests = checkNotNull(interests, "interests");
    Collection<String> validRoute = checkNotNull(route, "route");
    this.destinations = new ArrayList<String>(validDestinations);
    this.interests = new ArrayList<String>(validInterests);
    this.route = new ArrayList<String>(validRoute);
  }

  public ArrayList<String> getInterests() {
    return (ArrayList<String>) Collections.unmodifiableList(this.interests);
  }

  public ArrayList<String> getRoute() {
    return (ArrayList<String>) Collections.unmodifiableList(this.route);
  }

  public ArrayList<String> getDestinations() {
    return (ArrayList<String>) Collections.unmodifiableList(this.destinations);
  }

  public String getTripId() {
    return this.id;
  }

  public String getStart() {
    return this.start;
  }

  public static Trip FromEntity(Entity tripEntity) {
    checkArgument(tripEntity.getKind().equals(DATASTORE_ENTITY_KIND),
      "Wrong Entity kind. Expected %s, received %s", DATASTORE_ENTITY_KIND, tripEntity.getKind());
    String id = checkNotNull((String) tripEntity.getProperty("id"),
      "Trip entity does not contain an id");
    String start = checkNotNull((String) tripEntity.getProperty("start"),
      "Trip entity does not contain a start");
    ArrayList<String> destinations =
      checkNotNull((ArrayList<String>) tripEntity.getProperty("destinations"),
        "Trip entity does not contain destinations");
    ArrayList<String> interests =
      checkNotNull((ArrayList<String>) tripEntity.getProperty("interests"),
        "Trip entity does not contain interests");
    ArrayList<String> route =
      checkNotNull((ArrayList<String>) tripEntity.getProperty("route"),
        "Trip entity does not contain route");
    return new Trip(id, start, destinations, interests, route);
  }
} 