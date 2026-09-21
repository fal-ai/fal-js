import { secureFetch } from "@fal-sdk-demo/session-fetch";
import {
  AgentRequestError,
  createFalClient,
  type AgentAnswer,
  type AgentRequest,
  type AgentResponseView,
} from "../../src/index";

export function delegationResult(r: AgentResponseView) {
  return {
    response_id: r.id,
    conversation_id: r.fal.conversation_id,
    status: r.status,
    phase: r.fal.phase,
    summary: r.output_text,
    pending_inputs: r.pending_inputs,
    artifacts: r.artifacts,
    final_artifact_ids: r.fal.final_artifact_ids,
    error: r.error,
    output: r.output,
  };
}
export type DelegationCommand = { key: string } & (
  | { kind: "create"; request: AgentRequest }
  | {
      kind: "answer";
      id: string;
      input: { input_request_id: string; answer: AgentAnswer };
    }
  | { kind: "cancel"; id: string }
);

export function mountDelegation(
  root: ShadowRoot,
  hooks: {
    onSnapshot?: (response: AgentResponseView) => void;
    onIdle?: () => void;
    onAccepted?: (
      command: DelegationCommand,
      response: AgentResponseView,
    ) => void;
  } = {},
) {
  const agent = createFalClient({
    fetch: secureFetch,
    agent: { baseUrl: `${location.origin}/api/agent-v2/sdk` },
  }).agent;
  root.innerHTML = `<style>
:host{display:block;color:var(--content-base);font:14px/1.5 var(--font-sans);background:var(--page)}*{box-sizing:border-box}.wrap{max-width:1440px;margin:auto;padding:24px}:host([data-embedded]) .wrap,:host-context(#inspector-host) .wrap{padding:0}h2{font:500 28px/1.15 var(--font-heading);letter-spacing:-.02em;color:var(--content-strong);margin:8px 0}h3{margin:0 0 12px;font-size:15px;font-weight:600;color:var(--content-strong);letter-spacing:-.01em}p{color:var(--content-light);font-size:13px}.eyebrow{font:500 11px var(--font-mono);letter-spacing:.08em;color:var(--content-lighter)}.flow{display:grid;grid-template-columns:1fr 1.2fr 1fr;gap:16px;margin-top:24px}section{background:var(--surface-raised);border:1px solid var(--stroke-base);border-radius:var(--radius-lg);padding:20px;min-width:0;box-shadow:var(--shadow-card)}label{display:block;margin:12px 0 6px;font-size:13px;font-weight:500;color:var(--content-light)}textarea,input,select,button{font:inherit;color:inherit;border:1px solid var(--stroke-strong);border-radius:var(--radius-sm)}textarea,input,select{width:100%;min-height:40px;padding:8px 12px;background:var(--surface-alpha-light);font-weight:500}textarea::placeholder,input::placeholder{color:var(--content-lighter);font-weight:400}textarea{min-height:100px;resize:vertical;line-height:1.5}select{appearance:none;padding-right:36px;background-image:url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='16' height='16' fill='none' stroke='%23787881' stroke-width='1.5' stroke-linecap='round' stroke-linejoin='round'%3E%3Cpath d='m4 6 4 4 4-4'/%3E%3C/svg%3E");background-repeat:no-repeat;background-position:right 10px center}button{cursor:pointer;display:inline-flex;align-items:center;justify-content:center;height:36px;padding:0 14px;background:var(--surface-raised);font-weight:600;letter-spacing:-.01em;white-space:nowrap;margin:8px 8px 0 0}button:hover:enabled{background:var(--surface-alpha);border-color:var(--stroke-stronger)}button.primary{background:var(--primary);border-color:transparent;color:#fafafa}button.primary:hover:enabled{background:var(--primary-hover);border-color:transparent}button:disabled{opacity:.5;cursor:not-allowed}:focus-visible{outline:2px solid var(--focus);outline-offset:1px}.status{padding:10px 12px;background:var(--info-bg);color:var(--info-fg);border-radius:var(--radius-sm);margin:0 0 12px;font-weight:600;font-size:13px}pre{white-space:pre-wrap;overflow-wrap:anywhere;max-height:340px;overflow:auto;font:12px/1.6 var(--font-mono);background:var(--surface-100);padding:12px;border-radius:var(--radius-sm);margin:8px 0 0}details{margin-top:12px;font-size:13px}summary{cursor:pointer;font-weight:600;color:var(--content-strong)}.item{padding:12px 0;border-bottom:1px solid var(--stroke-base);white-space:pre-wrap;overflow-wrap:anywhere;font-size:13px}#work{margin-top:12px;font-size:13px;color:var(--content-light)}img,video{max-width:100%;max-height:240px;border-radius:var(--radius-sm);display:block;margin:8px 0;background:var(--surface-100)}a{color:var(--primary)}fieldset{border:1px solid var(--stroke-base);border-radius:var(--radius-sm);margin:12px 0;padding:12px;min-width:0}legend{font-weight:600;font-size:13px;color:var(--content-strong);padding:0 4px}fieldset label{display:flex;gap:8px;align-items:center;margin:6px 0;color:var(--content-base);font-weight:400}fieldset input[type=checkbox],fieldset input[type=radio]{width:16px;height:16px;min-height:0;margin:0;accent-color:var(--primary)}.note{font-size:12px;color:var(--content-lighter);margin-top:10px}.actions{display:flex;flex-wrap:wrap}.actions button{height:32px;padding:0 12px;font-size:13px}#error{color:var(--error-fg);white-space:pre-wrap}#error:empty{display:none}[hidden]{display:none!important}@media(max-width:1000px){.flow{grid-template-columns:1fr}.wrap{padding:16px}}
</style><div class="wrap"><div class="eyebrow">AGENCY → MEDIA SPECIALIST → AGENCY</div><h2>A specialist inside your agent.</h2><p>The agency owns the campaign. fal Agent handles a bounded media assignment and returns a resumable result.</p><p class="note">Scripted parent workflow · real fal Agent SDK · signed-in session · live generations incur normal charges.</p><div class="flow">
<section><h3>1. Agency brief</h3><label for="scenario">Assignment</label><select id="scenario"><option value="clarify">Resolve a creative direction</option><option value="image">Produce one campaign image</option><option value="plan">Plan a media package</option></select><label for="brief">Campaign context</label><textarea id="brief">Launch a small independent coffee brand for design-conscious commuters. Warm, tactile photography; no logos or text. The agency will handle copy and distribution.</textarea><label for="task">Delegate to fal Agent</label><textarea id="task"></textarea><p class="note">Questions and approvals return to the parent. This host never approves automatically. Native account approval settings apply.</p><button class="primary" id="delegate">Delegate media task →</button><details><summary>Tool call sent by the parent</summary><pre id="call">No task delegated.</pre></details><label for="restore">Resume by response ID</label><input id="restore" placeholder="resp_…"><button id="resume">Resume task</button><button id="retry" hidden>Retry unconfirmed command</button><p id="error" role="alert"></p></section>
<section><h3>2. fal Agent workspace</h3><div id="status" class="status" role="status">Ready for delegation</div><div class="actions"><button id="disconnect" disabled>Disconnect</button><button id="reconnect" disabled>Reconnect</button><button id="cancel" disabled>Cancel task</button></div><div id="work">The specialist’s messages, operations and deliverables will appear here.</div><div id="questions"></div></section>
<section><h3>3. Back to the agency</h3><p id="handoff">The parent waits for a result or a request for input. Completion does not automatically mean the work is approved for a campaign.</p><label for="revision">Revision brief</label><textarea id="revision" placeholder="Keep the composition, but make the palette warmer."></textarea><button id="refine" disabled>Delegate a follow-up</button><p class="note">Continues the same conversation and references returned artifact IDs. The agency reviews quality before using any output.</p><details open><summary>Structured tool result</summary><pre id="result">No result yet.</pre></details></section></div></div>`;
  const $ = (id: string) => root.getElementById(id)!;
  const value = (id: string) => ($(id) as HTMLInputElement).value;
  const btn = (id: string) => $(id) as HTMLButtonElement;
  const text = <K extends keyof HTMLElementTagNameMap>(
    tag: K,
    content: string,
  ) => {
    const el = document.createElement(tag);
    el.textContent = content;
    return el;
  };
  const terminal = (r: AgentResponseView) =>
    ["completed", "failed", "cancelled", "incomplete"].includes(r.status);
  let response: AgentResponseView | undefined,
    pending: DelegationCommand | undefined,
    busy = false,
    observer: AbortController | undefined,
    questionSignature = "";
  const key = "fal-agent-delegation-v1";
  let responseId = "";
  let lastCommand: DelegationCommand | undefined;
  function save() {
    try {
      sessionStorage.setItem(
        key,
        JSON.stringify({
          responseId,
          pending,
          lastCommand,
          brief: value("brief"),
          task: value("task"),
          revision: value("revision"),
        }),
      );
      return true;
    } catch {
      $("error").textContent =
        "Recovery storage is unavailable. Keep the response ID; new commands cannot be submitted safely from this tab.";
      return false;
    }
  }
  function controls() {
    const locked = busy || !!pending;
    btn("delegate").disabled = locked || (!!response && !terminal(response));
    btn("refine").disabled = locked || !response || !terminal(response);
    btn("cancel").disabled = locked || !response || terminal(response);
    btn("disconnect").disabled = !observer;
    btn("reconnect").disabled = locked || !responseId;
    btn("resume").disabled = locked || (!!response && !terminal(response));
    btn("retry").hidden = !pending || busy;
    root
      .querySelectorAll<HTMLFieldSetElement>("fieldset")
      .forEach((f) => (f.disabled = locked));
  }
  function stop() {
    observer?.abort();
    observer = undefined;
    controls();
  }
  function show(r: AgentResponseView) {
    response = r;
    responseId = r.id;
    save();
    ($("restore") as HTMLInputElement).value = r.id;
    $("status").textContent = `${r.status} · ${r.fal.phase}`;
    $("result").textContent = JSON.stringify(delegationResult(r), null, 2);
    $("handoff").textContent = r.pending_inputs.length
      ? "Parent paused: the specialist needs a clarification or approval before continuing."
      : r.status === "completed"
        ? `Task completed. ${r.artifacts.length} artifact(s) returned; ${r.final_artifacts.length} marked final. The agency can now review and delegate a revision.`
        : terminal(r)
          ? `Task ${r.status}. Preserve partial artifacts and inspect the error before deciding what to do next.`
          : "The parent has a durable response ID. It can do other work and resume observation later.";
    const work = document.createDocumentFragment();
    for (const item of r.output) {
      const card = text("div", "");
      card.className = "item";
      if (item.type === "message")
        card.textContent = item.content
          .map((p) => (p.type === "output_text" ? p.text : p.fallback_text))
          .join("\n");
      else if (item.type === "fal.operation")
        card.textContent = `${item.name} · ${item.status}${item.error ? `\n${item.error.message}` : ""}`;
      else if (item.type === "fal.artifact") {
        card.append(
          text("strong", `${item.media_type ?? item.kind} · ${item.id}`),
        );
        for (const file of item.files ?? []) {
          let url: URL;
          try {
            url = new URL(file.url);
          } catch {
            continue;
          }
          if (!["https:", "http:"].includes(url.protocol)) continue;
          if (file.mime_type.startsWith("image/")) {
            const img = document.createElement("img");
            img.src = url.href;
            img.alt = "Delegated media result";
            card.append(img);
          }
          const link = document.createElement("a");
          link.href = url.href;
          link.target = "_blank";
          link.rel = "noopener";
          link.textContent = ` Open ${file.role} ↗`;
          card.append(link);
        }
      } else continue;
      work.append(card);
    }
    $("work").replaceChildren(work);
    const signature = JSON.stringify(r.pending_inputs);
    if (signature !== questionSignature) {
      questionSignature = signature;
      $("questions").replaceChildren();
      for (const input of r.pending_inputs) {
        const form = document.createElement("form"),
          fields = document.createElement("fieldset");
        fields.append(text("legend", input.prompt));
        form.append(fields);
        const readers: Array<
          () => {
            question_id: string;
            selected_option_ids: string[];
            text?: string;
          }
        > = [];
        if (input.kind === "clarification")
          for (const q of input.questions) {
            fields.append(text("p", q.text));
            const options = q.options.map((o) => {
              const label = text(
                "label",
                o.description ? `${o.label} — ${o.description}` : o.label,
              );
              const choice = document.createElement("input");
              choice.type = q.multiple ? "checkbox" : "radio";
              choice.name = q.id;
              choice.value = o.id;
              label.prepend(choice);
              fields.append(label);
              return choice;
            });
            const free = document.createElement("input");
            free.placeholder = "Your answer";
            free.setAttribute("aria-label", q.text);
            if (q.allow_text) fields.append(free);
            readers.push(() => ({
              question_id: q.id,
              selected_option_ids: options
                .filter((o) => o.checked)
                .map((o) => o.value),
              ...(q.allow_text && free.value.trim()
                ? { text: free.value.trim() }
                : {}),
            }));
          }
        const choices =
          input.kind === "approval" ? input.accepted_answers : ["Send answer"];
        for (const choice of choices) {
          const button = text("button", choice);
          button.type = "submit";
          button.value = choice;
          fields.append(button);
        }
        form.onsubmit = (e) => {
          e.preventDefault();
          if (busy || pending) return;
          const decision = (e as SubmitEvent).submitter as HTMLButtonElement;
          const answer: AgentAnswer =
            input.kind === "approval"
              ? {
                  kind: "approval",
                  decision: decision.value as "approve" | "reject",
                }
              : { kind: "answers", answers: readers.map((read) => read()) };
          if (
            answer.kind === "answers" &&
            answer.answers.some((a) => !a.text && !a.selected_option_ids.length)
          ) {
            $("error").textContent = "Answer each question before continuing.";
            return;
          }
          void mutate({
            kind: "answer",
            id: r.id,
            input: { input_request_id: input.id, answer },
            key: crypto.randomUUID(),
          });
        };
        $("questions").append(form);
      }
    }
    controls();
    hooks.onSnapshot?.(r);
  }
  async function observe(id: string) {
    stop();
    const controller = new AbortController();
    observer = controller;
    controls();
    try {
      for await (const r of agent.responses.stream(id, {
        signal: controller.signal,
      })) {
        if (controller.signal.aborted) return;
        show(r);
      }
    } catch (e) {
      if (!controller.signal.aborted)
        $("error").textContent =
          `Observation interrupted: ${String(e)}. Reconnect to retrieve durable state.`;
    } finally {
      if (observer === controller) {
        observer = undefined;
        controls();
      }
    }
  }
  async function mutate(command: DelegationCommand) {
    if (busy || (pending && pending.key !== command.key)) return false;
    let accepted = false;
    stop();
    busy = true;
    pending = command;
    lastCommand = command;
    $("call").textContent = JSON.stringify(command, null, 2);
    $("status").textContent = "Submitting to fal Agent…";
    try {
      if (!save()) {
        pending = undefined;
        return;
      }
      controls();
      $("error").textContent = "";
      const options = { idempotencyKey: command.key };
      const r =
        command.kind === "create"
          ? await agent.responses.create(command.request, options)
          : command.kind === "answer"
            ? await agent.responses.answer(command.id, command.input, options)
            : await agent.responses.cancel(command.id, options);
      pending = undefined;
      accepted = true;
      show(r);
      hooks.onAccepted?.(command, r);
      busy = false;
      controls();
      if (!terminal(r) && !r.pending_inputs.length) void observe(r.id);
    } catch (e) {
      if (
        e instanceof AgentRequestError &&
        [400, 401, 403, 404, 422].includes(e.status ?? 0)
      )
        pending = undefined;
      $("error").textContent =
        `${String(e)}${pending ? ". Result uncertain: retry preserves the exact command and key." : ""}`;
      save();
    } finally {
      busy = false;
      controls();
      hooks.onIdle?.();
    }
    return accepted;
  }
  const tasks = {
    clarify:
      "Ask exactly one clarification question using a question card to choose between two visual directions. Do not generate media yet.",
    image:
      "Generate exactly one square campaign image of a ceramic coffee cup beside a window, with tactile materials and warm morning light. Use a low-cost image model. Return the image as a deliverable.",
    plan: "Create a three-step media production plan for this campaign. Include review checkpoints. Planning only; do not generate media yet.",
  };
  $("scenario").onchange = () => {
    ($("task") as HTMLInputElement).value =
      tasks[value("scenario") as keyof typeof tasks];
  };
  ($("task") as HTMLInputElement).value = tasks.clarify;
  function submit(followup = false) {
    const task = value(followup ? "revision" : "task").trim();
    if (!task) {
      $("error").textContent = "Enter a media assignment.";
      return;
    }
    const request: AgentRequest = {
      input:
        followup && response
          ? [
              {
                role: "user",
                content: [
                  { type: "input_text", text: task },
                  ...response.artifacts.map((a) => ({
                    type: "fal.input_artifact" as const,
                    artifact_id: a.id,
                    revision: a.revision,
                  })),
                ],
              },
            ]
          : `You are the media specialist delegated by an agency agent. Stay within this assignment; the agency owns copy and distribution. Ask for decisions when needed.\n\nCampaign context:\n${value("brief")}\n\nMedia assignment:\n${task}`,
      fal: { on_ambiguity: "ask" },
      ...(followup && response
        ? { conversation: response.fal.conversation_id }
        : {}),
    };
    $("call").textContent = JSON.stringify(
      { tool: "delegate_media", arguments: request },
      null,
      2,
    );
    void mutate({ kind: "create", request, key: crypto.randomUUID() });
  }
  $("delegate").onclick = () => submit();
  $("refine").onclick = () => submit(true);
  $("disconnect").onclick = () => {
    stop();
    $("status").textContent = "Disconnected · remote task continues";
  };
  $("reconnect").onclick = () => void restore(responseId);
  $("resume").onclick = () => void restore(value("restore").trim());
  $("retry").onclick = () => pending && void mutate(pending);
  $("cancel").onclick = () =>
    response &&
    void mutate({ kind: "cancel", id: response.id, key: crypto.randomUUID() });
  async function restore(id: string) {
    if (!id || busy || pending) return;
    stop();
    busy = true;
    controls();
    try {
      const r = await agent.responses.retrieve(id);
      show(r);
      busy = false;
      if (!terminal(r) && !r.pending_inputs.length) void observe(id);
    } catch (e) {
      $("error").textContent = String(e);
    } finally {
      busy = false;
      controls();
      hooks.onIdle?.();
    }
  }
  try {
    const saved = JSON.parse(sessionStorage.getItem(key) ?? "null");
    if (saved) {
      for (const id of ["brief", "task", "revision"]) {
        if (typeof saved[id] === "string")
          ($(id) as HTMLInputElement).value = saved[id];
      }
      pending = saved.pending;
      lastCommand = saved.lastCommand;
      if (lastCommand)
        $("call").textContent = JSON.stringify(lastCommand, null, 2);
      responseId = saved.responseId ?? "";
      if (pending)
        $("error").textContent =
          "An unconfirmed command was restored. Retry it with the same key before starting other work.";
      else if (responseId) void restore(responseId);
    }
  } catch {
    $("error").textContent = "Could not restore saved delegation.";
  }
  for (const id of ["brief", "task", "revision"])
    $(id).oninput = () => {
      save();
    };
  controls();
  return {
    get response() {
      return response;
    },
    get pending() {
      return pending;
    },
    get busy() {
      return busy;
    },
    async execute(command: DelegationCommand) {
      if (command.kind === "create") {
        ($("brief") as HTMLInputElement).value =
          "Delegated by the agency parent. The complete assignment is below.";
        ($("task") as HTMLInputElement).value =
          typeof command.request.input === "string"
            ? command.request.input
            : JSON.stringify(command.request.input, null, 2);
      }
      $("call").textContent = JSON.stringify(command, null, 2);
      return mutate(command);
    },
    clear() {
      if (busy || pending || (response && !terminal(response)))
        throw Error("Finish or cancel the current task before clearing it.");
      sessionStorage.removeItem(key);
      stop();
      response = undefined;
      responseId = "";
      lastCommand = undefined;
      questionSignature = "";
      for (const id of ["brief", "task", "revision", "restore"])
        ($(id) as HTMLInputElement).value = "";
      $("call").textContent = "No task delegated.";
      $("status").textContent = "Ready for delegation";
      $("work").textContent =
        "No task delegated yet. Send a brief to the agency to get started.";
      $("questions").replaceChildren();
      $("result").textContent = "No result yet.";
      $("handoff").textContent =
        "When the agency delegates work, its result or request for input will appear here.";
      $("error").textContent = "";
      controls();
    },
    restore,
    disconnect: stop,
  };
}
