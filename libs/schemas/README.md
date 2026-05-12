# @fal-ai/schemas

Runtime schemas for fal.ai API endpoints. Ships **JSON Schema** definitions for tooling plus **Zod** schemas for validation — no TypeScript type definitions.

If you want TypeScript types, derive them from the Zod schemas with `z.infer<typeof someSchema>` (or `z.input` / `z.output` to keep optional-with-default fields optional on the input side).

## Install

```bash
npm install @fal-ai/schemas
# Zod is a peer dependency, only needed if you import from `./zod` or `./zod/{category}`
npm install zod
```

## Entry points

The package ships as ES Modules with per-category subpath exports so bundlers only pull in what you import.

JSON Schemas (no `zod` peer required):

- `@fal-ai/schemas` — default entry, re-exports the namespaced JSON Schemas.
- `@fal-ai/schemas/schemas` — same as above; every category exposed under its own namespace (e.g. `Image.AestheticsSchema`).
- `@fal-ai/schemas/schemas/{category}` — JSON Schemas for a single category. Categories: `3d`, `audio`, `image`, `json`, `llm`, `speech`, `text`, `training`, `unknown`, `video`, `vision`, `workflow`.

Zod (requires `zod ^4`):

- `@fal-ai/schemas/zod` — every category namespaced (e.g. `Image.imageEndpoints`, `Image.zAuraFlowInput`). Raw schema names collide across categories, so the top-level barrel namespaces per category.
- `@fal-ai/schemas/zod/{category}` — single category's `{category}Endpoints` record (a typed `{ [endpointId]: { input, output } }` map), the `{Category}EndpointId` key-union type, and every `z*Input` / `z*Output` schema.

## Bundle size and tree-shaking

Every file in this package is side-effect-free (`sideEffects: false`), so bundlers can tree-shake on a per-export basis:

| Import                                                            | What ships                                                                                                                                                                                |
| ----------------------------------------------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `import { zVeo3Input } from "@fal-ai/schemas/zod/video"`          | Just `zVeo3Input` and the sub-schemas it references (a few KB gzipped).                                                                                                                   |
| `import { Veo3InputSchema } from "@fal-ai/schemas/schemas/video"` | Same, for the JSON Schema side.                                                                                                                                                           |
| `import { videoEndpoints } from "@fal-ai/schemas/zod/video"`      | The whole category — the record literal references every endpoint's schema, so bundlers can't drop them. Use this when you want every endpoint addressable by id (typed-client dispatch). |
| `import { Video } from "@fal-ai/schemas/zod"`                     | All 12 categories. Avoid — import the specific category instead.                                                                                                                          |

Zod schemas ship without `z.globalRegistry` metadata. Descriptions, examples, and titles live on the JSON Schema side (`schemas.gen.ts`) — read them from there if you need them at runtime.

## Examples

### Validate input for Kling 3 Pro (text-to-video)

The endpoint id `fal-ai/kling-video/o3/pro/text-to-video` maps to `zKlingVideoO3ProTextToVideoInput`. Parsing rejects unsupported durations before you ever send a request:

```ts
import { videoEndpoints } from "@fal-ai/schemas/zod/video";

const result = videoEndpoints["fal-ai/kling-video/o3/pro/text-to-video"].input.safeParse({
  prompt: "A mecha lands on the ground to save the city, in anime style",
  duration: "8", // ok — Kling 3 Pro supports 3–15s
  aspect_ratio: "9:16",
});

if (!result.success) {
  console.error(result.error.issues);
} else {
  // result.data is fully typed: duration is "3" | "4" | … | "15"
}
```

### Discover what a model supports (durations, resolutions, aspect ratios)

For introspection — building pickers, rendering docs, populating dropdowns — reach for the JSON Schema rather than the Zod schema. JSON Schemas are emitted `as const`, so property access yields readonly tuples of string literals without any unwrapping or casts, and you don't need the `zod` peer dependency:

```ts
import { KlingVideoO3ProTextToVideoInputSchema, Veo3InputSchema } from "@fal-ai/schemas/schemas/video";

KlingVideoO3ProTextToVideoInputSchema.properties.duration.enum;
// ["3","4","5","6","7","8","9","10","11","12","13","14","15"]
KlingVideoO3ProTextToVideoInputSchema.properties.aspect_ratio.enum;
// ["16:9","9:16","1:1"]

Veo3InputSchema.properties.resolution.enum; // ["720p", "1080p"]
Veo3InputSchema.properties.duration.enum; // ["4s", "6s", "8s"]
Veo3InputSchema.properties.aspect_ratio.enum; // ["16:9", "9:16"]
```

The Zod schemas wrap most fields with `.optional().default(...)`, so introspecting them means peeling those layers off — fine if you're already on the Zod side, but the JSON Schema is the simpler path.

### Cross-check Minimax Hailuo-02 constraints

Hailuo-02 standard image-to-video supports either 6s or 10s — but the API rejects 10s at 1080p. Parse rejects the bad enum value; the higher-level "10s + 1080p" rule lives in the field description, so verify before submitting:

```ts
import { videoEndpoints } from "@fal-ai/schemas/zod/video";

const hailuo = videoEndpoints["fal-ai/minimax/hailuo-02/standard/image-to-video"].input;
hailuo.parse({
  prompt: "Slow dolly-in on a snow leopard at dawn",
  image_url: "https://example.com/leopard.jpg",
  duration: "10", // fine
  resolution: "768P", // ok — switch to "1080P" + "10" and the API will refuse
});
```

### Validate Flux 2 image-size presets

```ts
import { z } from "zod";
import { zFlux2Input } from "@fal-ai/schemas/zod/image";

// image_size is a union of a custom size object and a preset enum.
zFlux2Input.parse({
  prompt: "Studio portrait, dramatic rim light",
  image_size: "portrait_16_9", // preset
});

zFlux2Input.parse({
  prompt: "Wide landscape, golden hour",
  image_size: { width: 1536, height: 864 }, // custom size
  num_images: 2,
  guidance_scale: 3.5,
});
```

### Validate ElevenLabs Eleven v3 TTS input

Text is bounded 1–5000 chars; `stability` is `0..1`. Parsing surfaces both at once:

```ts
import { audioEndpoints } from "@fal-ai/schemas/zod/audio";

const tts = audioEndpoints["fal-ai/elevenlabs/tts/eleven-v3"].input;
const result = tts.safeParse({
  text: "Welcome to the show.",
  voice: "Rachel",
  stability: 0.6,
  apply_text_normalization: "auto",
});
```

### Typed-client dispatch

The per-category `*Endpoints` record narrows `input`/`output` on the endpoint id without per-endpoint overloads or `as` casts:

```ts
import { z } from "zod";
import { videoEndpoints, type VideoEndpointId } from "@fal-ai/schemas/zod/video";

async function callVideo<E extends VideoEndpointId>(endpoint: E, input: z.input<(typeof videoEndpoints)[E]["input"]>): Promise<z.output<(typeof videoEndpoints)[E]["output"]>> {
  const parsed = videoEndpoints[endpoint].input.parse(input);
  // …POST `parsed` to fal, then:
  // return videoEndpoints[endpoint].output.parse(rawResponse);
}

const video = await callVideo("fal-ai/veo3", {
  prompt: "A timelapse of clouds over Patagonia, cinematic",
  resolution: "1080p",
  duration: "8s",
});
```

### Agent workflows: turn a prompt into a validated fal call

The JSON Schemas plug directly into LLM tool/structured-output APIs, so you can hand an agent a fal endpoint and let it fill the params from a free-form user request. Then run the model's output through the matching Zod schema as a final guardrail before shipping it to fal — that catches hallucinated enums, out-of-range numbers, and missing required fields cheaply, without a round-trip.

**Anthropic tool use** — register a fal endpoint as a tool the agent can call:

```ts
import Anthropic from "@anthropic-ai/sdk";
import { KlingVideoO3ProTextToVideoInputSchema } from "@fal-ai/schemas/schemas/video";
import { videoEndpoints } from "@fal-ai/schemas/zod/video";

const anthropic = new Anthropic();

const response = await anthropic.messages.create({
  model: "claude-sonnet-4-6",
  max_tokens: 1024,
  tools: [
    {
      name: "generate_kling_video",
      description: "Generate a video with Kling 3 Pro from a text prompt.",
      input_schema: KlingVideoO3ProTextToVideoInputSchema,
    },
  ],
  messages: [{ role: "user", content: "Make me a 9:16 anime mecha clip, about 8 seconds long, lands in a city." }],
});

for (const block of response.content) {
  if (block.type !== "tool_use" || block.name !== "generate_kling_video") continue;

  // Guardrail: validate the model's args against the same schema fal will reject on.
  const parsed = videoEndpoints["fal-ai/kling-video/o3/pro/text-to-video"].input.safeParse(block.input);

  if (!parsed.success) {
    // Feed parsed.error.issues back to the model and ask it to retry.
  } else {
    // parsed.data is now safe to send to fal.
  }
}
```

**OpenAI structured outputs / tool calls** follow the same shape — the `parameters` field on a tool definition (or `response_format.json_schema.schema`) accepts the same JSON Schema:

```ts
{
  type: "function",
  function: {
    name: "generate_veo3_video",
    parameters: Veo3InputSchema,
  },
}
```

**TanStack AI** — `toolDefinition()` accepts the Zod schema directly (and JSON Schema, ArkType, Valibot too), and `.server()` lets you wire the actual fal call as the tool's executor so the agent loop runs end-to-end:

```ts
import { chat, toolDefinition } from "@tanstack/ai";
import { anthropicText } from "@tanstack/ai-anthropic";
import { fal } from "@fal-ai/client";
import { z } from "zod";
import { zKlingVideoO3ProTextToVideoInput, zKlingVideoO3ProTextToVideoOutput } from "@fal-ai/schemas/zod/video";

const klingTool = toolDefinition({
  name: "generate_kling_video",
  description: "Generate a video with Kling 3 Pro from a text prompt.",
  inputSchema: zKlingVideoO3ProTextToVideoInput,
  outputSchema: zKlingVideoO3ProTextToVideoOutput,
}).server(async (input) => {
  // `input` is z.output<typeof zKlingVideoO3ProTextToVideoInput> — defaults
  // applied, enums narrowed, ready to ship.
  const { data } = await fal.subscribe("fal-ai/kling-video/o3/pro/text-to-video", { input });
  return data;
});

const result = await chat({
  adapter: anthropicText("claude-sonnet-4-6"),
  tools: [klingTool],
  messages: [{ role: "user", content: "Make me a 9:16 anime mecha clip, ~8s, lands in a city." }],
});
```

**Picking an endpoint dynamically.** If the agent can choose between models, register each fal endpoint as a separate tool — the LLM picks one and emits matched args. Don't bundle them under a single tool with a "model" parameter: distinct tools with their own schemas give the LLM tighter constraints and let you reject impossible combinations (like 10s @ 1080p on Hailuo-02) per-tool instead of relying on a giant union.

### Derive TypeScript types

```ts
import { z } from "zod";
import { zVeo3Input } from "@fal-ai/schemas/zod/video";

type Veo3Request = z.input<typeof zVeo3Input>; // optional+default fields stay optional
type Veo3Validated = z.output<typeof zVeo3Input>; // defaults applied, narrowed
```

### Validate with Ajv (no Zod required)

The JSON Schemas drop straight into any JSON-Schema-aware validator:

```ts
import Ajv from "ajv";
import { Veo3InputSchema } from "@fal-ai/schemas/schemas/video";

const validate = new Ajv().compile(Veo3InputSchema);
validate({ prompt: "…", duration: "8s" });
```

### Envelope validation

There is no exported `discriminatedUnion` over `{ endpoint, input, output }`. The per-endpoint record covers narrowing and the typed-client pattern above; dispatch via the record:

```ts
videoEndpoints[payload.endpoint].input.parse(payload.input);
```

## Contributing

Schemas are generated from upstream OpenAPI specs — see [CONTRIBUTING.md](./CONTRIBUTING.md) for the regeneration pipeline.

## Peer dependencies

- `zod ^4` — required if you import from `./zod` or `./zod/{category}`.

The Zod peer dependency is optional in `package.json`. Skip it if you only need the JSON Schemas.
