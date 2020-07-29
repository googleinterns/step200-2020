package com.google.sps.servlets;

import com.google.appengine.api.datastore.DatastoreService;
import com.google.appengine.api.datastore.DatastoreServiceFactory;
import com.google.appengine.api.datastore.Entity;
import com.google.appengine.api.datastore.KeyFactory;
import com.google.appengine.api.datastore.Key;

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
Entity userEntity = new Entity("UserInputs");


  @Override
  public void init() {
    userEntity.setProperty("start", "");
    userEntity.setProperty("destinations", new ArrayList<String>());
    datastore.put(userEntity);
  }

  @Override
  public void doGet(HttpServletRequest request, HttpServletResponse response) throws IOException {
    DatastoreService datastore = DatastoreServiceFactory.getDatastoreService();
    String start = (String) userEntity.getProperty("start");
    ArrayList<String> destinations = (ArrayList) userEntity.getProperty("destinations");
    UserLocations userLocations = new UserLocations(start, destinations);    
    response.setContentType("application/json;");
    response.getWriter().println(gson.toJson(userLocations));
  }

  @Override
  public void doPost(HttpServletRequest request, HttpServletResponse response) throws IOException { 
    DatastoreService datastore = DatastoreServiceFactory.getDatastoreService();
    places.addDestination(request.getParameter("destinations"));

    userEntity.setProperty("start", request.getParameter("start-location"));
    userEntity.setProperty("destinations", places.getDestinations());
    datastore.put(userEntity);

    String start = (String) userEntity.getProperty("start");
    ArrayList<String> destinations = (ArrayList) userEntity.getProperty("destinations");
    UserLocations userLocations = new UserLocations(start, destinations);    
    response.setContentType("application/json;");
    response.getWriter().println(gson.toJson(userLocations));
  }

}