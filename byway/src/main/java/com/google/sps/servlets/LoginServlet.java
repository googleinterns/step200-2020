package com.google.sps.servlets;

import com.google.appengine.api.datastore.DatastoreService;
import com.google.appengine.api.datastore.DatastoreServiceFactory;
import com.google.appengine.api.users.UserService;
import com.google.appengine.api.users.UserServiceFactory;
import com.google.gson.Gson;
import com.google.sps.data.LoginState;
import java.io.IOException;
import javax.servlet.annotation.WebServlet;
import javax.servlet.http.HttpServlet;
import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;

@WebServlet("/api/login")
public class LoginServlet extends HttpServlet {
  private final Gson gson = new Gson();
  private final UserService userService = UserServiceFactory.getUserService();
  private final DatastoreService datastore = DatastoreServiceFactory.getDatastoreService();

  private static final String URL_TO_REDIRECT_TO_AFTER_LOGIN = "/home.html";
  private static final String URL_TO_REDIRECT_TO_AFTER_LOGOUT = "/index.html";

  @Override
  public void doGet(HttpServletRequest request, HttpServletResponse response) throws IOException {
    boolean isLoggedIn = userService.isUserLoggedIn();
    String url =
        isLoggedIn
            ? userService.createLogoutURL(URL_TO_REDIRECT_TO_AFTER_LOGOUT)
            : userService.createLoginURL(URL_TO_REDIRECT_TO_AFTER_LOGIN);
    LoginState loginState = new LoginState(isLoggedIn, url);
    String json = gson.toJson(loginState);
    response.setContentType("application/json;");
    response.getWriter().println(json);
    return;
  }
}
