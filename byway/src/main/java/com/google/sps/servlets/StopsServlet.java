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
import com.google.appengine.api.datastore.Entity;
import com.google.appengine.api.datastore.Key;
import com.google.appengine.api.datastore.KeyFactory;
import com.google.appengine.api.datastore.PreparedQuery;
import com.google.appengine.api.datastore.Query;
import com.google.appengine.api.datastore.Query.Filter;
import com.google.appengine.api.datastore.Query.FilterOperator;
import com.google.appengine.api.datastore.Query.FilterPredicate;
import com.google.gson.Gson;
import com.google.sps.data.Trip;
import java.lang.reflect.Type;
import com.google.gson.reflect.TypeToken;
import java.io.IOException;
import java.util.ArrayList;
import java.util.Iterator;
import java.util.List;
import java.util.stream.Collectors;
import javax.servlet.annotation.MultipartConfig;
import javax.servlet.annotation.WebServlet;
import javax.servlet.http.HttpServlet;
import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;

/** Servlet that handles data for stops */
@WebServlet("/api/stop")
public final class StopsServlet extends HttpServlet {
  private final Gson gson = new Gson(); 
  private final DatastoreService datastore = DatastoreServiceFactory.getDatastoreService();
  private static final Type ARRAYLIST_STRING = new TypeToken<ArrayList<String>>() {}.getType();

  /* Passes saved destinations stops (if any) to be shown in the schedule panel */
  @Override
  public void doGet(HttpServletRequest request, HttpServletResponse response) throws IOException {
    // TODO: Replace ID filtering with .get(Key)
    // Duplicate code was just kept for this reason
    Filter propertyFilter = new FilterPredicate("id", FilterOperator.EQUAL, 1234);
    Query query = new Query(Trip.KIND).setFilter(propertyFilter);
    PreparedQuery results = datastore.prepare(query);
    List<String> stops= new ArrayList<>();

    // Should only be one entity with this ID
    for(Entity entity: results.asIterable()){
       stops = (ArrayList<String>) entity.getProperty("destinations");
    }
    response.setContentType("application/json;");
    response.getWriter().println(gson.toJson(stops));
  }

  /* Modifies the destinations array of Trip entity in datastore */
  @Override
  public void doPost(HttpServletRequest request, HttpServletResponse response) throws IOException{
    String stopsAsJSON = request.getParameter("stops");
    System.out.println("stops dopost");
    ArrayList<String> stops = gson.fromJson(stopsAsJSON, ARRAYLIST_STRING);
    Filter propertyFilter = new FilterPredicate("id", FilterOperator.EQUAL, 1234);
    Query query = new Query(Trip.KIND).setFilter(propertyFilter);
    PreparedQuery results = datastore.prepare(query);

    for(Entity entity: results.asIterable()){
      entity.setProperty("destinations", stops);
      datastore.put(entity);
    }
  } 
}
