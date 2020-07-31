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
import com.google.sps.data.Stop;
import java.io.IOException;
import java.util.ArrayList;
import java.util.Arrays;
import java.util.Iterator;
import java.util.List;
import javax.servlet.annotation.WebServlet;
import javax.servlet.http.HttpServlet;
import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;

@WebServlet("/api/stop")
public final class StopsServlet extends HttpServlet {
  private final Gson gson = new Gson(); 
  private final DatastoreService datastore = DatastoreServiceFactory.getDatastoreService();

  @Override
  public void doGet(HttpServletRequest request, HttpServletResponse response) throws IOException {
    Query query = new Query(Stop.KIND); 
    PreparedQuery results = datastore.prepare(query);
    List<Stop> stops= new ArrayList<>();
    for (Entity entity: results.asIterable()){
      stops.add(Stop.fromEntity(entity));
    }
    response.setContentType("application/json;");
    response.getWriter().println(gson.toJson(stops));
  }

  /* Method which modifies the Stop datastore */
  @Override
  public void doPost(HttpServletRequest request, HttpServletResponse response) throws IOException {
    String stop = request.getParameter("text");
    String action = request.getParameter("action");
   
    if(action.equals("remove")){
      System.out.println("remove: " + stop); 
      Query query = new Query(Stop.KIND);
      PreparedQuery results = datastore.prepare(query);
      for(Entity entity: results.asIterable()){
      if(entity.getProperty("placename").equals(stop)){
        datastore.delete(entity.getKey());
        System.out.println("removed");
      }
       
      }
    /**
      long id = Long.parseLong(request.getParameter("id"));
      Filter propertyFilter = new FilterPredicate("placename", FilterOperator.EQUAL, stop);
      Query query = new Query(Stop.KIND).setFilter(propertyFilter);
      PreparedQuery results = datastore.prepare(query);
      List<Stop> stops= new ArrayList<>();
      for(Entity entity: results.asIterable()){
        stops.add(Stop.fromEntity(entity));
      }
      System.out.println("remove: " + stop);
      if(stops.size() == 0){
        System.out.println(stops.get(0).placename);
        System.out.println(stops.get(0).id);
        Key stopEntityKey = KeyFactory.createKey(Stop.KIND, stops.get(0).id);
        datastore.delete(stopEntityKey);
        System.out.println("not duplicate");
      }
      **/
    }
    else if(action.equals("add")){
      
      // move out to a shared function
      System.out.println("add " + stop);
      long id = Long.parseLong(request.getParameter("id"));
      Filter propertyFilter = new FilterPredicate("placename", FilterOperator.EQUAL, stop);
      Query query = new Query(Stop.KIND).setFilter(propertyFilter);
      PreparedQuery results = datastore.prepare(query);
      Entity stopEntity = new Entity(Stop.KIND);
      List<Stop> stops= new ArrayList<>();
      for(Entity entity: results.asIterable()){
        stops.add(Stop.fromEntity(entity));
      }
      if(stops.size() == 0){
        System.out.println("not duplicate");
        stopEntity.setProperty("placename", stop);
        datastore.put(stopEntity);
      
      }
       
      
      // System.out.println(stopEntity.id());
    } 
  }
}
