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

import com.google.appengine.api.datastore.Entity;

/** A sample class to mock data received from another datastore table */
// TODO: Make a parent class that Rec and Stop can extend
public final class Recommendation {
  /** We may need to add more fields later, so making a class seemed reasonable. */
  private final long id;
  private final String placename;

  public static final String KIND = "Recommendation";

  public Recommendation(long id, String placename) {
    this.id = id;
    this.placename = placename;
   
  }

  public static Recommendation fromEntity(Entity entity) {
    checkArgument(
        entity.getKind().equals(KIND),
        "Wrong Entity kind, expected %s, got %s",
        KIND,
        entity.getKind());
    long id = entity.getKey().getId();
    String placename = (String) entity.getProperty("placename");

    return new Recommendation(id, placename);
  }
}
