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

import com.google.common.io.CharStreams;
import java.io.IOException;
import java.io.InputStreamReader;
import java.nio.charset.StandardCharsets;
import javax.servlet.annotation.WebServlet;
import javax.servlet.http.HttpServlet;
import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;
import javax.servlet.ServletException;

/** Servlet that serves the react page on all URLs that aren't otherwise matched. */
@WebServlet("/*")
public class ReactServlet extends HttpServlet {

  private static final String INDEX_PATH = "/index.html";

  private String indexPage;

  @Override
  public void init() throws ServletException {
    try {
      indexPage = 
          CharStreams.toString(
              new InputStreamReader(
                getServletConfig().getServletContext().getResourceAsStream(INDEX_PATH),
                StandardCharsets.UTF_8));
    } catch (IOException e) {
      throw new ServletException("Unable to load react index page", e);
    }
  }

  @Override
  public void doGet(HttpServletRequest request, HttpServletResponse response) throws IOException {
    response.setContentType("text/html;");
    response.getWriter().println(indexPage);
  }
}
