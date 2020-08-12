package com.google.sps.servlets;

import com.google.appengine.api.datastore.DatastoreService;
import com.google.appengine.api.datastore.DatastoreServiceConfig;
import com.google.appengine.api.datastore.DatastoreServiceFactory;
import com.google.appengine.api.datastore.Entity;
import com.google.appengine.api.datastore.EntityNotFoundException;
import com.google.appengine.api.datastore.Key;
import com.google.appengine.api.datastore.KeyFactory;
import com.google.appengine.api.users.UserService;
import com.google.appengine.api.users.UserServiceFactory;
import com.google.common.flogger.FluentLogger;
import com.google.gson.Gson;
import com.google.sps.data.Trip;
import com.google.sps.data.UserInfo;
import java.io.IOException;
import java.util.ArrayList;
import javax.servlet.annotation.WebServlet;
import javax.servlet.http.HttpServlet;
import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;

@WebServlet("/api/createtrip")
public class CreateTripServlet extends HttpServlet {
  private final Gson gson = new Gson();
  private final UserService userService = UserServiceFactory.getUserService();
  private final DatastoreService datastore = DatastoreServiceFactory.getDatastoreService();
  private static final FluentLogger logger = FluentLogger.forEnclosingClass();

  @Override
  public void init() {
    System.setProperty(
        DatastoreServiceConfig.DATASTORE_EMPTY_LIST_SUPPORT, Boolean.TRUE.toString());
  }

  @Override
  public void doPost(HttpServletRequest request, HttpServletResponse response) throws IOException {
    Key tripKey = createTripEntity();
    String keyString = KeyFactory.keyToString(tripKey);
    addTripForUser(keyString);
    String json = gson.toJson(KeyFactory.keyToString(tripKey));
    response.setContentType("application/json");
    response.getWriter().println(json);
  }

  /*
   * Adds new Trip entity with empty properties
   **/
  public Key createTripEntity() {
    System.setProperty(
        DatastoreServiceConfig.DATASTORE_EMPTY_LIST_SUPPORT, Boolean.TRUE.toString());
    Entity tripEntity = new Entity(Trip.DATASTORE_ENTITY_KIND);
    tripEntity.setProperty("start", "");
    tripEntity.setProperty("destinations", new ArrayList<String>());
    tripEntity.setProperty("interests", new ArrayList<String>());
    tripEntity.setProperty("route", new ArrayList<String>());
    datastore.put(tripEntity);
    Key tripKey = tripEntity.getKey();
    return tripKey;
  }

  public void addTripForUser(String tripKey) {
    Key userKey =
        KeyFactory.createKey(
            UserInfo.DATASTORE_ENTITY_KIND, userService.getCurrentUser().getUserId());
    try {
      Entity userEntity = datastore.get(userKey);
      ArrayList<String> tripIds = (ArrayList<String>) userEntity.getProperty("tripIds");
      tripIds.add(tripKey);
      userEntity.setProperty("tripIds", tripIds);
      datastore.put(userEntity);
    } catch (EntityNotFoundException exception) {
      logger.atInfo().withCause(exception).log("User Entity not found: %s", userKey);
      return;
    }
  }
}
