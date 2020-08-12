package com.google.sps.servlets;

import com.google.appengine.api.datastore.DatastoreService;
import com.google.appengine.api.datastore.DatastoreServiceConfig;
import com.google.appengine.api.datastore.DatastoreServiceFactory;
import com.google.appengine.api.datastore.Entity;
import com.google.appengine.api.datastore.EntityNotFoundException;
import com.google.appengine.api.datastore.KeyFactory;
import com.google.appengine.api.users.UserService;
import com.google.appengine.api.users.UserServiceFactory;
import com.google.gson.Gson;
import com.google.sps.data.Trip;
import com.google.sps.data.UserInfo;
import java.io.IOException;
import java.util.ArrayList;
import java.util.List;
import javax.servlet.annotation.WebServlet;
import javax.servlet.http.HttpServlet;
import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;

@WebServlet("/api/gettrips")
public class GetTripsServlet extends HttpServlet {
  private final Gson gson = new Gson();
  private final UserService userService = UserServiceFactory.getUserService();
  private final DatastoreService datastore = DatastoreServiceFactory.getDatastoreService();

  @Override
  public void init() {
    System.setProperty(
        DatastoreServiceConfig.DATASTORE_EMPTY_LIST_SUPPORT, Boolean.TRUE.toString());
  }

  @Override
  public void doGet(HttpServletRequest request, HttpServletResponse response) throws IOException {
    UserInfo userInfo = UserInfo.findOrCreateUser(userService, datastore);
    if (userInfo == null) {
      response.setStatus(HttpServletResponse.SC_UNAUTHORIZED);
    }
    List<String> userTripIds = userInfo.getTripIds();
    ArrayList<Trip> userTrips = new ArrayList<Trip>();
    for (String tripId : userTripIds) {
      try {
        Entity tripEntity = datastore.get(KeyFactory.stringToKey(tripId));
        Trip trip = Trip.fromEntity(tripEntity);
        userTrips.add(trip);
      } catch (EntityNotFoundException exception) {
        logger.atInfo().withCause(exception).log("Trip Entity not found: %s", tripId);
        response.setStatus(HttpServletResponse.SC_INTERNAL_SERVER_ERROR);
        return;
      }
    }
    String json = gson.toJson(userTrips);
    response.setContentType("application/json");
    response.getWriter().println(json);
  }
}
