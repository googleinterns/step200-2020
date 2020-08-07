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
import com.google.appengine.api.datastore.Key;
import com.google.appengine.api.datastore.KeyFactory;
import static com.google.common.base.Preconditions.checkArgument;
import static com.google.common.base.Preconditions.checkNotNull;
import java.util.Collection;
import java.util.Collections;
import java.util.ArrayList;
import java.util.List;

/**
 * A class to make a UserInfo type, containing an
 * email, id and a list of trip IDs per user.
 */
public final class UserInfo {

  public static final String DATASTORE_ENTITY_KIND = "user";

  private final String email;
  private final String id;
  private final ArrayList<Key> tripIds;

  public UserInfo(String email, String id, Collection<Key> tripIds) {
    this.email = checkNotNull(email, "email");
    this.id = checkNotNull(id, "id");
    checkNotNull(tripIds, "tripIds");
    this.tripIds = new ArrayList<>(tripIds);
  }

  public String getEmail() {
    return this.email;
  }

  public List<Key> getTripIds() {
    return Collections.unmodifiableList(this.tripIds);
  }

  public String getId() {
    return this.id;
  }

  public Key getKey() {
    return KeyFactory.stringToKey(this.id);
  }

  public static UserInfo fromEntity(Entity userEntity) {
    checkNotNull(userEntity, "User entity is null");
    checkArgument(userEntity.getKind().equals(DATASTORE_ENTITY_KIND),
      "Wrong entity kind. Expected %s, received %s", DATASTORE_ENTITY_KIND, userEntity.getKind());
    String email = checkNotNull((String) userEntity.getProperty("email"),
      "User entity does not contain an email");
    String id = checkNotNull((String) userEntity.getProperty("id"),
      "User entity does not contain a key string");
    ArrayList<Key> tripIds =
      checkNotNull((ArrayList<Key>) userEntity.getProperty("tripIds"),
        "User entity does not contain trip Ids");
    return new UserInfo(email, id, tripIds);
  }
} 