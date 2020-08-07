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
import com.google.gson.Gson;
import java.io.IOException;
import java.util.Arrays;
import java.util.List;
import javax.servlet.annotation.WebServlet;
import javax.servlet.http.HttpServlet;
import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;

/** Servlet that handles data for recommended places */
@WebServlet("/api/recs")
public final class RecsServlet extends HttpServlet {
  private final Gson gson = new Gson();
  private final DatastoreService datastore = DatastoreServiceFactory.getDatastoreService();

  /* Intializes a mock Trip entity
  public void init(){
    Entity tripEntity = new Entity(Trip.KIND);
    tripEntity.setProperty("id", 1234);
    datastore.put(tripEntity);

  **/

  /* Passes hard-coded data to be shown in the recommendations panel
   * TODO: Replace with actual arraylist of recommended places based on TextSearch in
   * interests page
   */
  @Override
  public void doGet(HttpServletRequest request, HttpServletResponse response) throws IOException {
    List<String> recs = Arrays.asList("Times Square", "MOMA", "Central Park");
    response.setContentType("application/json;");
    response.getWriter().println(gson.toJson(recs));
  }
}
