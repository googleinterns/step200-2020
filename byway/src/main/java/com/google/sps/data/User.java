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

import com.google.appengine.api.datastore.Entity;
import static com.google.common.base.Preconditions.checkArgument;
import static com.google.common.base.Preconditions.checkNotNull;
import java.util.Collection;
import java.util.Collections;
import java.util.ArrayList;
import java.util.List;

/**
 * A class to make a User type, containing an optional 
 * email String and a list of trip IDs the user can have. 
 * Users that are not logged in can only have one trip ID.
 */
public final class User {

  private final String email;
  private final String userId;
  private final ArrayList<String> tripIds;

  public static final String DATASTORE_ENTITY_KIND = "user";

  public User(String email, String userId, Collection<String> tripIds) {
    this.email = checkNotNull(email, "email");
    this.userId = checkNotNull(userId, "userId");
    checkNotNull(tripIds, "tripIds");
    this.tripIds = new ArrayList<>(tripIds);
  }

  public String getEmail() {
    return this.email;
  }

  public List<String> getTripIds() {
    return Collections.unmodifiableList(this.tripIds);
  }

  public String getUserId() {
    return this.userId;
  }

  public static User FromEntity(Entity userEntity) {
    Entity validEntity = checkNotNull(userEntity, "User entity is null");
    checkArgument(validEntity.getKind().equals(DATASTORE_ENTITY_KIND),
      "Wrong entity kind. Expected %s, received %s", DATASTORE_ENTITY_KIND, validEntity.getKind());
    String email = checkNotNull((String) validEntity.getProperty("email"),
      "User entity does not contain an email");
    String userId = checkNotNull((String) validEntity.getProperty("userId"),
      "User entity does not contain a user Id");
    ArrayList<String> tripIds =
      checkNotNull((ArrayList<String>) validEntity.getProperty("tripIds"),
        "User entity does not contain trip Ids");
    return new User(email, userId, tripIds);
  }
} 