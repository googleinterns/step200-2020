package com.google.sps.servlets;
import java.util.ArrayList;
/*
* Stores users start location and destinaions as they add additional places
*/

public class UserLocations{ 
  private String start;
  private ArrayList<String> destinations;
  
  public UserLocations(String start, ArrayList destinations) {
    this.start = start;
    this.destinations = destinations;
  }

  /*
  * returns start location as a string of a formatted-address 
  */
  public String getStart(){
    return start;
  } 

  /*
  * returns ArrayList of users input destinations as strings of formatted-addresses
  */   
  public ArrayList<String> getDestinations(){
    return destinations;
  }

  public void setStart(String startLocation){
    start=startLocation;
  }

  public void addDestination(String location){
    destinations.add(location);
  }
}