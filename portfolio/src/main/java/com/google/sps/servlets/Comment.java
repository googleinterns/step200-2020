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

import static com.google.common.base.Preconditions.checkArgument;

import com.google.errorprone.annotations.Immutable;
import com.google.appengine.api.datastore.Entity;
import com.google.appengine.api.datastore.DatastoreService;
import com.google.appengine.api.datastore.DatastoreServiceFactory;
import com.google.appengine.api.datastore.Key;
import com.google.appengine.api.datastore.PreparedQuery;
import com.google.appengine.api.datastore.Query;
import com.google.auto.value.AutoValue;
import com.google.gson.Gson;
import com.google.gson.TypeAdapter;

/** Represents a Comment from the database. */
@AutoValue
@Immutable
public abstract class Comment {
  Comment() {}

  private static final DatastoreService datastore = DatastoreServiceFactory.getDatastoreService();

  /** Entity kind for Comment Entities. */
  private static final String KIND = "Comment";

  /** Text content of this comment. */
  public abstract String content();

  /** {@link UserInfo} who posted this comment. */
  public abstract UserInfo author(); 

  /** Timestamp when this comment was posted. */
  public abstract long timestamp();

  /** ID of this comment in the datastore. */
  public abstract long id();

  /** Create a {@link Comment} with the given content, user, and explicit ID. */
  public static Comment create(String content, UserInfo author, long timestamp, long id) {
    return new AutoValue_Comment(content, author, timestamp, id);
  }

  /** Create and save a comment entity with the given content and author. */
  public static Comment save(String content, UserInfo author) {
    long timestamp = System.currentTimeMillis();
    Entity comment = new Entity(KIND);
    comment.setProperty("content", content);
    comment.setProperty("author", author.key());
    comment.setProperty("timestamp", timestamp);
    datastore.put(comment);
    return create(content, author, timestamp, comment.getKey().getId());
  }

  /** Create a query over Comments. */
  public static Query query() {
    return new Query(KIND);
  }

  /** Get a comment from the given comment entity. */
  public static Comment fromEntity(Entity comment) {
    checkArgument(comment.getKind().equals(KIND), "Wrong Entity kind, expected %s, got %s", KIND, comment.getKind());   
    return create(
        (String) comment.getProperty("content"),
        UserInfo.get((Key) comment.getProperty("author")).get(),
        (long) comment.getProperty("timestamp"),
        comment.getKey().getId());
  }

  /** Type adapter to make Gson work with this AutoValue type. */
  public static TypeAdapter<Comment> typeAdapter(Gson gson) {
    return new AutoValue_Comment.GsonTypeAdapter(gson);
  }
}
