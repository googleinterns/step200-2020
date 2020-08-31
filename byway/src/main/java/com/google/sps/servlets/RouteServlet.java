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

package com.google.sps.servlets;

import com.google.appengine.api.datastore.DatastoreService;
import com.google.appengine.api.datastore.DatastoreServiceFactory;
import com.google.common.flogger.FluentLogger;
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

/** Servlet that handles data for the route */
@WebServlet("/api/route")
public final class RouteServlet extends HttpServlet {
  private static final Type ARRAYLIST_STRING = new TypeToken<ArrayList<String>>() {}.getType();
  private static final FluentLogger logger = FluentLogger.forEnclosingClass();

  private final Gson gson = new Gson();
  private final DatastoreService datastore = DatastoreServiceFactory.getDatastoreService();

  /* Passes saved trip object to show route in the schedule panel, start/end in request */
  @Override
  public void doGet(HttpServletRequest request, HttpServletResponse response) throws IOException {
    String keyAsString = request.getParameter("tripKey");
    Trip trip = Trip.getTrip(datastore, keyAsString);

    if (trip == null) {
      logger.atInfo().log(
          "Could not retrieve trip with key %s while trying to get the stops", keyAsString);
      response.setStatus(HttpServletResponse.SC_NOT_FOUND);
      return;
    }
    response.setContentType("application/json");
    response.getWriter().println(gson.toJson(trip));
  }

  /* Modifies the route array of Trip object */
  @Override
  public void doPost(HttpServletRequest request, HttpServletResponse response) throws IOException {
    String keyAsString = request.getParameter("tripKey");
    ArrayList<String> stops = gson.fromJson(request.getReader(), ARRAYLIST_STRING);
    Trip trip = Trip.getTrip(datastore, keyAsString);

    if (trip == null) {
      logger.atInfo().log(
          "Could not retrieve trip with key %s while trying to update the stops", keyAsString);
      response.setStatus(HttpServletResponse.SC_NOT_FOUND);
      return;
    }
    trip.setRoute(stops);
    datastore.put(trip.toEntity());
    response.setStatus(HttpServletResponse.SC_NO_CONTENT);
  }
}
