package com.google.sps.servlets;

import com.google.appengine.api.datastore.DatastoreService;
import com.google.appengine.api.datastore.DatastoreServiceFactory;
import com.google.common.flogger.FluentLogger;
import com.google.gson.Gson;
import com.google.sps.data.Trip;
import java.io.IOException;
import javax.servlet.annotation.MultipartConfig;
import javax.servlet.annotation.WebServlet;
import javax.servlet.http.HttpServlet;
import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;

/** Servlet that returns trip id and start location and destinations user inputs */
@MultipartConfig
@WebServlet("/api/destinations")
public class DestinationsServlet extends HttpServlet {

  private static final FluentLogger logger = FluentLogger.forEnclosingClass();

  private final Gson gson = new Gson();
  private final DatastoreService datastore = DatastoreServiceFactory.getDatastoreService();

  @Override
  public void doGet(HttpServletRequest request, HttpServletResponse response) throws IOException {
    Trip trip = Trip.getTrip(datastore, request.getParameter("tripKey"));
    if (trip == null) {
      response.setStatus(HttpServletResponse.SC_NOT_FOUND);
      return;
    }
    response.setContentType("application/json;");
    response.getWriter().println(gson.toJson(trip));
  }

  @Override
  public void doPost(HttpServletRequest request, HttpServletResponse response) throws IOException {
    Trip trip = Trip.getTrip(datastore, request.getParameter("tripKey"));
    if (trip == null) {
      response.setStatus(HttpServletResponse.SC_NOT_FOUND);
      return;
    }
    String start = request.getParameter("start-search-box");
    if (start != null) {
      trip.setStart(start);
    }
    String destination = request.getParameter("destinations-search-box");
    if (destination != null) {
      trip.addDestination(destination);
      trip.addToRoute(destination);
    }
    datastore.put(trip.toEntity());
    response.setContentType("application/json");
    response.getWriter().println(gson.toJson(trip));
  }
}
