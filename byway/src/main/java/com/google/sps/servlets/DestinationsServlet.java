package com.google.sps.servlets;

import com.google.appengine.api.datastore.DatastoreService;
import com.google.appengine.api.datastore.DatastoreServiceFactory;
import com.google.appengine.api.datastore.Entity;
import com.google.appengine.api.datastore.KeyFactory;
import com.google.appengine.api.datastore.Key;
import com.google.appengine.api.datastore.PreparedQuery;
import com.google.appengine.api.datastore.Query;
import com.google.appengine.api.datastore.Query.SortDirection;

import com.google.gson.Gson;
import java.io.IOException;
import java.util.ArrayList;
import javax.servlet.annotation.WebServlet;
import javax.servlet.http.HttpServlet;
import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;

/** Servlet that returns start location and destinations user inputs */
@WebServlet("/api/destinations")
public class DestinationsServlet extends HttpServlet {

private final UserLocations places = new UserLocations("", new ArrayList<String>());
private final Gson gson = new Gson();
private final DatastoreService datastore = DatastoreServiceFactory.getDatastoreService();
private Long userKey;

  @Override
  public void init() {
    Entity userEntity = new Entity("UserInputs", "test");
    System.out.println(userKey);
    userKey= userEntity.getKey().getId();
    userEntity.setProperty("start", "");
    userEntity.setProperty("destinations", new ArrayList<String>());
    datastore.put(userEntity);
  }

  @Override
  public void doGet(HttpServletRequest request, HttpServletResponse response) throws IOException {
    Query userInput = new Query("UserInputs");
    PreparedQuery query = datastore.prepare(userInput);
    for(Entity user: query.asIterable()) {
      Long key = user.getKey().getId();
      if(key == userKey) {
          System.out.println(key);
        Entity currentUser = user;
        String start = (String) currentUser.getProperty("start");
        ArrayList<String> destinations = (ArrayList) currentUser.getProperty("destinations");
        UserLocations userLocations = new UserLocations(start, destinations);    
        response.setContentType("application/json;");
        response.getWriter().println(gson.toJson(userLocations));
        return;
      }
    }
    UserLocations userLocations = new UserLocations("", new ArrayList<String>());    
    response.setContentType("application/json;");
    response.getWriter().println(gson.toJson(userLocations));
  }

  @Override
  public void doPost(HttpServletRequest request, HttpServletResponse response) throws IOException { 
    Query userInput = new Query("UserInputs");
    PreparedQuery query = datastore.prepare(userInput);
    for(Entity user: query.asIterable()) {
      Long key = user.getKey().getId();
      if(key == userKey) {
        Entity currentUser = user;
        places.addDestination(request.getParameter("destinations"));
        currentUser.setProperty("start", request.getParameter("start-location"));
        currentUser.setProperty("destinations", places.getDestinations());
        datastore.put(currentUser);

        String start = (String) currentUser.getProperty("start");
        ArrayList<String> destinations = (ArrayList) currentUser.getProperty("destinations");
        UserLocations userLocations = new UserLocations(start, destinations);    
        response.setContentType("application/json;");
        response.getWriter().println(gson.toJson(userLocations));
      }
    }
    DatastoreService datastore = DatastoreServiceFactory.getDatastoreService();
    
  }

}