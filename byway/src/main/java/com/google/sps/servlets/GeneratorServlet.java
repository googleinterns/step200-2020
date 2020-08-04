package com.google.maps;

import com.google.appengine.api.datastore.DatastoreService;
import com.google.appengine.api.datastore.DatastoreServiceFactory;
import com.google.appengine.api.datastore.Entity;
import com.google.appengine.api.datastore.EntityNotFoundException;
import com.google.appengine.api.datastore.PreparedQuery;
import com.google.appengine.api.datastore.PreparedQuery.TooManyResultsException;
import com.google.appengine.api.datastore.Query;
import com.google.appengine.api.datastore.Query.FilterPredicate;
import com.google.appengine.api.datastore.Query.FilterOperator;
import com.google.gson.Gson;
import com.google.maps.model.PlaceType;
import java.io.IOException;
import java.util.ArrayList;
import java.util.Arrays;
import javax.servlet.annotation.WebServlet;
import javax.servlet.http.HttpServlet;
import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;

/**
 * Servlet that loads places of interest from
 * a specified user, previously configured.
 */
@WebServlet("/api/generator")
public class GeneratorServlet extends HttpServlet {

  private final Gson gson = new Gson();
  private final DatastoreService datastore = DatastoreServiceFactory.getDatastoreService();
  /**
  public void init(){
    Entity en = new Entity("user");
    en.setProperty("id", 2452);
    datastore.put(en);
  }
  **/
  /**
   * Temporary setup to retrieve a user entity with a specific trip id,
   * hard-coded as '2452' at the moment. Retrieves and returns their interests.
   */
  @Override
  public void doGet(HttpServletRequest request, HttpServletResponse response) throws IOException {
    Query person =
        new Query("user")
            .setFilter(new FilterPredicate("id", FilterOperator.EQUAL, 2452));
    PreparedQuery pq = datastore.prepare(person);
    Entity userEntity = pq.asSingleEntity();
    if(userEntity != null) {
        System.out.println("userEntity not null");
      // ArrayList<String> interestsSelected = (ArrayList) userEntity.getProperty("interests");
      ArrayList<String> interestsSelected = new ArrayList<>(Arrays.asList("Park", "Art"));
      response.setContentType("application/json;");
      response.getWriter().println(gson.toJson(interestsSelected));
    } else {
      System.out.println("userEntity  null");
      response.setStatus(response.SC_NOT_FOUND);
    }
  }
}