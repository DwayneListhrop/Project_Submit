# Learning Session Engine V8.1 evidence guard

The existing standalone V8 app now validates learning events before changing learner scores. The original file identity is preserved; `recovered-artifacts.json` records both the original V8 bytes and the patched V8.1 bytes.

The public `DBuildsSession` and `DBuildsPluginBridge` names, five stages, report schema and legacy event calls remain available. Attempts require boolean correctness. Mastery requires a known stage and nonempty evidence. Invalid events return `{accepted:false, reason}` without scoring. Unknown valid dotted telemetry types remain non-scoring telemetry.

For retry-safe delivery, producers should send a stable string `eventId`. The deduplication key is the current session plus resolved source plus event ID. Accepted IDs survive session persistence because they are recorded in the event history. Resetting a session clears them. No-ID legacy calls remain accepted without a deduplication guarantee. Distinct attempts must use distinct IDs even when their answers match.

Teacher/test flags (`teacherTest`, `teacherMode`, `testMode`, `teacher`, or `mode: 'teacher'/'test'`) exclude event scoring. The app adds a teacher test toggle; leaving it restarts the current activity at Build and clears demonstration readiness while retaining earned scores. Plug-in sample evidence buttons are always teacher/test evidence. Journey completion and native interaction counts are excluded while the session toggle is on.

Trusted engine metadata overrides caller id/time/stage; evidence reports use text nodes. JSON-normalized scoring fields are validated, and unavailable storage does not throw from persistence. Browser storage availability still determines whether local progress survives closing the page. Historical scores are retained without retroactive certification.

## Regression evidence

`learning-event-source.js` is an exact source excerpt fixture containing the actual guard, emitter, mastery percentage and bridge from the patched standalone app. It is a test fixture, not a standalone browser engine module. `learning-event.test.cjs` executes those functions in a Node VM. Set `LEARNING_ENGINE_HTML` to the full local HTML path to run the same suite against the actual app source. CI runs the fixture; it does not fetch or execute the external HTML.

The patch does not verify that producer learning criteria are scientifically valid. Older atom/circuit completion criteria, full application startup and interactions, real browser/device behavior, and cross-app adapters remain separate work. Release gates remain blocked.
