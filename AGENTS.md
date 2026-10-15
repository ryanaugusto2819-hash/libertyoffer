<!-- LOVABLE:BEGIN -->
> [!IMPORTANT]
> This project is connected to [Lovable](https://lovable.dev). Avoid rewriting
> published git history — force pushing, or rebasing/amending/squashing commits
> that are already pushed — as it rewrites history on Lovable's side and the
> user will likely lose their project history.
>
> Commits you push to the connected branch sync back to Lovable and show up in
> the editor, so keep the branch in a working state.
<!-- LOVABLE:END -->

- DR Control uses TanStack file routes and reusable feature components, with protected module pages under the managed authenticated layout; this keeps private navigation gated.
- Business writes use validated authenticated server functions or transactional database RPCs with role checks; client state never grants privileges.
- Authentication is invitation-only; initial administrator assignment is an explicit trusted provisioning operation, never first-user signup or editable metadata.
- Files use a private Cloud bucket with entity-aware access policies and signed preview/download URLs; demand item versions are append-only.
- Workspace mutations refresh only affected entity groups; remaining operational modules have independent query caches to avoid global reloads.
- The workspace context lives in a stable dependency-free module shared by the provider and shell; this prevents hot updates from creating mismatched context instances.
- Creative reviews target immutable file versions; publication records reference approved versions, keeping production, review, publication and performance states independent.
- SPY source references are linked to demand items instead of copying storage objects, preserving private attachments and their provenance.
- Attachment panels use the shared scope matcher with a non-empty SPY source guard; null associations must never include unrelated files.
- Researched SPY offers retain provenance through a unique operational destination; a role-checked transactional trigger promotes them, linking ads without copying private files. Operational pages resolve source research and categorized attachments through that association.
- Financial records retain original currency and optional explicit conversion pairs; metric aggregation never combines currencies implicitly.
- Operational and unpromoted SPY offer deletion is admin-only, exact-name confirmed, and performed by database transactions that remove dependent records before deleting the offer; this prevents partial business-data deletion.
- Operational creative deletion is admin-only, exact-name confirmed, and transactional across every dependent workflow record; this prevents orphaned publications, metrics, reviews and private files.

- Account appearance persists on the current device; private avatar files use profile-scoped uploads and signed URLs.
- SPY video transcription uses a bearer-authenticated streaming server route, entity-scoped file reads and per-file cached results with atomic claims; this prevents private-file exposure and duplicate AI charges. Durable service access blocks stop denied or credit-blocked calls across reloads.
- SPY cover generation uses a bearer-authenticated streaming server route and saves completed images as private cover-category files; generation remains an explicit user action to control AI spend.
