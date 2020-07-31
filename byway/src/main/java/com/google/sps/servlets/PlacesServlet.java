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
import com.google.appengine.api.datastore.PreparedQuery;
import com.google.appengine.api.datastore.PreparedQuery.TooManyResultsException;
import com.google.appengine.api.datastore.Query;
import com.google.appengine.api.datastore.Query.FilterPredicate;
import com.google.appengine.api.datastore.Query.FilterOperator;
import com.google.maps.model.LatLng;
import com.google.maps.model.PlaceType;
import com.google.gson.Gson;
import java.io.IOException;
import java.util.ArrayList;
import javax.servlet.annotation.WebServlet;
import javax.servlet.http.HttpServlet;
import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;

/**
 * Servlet that handles loading all placeTypes from Places API
 * and stores the interests a specified user selects within datastore.
 */
@WebServlet("/api/places")
public final class PlacesServlet extends HttpServlet {

  private final Gson gson = new Gson();

  @Override
  public void doGet(HttpServletRequest request, HttpServletResponse response) throws IOException {
    ArrayList<String> places = new ArrayList<>();
    for(PlaceType location: PlaceType.values()) {
      String place = formatLocation(location);
      places.add(place);
    }
    response.setContentType("application/json;");
    response.getWriter().println(gson.toJson(places));
  }

  /** 
   * Format string by capitalizing and adding spaces in-between words.
   * @param location is a PlaceType that indicates a type of location/interest.
   * @return is the modified location name.
   */
  private String formatLocation(PlaceType location) {
    String place = location.toString();
    place = place.substring(0,1).toUpperCase() + place.substring(1);
    place = place.replace('_', ' ');
    return place;
  }

  /**
   * Temporary setup to find entity with hard-coded id value. Set their interests.
   */
  @Override
  public void doPost(HttpServletRequest request, HttpServletResponse response) throws IOException {
    DatastoreService datastore = DatastoreServiceFactory.getDatastoreService();
    Query person =
      new Query("user")
        .setFilter(new FilterPredicate("id", FilterOperator.EQUAL, 2452));
    PreparedQuery pq = datastore.prepare(person);
    Entity userEntity;
    try {
      userEntity = pq.asSingleEntity();
      String interestsAsString = request.getParameter("data");
      addInterestsForUser(interestsAsString, userEntity, datastore);
    } catch(TooManyResultsException e) {
      // TODO: Handle both TooManyResultsException and EntityNotFoundException
    }
  }

  /**
   * Creates a list of interests from the JSON string passed in and adds it
   * to this user's Entity object as a separate property.
   * @param interestsAsString JSON String containing interests.
   * @param currentUser       Entity with user information.
   * @param datastore         DatastoreService with all users.
   */
  private void addInterestsForUser(String interestsAsString, Entity currentUser,
                                    DatastoreService datastore) throws IOException {

    ArrayList<String> interests = gson.fromJson(interestsAsString, ArrayList.class);
    currentUser.setProperty("interests", interests);
    datastore.put(currentUser);
  }
}
