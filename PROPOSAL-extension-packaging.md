# Where realtime extensions should live

A follow-up to [fal-js#224](https://github.com/fal-ai/fal-js/pull/224), which added
`defineRealtimeExtension` and three extensions built on it: `wma()`, `lucyRealtime()` and
`websocket()`.

The question this answers: should those extensions move into a package of their own —
`@fal-ai/wma`, or similar — or stay in `@fal-ai/client`?

**Recommendation: keep them in `@fal-ai/client`, and fix the packaging instead.** Then split along
_ownership_, not along "is it an extension", and only when there is a second per-model protocol to
justify it. The rest of this document is why, with the measurements that changed my mind.

---

## 1. The size argument, and why it does not hold

The obvious reason to split is that every consumer of `@fal-ai/client` pays for extensions they do
not use. That is worth measuring rather than assuming, so I measured it — esbuild, minified, ESM,
browser platform, against the real built output.

| What the app imports                        | Bundle   | Notes                                   |
| ------------------------------------------- | -------- | --------------------------------------- |
| `createFalClient` only                      | 74,245 B | already contains msgpack **and** robot3 |
| …plus `wma()` via `realtime/wma.js`         | 79,827 B | **+5.6 KB**                             |
| …plus `wma()` via `@fal-ai/client/realtime` | 87,655 B | **+13.4 KB**                            |

So the _entire_ cost of every extension the app never calls is about **7.8 KB minified** — the
difference between the last two rows.

There is one case where it is not 7.8 KB, and it is the case this whole document is about. An
extension published _outside_ this package imports the contract and nothing else:

| What an external extension imports                                 | Bundle    |
| ------------------------------------------------------------------ | --------- |
| `defineRealtimeExtension` from `@fal-ai/client/realtime`           | 47,748 B  |
| `defineRealtimeExtension` from `@fal-ai/client/realtime/extension` | **711 B** |

Through the barrel, a third-party extension bundles every one of fal's extensions — plus msgpack —
into itself, to obtain one function. That is a 67× difference, and it is the one number here that
genuinely blocks something: it makes an external extension package impossible to ship while the
barrel is the only public entry point.

Two things are worth pulling out of those numbers.

**The barrel is the problem, not the extensions.** Imported through `@fal-ai/client/realtime`, the
bundle is 47.7 KB _whichever single extension you ask for_, and it contains all of them. Imported
directly, `wma.js` is 6.2 KB and `lucy.js` is 4.6 KB. A new package would recover those 7.8 KB —
but so does a `package.json` change, without creating a second thing to version.

Worth noting what is _not_ the cause, since it was my first guess: the package being CommonJS-only.
A deep import of the built CJS `wma.js` already bundles at 6.2 KB with no trace of Lucy, because
each module requires only what it uses. It is the re-export barrel that defeats this, and only the
barrel. An ESM build is therefore not needed to fix it — see §7.

**msgpack is already unavoidable.** `websocket()` looks heavy in isolation (35 KB deep-imported)
but that is almost entirely `@msgpack/msgpack`, which the core client already pulls in because
`fal.realtime.connect()` is exported from the main entry. In any app that calls `createFalClient`,
`websocket()` is close to free. Moving it out of the package would not remove msgpack from anyone's
bundle; it would only duplicate it for anyone who uses both.

I went in expecting the size argument to carry this. It does not. 7.8 KB is not a package.

---

## 2. The seam that does matter

What differs between these three extensions is not size, and not transport. It is **who owns the
protocol, and how long it lives**.

| Tier                        | What it is                            | Examples                                                                                                                                    | Lifetime         |
| --------------------------- | ------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------- | ---------------- |
| **Contract**                | The extension mechanism itself        | `defineRealtimeExtension`, `RealtimeExtension`, `RealtimeSession`, diagnostics, `gatherIceCandidates`, the fal wire format in `protocol.ts` | The SDK's        |
| **Transports fal operates** | Infrastructure fal runs and publishes | `websocket()` (fal's inference protocol), `wma()` (the bridge at `wma.fal.run`)                                                             | The platform's   |
| **Per-model protocols**     | One model's bespoke handshake         | `lucyRealtime()` (Decart), formerly `happyOyster()`                                                                                         | **That model's** |

The first two tiers version with fal. The third does not, and that is the actual problem:

- A Lucy protocol change should not need a client release, and a client release should not wait on
  a model.
- When a model is retired, its extension is either a breaking change to the core SDK's public API
  or dead code that ships forever.
- It does not scale by precedent. Every partner model with a bespoke realtime handshake becomes a
  permanent export in fal's core client. Ten of those and the barrel is a real problem rather than
  a 7.8 KB one.

So if anything leaves `@fal-ai/client`, it is tier 3 — and `@fal-ai/wma` is the wrong home for it.
That name says "the WMA standard" but the contents would be "everything we wrote that happens to be
an extension", including a protocol WMA has nothing to do with. A package whose only organizing
principle is "custom" is a junk drawer, and its dependents inherit every reason any of its contents
changes.

---

## 3. What each thing should hold

**`@fal-ai/client`** — the contract and the transports fal operates. Concretely: `open()`,
`connect()`, `defineRealtimeExtension` and its types, `ice.ts`, `protocol.ts`, `websocket()`,
`wma()`.

`websocket()` in particular should not move. It shares `protocol.ts` — URL building, msgpack
framing, error classification — with `connect()`, which is the mechanism that stops fal's two doors
onto one protocol from drifting apart. Splitting them means either exporting `protocol.ts` as
public API or duplicating the wire format in two packages that must then agree by convention.

`wma()` is the closer call, since WMA is a standard with its own spec and cadence. It stays for now
because fal operates the bridge and this is the reference implementation of a standard fal
publishes — but it is the thing to reconsider first if WMA's spec starts moving faster than the
SDK.

**A per-model package, when there are two of them** — named for what it is, not for "custom".
`@fal-ai/realtime-lucy`, or better, published by whoever owns the model. It depends on
`@fal-ai/client` as a peer, and exports one extension.

**Nothing today.** One per-model protocol does not need a package. Two does.

---

## 4. If a WMA package is worth having, it is not for the extension

Worth separating from the above, because it is the one version of `@fal-ai/wma` I would argue _for_
— and its contents are not extensions.

`wma()` deliberately does not model WMA's control protocol. The type is literally
`export type WmaControlMessage = object`, and `onData` hands back a raw string, because a transport
cannot know a model's schema. That is the right call for the extension.

But the schema does exist, in exactly one place and one language: `registry/wma/protocol.py`, where
`KeysMessage`, `session_info` and the `ServerMessage` union are Pydantic models. On the TypeScript
side there is nothing, so every consumer re-derives it by hand — the demo does
`JSON.parse(raw)` and declares its own `BrainrotResult` locally, which is a schema copied out of a
runner by reading it.

That is the real missing artifact, and it is shared by three consumers that are currently
unaligned: the runner, the browser client, and the model playground. It also now has an upstream
source of truth — the `x-fal-realtime` OpenAPI extension — which means those types could be
**generated** rather than written twice and kept in sync by discipline.

So: a WMA package holding _protocol types generated from the contract_ is defensible and useful. A
WMA package holding _the extensions we happen to have written_ is the junk drawer. They are not the
same proposal, and only the first one is about WMA.

## 5. What is already true, and is easy to miss

`@fal-ai/client/realtime` **already exports the full extension contract** —
`defineRealtimeExtension`, every type, and `gatherIceCandidates`, with a comment in
`realtime/index.ts` saying it exists "so an extension living outside this package can reuse the
strategy rather than reimplement it".

And the coupling runs one way only: `realtime.ts`, `index.ts`, `config.ts` and `client.ts` contain
**zero** references to `wma`, `lucy` or `websocket`. Removing the implicit `supports()` routing is
what did that — the kernel no longer discovers extensions, it is handed one.

Which means **a third party can publish a fal realtime extension today**, with no change to this
package. The architecture is already where a split would take it. That is the strongest reason not
to rush one: the option stays open at zero cost, so it can be exercised when there is a reason
rather than in anticipation of one.

---

## 6. What splitting actually costs

The part that is easy to underestimate. Today the extension contract is an internal convention —
`RealtimeExtensionContext` can change shape in a patch release because every implementation lives in
this repo and moves with it.

The moment one extension ships from another package, that contract becomes a **semver-stable public
API**. Every field on the context, every diagnostic shape, every lifecycle guarantee. It also drags
in `realtime/testing.ts` (`fakeExtensionContext`), which is not exported today — an external
extension cannot currently be unit-tested without hand-rolling a fake, which is exactly what the
typed fake was added to stop.

That is a permanent tax, and a reasonable one to pay for a real ownership boundary. It is not a
reasonable one to pay for 7.8 KB.

---

## 7. Proposed sequence

**Steps 1 and 2 are done** — they are cheap, non-breaking, and worth doing whatever is decided about
packages, so they are implemented in this branch rather than left as a recommendation.

1. **Per-extension subpath exports + `sideEffects: false`.** ✅ `@fal-ai/client/realtime/wma`,
   `/lucy`, `/websocket`, `/ice`, `/extension`, `/testing`, each with matching `typesVersions`. The
   barrel keeps working, so nothing breaks.

   Measured through real package resolution, before → after:

   | Case                                      | Before   | After                           |
   | ----------------------------------------- | -------- | ------------------------------- |
   | App importing the client + `wma()`        | 88,230 B | **80,402 B** (−7.8 KB, no Lucy) |
   | External extension importing the contract | 47,748 B | **711 B** (−98.5%)              |

2. **Ship `fakeExtensionContext`.** ✅ Under `@fal-ai/client/realtime/testing`, which meant dropping
   `src/**/testing.ts` from `tsconfig.lib.json`'s exclude list. It imports only types, so it costs
   nothing to ship, and it stays out of the `./realtime` barrel so no runtime bundle pays for it.
   An extension is only useful outside this package if it can be _tested_ outside this package.

3. **No ESM build.** Deliberately dropped from this step after measuring. It would not buy anything
   here — subpath exports already recover every byte — and `@nx/js:tsc` emits extensionless relative
   imports, which are valid for bundlers but **not resolvable by Node's native ESM loader**. Pointing
   an `exports.import` condition at that output would break `import` in Node for a saving of zero.
   Dual-format is a real change with a real hazard; it should be its own decision, made for its own
   reasons.

4. **When there is a second per-model protocol:** move them out, one package per owner, peer-
   depending on `@fal-ai/client`. Not before.

5. **Revisit `wma()` separately** if the WMA spec's cadence diverges from the SDK's. That is a
   different question from Lucy's, and it should not be answered by the same package.

## What would change this

- A partner wanting to own and ship their own extension — that forces step 3 early, and is a good
  reason.
- The client gaining a dependency that only one extension needs. msgpack is already shared with
  `connect()`, so nothing today has this shape, but a WebRTC extension pulling a polyfill would.
- `@fal-ai/client` becoming import-heavy enough that 7.8 KB stops being noise. It is 74 KB before
  any extension, so the extensions are not where to look first.
