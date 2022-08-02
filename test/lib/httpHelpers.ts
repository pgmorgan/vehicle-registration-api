/* eslint-disable */
import fetch from "node-fetch";

/**
 * Send a GET request to the local instance of the server, returning the response
 *
 * @param route API route to GET from.
 * @param query Query string to include (e.g. '?value=3').
 * @returns GET response.
 */
// eslint-disable-next-line @typescript-eslint/explicit-module-boundary-types
export async function get(route: string, queryObj?: any): Promise<any> {
  let query = "?";
  if (queryObj !== undefined) {
    for (const [key, value] of Object.entries(queryObj)) {
      query += key + "=" + (value as string) + "&";
    }
  }
  const lastChar = query.charAt(query.length - 1);
  if (lastChar === "&" || lastChar === "?") {
    query = query.slice(0, -1);
  }
  console.debug(`GET request to ${route}${query}`);
  const response = await fetch(`http://localhost:${process.env.PORT}${route}${query}`);
  return response;
}

/**
 * Send a POST request to the local instance of the server, returning the response
 *
 * @param route API route to POST to.
 * @param request POST request body (sent as JSON).
 * @returns POST response.
 */
export async function post(route: string, request: Record<string, unknown>): Promise<any> {
  console.debug(`POST request to ${route}`, request);
  const response = await fetch(`http://localhost:${process.env.PORT}${route}`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(request, null, 2),
  });
  return response;
}

/**
 * Send a PUT request to the local instance of the server, returning the response
 *
 * @param route API route to GET from.
 * @param query Query string to include (e.g. '?value=3').
 * @param request PUT request body (sent as JSON).
 * @returns PUT response.
 */
export async function put(
  route: string,
  query?: string,
  request?: Record<string, unknown>,
): Promise<any> {
  const definedQuery = query !== undefined ? "/" + query : "";
  const definedBody = request !== undefined ? request : {};
  console.debug(`PUT request to ${route}${definedQuery}`);
  const response = await fetch(`http://localhost:${process.env.PORT}${route}${definedQuery}`, {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(definedBody, null, 2),
  });
  return response;
}

/**
 * Send a PATCH request to the local instance of the server, returning the response
 *
 * @param route API route to GET from.
 * @param query Query string to include (e.g. '?value=3').
 * @param request PATCH request body (sent as JSON).
 * @returns PATCH response.
 */
export async function patch(
  route: string,
  query?: string,
  request?: Record<string, unknown>,
): Promise<any> {
  const definedQuery = query !== undefined ? "/" + query : "";
  const definedBody = request !== undefined ? request : {};
  console.debug(`PATCH request to ${route}${definedQuery}`);
  const response = await fetch(`http://localhost:${process.env.PORT}${route}${definedQuery}`, {
    method: "PATCH",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(definedBody, null, 2),
  });
  return response;
}