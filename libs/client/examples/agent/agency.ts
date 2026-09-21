import { secureFetch } from "@fal-sdk-demo/session-fetch";
import { type AgentAnswer, type AgentResponseView } from "../../src/index";
import { mountDelegation, type DelegationCommand } from "./delegation";

const starterBriefs = {
  direction:
    "Help me shape a coffee campaign. Delegate a planning-only task to fal Agent now: have the specialist ask me one question with two visual directions, wait for my answer, then return a short creative brief. You handle the headline. Do not generate any media.",
  plan: "Help me launch a small independent coffee brand for design-conscious commuters. You handle the headline and caption. Delegate a planning-only task to fal Agent now: return a three-step visual production plan with deliverables and review checkpoints. Use warm, tactile photography as the direction. Do not generate any media.",
  coffee:
    "Help me launch a small coffee brand. You handle the headline and caption. Delegate exactly one square hero image to fal Agent now, using fal-ai/flux/schnell. Have the specialist ask me one question with two visual directions before generating, and wait for my answer. No logos or text in the image. No extra images or video.",
};
type Entry = { role: "user" | "agency" | "event"; text: string };
type ParentAction =
  | {
      name: "delegate_media";
      args: {
        title: string;
        assignment: string;
        continue_conversation: boolean;
      };
    }
  | {
      name: "answer_media";
      args: {
        input_request_id: string;
        answers: Extract<AgentAnswer, { kind: "answers" }>["answers"];
      };
    };
type State = {
  history: Entry[];
  title: string;
  owned: boolean;
  handled: string;
  pendingAction?: DelegationCommand;
  draft: string;
  mode: "app" | "inspect";
  model: string;
  turns: number;
  parentNeeded: boolean;
  events: string[];
  taskIds: string[];
};
export function parentContext(response?: AgentResponseView) {
  if (!response) return null;
  return {
    response_id: response.id,
    status: response.status,
    phase: response.fal.phase,
    summary: response.output_text.slice(-30000),
    final_artifact_ids: response.fal.final_artifact_ids,
    operations: response.output.filter((item) => item.type === "fal.operation"),
    blocks: response.output
      .filter((item) => item.type === "message")
      .flatMap((item) => item.content)
      .filter((part) => part.type === "fal.block"),
    pending_inputs: response.pending_inputs,
    artifacts: response.artifacts.slice(0, 40).map((a) => ({
      id: a.id,
      media_type: a.media_type,
      files: a.files?.map((f) => ({ url: f.url, mime_type: f.mime_type })),
    })),
    error: response.error,
  };
}
export function mountAgency(root: ShadowRoot) {
  root.innerHTML = `<style>
:host{display:block;color:var(--content-base);background:var(--page);font:14px/1.5 var(--font-sans)}*{box-sizing:border-box}[hidden]{display:none!important}button,textarea{font:inherit;color:inherit}:focus-visible{outline:2px solid var(--focus);outline-offset:1px}button{cursor:pointer;display:inline-flex;align-items:center;justify-content:center;gap:6px;height:36px;padding:0 14px;border:1px solid var(--stroke-strong);background:var(--surface-raised);border-radius:var(--radius-sm);font-weight:600;letter-spacing:-.01em;white-space:nowrap}button:hover:enabled{background:var(--surface-alpha);border-color:var(--stroke-stronger)}button:disabled{opacity:.5;cursor:not-allowed}button[aria-pressed=true]{background:var(--surface-inverse);border-color:transparent;color:var(--content-inverse)}button.primary{background:var(--primary);border-color:transparent;color:#fafafa}button.primary:hover:enabled{background:var(--primary-hover);border-color:transparent}.switcher{max-width:1440px;margin:auto;padding:16px 24px;display:flex;align-items:center;gap:8px;border-bottom:1px solid var(--stroke-base)}.switcher button{height:32px;padding:0 12px;font-size:13px}.switcher span{margin-left:auto;color:var(--content-lighter);font-size:12px}.shell{max-width:1440px;margin:auto;display:grid;grid-template-columns:minmax(0,1.3fr) minmax(0,1fr);gap:20px;padding:24px}.shell.inspect{display:block}.chat{background:var(--surface-raised);border:1px solid var(--stroke-base);border-radius:var(--radius-lg);box-shadow:var(--shadow-card);overflow:hidden;display:flex;flex-direction:column;min-height:710px;max-height:calc(100vh - 235px)}.chat header{padding:16px 20px;border-bottom:1px solid var(--stroke-base);display:flex;align-items:center;gap:12px}.mark{background:var(--surface-inverse);color:var(--content-inverse);border-radius:var(--radius-sm);width:36px;height:36px;display:grid;place-items:center;font:500 18px var(--font-heading)}.chat h2{font:500 16px var(--font-heading);margin:0;color:var(--content-strong)}.sub{color:var(--content-lighter);font-size:12px}.live{margin-left:auto;color:var(--primary);background:var(--primary-soft);border-radius:999px;padding:3px 8px;font-size:11px;font-weight:600;letter-spacing:.04em}#messages{overflow:auto;flex:1;padding:24px;min-height:180px}.empty{padding:24px 4px;color:var(--content-light)}.empty h3{font:500 28px/1.15 var(--font-heading);color:var(--content-strong);letter-spacing:-.02em;max-width:420px;margin:0 0 12px}.chips{display:flex;flex-direction:column;align-items:flex-start;gap:8px;margin-top:20px}.chips button{font-size:13px;font-weight:500;text-align:left;background:var(--surface-alpha-light);border-color:var(--stroke-base);height:auto;padding:10px 14px;white-space:normal}.message{max-width:95%;margin-bottom:20px;white-space:pre-wrap;overflow-wrap:anywhere;line-height:1.6}.message .who{font:500 11px var(--font-mono);letter-spacing:.08em;text-transform:uppercase;color:var(--content-lighter);margin-bottom:6px}.message.user{margin-left:auto;background:var(--surface-100);border-radius:var(--radius-lg);padding:12px 16px}.message.event{font-size:12px;color:var(--content-light);border-left:2px solid var(--stroke-stronger);padding:4px 12px}.task-card{width:100%;height:auto;text-align:left;background:var(--surface-200);border:1px solid var(--stroke-base);display:flex;justify-content:space-between;align-items:center;margin:0 0 20px;padding:14px;font-weight:500;white-space:normal}.task-card:hover:enabled{border-color:var(--stroke-stronger);background:var(--surface-alpha)}.task-card small{display:block;color:var(--content-lighter);margin-top:3px;font-weight:400}.compose{border-top:1px solid var(--stroke-base);padding:14px 20px;background:var(--surface-raised)}.compose textarea{width:100%;resize:vertical;min-height:72px;max-height:180px;border:0;outline:none;background:transparent;font-size:15px}.compose textarea::placeholder{color:var(--content-lighter)}.compose footer{display:flex;align-items:center;justify-content:space-between;gap:8px}.compose small{color:var(--content-lighter);font-size:12px}#parent-status{padding:0 24px 10px;font-size:12px;color:var(--content-light)}#parent-error{margin:0 20px;color:var(--error-fg);font-size:13px;white-space:pre-wrap}.side{min-width:0}.side-head{padding:0 0 16px;display:flex;justify-content:space-between;align-items:center}.side-head h3{font-size:15px;font-weight:600;margin:0;color:var(--content-strong);letter-spacing:-.01em}.side-head small{color:var(--content-light);font-size:13px}.side-head button{height:32px;padding:0 12px;font-size:13px}.route{display:flex;align-items:center;gap:8px;padding:10px 14px;background:var(--surface-100);border-radius:var(--radius-sm);margin-bottom:12px;font-size:12px}.route strong{color:var(--content-strong);font-weight:600}.route span{color:var(--content-lighter)}#decision{padding:0 24px}fieldset{border:1px solid var(--stroke-base);background:var(--surface-200);padding:16px;border-radius:var(--radius-lg);margin:0 0 16px;min-width:0}legend{font-weight:600;color:var(--content-strong);padding:0 4px}fieldset p{font-size:13px;color:var(--content-light)}fieldset label{display:flex;gap:8px;align-items:center;font-size:13px;padding:5px 0}fieldset input[type=checkbox],fieldset input[type=radio]{width:16px;height:16px;margin:0;accent-color:var(--primary)}fieldset input[type=text]{width:100%;font:inherit;min-height:36px;padding:6px 12px;border:1px solid var(--stroke-strong);border-radius:var(--radius-sm);background:var(--surface-alpha-light);color:inherit}fieldset button{margin:10px 8px 0 0;height:32px;padding:0 12px;font-size:13px}#timeline{font-size:12px;color:var(--content-light);max-height:155px;overflow:auto;padding:0 4px;margin-top:12px}#timeline div{padding:6px 0;border-bottom:1px solid var(--stroke-base)}.note{font-size:11px;color:var(--content-lighter);margin-top:12px}#view-label{font-size:13px}@media(max-width:1000px){.shell{grid-template-columns:1fr;padding:16px}.chat{max-height:750px}.switcher{padding:12px 16px}.switcher span{display:none}}
.reset-confirm{max-width:1392px;margin:16px auto 0;padding:20px;background:var(--surface-raised);border:1px solid var(--stroke-strong);border-radius:var(--radius-lg)}.reset-confirm p{color:var(--content-light)}#reset-error{color:var(--error-fg)}.reset-confirm button{margin-right:8px}.side-head{gap:8px}.side-head>div{margin-right:auto}.switcher{flex-wrap:wrap}.starter{display:grid;grid-template-columns:1fr 1.2fr;gap:24px;padding:20px;margin-bottom:20px;background:var(--surface-raised);border:1px solid var(--stroke-base);border-radius:var(--radius-lg)}.starter h3{margin:0;color:var(--content-strong);font-size:17px}.starter p,.starter small{color:var(--content-light)}.starter p{margin:8px 0;font-size:13px}.templates{display:flex;flex-wrap:wrap;gap:8px;margin:16px 0}.templates button{font-size:12px;padding:0 10px}.starter small{font-size:12px}.starter label{display:block;font-weight:600;margin-bottom:8px}.starter textarea{display:block;width:100%;min-height:136px;resize:vertical;padding:12px;background:var(--surface-alpha-light);border:1px solid var(--stroke-strong);border-radius:var(--radius-sm);margin-bottom:12px;line-height:1.5}.starter details{grid-column:1/-1;font-size:13px}.starter summary{cursor:pointer;color:var(--content-light)}#starter-reply-text{white-space:pre-wrap;max-height:200px;overflow:auto;margin-top:12px}#starter-error{color:var(--error-fg)}@media(max-width:800px){.starter{grid-template-columns:1fr}}</style><div class="switcher"><button id="app-view" aria-pressed="true">Agency app</button><button id="inspect-view" aria-pressed="false">How it works</button><span id="view-label">One conversation · the same live delegation in both views</span><button id="reset-session">Reset session</button></div><div id="reset-confirm" class="reset-confirm" role="dialog" aria-modal="false" aria-labelledby="reset-title" hidden><strong id="reset-title"></strong><p id="reset-description"></p><button id="confirm-reset" class="primary"></button><button id="dismiss-reset">Keep session</button><p id="reset-error" role="alert"></p></div><div class="shell" id="shell"><section class="chat" id="chat"><header><div class="mark">f.</div><div><h2>Fieldwork</h2><div class="sub">Your campaign partner</div></div><span class="live">LIVE PARENT AGENT</span></header><div id="messages"></div><div id="decision"></div><div id="parent-status" role="status"></div><div id="parent-error" role="alert"></div><form class="compose" id="compose"><textarea id="agency-prompt" aria-label="Message the agency" placeholder="Tell me what you’re making…"></textarea><footer><small>Real agency agent + fal Agent. Normal model charges apply.</small><button class="primary" id="send-agency">Send →</button></footer></form></section><aside class="side"><div class="side-head" id="side-head"><div><h3>Delegation workspace</h3><small>What your agency is doing with fal Agent</small></div><button id="clear-workspace">Clear workspace</button><button id="continue-agency" hidden>Continue agency</button></div><div class="route" id="route"><strong>Agency</strong><span>→</span><strong>fal Agent</strong><span id="route-state">· Ready for a brief</span></div><section id="inspect-starter" class="starter" hidden><div><h3>Try a delegation</h3><p>Choose a template, edit the brief, then run it through the parent agent. Watch the live command, execution, and result below.</p><div class="templates"><button type="button" data-template="direction">Ask a question</button><button type="button" data-template="plan">Make a plan</button><button type="button" data-template="coffee">Generate one image</button></div><small>Templates only fill the brief. Running uses real agents and normal model charges.</small></div><form id="starter-form"><label for="starter-brief">Brief for the parent agent</label><textarea id="starter-brief" placeholder="Choose a template or write your own brief…"></textarea><button class="primary" id="run-starter">Run with parent agent →</button><p id="starter-status" role="status"></p><p id="starter-error" role="alert"></p></form><details id="starter-reply" hidden><summary>Latest parent response</summary><div id="starter-reply-text"></div></details></section><div id="inspector-host"></div><div id="timeline"></div><div class="note" id="model-note">Only observable actions and results are shown here.</div></aside></div>`;
  const $ = (id: string) => root.getElementById(id)!;
  const button = (id: string) => $(id) as HTMLButtonElement;
  const input = $("agency-prompt") as HTMLTextAreaElement;
  const starterInput = $("starter-brief") as HTMLTextAreaElement;
  const make = <K extends keyof HTMLElementTagNameMap>(
    tag: K,
    content = "",
  ) => {
    const el = document.createElement(tag);
    el.textContent = content;
    return el;
  };
  const storage = "fal-agency-parent-v1";
  const freshState = (): State => ({
    history: [],
    title: "Media assignment",
    owned: false,
    handled: "",
    draft: "",
    mode: "app",
    model: "",
    turns: 0,
    parentNeeded: false,
    events: [],
    taskIds: [],
  });
  let state = freshState();
  try {
    const saved = JSON.parse(sessionStorage.getItem(storage) ?? "null");
    if (saved) state = { ...state, ...saved };
  } catch {
    /* Keep the fresh demo usable if older storage cannot be read. */
  }
  input.value = starterInput.value = state.draft;
  let resetScope: "workspace" | "session" = "session";
  let resetting = false;
  let epoch = 0;
  let parentRequest: AbortController | undefined;
  let parentBusy = false,
    stopped = false,
    awaitingUser = false,
    decisionSignature = "",
    lastSignal = "",
    timer: ReturnType<typeof setTimeout> | undefined;
  function save() {
    try {
      sessionStorage.setItem(storage, JSON.stringify(state));
      return true;
    } catch {
      $("parent-error").textContent =
        "Could not save recovery state. This tab cannot submit another task until storage is available.";
      return false;
    }
  }
  function event(message: string) {
    if (state.events.at(-1) === message) return;
    state.events.push(message);
    state.events = state.events.slice(-35);
    save();
    renderTimeline();
  }
  function renderTimeline() {
    $("timeline").replaceChildren(...state.events.map((e) => make("div", e)));
    $("model-note").textContent = state.model
      ? `Parent model: ${state.model} · observable actions and results`
      : "Only observable actions and results are shown here.";
  }
  const inspector = $("inspector-host").attachShadow({ mode: "open" });
  const controller = mountDelegation(inspector, {
    onIdle() {
      if (resetting) return;
      render();
      schedule();
    },
    onSnapshot(r) {
      if (resetting) return;
      // Older demo versions used transport sequence numbers as parent checkpoints.
      if (
        state.handled.startsWith(`${r.id}:${r.status}:${r.fal.phase}:`) &&
        /:\d+$/.test(state.handled)
      )
        state.handled = checkpoint(r);
      if (
        r.pending_inputs.length &&
        state.handled === checkpoint(r) &&
        !parentBusy &&
        !state.parentNeeded
      )
        awaitingUser = true;
      const signal = `${r.id}:${r.fal.phase}:${r.status}`;
      if (signal !== lastSignal) {
        lastSignal = signal;
        event(
          `fal Agent · ${r.fal.phase === "waiting_for_input" ? "needs a decision" : r.fal.phase === "finished" ? r.status : r.fal.phase}`,
        );
      }
      render();
      schedule();
    },
    onAccepted(command, r) {
      if (resetting) return;
      if (state.pendingAction?.key === command.key) {
        state.pendingAction = undefined;
        state.owned = true;
      } else if (command.kind === "create") state.owned = false;
      if (command.kind === "answer")
        event("Answer accepted by fal Agent; observing its next state.");
      if (!state.taskIds.includes(r.id)) state.taskIds.push(r.id);
      save();
      render();
      schedule();
    },
  });
  const viewStyle = document.createElement("style");
  inspector.append(viewStyle);
  function setMode(mode: State["mode"]) {
    state.mode = mode;
    save();
    $("shell").classList.toggle("inspect", mode === "inspect");
    $("chat").hidden = mode === "inspect";
    $("inspect-starter").hidden = mode !== "inspect";
    $("route").hidden = mode === "inspect";
    $("timeline").hidden = mode === "inspect";
    button("app-view").setAttribute("aria-pressed", String(mode === "app"));
    button("inspect-view").setAttribute(
      "aria-pressed",
      String(mode === "inspect"),
    );
    const resultDetails = inspector.querySelector<HTMLDetailsElement>(
      ".flow > section:last-child details",
    );
    if (resultDetails) resultDetails.open = mode === "inspect";
    const requestDetails = inspector.querySelector<HTMLDetailsElement>(
      ".flow > section:first-child details",
    );
    if (requestDetails) {
      requestDetails.open = mode === "inspect";
      requestDetails.querySelector("summary")!.textContent =
        "Latest SDK command";
    }
    const headings = inspector.querySelectorAll(".flow > section > h3");
    if (headings[0]) headings[0].textContent = "1. Parent → specialist";
    if (headings[1])
      headings[1].textContent =
        mode === "app" ? "fal Agent" : "2. fal Agent execution";
    if (headings[2])
      headings[2].textContent =
        mode === "app" ? "Returned to agency" : "3. Returned to the parent";
    viewStyle.textContent =
      mode === "app"
        ? `.wrap{padding:0}.wrap > :not(.flow){display:none}.flow{display:block;margin:0}.flow>section:first-child{display:none}.flow>section{margin-bottom:14px;padding:18px}.flow>section:last-child>label,.flow>section:last-child>textarea,.flow>section:last-child>button,.flow>section:last-child>.note{display:none}.flow>section:last-child h3{font-size:14px}#work{max-height:410px;overflow:auto}#questions{display:none}h3{font-size:15px}pre{max-height:200px}.status{font-size:13px}.item{font-size:13px}`
        : `.wrap{padding:0}.wrap>.note{display:none}.wrap>.eyebrow,.wrap>h2,.wrap>p{display:none}.flow{margin-top:0}#delegate,#refine,#scenario,label[for=scenario],#revision,label[for=revision],#brief,label[for=brief],#task,label[for=task]{display:none}`;
  }
  function append(role: Entry["role"], text: string) {
    state.history.push({ role, text });
    save();
    renderMessages();
  }
  function messageBody(text: string) {
    const block = make("div");
    for (const [i, part] of text.split(/\*\*(.*?)\*\*/gs).entries()) {
      block.append(
        i % 2 ? make("strong", part) : document.createTextNode(part),
      );
    }
    return block;
  }
  function renderMessages() {
    const box = $("messages");
    const nearBottom =
      box.scrollHeight - box.scrollTop - box.clientHeight < 100;
    box.replaceChildren();
    if (!state.history.length) {
      const empty = make("div");
      empty.className = "empty";
      empty.innerHTML = `<h3>A campaign starts with a conversation.</h3><p>I’ll shape the idea and copy. fal Agent will make the media, with you in the loop.</p><div class="chips"><button type="button" data-brief="coffee">A coffee launch, from brief to visual</button><button type="button" data-brief="direction">Explore a direction first · no images yet</button></div>`;
      empty.querySelectorAll<HTMLButtonElement>("button").forEach(
        (b) =>
          (b.onclick = () => {
            setDraft(
              starterBriefs[
                b.dataset.brief === "coffee" ? "coffee" : "direction"
              ],
            );
            input.focus();
          }),
      );
      box.append(empty);
    }
    for (const entry of state.history) {
      const row = make("div");
      row.className = `message ${entry.role}`;
      if (entry.role !== "event") {
        const label = make("div", entry.role === "user" ? "You" : "Agency");
        label.className = "who";
        row.append(label);
      }
      row.append(messageBody(entry.text));
      box.append(row);
    }
    const r = controller.response;
    if (r && state.owned) {
      const card = make("button");
      card.className = "task-card";
      const title = make("div", state.title);
      title.append(
        make(
          "small",
          r.pending_inputs.length
            ? "Needs a decision"
            : r.status === "completed"
              ? "Results returned to agency"
              : r.status,
        ),
      );
      card.append(title, make("span", "Inspect →"));
      card.onclick = () => {
        $("inspector-host").scrollIntoView({
          behavior: "smooth",
          block: "nearest",
        });
        inspector.getElementById("status")?.focus();
      };
      box.append(card);
      if (r.status === "completed")
        for (const a of r.artifacts)
          for (const f of a.files ?? []) {
            if (!f.mime_type.startsWith("image/")) continue;
            try {
              const u = new URL(f.url);
              if (!["http:", "https:"].includes(u.protocol)) continue;
              const img = document.createElement("img");
              img.src = u.href;
              img.alt = "Campaign image returned by fal Agent";
              img.style.cssText =
                "max-width:100%;max-height:320px;border-radius:12px;margin-bottom:16px";
              box.append(img);
            } catch {
              /* Ignore invalid media links. */
            }
          }
    }
    if (nearBottom) box.scrollTop = box.scrollHeight;
  }
  function paused(r?: AgentResponseView) {
    return (
      !!r &&
      (r.pending_inputs.length > 0 ||
        ["completed", "failed", "cancelled", "incomplete"].includes(r.status))
    );
  }
  function checkpoint(r: AgentResponseView) {
    return `${r.id}:${r.status}:${r.fal.phase}:${JSON.stringify(r.fal.pending_input_ids)}`;
  }
  function controls() {
    const r = controller.response;
    const running = !!r && !paused(r);
    const locked =
      resetting ||
      parentBusy ||
      controller.busy ||
      !!controller.pending ||
      !!state.pendingAction;
    button("send-agency").disabled = locked || running;
    button("run-starter").disabled = locked || running || !state.draft.trim();
    root.querySelectorAll<HTMLButtonElement>("[data-template]").forEach((b) => {
      b.disabled = locked || running;
    });
    for (const id of ["reset-session", "clear-workspace", "confirm-reset"])
      button(id).disabled = resetting || controller.busy;
    button("dismiss-reset").disabled = resetting;
    button("continue-agency").disabled =
      resetting || parentBusy || controller.busy;
    button("continue-agency").hidden =
      parentBusy ||
      controller.busy ||
      (!state.parentNeeded && !stopped && !state.pendingAction);
    $("parent-status").textContent = parentBusy
      ? "Agency is considering the brief and specialist results…"
      : controller.busy
        ? "Syncing with fal Agent…"
        : controller.pending
          ? "Submission unconfirmed. Open How it works to retry the same command."
          : running
            ? "fal Agent is working. Its progress is live on the right."
            : awaitingUser
              ? "The agency is waiting for your decision."
              : "";
    $("starter-status").textContent = $("parent-status").textContent;
    $("starter-error").textContent = $("parent-error").textContent;
    const lastReply = [...state.history]
      .reverse()
      .find((entry) => entry.role === "agency");
    $("starter-reply").hidden = !lastReply;
    $("starter-reply-text").textContent = lastReply?.text ?? "";
    root
      .querySelectorAll<HTMLFieldSetElement>("#decision fieldset")
      .forEach((f) => (f.disabled = locked));
  }
  function render() {
    renderMessages();
    renderTimeline();
    const r = controller.response;
    $("route-state").textContent = r
      ? `· ${r.pending_inputs.length ? "Decision needed" : r.status}`
      : "· Ready for a brief";
    renderDecisions();
    controls();
  }
  function schedule() {
    if (resetting) return;
    if (timer) clearTimeout(timer);
    timer = setTimeout(() => {
      if (
        state.owned &&
        paused(controller.response) &&
        !parentBusy &&
        !controller.busy &&
        !controller.pending &&
        !state.pendingAction &&
        !stopped &&
        state.handled !== checkpoint(controller.response!)
      )
        void runParent();
    }, 0);
  }
  function renderDecisions() {
    const r = controller.response;
    const inputs = r?.pending_inputs ?? [];
    const visible = inputs.filter((q) => q.kind === "approval" || awaitingUser);
    const signature = JSON.stringify(visible);
    if (signature === decisionSignature) return;
    decisionSignature = signature;
    $("decision").replaceChildren();
    for (const request of visible) {
      const form = document.createElement("form");
      const fields = document.createElement("fieldset");
      fields.append(
        make(
          "legend",
          request.kind === "approval"
            ? "Your approval is required"
            : request.prompt,
        ),
      );
      form.append(fields);
      const readers: Array<
        () => Extract<AgentAnswer, { kind: "answers" }>["answers"][number]
      > = [];
      if (request.kind === "clarification")
        for (const q of request.questions) {
          fields.append(make("p", q.text));
          const options = q.options.map((o) => {
            const label = make(
              "label",
              `${o.label}${o.description ? ` — ${o.description}` : ""}`,
            );
            const el = document.createElement("input");
            el.type = q.multiple ? "checkbox" : "radio";
            el.name = q.id;
            el.value = o.id;
            label.prepend(el);
            fields.append(label);
            return el;
          });
          const free = document.createElement("input");
          free.type = "text";
          free.setAttribute("aria-label", q.text);
          free.placeholder = "Or add your own direction";
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
      for (const label of request.kind === "approval"
        ? request.accepted_answers
        : ["Send decision"]) {
        const b = make("button", label);
        b.type = "submit";
        b.value = label;
        fields.append(b);
      }
      form.onsubmit = (e) => {
        e.preventDefault();
        if (parentBusy || controller.busy || controller.pending) return;
        const answer: AgentAnswer =
          request.kind === "approval"
            ? {
                kind: "approval",
                decision: ((e as SubmitEvent).submitter as HTMLButtonElement)
                  .value as "approve" | "reject",
              }
            : { kind: "answers", answers: readers.map((read) => read()) };
        if (
          answer.kind === "answers" &&
          answer.answers.some((a) => !a.text && !a.selected_option_ids.length)
        ) {
          $("parent-error").textContent =
            "Answer each question before sending.";
          return;
        }
        const display =
          answer.kind === "approval"
            ? `I ${answer.decision} this request.`
            : answer.answers
                .map((a) => {
                  const q =
                    request.kind === "clarification"
                      ? request.questions.find((q) => q.id === a.question_id)
                      : undefined;
                  return [
                    ...a.selected_option_ids.map(
                      (id) => q?.options.find((o) => o.id === id)?.label ?? id,
                    ),
                    a.text,
                  ]
                    .filter(Boolean)
                    .join(" · ");
                })
                .join("\n");
        append("user", display);
        state.turns = 0;
        awaitingUser = false;
        state.owned = true;
        event("Client decision → fal Agent");
        void execute({
          kind: "answer",
          id: r!.id,
          input: { input_request_id: request.id, answer },
          key: crypto.randomUUID(),
        });
      };
      $("decision").append(form);
    }
  }
  async function execute(command: DelegationCommand) {
    state.pendingAction = command;
    state.parentNeeded = false;
    if (!save()) return;
    controls();
    const accepted = await controller.execute(command);
    if (accepted) {
      state.pendingAction = undefined;
      save();
    } else if (!controller.pending) {
      state.pendingAction = undefined;
      stopped = true;
      state.parentNeeded = true;
      save();
      $("parent-error").textContent =
        "The specialist rejected the command. Inspect the error in How it works before continuing.";
    }
    controls();
    schedule();
  }
  async function runParent() {
    if (
      resetting ||
      parentBusy ||
      controller.busy ||
      controller.pending ||
      state.pendingAction
    )
      return;
    if (++state.turns > 6) {
      stopped = true;
      state.parentNeeded = true;
      $("parent-error").textContent =
        "Paused after six agency decisions. Send a message to continue.";
      save();
      controls();
      return;
    }
    parentBusy = true;
    awaitingUser = false;
    state.parentNeeded = true;
    stopped = false;
    $("parent-error").textContent = "";
    if (!save()) {
      parentBusy = false;
      controls();
      return;
    }
    controls();
    const r = state.owned ? controller.response : undefined;
    const token = r ? checkpoint(r) : "brief";
    const requestEpoch = epoch;
    const request = new AbortController();
    parentRequest = request;
    try {
      const res = await secureFetch(
        `${location.origin}/api/agent-v2/sdk/demo/parent`,
        {
          signal: request.signal,
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            history: state.history.slice(-60),
            specialist: parentContext(r),
          }),
        },
      );
      if (!res.ok) {
        let message = `Parent request failed (${res.status})`;
        try {
          message = (await res.json()).error?.message ?? message;
        } catch {}
        throw Error(message);
      }
      const data = (await res.json()) as {
        text: string;
        action: ParentAction | null;
        model: string;
      };
      if (requestEpoch !== epoch) return;
      state.model = data.model;
      state.handled = token;
      state.parentNeeded = false;
      if (data.text.trim()) append("agency", data.text);
      if (data.action?.name === "delegate_media") {
        if (r && !paused(r))
          throw Error("Cannot delegate while fal Agent is active");
        state.title = data.action.args.title;
        state.owned = true;
        event(`Agency calls delegate_media · ${state.title}`);
        append("event", `Delegated to fal Agent: ${state.title}`);
        const follow = data.action.args.continue_conversation && r;
        const command: DelegationCommand = {
          kind: "create",
          key: crypto.randomUUID(),
          request: {
            input: follow
              ? [
                  {
                    role: "user",
                    content: [
                      { type: "input_text", text: data.action.args.assignment },
                      ...r.artifacts.slice(0, 39).map((a) => ({
                        type: "fal.input_artifact" as const,
                        artifact_id: a.id,
                        revision: a.revision,
                      })),
                    ],
                  },
                ]
              : data.action.args.assignment,
            fal: { on_ambiguity: "ask" },
            ...(follow ? { conversation: r.fal.conversation_id } : {}),
          },
        };
        parentBusy = false;
        await execute(command);
      } else if (data.action?.name === "answer_media") {
        const inputRequestId = data.action.args.input_request_id;
        const request = r?.pending_inputs.find((p) => p.id === inputRequestId);
        if (!r || request?.kind !== "clarification")
          throw Error("The agency can only answer pending clarifications");
        event("Agency answers from the client brief → fal Agent");
        append("event", "Agency answered the specialist using your brief.");
        const command: DelegationCommand = {
          kind: "answer",
          id: r.id,
          key: crypto.randomUUID(),
          input: {
            input_request_id: data.action.args.input_request_id,
            answer: { kind: "answers", answers: data.action.args.answers },
          },
        };
        parentBusy = false;
        await execute(command);
      } else {
        awaitingUser = !!r?.pending_inputs.length;
        if (r && paused(r) && !r.pending_inputs.length) {
          event("Specialist result → agency response");
        }
        save();
      }
    } catch (e) {
      if (requestEpoch !== epoch) return;
      $("parent-error").textContent =
        e instanceof Error ? e.message : String(e);
      state.parentNeeded = true;
      stopped = true;
      save();
    } finally {
      if (requestEpoch !== epoch) return;
      parentRequest = undefined;
      parentBusy = false;
      render();
      schedule();
    }
  }
  function submitBrief() {
    if (button("send-agency").disabled || !input.value.trim()) return;
    const value = input.value.trim();
    if (value.length > 18000) {
      $("parent-error").textContent =
        "Please keep the brief under 18,000 characters.";
      controls();
      return;
    }
    append("user", value);
    input.value = starterInput.value = "";
    state.draft = "";
    state.turns = 0;
    state.parentNeeded = true;
    save();
    void runParent();
  }
  for (const id of ["compose", "starter-form"])
    $(id).onsubmit = (e) => {
      e.preventDefault();
      submitBrief();
    };
  function setDraft(value: string) {
    input.value = starterInput.value = state.draft = value;
    save();
    controls();
  }
  input.oninput = () => setDraft(input.value);
  starterInput.oninput = () => setDraft(starterInput.value);
  root.querySelectorAll<HTMLButtonElement>("[data-template]").forEach((b) => {
    b.onclick = () => {
      setDraft(starterBriefs[b.dataset.template as keyof typeof starterBriefs]);
      starterInput.focus();
    };
  });
  input.onkeydown = (e) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      if (!button("send-agency").disabled)
        ($("compose") as HTMLFormElement).requestSubmit();
    }
  };
  function requestReset(scope: "workspace" | "session") {
    resetScope = scope;
    $("reset-title").textContent =
      scope === "session"
        ? "Start a fresh session?"
        : "Clear the delegation workspace?";
    $("reset-description").textContent =
      (scope === "session"
        ? "This clears the parent chat, draft, delegation, results, and activity in both views."
        : "This clears the specialist task, results, and activity in both views. Your parent chat and draft stay.") +
      " Any active fal Agent task will be cancelled first. Generated files remain in your account.";
    button("confirm-reset").textContent =
      scope === "session" ? "Reset everything" : "Clear workspace";
    $("reset-error").textContent = "";
    $("reset-confirm").hidden = false;
    button("confirm-reset").focus();
  }
  $("reset-session").onclick = () => requestReset("session");
  $("clear-workspace").onclick = () => requestReset("workspace");
  $("dismiss-reset").onclick = () => {
    $("reset-confirm").hidden = true;
    button(
      resetScope === "session" ? "reset-session" : "clear-workspace",
    ).focus();
  };
  $("reset-confirm").onkeydown = (e) => {
    if (e.key === "Escape" && !resetting) button("dismiss-reset").click();
  };
  $("confirm-reset").onclick = async () => {
    if (resetting || controller.busy) return;
    resetting = true;
    epoch++;
    parentRequest?.abort();
    parentRequest = undefined;
    parentBusy = false;
    stopped = true;
    if (timer) clearTimeout(timer);
    controller.disconnect();
    controls();
    $("reset-error").textContent = "Stopping the session…";
    try {
      // Resolve an uncertain submission with its original key before cancelling it.
      const pending = controller.pending ?? state.pendingAction;
      if (pending) {
        const accepted = await controller.execute(pending);
        if (!accepted && controller.pending)
          throw Error(
            "Could not confirm the previous submission. Try again to safely cancel and clear it.",
          );
        state.pendingAction = undefined;
        save();
      }
      const r = controller.response;
      if (
        r &&
        !["completed", "failed", "cancelled", "incomplete"].includes(r.status)
      ) {
        const cancelled = await controller.execute({
          kind: "cancel",
          id: r.id,
          key: crypto.randomUUID(),
        });
        if (!cancelled)
          throw Error(
            "Could not cancel the active task. Your session has been kept; try again.",
          );
      }
      controller.clear();
      const previous = state;
      state = freshState();
      state.mode = previous.mode;
      if (resetScope === "workspace") {
        state.history = [
          ...previous.history,
          {
            role: "event",
            text: "Delegation workspace cleared. The previous specialist conversation is closed; delegate a new task when needed.",
          },
        ];
        state.draft = input.value;
        state.model = previous.model;
      }
      awaitingUser = false;
      decisionSignature = "";
      lastSignal = "";
      stopped = false;
      input.value = starterInput.value = state.draft;
      $("decision").replaceChildren();
      $("parent-error").textContent = "";
      sessionStorage.removeItem(storage);
      if (!save())
        throw Error(
          "The view was cleared, but the fresh session could not be saved.",
        );
      $("reset-confirm").hidden = true;
      input.focus();
    } catch (e) {
      state.parentNeeded = true;
      save();
      $("reset-error").textContent = e instanceof Error ? e.message : String(e);
    } finally {
      resetting = false;
      render();
    }
  };
  $("app-view").onclick = () => setMode("app");
  $("inspect-view").onclick = () => setMode("inspect");
  $("continue-agency").onclick = () => {
    state.turns = 0;
    stopped = false;
    if (state.pendingAction) void execute(state.pendingAction);
    else void runParent();
  };
  setMode(state.mode);
  render();
  // Reload never starts a new media submission with a new key. Recover the stored command explicitly.
  if (state.pendingAction) {
    stopped = true;
    state.parentNeeded = true;
    $("parent-error").textContent =
      "A delegated command was interrupted. Continue agency reuses its original key.";
    controls();
  } else if (state.parentNeeded) {
    stopped = true;
    controls();
  }
}
