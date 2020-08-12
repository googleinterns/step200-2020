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

package com.google.sps.data;

import static com.google.common.base.Preconditions.checkArgument;
import static com.google.common.base.Preconditions.checkNotNull;

import com.google.appengine.api.datastore.DatastoreService;
import com.google.appengine.api.datastore.Entity;
import com.google.appengine.api.datastore.EntityNotFoundException;
import com.google.appengine.api.datastore.Key;
import com.google.appengine.api.datastore.KeyFactory;
import com.google.appengine.api.users.User;
import com.google.appengine.api.users.UserService;
import java.util.ArrayList;
import java.util.Collection;
import java.util.Collections;
import java.util.List;

/** A class to make a UserInfo type, containing an email, id and a list of trip IDs per user. */
public final class UserInfo {

  public static final String DATASTORE_ENTITY_KIND = "user";

  private final String email;
  private final String userId;
  private final ArrayList<String> tripIds;

  /**
   * Constructor to make an instance of UserInfo.
   *
   * @param email user's email as plain text
   * @param userId unique String provided by UserService
   * @param tripIds list of trip IDs as string representations of Keys to a Trip Entity
   */
  public UserInfo(String email, String userId, Collection<String> tripIds) {
    this.email = checkNotNull(email, "email");
    this.userId = checkNotNull(userId, "userId");
    checkNotNull(tripIds, "tripIds");
    this.tripIds = new ArrayList<>(tripIds);
  }

  /* Retrieves user email as a String. */
  public String getEmail() {
    return this.email;
  }

  /** Retrieves a list of trip IDs. Stored as strings which are convertible to Key types. */
  public List<String> getTripIds() {
    return Collections.unmodifiableList(this.tripIds);
  }

  /* Retrieves the unique user ID as a String. */
  public String getUserId() {
    return this.userId;
  }

  /**
   * Creates a Key to reference this entity on datastore with the user id and the kind of UserInfo.
   */
  public Key getKey() {
    return KeyFactory.createKey(DATASTORE_ENTITY_KIND, this.userId);
  }

  /**
   * Creates an instance of this class from the provided Entity. Checks for valid properties of the
   * entity to make a valid UserInfo instance.
   *
   * @param userInfoEntity entity from datastore
   */
  public static UserInfo fromEntity(Entity userInfoEntity) {
    checkNotNull(userInfoEntity, "User entity is null");
    checkArgument(
        userInfoEntity.getKind().equals(DATASTORE_ENTITY_KIND),
        "Wrong entity kind. Expected %s, received %s",
        DATASTORE_ENTITY_KIND,
        userInfoEntity.getKind());
    String email =
        checkNotNull(
            (String) userInfoEntity.getProperty("email"), "User entity does not contain an email");
    String userId =
        checkNotNull(userInfoEntity.getKey().getName(), "User entity does not contain a userId");
    ArrayList<String> tripIds =
        checkNotNull(
            (ArrayList<String>) userInfoEntity.getProperty("tripIds"),
            "User entity does not contain trip Ids");
    return new UserInfo(email, userId, tripIds);
  }

  /**
   * Creates an instance of this class from the provided Entity. Checks for valid properties of the
   * entity to make a valid UserInfo instance.
   *
   * @param userInfoEntity entity from datastore
   */
  public static Entity toEntity(DatastoreService datastore) {
    User user = userService.getCurrentUser();
    Key userKey = KeyFactory.createKey(UserInfo.DATASTORE_ENTITY_KIND, user.getUserId());
    try {
      // try to retrieve the entity with the key
      Entity userEntity = datastore.get(this.userId);
      userEntity.setProperty("email", this.email);
      userEntity.setProperty("tripIds", this.tripIds);
    } catch (EntityNotFoundException exception) {
      logger.atInfo().withCause(exception).log("User Entity not found: %s", userKey);
      response.setStatus(HttpServletResponse.SC_INTERNAL_SERVER_ERROR);
      return;
    }
  }

  /**
   * Finds a User or creates User if User doesnt exist
   *
   * @param userService UserServiceFactory.getUserService()
   * @param datastore DatastoreServiceFactory.getDatastoreService()
   */
  public static UserInfo findOrCreateUser(UserService userService, DatastoreService datastore) {
    User user = userService.getCurrentUser();
    // Create a key based on the user ID
    if (userService.getCurrentUser() == null) {
      return null;
    }
    Key userKey = KeyFactory.createKey(UserInfo.DATASTORE_ENTITY_KIND, user.getUserId());
    UserInfo userInfo;
    try {
      // try to retrieve the entity with the key
      Entity userEntity = datastore.get(userKey);
      userInfo = UserInfo.fromEntity(userEntity);
    } catch (EntityNotFoundException exception) {
      // If the user doesn't exist yet or is new, create a new user
      Entity newUserEntity = new Entity(userKey);
      newUserEntity.setProperty("email", user.getEmail());
      newUserEntity.setProperty("tripIds", new ArrayList<String>());
      datastore.put(newUserEntity);
      userInfo = UserInfo.fromEntity(newUserEntity);
    }
    return userInfo;
  }
}
