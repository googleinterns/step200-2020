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

package com.google.maps;

import com.google.appengine.api.datastore.DatastoreService;
import com.google.appengine.api.datastore.DatastoreServiceConfig;
import com.google.appengine.api.datastore.DatastoreServiceFactory;
import com.google.common.collect.ImmutableSet;
import com.google.common.collect.Sets;
import com.google.gson.Gson;
import com.google.gson.reflect.TypeToken;
import com.google.maps.model.PlaceType;
import com.google.sps.data.Trip;
import java.io.IOException;
import java.lang.reflect.Type;
import java.util.ArrayList;
import java.util.Collections;
import javax.servlet.annotation.WebServlet;
import javax.servlet.http.HttpServlet;
import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;

/**
 * Servlet that returns all PlaceTypes from Places API. Stores which placeTypes, or interests, user
 * selects in datastore with their specific Trip Entity.
 */
@WebServlet("/api/places")
public final class PlacesServlet extends HttpServlet {

  /** {@link Type} of an {@link ArrayList} containing {@link String}, for gson decoding. */
  private static final Type ARRAYLIST_STRING = new TypeToken<ArrayList<String>>() {}.getType();

  /**
   * Immutable set of the PlaceType enumerator values containing interests. Labelled as non
   * interests to filter from other interests contained in the Places API.
   */
  private static final ImmutableSet<PlaceType> NON_INTERESTS_FROM_PLACETYPES =
      Sets.immutableEnumSet(
          PlaceType.ACCOUNTING,
          PlaceType.CEMETERY,
          PlaceType.COURTHOUSE,
          PlaceType.DENTIST,
          PlaceType.ELECTRICIAN,
          PlaceType.ELECTRONICS_STORE,
          PlaceType.FIRE_STATION,
          PlaceType.FUNERAL_HOME,
          PlaceType.HARDWARE_STORE,
          PlaceType.HOME_GOODS_STORE,
          PlaceType.INSURANCE_AGENCY,
          PlaceType.HOSPITAL,
          PlaceType.LAWYER,
          PlaceType.LOCKSMITH,
          PlaceType.MOVING_COMPANY,
          PlaceType.PAINTER,
          PlaceType.PHYSIOTHERAPIST,
          PlaceType.PLUMBER,
          PlaceType.POLICE,
          PlaceType.PRIMARY_SCHOOL,
          PlaceType.REAL_ESTATE_AGENCY,
          PlaceType.ROOFING_CONTRACTOR,
          PlaceType.SECONDARY_SCHOOL,
          PlaceType.STORAGE,
          PlaceType.TAXI_STAND);

  // Formatted to be space delimited with a capital first letter.
  private static final ImmutableSet<String> CUSTOM_INTERESTS =
      ImmutableSet.of("Animals", "Beach", "Lake", "Fashion", "Nature", "Night life");

  private final Gson gson = new Gson();
  private final DatastoreService datastore = DatastoreServiceFactory.getDatastoreService();

  /* Distinguishes null values from empty lists in DatastoreService. */
  @Override
  public void init() {
    System.setProperty(
        DatastoreServiceConfig.DATASTORE_EMPTY_LIST_SUPPORT, Boolean.TRUE.toString());
  }

  @Override
  public void doGet(HttpServletRequest request, HttpServletResponse response) throws IOException {
    ArrayList<String> places = new ArrayList<String>();
    for (PlaceType location : PlaceType.values()) {
      if (!NON_INTERESTS_FROM_PLACETYPES.contains(location)) {
        String place = formatPlace(location.toString());
        places.add(place);
      }
    }
    places.addAll(CUSTOM_INTERESTS);
    Collections.sort(places);
    response.setContentType("application/json;");
    response.getWriter().println(gson.toJson(places));
  }

  /**
   * Format string by capitalizing and adding spaces in-between words.
   *
   * @param place indicates a type of location/interest.
   * @return the modified location name.
   */
  private String formatPlace(String place) {
    place = place.substring(0, 1).toUpperCase() + place.substring(1);
    place = place.replace('_', ' ');
    return place;
  }

  @Override
  public void doPost(HttpServletRequest request, HttpServletResponse response) throws IOException {
    String tripKeyString = request.getParameter("tripKey");
    ArrayList<String> interests = gson.fromJson(request.getReader(), ARRAYLIST_STRING);
    Trip trip = Trip.getTrip(datastore, tripKeyString);
    if (trip == null) {
      response.setStatus(response.SC_NOT_FOUND);
      return;
    }
    trip.setInterests(interests);
    datastore.put(trip.toEntity());
  }
}
