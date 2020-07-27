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


/** Servlet that returns some example content. TODO: modify this file to handle comments data */
@WebServlet("/api/destinations")
public class DestinationsServlet extends HttpServlet {

    private final static class UserLocations{ 
      private String start;
      private ArrayList<String> destinations;

        public UserLocations(String start, ArrayList destinations) {
            this.start = start;
            this.destinations = destinations;
        }
    };

private final UserLocations places = new UserLocations("", new ArrayList<String>());
private final Gson gson = new Gson();
DatastoreService datastore = DatastoreServiceFactory.getDatastoreService();
  Entity destinationsEntity = new Entity("UserDestinations");
 // Key entityKey = destinationsEntity.getKey());

@Override
public void init() {
  destinationsEntity.setProperty("start", "");
  destinationsEntity.setProperty("destinations", new ArrayList<String>());
  datastore.put(destinationsEntity);
}

  @Override
  public void doGet(HttpServletRequest request, HttpServletResponse response) throws IOException {
    DatastoreService datastore = DatastoreServiceFactory.getDatastoreService();
    //Entity entity = datastore.get(entityKey);
    String start = (String) destinationsEntity.getProperty("start");
    ArrayList<String> destinations = (ArrayList) destinationsEntity.getProperty("destinations");
    UserLocations userLocations = new UserLocations(start, destinations);    
    response.setContentType("application/json;");
    response.getWriter().println(gson.toJson(userLocations));
  }

  @Override
  public void doPost(HttpServletRequest request, HttpServletResponse response) throws IOException { 
    DatastoreService datastore = DatastoreServiceFactory.getDatastoreService();
    String startInput = request.getParameter("start-location");
    String destination = request.getParameter("destinations"); 

    places.start = startInput;
    places.destinations.add(destination);

    //Entity entity = datastore.get(entityKey);
    destinationsEntity.setProperty("start", places.start);
    destinationsEntity.setProperty("destinations", places.destinations);
    datastore.put(destinationsEntity);

    response.sendRedirect("/destinations.html");
  }

}