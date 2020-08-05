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
  /* Method which retrieves the Stop KIND from datastore */
  @Override
  public void doGet(HttpServletRequest request, HttpServletResponse response) throws IOException {
      /**
    Query query = new Query(Stop.KIND); 
    PreparedQuery results = datastore.prepare(query);
    List<Stop> stops= new ArrayList<>();
    for (Entity entity: results.asIterable()){
      stops.add(Stop.fromEntity(entity));
    } **/
    Filter propertyFilter = new FilterPredicate("id", FilterOperator.EQUAL, 1234);
    Query query = new Query(Trip.KIND).setFilter(propertyFilter);
    PreparedQuery results = datastore.prepare(query);
    List<String> stops= new ArrayList<>();
    // should only be one 
    System.out.println("filtered get");
    for(Entity entity: results.asIterable()){
       stops = (ArrayList<String>) entity.getProperty("destinations");
    }
    response.setContentType("application/json;");
    response.getWriter().println(gson.toJson(stops));
  }

  /* Method which modifies the Stop KIND in datastore */
  
  @Override
  public void doPost(HttpServletRequest request, HttpServletResponse response) throws IOException {
    // String test = request.getReader().lines().collect(Collectors.joining(System.lineSeparator()));
    // System.out.println("test" + test);
    // String stop = request.getParameter("text");
    // String action = request.getParameter("action");
    String stopsAsJSON = request.getParameter("stops");
    ArrayList<String> stops = gson.fromJson(stopsAsJSON, ARRAYLIST_STRING);
    System.out.println("in doPost for stops");
    for(int i = 0; i < stops.size(); i++){
        System.out.println("i" + stops.get(i));
    }
    Filter propertyFilter = new FilterPredicate("id", FilterOperator.EQUAL, 1234);
    Query query = new Query(Trip.KIND).setFilter(propertyFilter);
    PreparedQuery results = datastore.prepare(query);
    // should only be one 
    System.out.println("filtered");
    for(Entity entity: results.asIterable()){
      System.out.println("changing entity");
       entity.setProperty("destinations", stops);
       datastore.put(entity);
    }
    
    /**
    if(action.equals("remove")){
      Query query = new Query(Stop.KIND);
      PreparedQuery results = datastore.prepare(query);
      // Note: A more proper solution is to use Filter
      // but I noticed it was not working as intended 
      for(Entity entity: results.asIterable()){
        if(entity.getProperty("placename").equals(stop)){
          datastore.delete(entity.getKey());
        }
      }
    }
    else if(action.equals("add")){
      Entity stopEntity = new Entity(Stop.KIND);
      stopEntity.setProperty("placename", stop);
      datastore.put(stopEntity);
      /**
      TODO: use filter as a check for duplication
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
      **/
     
    } 
  }
