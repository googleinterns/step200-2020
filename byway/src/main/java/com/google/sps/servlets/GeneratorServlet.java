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
import com.google.gson.Gson;
import com.google.maps.model.PlaceType;
import java.io.IOException;
import java.util.ArrayList;
import javax.servlet.annotation.WebServlet;
import javax.servlet.http.HttpServlet;
import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;

/**
 * Servlet that loads places of interest from
 * a specified user, previously configured.
 */
@WebServlet("/api/generator")
public class GeneratorServlet extends HttpServlet {

  private final Gson gson = new Gson();

  /**
   * Temporary setup to retrieve a user entity with a specific trip id,
   * hard-coded as '2452' at the moment. Retrieves and returns their interests.
   */
  @Override
  public void doGet(HttpServletRequest request, HttpServletResponse response) throws IOException {
    DatastoreService datastore = DatastoreServiceFactory.getDatastoreService();
    Query person =
        new Query("user")
            .setFilter(new FilterPredicate("id", FilterOperator.EQUAL, 2452));
    PreparedQuery pq = datastore.prepare(person);
    Entity userEntity;
    try {
      userEntity = pq.asSingleEntity();
      ArrayList<String> interestsSelected = (ArrayList) userEntity.getProperty("interests");
      response.setContentType("application/json;");
      response.getWriter().println(gson.toJson(interestsSelected));
    } catch(TooManyResultsException e) {
      // TODO: Handle both TooManyResultsException and EntityNotFoundException
    }
  }
}
