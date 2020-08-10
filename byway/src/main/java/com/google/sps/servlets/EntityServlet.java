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
import com.google.sps.data.Trip;


@WebServlet("/entity")
public class EntityServlet extends HttpServlet {
  private final Gson gson = new Gson();
  private final UserService userService = UserServiceFactory.getUserService();
  private final DatastoreService datastore = DatastoreServiceFactory.getDatastoreService();
    
  @Override
  public void doPost(HttpServletRequest request, HttpServletResponse response) throws IOException {
    Key tripKey = createTripEntity();
    User user =  userService.getCurrentUser();
    UserInfo userInfo = addUserEntity(user);
    addTripForUser(tripKey, userInfo);
    sendRedirect
    
  }
} 
 
 
 
 /*
  * Adds new Trip entity with empty properties
  **/
  public Key createTripEntity(){
    Entity tripEntity = new Entity(Trip.DATASTORE_ENTITY_KIND);
    tripEntity.setProperty("start", "");
    tripEntity.setProperty("destinations", new ArrayList<String>());
    tripEntity.setProperty("interests", new ArrayList<String>());
    tripEntity.setProperty("route", new ArrayList<String>());
    datastore.put(tripEntity);
    tripKey = tripEntity.getKey();
    return tripKey;
  }

  /*
  * Adds new user entity if user has not logged in before
  * Adds tripKey to the user's array of trips
  **/
  /*public void addUserEntity(Key tripKey){
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
          if (!trips.contains(tripKey)){
            trips.add(tripKey);
          }
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
  }*/


  public UserInfo addUserEntity(User user) {
  // Create a key based on the user ID
  Key userKey = KeyFactory.createKey(UserInfo.KIND, user.getUserId());
  UserInfo userInfo;
  try {
    // try to retrieve the entity with the key 
    Entity userEntity = datastore.get(userKey);
    userInfo = UserInfo.FromEntity(userEntity);
  catch (EntityNotFoundException exception) {
    // If the user doesn't exist yet or is new, create a new user
    Entity newUserEntity = new Entity(userKey)
    newUserEntity.setProperty("email", user.getEmail());
    datastore.put(newUserEntity);
    userInfo = UserInfo.FromEntity(newUserEntity)
  }
  return userInfo;
}

  public void addTripForUser(UserInfo user) {
    //TODO
  }