// Local protocol fixture only. No LLM, paid calls, persistence, or production auth.
import { randomUUID } from "node:crypto";
import { createServer } from "node:http";
import { pathToFileURL } from "node:url";

export async function startReferenceServer(port = 0) {
  const responses = new Map();
  const conversations = new Map();
  const keys = new Map();
  const timers = new Set();
  const clone = (value) => JSON.parse(JSON.stringify(value));
  const later = (fn, ms) => {
    const timer = setTimeout(() => {
      timers.delete(timer);
      fn();
    }, ms);
    timers.add(timer);
  };
  const json = (res, value, status = 200) => {
    res.writeHead(status, { "Content-Type": "application/json" });
    res.end(JSON.stringify(value));
  };
  const isStopped = (r) =>
    ["completed", "failed", "cancelled", "incomplete"].includes(r.status) ||
    r.fal.phase === "waiting_for_input";
  const history = (conversationId, item) => {
    const c = conversations.get(conversationId);
    if (c)
      c.items.push({
        id: randomUUID(),
        sequence_number: c.items.length,
        ...clone(item),
      });
  };
  const publish = (entry) => {
    entry.value.fal.sequence_number++;
    const event = {
      type: "response.snapshot",
      response_id: entry.value.id,
      sequence_number: entry.value.fal.sequence_number,
      response: clone(entry.value),
    };
    entry.events.push(event);
    const c = conversations.get(entry.value.fal.conversation_id);
    if (c)
      c.active_response_ids = [...responses.values()]
        .filter(
          (e) =>
            e.value.fal.conversation_id === c.id &&
            !["completed", "failed", "cancelled", "incomplete"].includes(
              e.value.status,
            ),
        )
        .map((e) => e.value.id);
    for (const watcher of entry.watchers) {
      watcher.write(`data: ${JSON.stringify(event)}\n\n`);
      if (isStopped(entry.value)) watcher.end();
    }
  };
  let base;
  const generate = (entry) => {
    if (entry.value.status !== "in_progress") return;
    const r = entry.value;
    const operation = {
      id: randomUUID(),
      type: "fal.operation",
      kind: "generation",
      name: "demo_image",
      status: "queued",
      artifact_ids: [],
      error: null,
    };
    r.output.push(operation);
    r.fal.phase = "running";
    publish(entry);
    later(() => {
      if (r.status !== "in_progress") return;
      operation.status = "in_progress";
      publish(entry);
      later(() => {
        if (r.status !== "in_progress") return;
        const artifact = {
          id: randomUUID(),
          type: "fal.artifact",
          kind: "media",
          media_type: "image",
          revision: 1,
          produced_by: operation.id,
          files: [
            {
              role: "primary",
              url: `${base}/demo.svg`,
              mime_type: "image/svg+xml",
            },
          ],
          metadata: { synthetic: true },
        };
        operation.status = "completed";
        operation.artifact_ids = [artifact.id];
        r.output.push(artifact, {
          id: randomUUID(),
          type: "message",
          role: "assistant",
          status: "completed",
          content: [
            {
              type: "output_text",
              text: "Here is a synthetic demo artifact (no model was called).",
              annotations: [],
            },
          ],
        });
        r.fal.final_artifact_ids = [artifact.id];
        r.status = "completed";
        r.fal.phase = "finished";
        r.usage = { cost: { currency: "USD", settled: 0 } };
        for (const item of r.output)
          history(r.fal.conversation_id, {
            response_id: r.id,
            type: "output",
            item,
          });
        publish(entry);
      }, 40);
    }, 40);
  };

  const server = createServer(async (req, res) => {
    try {
      const url = new URL(req.url, base);
      const path = url.pathname
        .split("/")
        .filter(Boolean)
        .map(decodeURIComponent);
      if (url.pathname === "/demo.svg") {
        res.writeHead(200, { "Content-Type": "image/svg+xml" });
        res.end(
          '<svg xmlns="http://www.w3.org/2000/svg" width="640" height="360"><rect width="640" height="360" fill="#f5b66b"/><text x="35" y="180" font-size="26">Agent SDK synthetic test artifact</text></svg>',
        );
        return;
      }
      if (req.headers.authorization !== "Key local-demo")
        return json(
          res,
          { message: "Use local-demo for this loopback fixture" },
          401,
        );
      let raw = "";
      for await (const chunk of req) {
        raw += chunk;
        if (raw.length > 1_000_000)
          return json(res, { message: "Request too large" }, 413);
      }
      const body = raw ? JSON.parse(raw) : {};
      const key = req.headers["idempotency-key"];
      const fingerprint = `${req.method}:${url.pathname}:${raw}`;
      const replay = key && keys.get(key);
      if (replay) {
        if (replay.fingerprint !== fingerprint)
          return json(res, { message: "Idempotency conflict" }, 409);
        return json(res, replay.result);
      }
      const finishMutation = (result) => {
        if (key) keys.set(key, { fingerprint, result: clone(result) });
        json(res, result);
      };
      if (path[0] !== "v1") return json(res, { message: "Not found" }, 404);
      if (
        path[1] === "responses" &&
        path.length === 2 &&
        req.method === "POST"
      ) {
        if (!key)
          return json(res, { message: "Idempotency-Key required" }, 400);
        if (body.conversation && !conversations.has(body.conversation))
          return json(res, { message: "Conversation not found" }, 404);
        const id = randomUUID();
        const conversationId = body.conversation ?? randomUUID();
        if (!conversations.has(conversationId))
          conversations.set(conversationId, {
            id: conversationId,
            title: null,
            active_response_ids: [],
            items: [],
          });
        const value = {
          id,
          status: "in_progress",
          output: [],
          error: null,
          usage: null,
          fal: {
            conversation_id: conversationId,
            phase: "running",
            sequence_number: 0,
            pending_input_ids: [],
            final_artifact_ids: [],
          },
        };
        const entry = { value, events: [], watchers: new Set() };
        responses.set(id, entry);
        conversations.get(conversationId).active_response_ids.push(id);
        history(conversationId, {
          response_id: id,
          type: "input",
          input: body.input,
        });
        finishMutation(value);
        later(() => {
          if (value.status !== "in_progress") return;
          if (body.fal?.on_ambiguity === "assume" || body.conversation) {
            generate(entry);
            return;
          }
          const q = {
            id: randomUUID(),
            type: "fal.input_request",
            kind: "clarification",
            status: "pending",
            prompt: "Choose a visual direction.",
            questions: [
              {
                id: "style",
                text: "What style?",
                multiple: false,
                options: [
                  { id: "studio", label: "Studio" },
                  { id: "outdoor", label: "Outdoors" },
                ],
                allow_text: true,
              },
            ],
          };
          value.output.push(q);
          value.fal.pending_input_ids = [q.id];
          value.fal.phase = "waiting_for_input";
          publish(entry);
        }, 20);
        return;
      }
      if (path[1] === "responses" && path[2]) {
        const entry = responses.get(path[2]);
        if (!entry) return json(res, { message: "Response not found" }, 404);
        const r = entry.value;
        if (req.method === "GET" && path.length === 3) {
          if (url.searchParams.get("stream") !== "true") return json(res, r);
          res.writeHead(200, {
            "Content-Type": "text/event-stream",
            "Cache-Control": "no-cache",
          });
          res.flushHeaders();
          const cursor = Number(url.searchParams.get("starting_after") ?? -1);
          for (const event of entry.events)
            if (event.sequence_number > cursor)
              res.write(`data: ${JSON.stringify(event)}\n\n`);
          if (isStopped(r)) {
            res.end();
            return;
          }
          entry.watchers.add(res);
          res.on("close", () => entry.watchers.delete(res));
          return;
        }
        if (req.method === "POST" && path[3] === "input") {
          const q = r.output.find(
            (item) =>
              item.id === body.input_request_id &&
              item.type === "fal.input_request",
          );
          if (r.status !== "in_progress" || !q || q.status !== "pending")
            return json(res, { message: "Input is no longer pending" }, 409);
          if (
            body.answer?.kind !== "answers" ||
            !Array.isArray(body.answer.answers)
          )
            return json(res, { message: "Expected question answers" }, 422);
          q.status = "answered";
          r.fal.pending_input_ids = [];
          r.fal.phase = "running";
          history(r.fal.conversation_id, {
            response_id: r.id,
            type: "answer",
            input_request_id: q.id,
            answer: body.answer,
          });
          publish(entry);
          finishMutation(r);
          later(() => generate(entry), 20);
          return;
        }
        if (req.method === "POST" && path[3] === "cancel") {
          if (
            !["completed", "failed", "cancelled", "incomplete"].includes(
              r.status,
            )
          ) {
            r.status = "cancelled";
            r.fal.phase = "finished";
            r.fal.pending_input_ids = [];
            for (const item of r.output) {
              if (
                item.type === "fal.input_request" &&
                item.status === "pending"
              )
                item.status = "cancelled";
              if (
                item.type === "fal.operation" &&
                ["queued", "in_progress"].includes(item.status)
              )
                item.status = "cancelled";
            }
            publish(entry);
          }
          return finishMutation(r);
        }
      }
      if (path[1] === "conversations" && req.method === "GET") {
        if (!path[2])
          return json(res, {
            data: [...conversations.values()].map(({ items, ...c }) => c),
            next_cursor: null,
          });
        const c = conversations.get(path[2]);
        if (!c) return json(res, { message: "Conversation not found" }, 404);
        if (path[3] === "items") {
          const offset = Number(url.searchParams.get("cursor") ?? 0);
          const limit = Math.min(
            100,
            Number(url.searchParams.get("limit") ?? 20),
          );
          return json(res, {
            data: c.items.slice(offset, offset + limit),
            next_cursor:
              offset + limit < c.items.length ? String(offset + limit) : null,
          });
        }
        const { items, ...info } = c;
        return json(res, info);
      }
      if (
        path[1] === "agent" &&
        path[2] === "artifacts" &&
        req.method === "GET"
      ) {
        for (const { value } of responses.values()) {
          const artifact = value.output.find(
            (item) => item.type === "fal.artifact" && item.id === path[3],
          );
          if (artifact) return json(res, artifact);
        }
      }
      json(res, { message: "Route not implemented by this fixture" }, 404);
    } catch (error) {
      if (!res.headersSent) json(res, { message: error.message }, 400);
      else res.end();
    }
  });
  await new Promise((resolve, reject) => {
    server.once("error", reject);
    server.listen(port, "127.0.0.1", resolve);
  });
  base = `http://127.0.0.1:${server.address().port}`;
  const nativeFetch = globalThis.fetch;
  return {
    baseUrl: `${base}/v1`,
    // Test transport only: exercise the SDK's fixed URL without any live calls.
    fetch(input, init) {
      const url = new URL(input instanceof Request ? input.url : input);
      if (
        url.origin === "https://fal.ai" &&
        url.pathname.startsWith("/api/agent-v2/sdk/")
      ) {
        url.pathname = url.pathname.replace("/api/agent-v2/sdk", "/v1");
        url.protocol = "http:";
        url.host = new URL(base).host;
      } else if (url.origin !== base) {
        throw new Error(
          `Unexpected fixture request: ${url.origin}${url.pathname}`,
        );
      }
      return nativeFetch(
        input instanceof Request ? new Request(url, input) : url,
        init,
      );
    },
    async close() {
      for (const timer of timers) clearTimeout(timer);
      for (const { watchers } of responses.values())
        for (const res of watchers) res.end();
      server.closeAllConnections();
      await new Promise((resolve, reject) =>
        server.close((error) => (error ? reject(error) : resolve())),
      );
    },
  };
}

if (
  process.argv[1] &&
  import.meta.url === pathToFileURL(process.argv[1]).href
) {
  const server = await startReferenceServer(Number(process.env.PORT ?? 8787));
  console.log(
    `Synthetic Agent reference server: ${server.baseUrl} (key: local-demo)`,
  );
  process.once("SIGINT", async () => {
    await server.close();
    process.exit(0);
  });
}
