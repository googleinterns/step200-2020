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

import static com.google.common.base.Preconditions.checkNotNull;

import com.google.auto.value.AutoValue;
import com.google.cloud.datastore.Datastore;
import com.google.cloud.datastore.DatastoreOptions;
import com.google.gson.Gson;
import com.google.gson.GsonBuilder;
import javax.servlet.ServletContext;

/** Represents a Comment from the database. */
@AutoValue
public abstract class SharedResources {
  SharedResources() {}

  /** {@link Gson} object configured with support for AutoValue types. */
  public abstract Gson gson();

  /** Raw access to the {@link Datastore}. */
  public abstract Datastore datastore();

  /** Attribute name to attach to the servlet context under. */
  private static final String ATTRIBUTE_NAME = SharedResources.class.getName();

  /** 
   * Create the SharedResources object and attach it to the ServletContext. 
   * 
   * Should only be called by the SharedResourcesSetupListener.
   */
  static void attachToContext(ServletContext context) {
    SharedResources instance = new AutoValue_SharedResources(
        new GsonBuilder().registerTypeAdapterFactory(AutoValueGsonAdapterFactory.create()).create(),
        DatastoreOptions.getDefault());
    context.setAttribute(ATTRIBUTE_NAME, instance);
  }

  /** 
   * Clean up the shared resources and remove it from the context.
   *
   * Should only be called by the SharedResourcesSetupListener.
   */
  static void cleanupFromContext(ServletContext context) {
    context.removeAttribute(ATTRIBUTE_NAME);
  }

  /** 
   * Get the SharedResources object from the given context. Throws if no
   * SharedResources is found in the context.
   */
  public static SharedResources get(ServletContext context) {
    return (SharedResources) checkNotNull(
        context.getAttribute(ATTRIBUTE_NAME),
        "SharedResources not found in context.");
  }
}
