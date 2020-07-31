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

  private static final FluentLogger logger = FluentLogger.forEnclosingClass();

  private final Gson gson = new Gson();
  private final DatastoreService datastore = DatastoreServiceFactory.getDatastoreService();
  private Key userKey;

  @Override
  public void init() {
    Entity userEntity = new Entity("UserInputs");
    userEntity.setProperty("start", "");
    userEntity.setProperty("destinations", new ArrayList<String>());
    datastore.put(userEntity);
    userKey= userEntity.getKey();
  }

  @Override
  public void doGet(HttpServletRequest request, HttpServletResponse response) throws IOException {
    Entity entity = null; 
    try{ 
      entity = datastore.get(userKey);
    } catch(EntityNotFoundException e){
      UserLocations userLocations = new UserLocations("", new ArrayList<String>()); 
      response.setContentType("application/json;");
      response.getWriter().println(gson.toJson(userLocations)); 
      logger.atInfo().withCause(e).log("Unable to find UserLocations Entity %s", userKey);
    }
    if(entity != null){
      String start = (String) entity.getProperty("start");
      ArrayList<String> destinations = (ArrayList<String>) entity.getProperty("destinations");
      UserLocations userLocations = new UserLocations(start, destinations); 
      response.setContentType("application/json;");
      response.getWriter().println(gson.toJson(userLocations)); 
    }
  }

  @Override
  public void doPost(HttpServletRequest request, HttpServletResponse response) throws IOException { 
    Entity entity = null;
    try{ 
      entity = datastore.get(userKey) ;
    } catch(EntityNotFoundException e){
      UserLocations userLocations = new UserLocations("", new ArrayList<String>()); 
      response.setContentType("application/json;");
      response.getWriter().println(gson.toJson(userLocations)); 
      logger.atInfo().withCause(e).log("Unable to find UserLocations Entity %s", userKey);
    }
    if(entity != null){
      String start= request.getParameter("start-location"); 
      String destination = request.getParameter("destinations");
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
      UserLocations userLocations = new UserLocations(start, destinations);    
      response.setContentType("application/json;");
      response.getWriter().println(gson.toJson(userLocations)); 
    }
  }
}

