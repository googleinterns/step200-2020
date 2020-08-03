package com.google.sps.servlets;
import java.util.ArrayList;
/**
* Stores users start location and destinaions as they add additional places
*/
// TODO(renau06): add "fromEntity" method to create UserLocations from a datastore entity
public class UserLocations{ 
  private String trip_id;
  private String start;
  private ArrayList<String> destinations;
  
  public UserLocations(String trip_id, String start, ArrayList destinations) {
    this.trip_id = trip_id;
    this.start = start;
    this.destinations = destinations;
  }
  /**
  * returns trip_id as a string 
  */
  public String getTrpId(){
    return trip_id;
  } 

  /**
  * returns start location as a string of a formatted-address 
  */
  public String getStart(){
    return start;
  } 

  /**
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