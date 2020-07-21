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
import com.google.appengine.api.users.UserService;
import com.google.appengine.api.users.User;
import com.google.appengine.api.users.UserServiceFactory;
import com.google.appengine.api.datastore.DatastoreServiceFactory;
import com.google.appengine.api.datastore.EntityNotFoundException;
import com.google.appengine.api.datastore.DatastoreService;
import com.google.appengine.api.datastore.Key;
import com.google.appengine.api.datastore.KeyFactory;
import com.google.appengine.api.datastore.Entity;
import com.google.appengine.api.datastore.PreparedQuery;
import com.google.appengine.api.datastore.Query;
import com.google.auto.value.AutoValue;
import com.google.common.base.Splitter;
import com.google.common.collect.Iterables;
import com.google.gson.Gson;
import com.google.gson.TypeAdapter;
import java.util.Optional;

/** Public information about a user. */
@AutoValue
@Immutable
public abstract class UserInfo {
  UserInfo() {}

  private static final DatastoreService datastore = DatastoreServiceFactory.getDatastoreService();
  private static final UserService userService = UserServiceFactory.getUserService();

  private static String KIND = "UserInfo";

  /** Convert a string ID to a database key. */
  private static Key idToKey(String id) {
    return KeyFactory.createKey(KIND, id);
  }

  /** Public username of this user. */
  public abstract String username();

  /** Internal ID of this user. */
  public abstract String id();

  /** Key for this user in the database. */
  public final Key key() {
    return idToKey(id());
  }

  /** Create a {@link UserInfo} with the given username and ID. */
  public static UserInfo create(String username, String id) {
    return new AutoValue_UserInfo(username, id);
  }

  /** Create or update the user in the datastore. */
  public static UserInfo put(String username, String id) {
    Entity entity = new Entity(KIND, id);
    entity.setProperty("username", username);
    datastore.put(entity);
    return create(username, id);
  }

  /** Get the user with the given ID from the datastore. */
  public static Optional<UserInfo> get(String id) {
    return get(idToKey(id));
  }

  /** Get the user with the given Key from the datastore. */
  public static Optional<UserInfo> get(Key key) {
    checkArgument(key.getKind().equals(KIND), "Key has wrong kind, expected %s, got %s", KIND, key.getKind());
    Entity entity = null;
    try {
      entity = datastore.get(key);
    } catch (EntityNotFoundException ex) {
      return Optional.empty();
    }
    return Optional.of(create((String) entity.getProperty("username"), key.getName()));
  }

  /** Get the current logged-in user, if any. If the user is logged in and not in the database, they will be added. */
  public static Optional<UserInfo> getCurrentUser() {
    User user = userService.getCurrentUser();
    if (user == null) {
      return Optional.empty();
    }
    Optional<UserInfo> userInfo = get(user.getUserId());
    if (userInfo.isPresent()) {
      return userInfo;
    }
    Entity userEntity = new Entity(KIND, user.getUserId());
    String nick = emailToNick(user.getEmail());
    userEntity.setProperty("username", nick);
    datastore.put(userEntity);
    return Optional.of(create(nick, user.getUserId()));
  }

  private static final Splitter NICK_SPLITTER = Splitter.on('@');
  private static final String DEFAULT_NAME = "<unnamed user>";

  /** Create an initial nickname from the user's email. */
  private static String emailToNick(String email) {
    String nick = Iterables.getFirst(NICK_SPLITTER.split(email), DEFAULT_NAME);
    if (nick.isEmpty()) {
      return DEFAULT_NAME;
    }
    return nick;
  }

  /** Type adapter to make Gson work with this AutoValue type. */
  public static TypeAdapter<Comment> typeAdapter(Gson gson) {
    return new AutoValue_Comment.GsonTypeAdapter(gson);
  }
}
