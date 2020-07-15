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

/** An item on the comment section. */
public final class Comment {
  /** We may need to add more fields later, so making a class seemed reasonable. */
  private final long id;
  private final String text;
  private final long timestamp;
  private final String email;
  

  public Comment(long id, String text, long timestamp, String email){
    this.id = id;
    this.text = text;
    this.timestamp = timestamp;
    this.email = email;
  }
}