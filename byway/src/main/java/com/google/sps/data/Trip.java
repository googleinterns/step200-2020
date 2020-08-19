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

import com.google.appengine.api.datastore.DatastoreService;
import com.google.appengine.api.datastore.Entity;
import com.google.appengine.api.datastore.EntityNotFoundException;
import com.google.appengine.api.datastore.Key;
import com.google.appengine.api.datastore.KeyFactory;
import com.google.common.flogger.FluentLogger;
import java.util.ArrayList;
import java.util.Collection;
import java.util.Collections;
import java.util.List;

/**
 * A class to make a Trip type, containing a specific id, destinations, interests and routes to be
 * used when updating a trip.
 */
public final class Trip {
  private static final FluentLogger logger = FluentLogger.forEnclosingClass();
  public static final String DATASTORE_ENTITY_KIND = "Trip";

  private final String keyString;
  private String start;
  private final ArrayList<String> destinations;
  private final ArrayList<String> interests;
  private final ArrayList<String> route;

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

  /**
   * Set the interests for the trip as plain text with the Collection passed in.
   *
   * @param interests collection of Strings indicating a user interest
   */
  public void setInterests(Collection<String> interests) {
    this.interests.clear();
    this.interests.addAll(interests);
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
    this.route.clear();
    this.route.addAll(route);
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

  /* Sets the starting point of the trip as plain text. */
  public void setStart(String start) {
    this.start = start;
  }

  /* Adds a destination point of the trip as plain text. */
  public void addDestination(String destination) {
    destinations.add(destination);
  }

  /**
   * Creates an entity using the properties from the Trip class instance.
   *
   * @return tripEntity entity with propoerties set from this Trip instance to be put into the
   *     datastore
   */
  public Entity toEntity() {
    Entity tripEntity = new Entity(this.getKey());
    tripEntity.setProperty("start", this.start);
    tripEntity.setProperty("destinations", this.destinations);
    tripEntity.setProperty("interests", this.interests);
    tripEntity.setProperty("route", this.route);
    return tripEntity;
  }

  /**
   * Creates a Trip instance from the entity passed in. Checks for valid properties of the entity to
   * make a valid Trip instance.
   *
   * @param tripEntity entity from datastore
<<<<<<< HEAD
   * @return Trip object of the Trip class
=======
   * @return Trip object of with properties copied from provided entity
>>>>>>> master
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

  /** Adds new Trip entity with empty properties */
  public static Trip createTrip(DatastoreService datastore) {
    Entity tripEntity = new Entity(DATASTORE_ENTITY_KIND);
    tripEntity.setProperty("start", "");
    tripEntity.setProperty("destinations", new ArrayList<String>());
    tripEntity.setProperty("interests", new ArrayList<String>());
    tripEntity.setProperty("route", new ArrayList<String>());
    datastore.put(tripEntity);
    return fromEntity(tripEntity);
  }

  /**
   * Converts the tripKeyString passed in into a Key tripKey and searches for an entity with this
   * key. If found, convert the entity into a Trip type or return null if not found.
   *
   * @param datastore DatastoreService database
   * @param tripKeyString String convertible to a Key for access to a specific entity in datastore.
   * @return Trip type with information retrieved from the entity, or null.
   */
  public static Trip getTrip(DatastoreService datastore, String tripKeyString) {
    Key tripKey;
    try {
      tripKey = KeyFactory.stringToKey(tripKeyString);
    } catch (IllegalArgumentException e) {
      logger.atInfo().withCause(e).log("String cannot be parsed: %s", tripKeyString);
      return null;
    }

    try {
      Entity tripEntity = datastore.get(tripKey);
      return fromEntity(tripEntity);
    } catch (EntityNotFoundException e) {
      logger.atInfo().withCause(e).log("Trip Entity not found : %s", tripKey);
      return null;
    }
  }
}
