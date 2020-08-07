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
import com.google.appengine.api.datastore.DatastoreServiceFactory;
import com.google.appengine.api.datastore.Entity;
import com.google.appengine.api.datastore.EntityNotFoundException;
import com.google.appengine.api.datastore.Key;
import com.google.appengine.api.datastore.KeyFactory;
import com.google.gson.Gson;
import com.google.gson.reflect.TypeToken;
import com.google.maps.model.PlaceType;
import java.io.IOException;
import java.lang.reflect.Type;
import java.util.ArrayList;
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

  private final Gson gson = new Gson();
  private final DatastoreService datastore = DatastoreServiceFactory.getDatastoreService();

  @Override
  public void doGet(HttpServletRequest request, HttpServletResponse response) throws IOException {
    ArrayList<String> places = new ArrayList<>();
    for (PlaceType location : PlaceType.values()) {
      String place = formatLocation(location);
      places.add(place);
    }
    response.setContentType("application/json;");
    response.getWriter().println(gson.toJson(places));
  }

  /**
   * Format string by capitalizing and adding spaces in-between words.
   *
   * @param location is a PlaceType that indicates a type of location/interest.
   * @return is the modified location name.
   */
  private String formatLocation(PlaceType location) {
    String place = location.toString();
    place = place.substring(0, 1).toUpperCase() + place.substring(1);
    place = place.replace('_', ' ');
    return place;
  }

  @Override
  public void doPost(HttpServletRequest request, HttpServletResponse response) throws IOException {
    String tripKeyString = request.getParameter("tripId");
    Key tripKey = KeyFactory.stringToKey(tripKeyString);
    ArrayList<String> interests = gson.fromJson(request.getReader(), ARRAYLIST_STRING);
    Entity trip;
    try {
      trip = datastore.get(tripKey);
      trip.setProperty("interests", interests);
      datastore.put(trip);
      response.setContentType("application/json;");
      response.getWriter().println("{\"results\": \"success\"}");
    } catch (EntityNotFoundException e) {
      // thrown automatically
    }
  }
}
