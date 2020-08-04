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
import com.google.sps.data.Trip;

/** Servlet that returns trip id and start location and destinations user inputs */
@MultipartConfig
@WebServlet("/api/destinations")
public class DestinationsServlet extends HttpServlet {

  private static final FluentLogger logger = FluentLogger.forEnclosingClass();

  private final Gson gson = new Gson();
  private final DatastoreService datastore = DatastoreServiceFactory.getDatastoreService();
  private final UserService userService = UserServiceFactory.getUserService();
  private Key tripKey;
  
  @Override
  public void doGet(HttpServletRequest request, HttpServletResponse response) throws IOException {
    Entity tripEntity = new Entity("Trips");
    tripEntity.setProperty("start", "");
    tripEntity.setProperty("destinations", new ArrayList<String>());
    datastore.put(tripEntity);
    tripKey = tripEntity.getKey();

    Entity entity; 
    try{ 
      entity = datastore.get(tripKey) ;
    } catch(EntityNotFoundException e){
      Trip trip = new Trip("","", new ArrayList<String>(), null, null); 
      response.setContentType("application/json;");
      response.getWriter().println(gson.toJson(trip)); 
      logger.atInfo().withCause(e).log("Unable to find Trip Entity %s", tripKey);
      return;
    }
    String start = (String) entity.getProperty("start");
    ArrayList<String> destinations = (ArrayList<String>) entity.getProperty("destinations");
    Trip trip = new Trip(KeyFactory.keyToString(tripKey),start, destinations, null, null); 
    response.setContentType("application/json;");
    response.getWriter().println(gson.toJson(trip));
    
    addUserEntity();
  }

  @Override
  public void doPost(HttpServletRequest request, HttpServletResponse response) throws IOException { 
    Entity entity;
    String start= request.getParameter("start-location");
    String destination = request.getParameter("destinations");
    try{ 
      entity = datastore.get(tripKey) ;
    } catch(EntityNotFoundException e){
      Trip trip = new Trip("","", new ArrayList<String>(), null, null); 
      response.setContentType("application/json;");
      response.getWriter().println(gson.toJson(trip)); 
      logger.atInfo().withCause(e).log("Unable to find Trip Entity %s", tripKey);
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
    Trip trip = new Trip(KeyFactory.keyToString(tripKey), start, destinations, null, null);    
    response.setContentType("application/json;");
    response.getWriter().println(gson.toJson(trip));
  }
  

  /*
  * Adds new user entity if user has not logged in before
  * Adds tripKey to the user's array of trips
  **/
  public void addUserEntity(){
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
          trips.add(tripKey);
          currentEntity.setProperty("trips",trips);
          datastore.put(currentEntity);   
        }
    }
    if (userExists == false){
      Entity userEntity = new Entity("User");
      userEntity.setProperty("id", userId);
      userEntity.setProperty("email", userEmail); 
      ArrayList<Key> trips = new ArrayList<Key>();
      trips.add(tripKey);
      userEntity.setProperty("trips", trips);
      datastore.put(userEntity);
    }
  }
}