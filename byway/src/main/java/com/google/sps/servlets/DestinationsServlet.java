package com.google.sps.servlets;

import com.google.gson.Gson;
import java.io.IOException;
import java.util.ArrayList;
import javax.servlet.annotation.WebServlet;
import javax.servlet.http.HttpServlet;
import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;


/** Servlet that returns some example content. TODO: modify this file to handle comments data */
@WebServlet("/api/destinations")
public class DestinationsServlet extends HttpServlet {

    private final static class UserLocations{ 
      private String start = "";
      private ArrayList<String> destinations =  new ArrayList<String>();
    }

  private final UserLocations places = new UserLocations();
  private final Gson gson = new Gson();

  @Override
  public void doGet(HttpServletRequest request, HttpServletResponse response) throws IOException {
    String userCurrentandDestinations = gson.toJson(places);
    response.setContentType("application/json;");
    response.getWriter().println(userCurrentandDestinations);
  }

  @Override
  public void doPost(HttpServletRequest request, HttpServletResponse response) throws IOException {
    String current= request.getParameter("start-location");
    String place = request.getParameter("destinations"); 
    places.start = current;
    places.destinations.add(place);

    String userCurrentandDestinations = gson.toJson(places);
    response.setContentType("application/json;");
    response.getWriter().println(userCurrentandDestinations);
    response.sendRedirect("/destinations.html");
  }

}