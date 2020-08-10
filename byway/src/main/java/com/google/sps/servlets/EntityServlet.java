package com.google.sps.servlets;

import com.google.appengine.api.datastore.DatastoreService;
import com.google.appengine.api.datastore.DatastoreServiceFactory;
import com.google.appengine.api.datastore.Entity;
import com.google.appengine.api.datastore.KeyFactory;
import com.google.appengine.api.datastore.Key;
import com.google.appengine.api.users.UserService;
import com.google.appengine.api.users.UserServiceFactory;
import com.google.appengine.api.datastore.EntityNotFoundException;
import com.google.appengine.api.datastore.DatastoreServiceConfig;
import java.io.IOException;
import java.io.IOException;
import java.util.ArrayList;
import javax.servlet.annotation.WebServlet;
import javax.servlet.http.HttpServlet;
import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;
import com.google.gson.Gson;
import com.google.sps.data.Trip;
import com.google.sps.data.UserInfo;

@WebServlet("/entity")
public class EntityServlet extends HttpServlet {
  private final Gson gson = new Gson();
  private final UserService userService = UserServiceFactory.getUserService();
  private final DatastoreService datastore = DatastoreServiceFactory.getDatastoreService();
    
  @Override
  public void doPost(HttpServletRequest request, HttpServletResponse response) throws IOException {
    Key tripKey = createTripEntity();
    com.google.appengine.api.users.User user =  userService.getCurrentUser();
    UserInfo userInfo = addUserEntity(user, tripKey);
    String json = gson.toJson(KeyFactory.keyToString(tripKey));
    response.setContentType("application/json;");
    response.getWriter().println(json);
  } 
 
 /*
  * Adds new Trip entity with empty properties
  **/
  public Key createTripEntity(){
    System.setProperty(DatastoreServiceConfig.DATASTORE_EMPTY_LIST_SUPPORT, Boolean.TRUE.toString());
    Entity tripEntity = new Entity(Trip.DATASTORE_ENTITY_KIND);
    tripEntity.setProperty("start", "");
    tripEntity.setProperty("destinations", new ArrayList<String>());
    tripEntity.setProperty("interests", new ArrayList<String>());
    tripEntity.setProperty("route", new ArrayList<String>());
    datastore.put(tripEntity);
    Key tripKey = tripEntity.getKey();
    tripEntity.setProperty("keyString", KeyFactory.keyToString(tripKey));
    datastore.put(tripEntity);
    return tripKey;
  }

  public UserInfo addUserEntity(com.google.appengine.api.users.User user, Key tripKey) {
    // Create a key based on the user ID
    Key userKey = KeyFactory.createKey(UserInfo.DATASTORE_ENTITY_KIND, user.getUserId());
    UserInfo userInfo;
    try {
      // try to retrieve the entity with the key 
      Entity userEntity = datastore.get(userKey);
      addTripForUser(userEntity, tripKey);
      datastore.put(userEntity);
      userInfo = UserInfo.fromEntity(userEntity);
    } catch (EntityNotFoundException exception) {
      // If the user doesn't exist yet or is new, create a new user
      Entity newUserEntity = new Entity(userKey);
      newUserEntity.setProperty("email", user.getEmail());
      newUserEntity.setProperty("userId", user.getUserId());
      addTripForUser(newUserEntity, tripKey);
      datastore.put(newUserEntity);
      userInfo = UserInfo.fromEntity(newUserEntity);
    }
    return userInfo;
  }

  public void addTripForUser(Entity userEntity, Key tripKey) {
    ArrayList<String> tripIds;
    if (userEntity.getProperty("tripIds") == null){
      tripIds =  new ArrayList<String>();
    }
    else{
      tripIds = (ArrayList<String>) userEntity.getProperty("tripIds");
    }
    tripIds.add(KeyFactory.keyToString(tripKey));
    userEntity.setProperty("tripIds", tripIds);
  }
}