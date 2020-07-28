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
import com.google.appengine.api.datastore.PreparedQuery;
import com.google.appengine.api.datastore.PreparedQuery.TooManyResultsException;
import com.google.appengine.api.datastore.Query;
import com.google.maps.model.PlaceType;
import com.google.gson.Gson;
import java.io.IOException;
import javax.servlet.annotation.WebServlet;
import javax.servlet.http.HttpServlet;
import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;
import java.util.ArrayList;

/** Servlet that loads places of interest and generates 
 *  recommended places based on interests selected.
 */
@WebServlet("/api/generator")
public class GeneratorServlet extends HttpServlet {

  private final Gson gson = new Gson();
  private ArrayList<String> interestsSelected = new ArrayList<>();

  @Override
  public void doGet(HttpServletRequest request, HttpServletResponse response) throws IOException {
    DatastoreService datastore = DatastoreServiceFactory.getDatastoreService();

    Query person = new Query("sample");
    PreparedQuery pq = datastore.prepare(person);
    for(Entity enteredUser: pq.asIterable()) {
      long id = (long) enteredUser.getProperty("id");
      if(id == 2452) {
        Entity currentUser = enteredUser;
        interestsSelected = (ArrayList) currentUser.getProperty("interests");
      }
    }
    response.setContentType("application/json;");
    response.getWriter().println(gson.toJson(interestsSelected));
  }

  @Override
  public void doPost(HttpServletRequest request, HttpServletResponse response) throws IOException {
    String interests = request.getParameter("data");
    interestsSelected = gson.fromJson(interests, ArrayList.class);
    for(String elem: interestsSelected) {
      response.getWriter().println(elem);
    }
    response.sendRedirect("/generator.html");
  }
}
