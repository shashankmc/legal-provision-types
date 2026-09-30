# legal-provision-types

The BlueLab port types as TypeScript and JSON Schema: the contract that flows
between the case builder, the provision retriever, the document manager, the
annotation step and the service.

No client, no requests, no credentials — import it anywhere, including browser
code.

```bash
npm install legal-provision-types
```

```ts
import type { CaseV1, RankedProvisionsV1, ProvisionSetV1 } from "legal-provision-types";
import { PORT_TYPES, provisionSetToCorpus } from "legal-provision-types";
```

```bash
# JSON Schema, for non-TypeScript consumers (the Python service validates against these)
node_modules/legal-provision-types/schemas/provision-set.v1.schema.json
```

## Why this is separate

The query builder, the visualizer, the retriever and the service must agree on
the same shapes, but none of them should own them:

| Consumer | Needs |
|---|---|
| `vue-legal-case-builder` | `case@1`, to produce it |
| `vue-legal-provision-retriever` | `case@1` in, `ranked-provisions@1` out |
| `vue-legal-document-manager` | `ranked-provisions@1` in, `provision-set@1` out |
| `bluelab-service` (Python) | all of them, validated with Pydantic against the JSON Schema |

Keeping the contract in its own package means browser code can be given
exactly the shapes and nothing more, and the Python and TypeScript sides
cannot drift.

## What is in here

| Type | Shape |
|---|---|
| `case@1` (`CaseV1`) | `{ case_id?, title, fact_pattern, facts, origin }` |
| `ranked-provisions@1` (`RankedProvisionsV1`) | `{ case_id?, query, method, threshold, corpus_version, documents[] }` |
| `provision-set@1` (`ProvisionSetV1`) | `{ case_id?, corpus_version, method, threshold, documents[], provisions[], excluded[], provenance[] }` |
| `ProvenanceEvent` (`ProvenanceEventV1`) | `{ timestamp, action, target_kind, target_id?, reason?, method?, threshold? }` |

The only adapter is exported as a function: `provisionSetToCorpus(set)` maps
each selected provision onto a `corpus@1` document (`name = prov_id`,
`full_text = text`) and drops scores, provenance and exclusions. It restates
and drops, so it satisfies the adapter rule.

`PORT_TYPES` holds the `@1` ids for manifests and registry checks.

## Versioning

The `@1` suffix is the contract version. Shape changes mean a new `@2` type;
`@1` never changes. The JSON Schemas under `schemas/` mirror the types
one-to-one and are checked in CI.

## Development

```bash
npm install
npm run test        # tsc build + schema/example validation
npm run check:schemas
```
