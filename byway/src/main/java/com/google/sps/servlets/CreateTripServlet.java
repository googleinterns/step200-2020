package com.google.sps.servlets;

import com.google.appengine.api.datastore.DatastoreService;
import com.google.appengine.api.datastore.DatastoreServiceConfig;
import com.google.appengine.api.datastore.DatastoreServiceFactory;
import com.google.appengine.api.users.UserService;
import com.google.appengine.api.users.UserServiceFactory;
import com.google.gson.Gson;
import com.google.sps.data.Trip;
import com.google.sps.data.UserInfo;
import java.io.IOException;
import javax.servlet.annotation.WebServlet;
import javax.servlet.http.HttpServlet;
import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;

/** Servlet that creates new trip entity in datastore and adds to users list of tripKeys  */
@WebServlet("/api/createtrip")
public class CreateTripServlet extends HttpServlet {
  private final Gson gson = new Gson();
  private final UserService userService = UserServiceFactory.getUserService();
  private final DatastoreService datastore = DatastoreServiceFactory.getDatastoreService();

  @Override
  public void init() {
    System.setProperty(
        DatastoreServiceConfig.DATASTORE_EMPTY_LIST_SUPPORT, Boolean.TRUE.toString());
  }

  @Override
  public void doPost(HttpServletRequest request, HttpServletResponse response) throws IOException {
    UserInfo user = UserInfo.findOrCreateUser(userService, datastore);
    if (user == null) {
      response.setStatus(HttpServletResponse.SC_UNAUTHORIZED);
      return;
    }
    Trip trip = Trip.createTrip(datastore);
    addTripForUser(trip, user);
    String json = gson.toJson(trip);
    response.setContentType("application/json");
    response.getWriter().println(json);
  }

  public void addTripForUser(Trip trip, UserInfo user) {
    user.addTrip(trip);
    datastore.put(user.toEntity());
  }
}
