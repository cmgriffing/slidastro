
import { dev } from 'astro';
async function test() {
  const server = await dev({ root: process.cwd() });
  console.log('Server keys:', Object.keys(server));
  console.log('Server address:', server.address);
  // console.log('Resolved URLs:', server.resolvedUrls);
  await server.stop();
}
test();
