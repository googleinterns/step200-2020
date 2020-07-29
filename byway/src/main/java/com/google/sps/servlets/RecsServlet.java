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
import com.google.appengine.api.datastore.KeyFactory;
import com.google.appengine.api.datastore.PreparedQuery;
import com.google.appengine.api.datastore.Query;

import com.google.gson.Gson;
import com.google.sps.data.Recommendation;
import java.io.IOException;
import java.util.ArrayList;
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
  
  /** Fills datastore with hardcoded values for Recommendation objects,
  values will be from another datastore later **/
  @Override
  public void init(){
    // when using actual values, there will only be one Entity object instantiated, not one per stop
    // loop through Rena and Leo's datastore entries for recommended stops
    Entity recEntity1 = new Entity(Recommendation.KIND);
    Entity recEntity2 = new Entity(Recommendation.KIND);
    Entity recEntity3 = new Entity(Recommendation.KIND);
    recEntity1.setProperty("placename", "Times Square");
    datastore.put(recEntity1);
    recEntity2.setProperty("placename", "MOMA");
    datastore.put(recEntity2);
    recEntity3.setProperty("placename", "Central Park");
    datastore.put(recEntity3);
  }

  @Override
  public void doGet(HttpServletRequest request, HttpServletResponse response) throws IOException {
    Query query = new Query(Recommendation.KIND); 
    PreparedQuery results = datastore.prepare(query);
    List<Recommendation> recs = new ArrayList<>();

    for (Entity entity: results.asIterable()){
      recs.add(Recommendation.fromEntity(entity));
    }

    response.setContentType("application/json;");
    response.getWriter().println(gson.toJson(recs));
  }
  
}
