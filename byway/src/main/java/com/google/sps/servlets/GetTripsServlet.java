package com.google.sps.servlets;

import com.google.appengine.api.datastore.DatastoreService;
import com.google.appengine.api.datastore.DatastoreServiceConfig;
import com.google.appengine.api.datastore.DatastoreServiceFactory;
import com.google.appengine.api.users.UserService;
import com.google.appengine.api.users.UserServiceFactory;
import com.google.common.flogger.FluentLogger;
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
  private static final FluentLogger logger = FluentLogger.forEnclosingClass();

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
      Trip trip = Trip.getTrip(datastore, tripId);
      if (trip == null) {
        response.setStatus(HttpServletResponse.SC_NOT_FOUND);
      } else {
        userTrips.add(trip);
      }
    }
    String json = gson.toJson(userTrips);
    response.setContentType("application/json");
    response.getWriter().println(json);
  }
}
