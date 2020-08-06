package com.google.sps.servlets;

import com.google.appengine.api.datastore.DatastoreService;
import com.google.appengine.api.datastore.DatastoreServiceFactory;
import com.google.appengine.api.datastore.Entity;
import com.google.appengine.api.datastore.KeyFactory;
import com.google.appengine.api.datastore.Key;
import com.google.appengine.api.users.UserService;
import com.google.appengine.api.users.UserServiceFactory;
import java.io.IOException;
import java.io.IOException;
import java.util.ArrayList;
import javax.servlet.annotation.WebServlet;
import javax.servlet.http.HttpServlet;
import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;
import com.google.gson.Gson;
import com.google.sps.data.Login;


@WebServlet("/login")
public class LoginServlet extends HttpServlet {
  private final Gson gson = new Gson();
  private final UserService userService = UserServiceFactory.getUserService();
  private final DatastoreService datastore = DatastoreServiceFactory.getDatastoreService();
    
  private static final String URL_TO_REDIRECT_TO_AFTER_LOGSIN = "/destinations.html";
  private static final String URL_TO_REDIRECT_TO_AFTER_LOGSOUT = "/index.html";

  private Key tripKey;
    
  @Override
  public void doGet(HttpServletRequest request, HttpServletResponse response) throws IOException {
    createTripEntity();
    boolean loginStatus = userService.isUserLoggedIn();
    String url;
    if (!loginStatus) {
      url = userService.createLoginURL(URL_TO_REDIRECT_TO_AFTER_LOGSIN +"?tripId=" + KeyFactory.keyToString(tripKey));
    }
   
    else {
      url = userService.createLogoutURL(URL_TO_REDIRECT_TO_AFTER_LOGSOUT);
    }
    Login login = new Login(loginStatus,url);
    String json = gson.toJson(login);
    response.setContentType("application/json;");
    response.getWriter().println(json);
    return;
  }
  
  /*
  * Adds new Trip entity with empty properties
  **/
  public void createTripEntity(){
    Entity tripEntity = new Entity(Trip.DATASTORE_ENTITY_KIND);
    tripEntity.setProperty("start", "");
    tripEntity.setProperty("destinations", new ArrayList<String>());
    tripEntity.setProperty("interests", new ArrayList<String>());
    tripEntity.setProperty("route", new ArrayList<String>());
    datastore.put(tripEntity);
    tripKey = tripEntity.getKey();
  }
}