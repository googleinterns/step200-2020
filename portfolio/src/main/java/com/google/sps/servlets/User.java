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

import com.google.errorprone.annotations.Immutable;
import com.google.auto.value.AutoValue;
import com.google.gson.Gson;
import com.google.gson.TypeAdapter;

/** Public information about a user. */
@AutoValue
@Immutable
public abstract class User {
  User() {}

  /** Public username of this user. */
  public abstract String username();

  /** Internal ID of this user. */
  public abstract String id();

  /**  Create a {@link User} with the given username and ID. */
  public static User create(String username, String id) {
    return new AutoValue_User(username, id);
  }

  /** Type adapter to make Gson work with this AutoValue type. */
  public static TypeAdapter<Comment> typeAdapter(Gson gson) {
    return new AutoValue_Comment.GsonTypeAdapter(gson);
  }
}
