/**
 * BlueLab shared port types.
 *
 * These describe what flows between the BlueLab pipeline modules
 * (docs/MODULARIZATION_PLAN.md §3). The `@1` suffix is the contract version:
 * add a new `@2` type rather than changing a `@1` shape.
 *
 * No client, no requests, no credentials — safe to import from browser code.
 */

/** Where a case came from: a prepared scenario or one typed in by hand. */
export type CaseOrigin = "scenario" | "custom";

/** How a document or provision entered the selection. */
export type SelectionSource = "system" | "manual";

/** What a provenance event acted on. */
export type ProvenanceTargetKind = "case" | "document" | "provision" | "retrieval";

/**
 * A compliance case: a fact pattern plus structured facts. Output of the
 * case builder, input to the provision retriever.
 */
export interface CaseV1 {
  case_id?: string;
  title: string;
  fact_pattern: string;
  facts: Record<string, unknown>;
  origin: CaseOrigin;
}

/** One provision as returned by retrieval, with a short preview of its text. */
export interface RankedProvisionV1 {
  prov_id: string;
  citation: string | null;
  article: string;
  score: number;
  text_preview: string;
}

/** One ranked document, with its provisions ranked within it. */
export interface RankedDocumentV1 {
  doc_id: string;
  title: string;
  score: number;
  top_provision: string;
  provisions: RankedProvisionV1[];
}

/**
 * Ranked retrieval output. Output of the provision retriever, input to the
 * document manager.
 */
export interface RankedProvisionsV1 {
  case_id?: string;
  query: string;
  method: string;
  threshold: number;
  corpus_version: string | null;
  documents: RankedDocumentV1[];
}

/** A document in the selection. */
export interface ProvisionSetDocumentV1 {
  doc_id: string;
  title: string;
  origin: SelectionSource;
}

/** A selected provision. */
export interface ProvisionSetProvisionV1 {
  prov_id: string;
  doc_id: string;
  citation: string | null;
  text: string | null;
  score: number | null;
  source: SelectionSource;
}

/** A document the reviewer excluded, with the reason they gave. */
export interface ExcludedDocumentV1 {
  doc_id: string;
  reason: string | null;
}

/**
 * One review action, logged in the provenance trail. `target_kind` says what
 * was acted on; `target_id` is the case id, doc_id or prov_id accordingly.
 */
export interface ProvenanceEventV1 {
  timestamp: string;
  action: string;
  target_kind: ProvenanceTargetKind;
  target_id?: string | null;
  reason?: string | null;
  method?: string | null;
  threshold?: number | null;
}

/**
 * The reviewer's selection. Output of the document manager, input to the
 * annotation step (via the `provision-set@1 -> corpus@1` adapter).
 */
export interface ProvisionSetV1 {
  case_id?: string;
  corpus_version: string | null;
  method: string;
  threshold: number;
  documents: ProvisionSetDocumentV1[];
  provisions: ProvisionSetProvisionV1[];
  excluded: ExcludedDocumentV1[];
  provenance: ProvenanceEventV1[];
}

/** The `corpus@1` document shape the adapter projects a provision onto. */
export interface CorpusDocumentV1 {
  name: string;
  full_text: string;
}

/**
 * The only adapter: `provision-set@1 -> corpus@1`.
 * Each selected provision becomes one document; scores, provenance and
 * exclusions are dropped. It restates and drops, so it satisfies the
 * adapter rule (docs/MODULARIZATION_PLAN.md §2).
 */
export function provisionSetToCorpus(provisionSet: ProvisionSetV1): CorpusDocumentV1[] {
  return provisionSet.provisions.map((p) => ({
    name: p.prov_id,
    full_text: p.text ?? "",
  }));
}

/** Port type ids, for manifests and registry checks. */
export const PORT_TYPES = {
  case: "case@1",
  rankedProvisions: "ranked-provisions@1",
  provisionSet: "provision-set@1",
} as const;

export type PortTypeId = (typeof PORT_TYPES)[keyof typeof PORT_TYPES];
