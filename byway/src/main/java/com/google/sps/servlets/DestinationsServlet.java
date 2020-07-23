package com.google.sps.servlets;


import com.google.gson.Gson;
import java.io.IOException;
import javax.servlet.annotation.WebServlet;
import javax.servlet.http.HttpServlet;
import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;
import java.util.ArrayList;

/** Servlet that returns some example content. TODO: modify this file to handle comments data */
@WebServlet("/destinations")
public class DestinationsServlet extends HttpServlet {

    public static class UserLocations{ 
        String start;
        ArrayList<String> destinations;

        public UserLocations(){
            this.start = "";
            this.destinations= new ArrayList<String>();
        }
    }

    

UserLocations places = new UserLocations();
Gson gson = new Gson();

  @Override
  public void doGet(HttpServletRequest request, HttpServletResponse response) throws IOException {
    String userCurrentandDestinations = gson.toJson(places);
    response.setContentType("application/json;");
    response.getWriter().println(userCurrentandDestinations);
  }

  public void doPost(HttpServletRequest request, HttpServletResponse response) throws IOException {
      String current= request.getParameter("start-location");
      String place = request.getParameter("destinations");
      //String address= request.getParameter("city").formatter_address;
    places.start = current;
    places.destinations.add(place);

    String userCurrentandDestinations = gson.toJson(places);
    response.setContentType("application/json;");
    response.getWriter().println(userCurrentandDestinations);
    response.sendRedirect("/Destinations.html");
      
  }

}