// Copyright 2019 Google LLC
//
// Licensed under the Apache License, Version 2.0 (the "License");
// you may not use this file except in compliance with the License.
// You may obtain a copy of the License at
//
//     https://www.apache.org/licenses/LICENSE-2.0
//
// Unless required by applicable law or agreed to in writing, software
// distributed under the License is distributed on an "AS IS" BASIS,
// WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
// See the License for the specific language governing permissions and
// limitations under the License.

package com.google.sps.servlets;

import com.google.gson.Gson;
import java.io.IOException;
import java.util.ArrayList;
import javax.servlet.annotation.WebServlet;
import javax.servlet.http.HttpServlet;
import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;

/** Servlet that handles data for stops */

@WebServlet("/api/stop")
public final class StopsServlet extends HttpServlet {

  ArrayList<String> stops= new ArrayList<String>();
  private final Gson gson = new Gson(); 
  // Implement datastore in routepage branch

  @Override
  public void doGet(HttpServletRequest request, HttpServletResponse response) throws IOException {
    Gson gson = new Gson();
    String json=gson.toJson(stops);
    
    response.setContentType("application/json;");
    response.getWriter().println(json);
  }

  /* Method which modifies the stops ArrayList */
  @Override
  public void doPost(HttpServletRequest request, HttpServletResponse response) throws IOException {
    String stop = request.getParameter("text");
    String action = request.getParameter("action");
    if(action.equals("add")){
       stops.add(stop);
    }
    else if(action.equals("remove")){
        stops.remove(stop);
    }
    // response.sendRedirect("/routepage.html"); 
  }
}
