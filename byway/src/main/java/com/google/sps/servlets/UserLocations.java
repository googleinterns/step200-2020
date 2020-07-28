package com.google.sps.servlets;
import java.util.ArrayList;

public class UserLocations{ 
  private String start;
  private ArrayList<String> destinations;
  
  public UserLocations(String start, ArrayList destinations) {
    this.start = start;
    this.destinations = destinations;
  }

  public String getStart(){
    return start;
  } 
     
  public ArrayList getDestinations(){
    return destinations;
  }

  public void setStart(String startLocation){
    start=startLocation;
  }

  public void addDestination(String location){
    destinations.add(location);
  }
}