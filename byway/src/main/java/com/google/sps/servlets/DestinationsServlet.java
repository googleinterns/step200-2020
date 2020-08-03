package com.google.sps.servlets;

import com.google.appengine.api.datastore.DatastoreService;
import com.google.appengine.api.datastore.DatastoreServiceFactory;
import com.google.appengine.api.datastore.Entity;
import com.google.appengine.api.datastore.KeyFactory;
import com.google.appengine.api.datastore.Key;
import com.google.appengine.api.datastore.PreparedQuery;
import com.google.appengine.api.datastore.Query;
import com.google.appengine.api.datastore.Query.SortDirection;
import com.google.appengine.api.datastore.EntityNotFoundException;
import com.google.common.flogger.FluentLogger;
import com.google.appengine.api.users.UserService;
import com.google.appengine.api.users.UserServiceFactory;

import com.google.gson.Gson;
import java.io.IOException;
import java.util.ArrayList;
import javax.servlet.annotation.WebServlet;
import javax.servlet.annotation.MultipartConfig;
import javax.servlet.http.HttpServlet;
import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;

/** Servlet that returns start location and destinations user inputs */
@MultipartConfig
@WebServlet("/api/destinations")
public class DestinationsServlet extends HttpServlet {

  private final Gson gson = new Gson();
  private final DatastoreService datastore = DatastoreServiceFactory.getDatastoreService();
  private final UserService userService = UserServiceFactory.getUserService();
  private static final FluentLogger logger = FluentLogger.forEnclosingClass();
  private Key userKey;
  
  @Override
  public void doGet(HttpServletRequest request, HttpServletResponse response) throws IOException {
    Entity tripEntity = new Entity("Trips");
    tripEntity.setProperty("start", "");
    tripEntity.setProperty("destinations", new ArrayList<String>());
    datastore.put(tripEntity);
    userKey = tripEntity.getKey();

    Entity entity; 
      try{ 
      entity = datastore.get(userKey) ;
    } catch(EntityNotFoundException e){
      UserLocations userLocations = new UserLocations("","", new ArrayList<String>()); 
      response.setContentType("application/json;");
      response.getWriter().println(gson.toJson(userLocations)); 
      logger.atInfo().withCause(e).log("Unable to find UserLocations Entity %s", userKey);
      return;
    }

    String start = (String) entity.getProperty("start");
    ArrayList<String> destinations = (ArrayList<String>) entity.getProperty("destinations");
    UserLocations userLocations = new UserLocations(KeyFactory.keyToString(userKey),start, destinations); 
    response.setContentType("application/json;");
    response.getWriter().println(gson.toJson(userLocations));

    boolean userExists = false;
    String userId = userService.getCurrentUser().getUserId();
    String userEmail = userService.getCurrentUser().getEmail();
    Query query = new Query("User");
    PreparedQuery results = datastore.prepare(query);
    for (Entity currentEntity : results.asIterable()) {
        String entityId = (String) currentEntity.getProperty("id");
        if (entityId.equals(userId)){
          userExists = true; 
          ArrayList<Key> trips = (ArrayList<Key>) currentEntity.getProperty("trips");
          System.out.println(trips);
          trips.add(userKey);
          currentEntity.setProperty("trips",trips);
          datastore.put(currentEntity);   
        }
    }
    if (userExists == false){
      Entity userEntity = new Entity("User");
      userEntity.setProperty("id", userId);
      userEntity.setProperty("email", userEmail); 
      ArrayList<Key> trips = new ArrayList<Key>();
      trips.add(userKey);
      userEntity.setProperty("trips", trips);
      datastore.put(userEntity);
    }
  }

  @Override
  public void doPost(HttpServletRequest request, HttpServletResponse response) throws IOException { 
    Entity entity;
    String start= request.getParameter("start-location");
    String destination = request.getParameter("destinations");
    try{ 
      entity = datastore.get(userKey) ;
    } catch(EntityNotFoundException e){
      UserLocations userLocations = new UserLocations("","", new ArrayList<String>()); 
      response.setContentType("application/json;");
      response.getWriter().println(gson.toJson(userLocations)); 
      logger.atInfo().withCause(e).log("Unable to find UserLocations Entity %s", userKey);
      return;
    }
    entity.setProperty("start", start);
    if((ArrayList<String>) entity.getProperty("destinations") == null){
      ArrayList<String> destinations = new ArrayList<String>();
      destinations.add(destination);
      entity.setProperty("destinations", destinations);
    }
    else{
      ArrayList<String> destinations = (ArrayList<String>) entity.getProperty("destinations");
      destinations.add(destination);
      entity.setProperty("destinations", destinations);
    }
    datastore.put(entity);
    ArrayList<String> destinations = (ArrayList<String>) entity.getProperty("destinations");
    UserLocations userLocations = new UserLocations(KeyFactory.keyToString(userKey), start, destinations);    
      response.setContentType("application/json;");
    response.getWriter().println(gson.toJson(userLocations));
  }
}