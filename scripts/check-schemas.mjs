// Validate the JSON Schemas and the example fixtures against them.
//
// The Python Pydantic models in bluelab-service round-trip against these same
// schemas (docs/MODULARIZATION_PLAN.md §7.3); this script is the schema side.
//
// Run: npm run check:schemas   (needs `npm install`)

import { readFileSync, readdirSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { dirname, join } from "node:path";
import Ajv2020 from "ajv/dist/2020.js";

const here = dirname(fileURLToPath(import.meta.url));
const schemasDir = join(here, "..", "schemas");
const examplesDir = join(here, "..", "examples");

const ajv = new Ajv2020({ allErrors: true, strict: true });

const schemas = new Map();
for (const file of readdirSync(schemasDir).filter((f) => f.endsWith(".schema.json"))) {
  const schema = JSON.parse(readFileSync(join(schemasDir, file), "utf8"));
  ajv.addSchema(schema, schema.$id);
  schemas.set(schema.title, schema);
  console.log(`loaded schema ${schema.title} (${file})`);
}

// Every $ref must resolve.
ajv.compile({ $ref: schemas.get("provision-set@1").$id });

let failures = 0;
let checks = 0;

for (const file of readdirSync(examplesDir).filter((f) => f.endsWith(".json"))) {
  const example = JSON.parse(readFileSync(join(examplesDir, file), "utf8"));
  const title = exampleSchemaTitle(file);
  const schema = schemas.get(title);
  if (!schema) {
    console.error(`no schema for examples/${file}: expected title ${title}`);
    failures++;
    continue;
  }
  const validate = ajv.getSchema(schema.$id);
  checks++;
  if (validate(example)) {
    console.log(`ok   examples/${file}  ->  ${title}`);
  } else {
    failures++;
    console.error(`FAIL examples/${file}  ->  ${title}`);
    for (const err of validate.errors) {
      console.error(`       ${err.instancePath || "/"} ${err.message}`);
    }
  }
}

// Negative check: a malformed provenance event must be rejected.
const caseSchema = ajv.getSchema(schemas.get("case@1").$id);
const badCase = { title: "x", fact_pattern: "y", facts: {}, origin: "made-up" };
checks++;
if (!caseSchema(badCase)) {
  console.log("ok   negative: bad case origin rejected");
} else {
  failures++;
  console.error("FAIL negative: bad case origin was accepted");
}

console.log(`\n${checks} checks, ${failures} failure(s)`);
process.exit(failures === 0 ? 0 : 1);

function exampleSchemaTitle(file) {
  const base = file.replace(".example.json", "");
  return { case: "case@1", "ranked-provisions": "ranked-provisions@1", "provision-set": "provision-set@1" }[base] ?? base;
}
