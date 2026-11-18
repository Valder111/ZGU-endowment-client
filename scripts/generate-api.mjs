import { execFileSync } from 'node:child_process';
import { mkdir, readFile, writeFile } from 'node:fs/promises';
import path from 'node:path';

const root = path.resolve(import.meta.dirname, '..');
const server = path.resolve(root, '../ZGU-endowment-server');
const args = process.argv.slice(2);
if (args.length && (args[0] !== '--server-ref' || args.length !== 2))
  throw new Error('Usage: npm run gen:api -- [--server-ref origin/main]');
const git = (...arguments_) =>
  execFileSync('git', arguments_, { cwd: server, encoding: 'utf8' }).trim();
const same = (first, second) =>
  JSON.stringify(first) === JSON.stringify(second);
const object = (value) =>
  value && typeof value === 'object' && !Array.isArray(value);

// Apply only the additional branch's changes since its common ancestor.
// Conflicting changes stop generation instead of silently changing a contract.
function merge(base, current, incoming, key = '$') {
  if (same(current, incoming) || same(base, incoming)) return current;
  if (same(base, current)) return incoming;
  if (object(current) && object(incoming) && (!base || object(base))) {
    const result = {};
    for (const name of new Set([
      ...Object.keys(base || {}),
      ...Object.keys(current),
      ...Object.keys(incoming),
    ])) {
      const value = merge(
        base?.[name],
        current[name],
        incoming[name],
        `${key}.${name}`,
      );
      if (value !== undefined) result[name] = value;
    }
    return result;
  }
  throw new Error(
    `Conflicting server API changes at ${key}. Merge the server contracts first.`,
  );
}

let schema = JSON.parse(
  await readFile(path.join(server, 'docs/swagger.json'), 'utf8'),
);
if (args[1]) {
  const ref = git('rev-parse', '--verify', `${args[1]}^{commit}`);
  const ancestor = git('merge-base', 'HEAD', ref);
  const readSpec = (commit) =>
    JSON.parse(git('show', `${commit}:docs/swagger.json`));
  schema = merge(readSpec(ancestor), schema, readSpec(ref));
  console.log(`Including server contract changes from ${ref}`);
}
const cache = path.join(root, '.migration/api-codegen');
await mkdir(cache, { recursive: true });
const input = path.join(cache, 'swagger.json');
await writeFile(input, JSON.stringify(schema, null, 2) + '\n');
execFileSync(
  process.execPath,
  [
    path.join(root, 'node_modules/swagger-typescript-api/dist/cli.mjs'),
    'generate',
    '--axios',
    '--path',
    input,
    '--output',
    path.join(root, 'src/api/generated'),
    '--name',
    'index.ts',
    '--modular',
    '--module-name-first-tag',
    '--responses',
    '--extract-request-body',
    '--extract-response-body',
    '--extract-response-error',
    '--enum-style',
    'union',
    '--type-only-imports',
  ],
  { cwd: root, stdio: 'inherit' },
);
execFileSync(
  process.execPath,
  [
    path.join(root, 'node_modules/prettier/bin/prettier.cjs'),
    '--write',
    'src/api/generated',
  ],
  { cwd: root, stdio: 'inherit' },
);
