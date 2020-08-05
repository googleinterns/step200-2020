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
import java.io.IOException;
import java.io.IOException;
import java.util.ArrayList;
import javax.servlet.annotation.WebServlet;
import javax.servlet.http.HttpServlet;
import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;
import com.google.gson.Gson;

@WebServlet("/login")
public class LoginServlet extends HttpServlet {
    private final Gson gson = new Gson();
    private final UserService userService = UserServiceFactory.getUserService();
    private final DatastoreService datastore = DatastoreServiceFactory.getDatastoreService();

    public static class Login{ 
        private final boolean status;
        private final String url;
  
        public Login(boolean status, String url) {
            this.status = status;
            this.url = url;
        }
    }

    private static final String URL_TO_REDIRECT_TO_AFTER_LOGSIN = "/destinations.html";
    private static final String URL_TO_REDIRECT_TO_AFTER_LOGSOUT = "/index.html";

    private Key tripKey;
    
  @Override
  public void doGet(HttpServletRequest request, HttpServletResponse response) throws IOException {
    createTripEntity();
    boolean loginStatus = userService.isUserLoggedIn();
    if (!userService.isUserLoggedIn()) {
      String loginUrl = userService.createLoginURL(URL_TO_REDIRECT_TO_AFTER_LOGSIN +"?id=" + KeyFactory.keyToString(tripKey));
      Login login = new Login(loginStatus,loginUrl);
      String json = gson.toJson(login);
      response.setContentType("application/json;");
      response.getWriter().println(json);
      return;
    }
   
    if (userService.isUserLoggedIn()){
      String userEmail = userService.getCurrentUser().getEmail();
      String logoutUrl = userService.createLogoutURL(URL_TO_REDIRECT_TO_AFTER_LOGSOUT);
      Login login = new Login(loginStatus,logoutUrl);
      String json = gson.toJson(login);
      response.setContentType("application/json;");
      response.getWriter().println(json);
    }
  }

  public void createTripEntity(){
    Entity tripEntity = new Entity("Trips");
    tripEntity.setProperty("start", "");
    tripEntity.setProperty("destinations", new ArrayList<String>());
    datastore.put(tripEntity);
    tripKey = tripEntity.getKey();
  }
}