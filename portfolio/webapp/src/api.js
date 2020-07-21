const prod = Object.freeze({
  URL: '/api',
});

const dev = Object.freeze({
  // Explicitly pointing dev servers to localhost:8000 allows using yarn start
  // in combination with mvn package appengine:run without having to constantly
  // run yarn build and copy the output back to the maven-managed folder.
  URL: 'http://localhost:8000/api'
});

/** Conditional parameters for which API URL/endpoints to use. */
export const api = process.env.NODE_ENV === 'development' ? dev : prod;

/** 
 * Create a URL to an endpoint within the API using the given path and
 * parameters.
 */
export const buildApiUrl = (path, params) => {
  let url = api.URL + "/" + path;
  if (params) {
    url += "?" + new URLSearchParams(params).toString();
  }
  return url
}
