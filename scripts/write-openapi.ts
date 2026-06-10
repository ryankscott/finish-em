/**
 * Writes the generated OpenAPI document to openapi.json at the repo root so
 * API changes show up in diffs. Run with: bun run openapi:write
 */

import path from 'node:path'

import { createApp } from '../src/server/http/app'

const app = createApp()
const response = await app.request('/api/openapi.json')
if (!response.ok) {
  console.error(`Failed to generate OpenAPI document: ${response.status}`)
  process.exit(1)
}
const doc = await response.json()
const outPath = path.join(import.meta.dir, '..', 'openapi.json')
await Bun.write(outPath, `${JSON.stringify(doc, null, 2)}\n`)
console.log(`Wrote ${outPath}`)
