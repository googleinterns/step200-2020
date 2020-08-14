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
  private ArrayList<String> route;

  /**
   * Constructor to make an instance of Trip.
   *
   * @param keyString string representation of Key for this entity
   * @param start plain text of origin for this trip
   * @param destinations list of destinations for this trip as plain text
   * @param interests list of interests for this trip as plain text
   * @param route list of destinations and stops for this trip as plain text
   */
  public Trip(
      String keyString,
      String start,
      Collection<String> destinations,
      Collection<String> interests,
      Collection<String> route) {
    this.keyString = keyString;
    this.start = checkNotNull(start, "start");
    checkNotNull(destinations, "destinations");
    checkNotNull(interests, "interests");
    checkNotNull(route, "route");
    this.destinations = new ArrayList<String>(destinations);
    this.interests = new ArrayList<String>(interests);
    this.route = new ArrayList<String>(route);
  }

  /* Retrieves interests for the trip as plain text. */
  public List<String> getInterests() {
    return Collections.unmodifiableList(this.interests);
  }

  /** Retrieves the route of the trip with a list of stops and destinations as plain text. */
  public List<String> getRoute() {
    return Collections.unmodifiableList(this.route);
  }

  /**
   * Sets the route of the trip with a list of stops and destinations as plain text.
   *
   * @param route list of user-selected stops and destinations
   */
  public void setRoute(Collection<String> route) {
    this.route = new ArrayList<>(route);
  }

  /**
   * Retrieves the destinations of the trip as a list with plain text containing the name of the
   * destinations.
   */
  public List<String> getDestinations() {
    return Collections.unmodifiableList(this.destinations);
  }

  /** Retrieves the converted string version of the key to reference this Trip in datastore. */
  public String getKeyString() {
    return this.keyString;
  }

  /* Retrieves the starting point of the trip as plain text. */
  public String getStart() {
    return this.start;
  }

  /**
   * Converts the saved string representation of the Key back into a Key type to reference in
   * datastore.
   */
  public Key getKey() {
    return KeyFactory.stringToKey(keyString);
  }

  /**
   * Creates a Trip instance from the entity passed in. Checks for valid properties of the entity to
   * make a valid Trip instance.
   *
   * @param tripEntity entity from datastore
   * @return Trip object of the Trip class
   */
  public static Trip fromEntity(Entity tripEntity) {
    checkNotNull(tripEntity, "tripEntity");
    checkArgument(
        tripEntity.getKind().equals(DATASTORE_ENTITY_KIND),
        "Wrong Entity kind. Expected %s, received %s",
        DATASTORE_ENTITY_KIND,
        tripEntity.getKind());
    String keyString =
        checkNotNull(
            KeyFactory.keyToString(tripEntity.getKey()),
            "Trip entity does not contain a key string");
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

  /**
   * Creates a Trip entity based on the Trip class attributes
   *
   * @return tripEntity entity from datastore
   */
  public Entity toEntity() {
    Entity tripEntity = new Entity(this.getKey());
    tripEntity.setProperty("start", this.start);
    tripEntity.setProperty("destinations", this.destinations);
    tripEntity.setProperty("interests", this.interests);
    tripEntity.setProperty("route", this.route);
    return tripEntity;
  }
}
