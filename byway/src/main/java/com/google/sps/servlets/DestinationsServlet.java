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

private final UserLocations places = new UserLocations("", new ArrayList<String>());
private final Gson gson = new Gson();
private final DatastoreService datastore = DatastoreServiceFactory.getDatastoreService();
private Key userKey;

  @Override
  public void init() {
    Entity userEntity = new Entity("UserInputs", "test");
    userEntity.setProperty("start", "");
    userEntity.setProperty("destinations", new ArrayList<String>());
    datastore.put(userEntity);
    userKey= userEntity.getKey();
  }

  @Override
  public void doGet(HttpServletRequest request, HttpServletResponse response) throws IOException {
    Entity entity; 
    try{ 
      entity = datastore.get(userKey);
      String start = (String) entity.getProperty("start");
      ArrayList<String> destinations = (ArrayList<String>) entity.getProperty("destinations");
      UserLocations userLocations = new UserLocations(start, destinations); 
      System.out.println(userLocations.getDestinations());   
      response.setContentType("application/json;");
      response.getWriter().println(gson.toJson(userLocations));
    } catch(EntityNotFoundException e){
      System.out.println("error");
    } 
  }

  @Override
  public void doPost(HttpServletRequest request, HttpServletResponse response) throws IOException { 
    Entity entity;
    try{ 
      entity = datastore.get(userKey) ;
      places.addDestination(request.getParameter("destinations"));
      entity.setProperty("start", request.getParameter("start-location"));
      entity.setProperty("destinations", places.getDestinations());
      datastore.put(entity);

      /*String start = (String) entity.getProperty("start");
      ArrayList<String> destinations = (ArrayList) entity.getProperty("destinations");
      UserLocations userLocations = new UserLocations(start, destinations);    
      response.setContentType("application/json;");
      response.getWriter().println(gson.toJson(userLocations));*/
    } catch(EntityNotFoundException e){} 
  }
}