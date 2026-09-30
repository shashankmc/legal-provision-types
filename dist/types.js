/**
 * BlueLab shared port types.
 *
 * These describe what flows between the BlueLab pipeline modules
 * (docs/MODULARIZATION_PLAN.md §3). The `@1` suffix is the contract version:
 * add a new `@2` type rather than changing a `@1` shape.
 *
 * No client, no requests, no credentials — safe to import from browser code.
 */
/**
 * The only adapter: `provision-set@1 -> corpus@1`.
 * Each selected provision becomes one document; scores, provenance and
 * exclusions are dropped. It restates and drops, so it satisfies the
 * adapter rule (docs/MODULARIZATION_PLAN.md §2).
 */
export function provisionSetToCorpus(provisionSet) {
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
};
