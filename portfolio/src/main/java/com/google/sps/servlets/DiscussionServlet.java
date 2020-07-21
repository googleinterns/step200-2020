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

import java.io.IOException;
import com.google.appengine.api.datastore.DatastoreService;
import com.google.appengine.api.datastore.DatastoreServiceFactory;
import com.google.appengine.api.datastore.Entity;
import com.google.appengine.api.datastore.PreparedQuery;
import com.google.appengine.api.datastore.Query;
import com.google.appengine.api.datastore.Query.SortDirection;
import com.google.appengine.api.users.UserService;
import com.google.appengine.api.users.UserServiceFactory;
import com.google.common.collect.Streams;
import java.util.stream.Collectors;
import java.util.List;
import java.util.Optional;
import javax.servlet.annotation.WebServlet;
import javax.servlet.http.HttpServlet;
import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;

/** Servlet that manages discussion data. */
@WebServlet("/api/discussion")
public class DiscussionServlet extends HttpServlet {

  private final DatastoreService datastore = DatastoreServiceFactory.getDatastoreService();

  @Override
  public void doGet(HttpServletRequest request, HttpServletResponse response) throws IOException {
    int page;
    try {
      page = Integer.parseInt(request.getParameter("page"));
    } catch (NumberFormatException ex) {
      page = 0;
    }
    if (page < 0) {
      page = 0;
    }
    int commentsPerPage;
    try {
      commentsPerPage = Integer.parseInt(request.getParameter("commentsPerPage"));
    } catch (NumberFormatException ex) {
      commentsPerPage = 1;
    }
    if (commentsPerPage < 1) {
      commentsPerPage = 1;
    }

    Query query = new Query("Comment").addSort("timestamp", SortDirection.DESCENDING);
    PreparedQuery results = datastore.prepare(query);

    List<Comment> comments =
        Streams.stream(results.asIterable())
            .skip(page * commentsPerPage)
            .limit(commentsPerPage)
            .map(Comment::fromEntity)
            .collect(Collectors.toList());

    String json = SharedResources.GSON.toJson(comments);
    response.setContentType("application/json");
    response.setCharacterEncoding("UTF-8");
    response.getWriter().println(json);
  }

  @Override
  public void doPost(HttpServletRequest request, HttpServletResponse response) throws IOException {
    response.setCharacterEncoding("UTF-8");
    response.setContentType("application/json");

    Optional<UserInfo> currentUser = UserInfo.getCurrentUser();
    if (!currentUser.isPresent()) {
      response.setStatus(HttpServletResponse.SC_UNAUTHORIZED);
      response.getWriter().println("{\"error\": \"Not Logged In\"}");
      return;
    }
    String content = request.getParameter("comment");

    Comment newComment = Comment.save(content, currentUser.get());

    response.getWriter().println(SharedResources.GSON.toJson(newComment));
  }

}
