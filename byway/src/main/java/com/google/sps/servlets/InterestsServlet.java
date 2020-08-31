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
import com.google.gson.Gson;
import com.google.gson.reflect.TypeToken;
import com.google.sps.data.Trip;
import java.io.IOException;
import java.lang.reflect.Type;
import java.util.ArrayList;
import javax.servlet.annotation.WebServlet;
import javax.servlet.http.HttpServlet;
import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;

/**
 * Servlet that stores which interests the user selected for their trip in datastore. Also updates
 * the interests in POST requests.
 */
@WebServlet("/api/interests")
public final class InterestsServlet extends HttpServlet {

  /** {@link Type} of an {@link ArrayList} containing {@link String}, for gson decoding. */
  private static final Type ARRAYLIST_STRING = new TypeToken<ArrayList<String>>() {}.getType();

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
    String keyAsString = request.getParameter("tripKey");
    Trip trip = Trip.getTrip(datastore, keyAsString);
    if (trip == null) {
      response.setStatus(HttpServletResponse.SC_NOT_FOUND);
      return;
    }
    response.setContentType("application/json");
    response.getWriter().println(gson.toJson(trip.getInterests()));
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
    response.setStatus(response.SC_NO_CONTENT);
  }
}
