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
import java.util.ArrayList;

/** A simplified version of the Trip.java class **/ 
public final class Trip{
  private final long id;
  private final ArrayList<String> destinations;
  public static final String KIND = "Trip";
  
  public Trip(long id, ArrayList<String> destinations) {
    this.id = id;
    this.destinations = destinations;
  }

  public static Trip fromEntity(Entity entity){
    checkArgument(entity.getKind().equals(KIND), "Wrong Entity kind, expected %s, got %s", KIND, entity.getKind());
    long id = entity.getKey().getId();
    ArrayList destinations = (ArrayList<String>) entity.getProperty("destinations");
    return new Trip(id, destinations);
  }
}