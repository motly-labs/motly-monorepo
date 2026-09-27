// A static server for the demos, so the visual regression suite needs nothing but Node.
import { readFile } from 'node:fs/promises';
import { createServer } from 'node:http';
import { extname, join, normalize } from 'node:path';

const root = import.meta.dirname;
const types = { '.html': 'text/html', '.mjs': 'text/javascript', '.js': 'text/javascript' };

createServer(async (request, response) => {
  // Only the path is read from the URL, so any base will do.
  const path = normalize(decodeURIComponent(new URL(request.url, 'http://x').pathname));
  try {
    const body = await readFile(join(root, path));
    response.writeHead(200, { 'content-type': types[extname(path)] ?? 'application/octet-stream' });
    response.end(body);
  } catch {
    response.writeHead(404).end();
  }
}).listen(4173);
