// Proxy all /api/* requests to the worker
export async function onRequest(context) {
  const { request, env, params } = context;
  
  // Get the path after /api/
  const url = new URL(request.url);
  const workerUrl = `https://swing-platform.brianduryea.workers.dev${url.pathname}`;
  
  console.log(`Proxying ${url.pathname} to ${workerUrl}`);
  
  // Forward the request to the worker
  const workerRequest = new Request(workerUrl, {
    method: request.method,
    headers: request.headers,
    body: request.body,
  });
  
  const response = await fetch(workerRequest);
  
  // Return the worker's response
  return new Response(response.body, {
    status: response.status,
    statusText: response.statusText,
    headers: response.headers,
  });
}