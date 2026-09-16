import { secureFetch } from "@fal-sdk-demo/session-fetch";
import {
  AgentRequestError,
  createFalClient,
  type AgentArtifact,
  type AgentConversationItem,
  type AgentInputRequest,
  type AgentResponseView,
} from "../../src/index";

const client = createFalClient({
  agent: { baseUrl: `${location.origin}/api/agent-v2/sdk` },
  fetch: secureFetch,
});
const $ = (id: string) => document.getElementById(id)!;
const input = (id: string) => $(id) as HTMLInputElement;
const button = (id: string) => $(id) as HTMLButtonElement;
const terminal = (response: AgentResponseView) =>
  ["completed", "failed", "cancelled", "incomplete"].includes(response.status);
const presets = {
  image: {
    prompt:
      "Generate exactly one square image of a cobalt blue ceramic mug on a pale stone table beside a window, a small orange on the right, cool morning light. Editorial product photography, no text. Use a low-cost image model at standard resolution. Proceed without clarification.",
    description:
      "Generate one image, preview the result, then refine it by artifact ID.",
    label: "Run image test →",
  },
  question: {
    prompt:
      "Ask me to choose between two visual styles using a questions card. Do not generate any media yet. After I answer, acknowledge the choice in one sentence without generating media.",
    description:
      "Receive a question with options, send an answer, and watch the same response continue. This test does not request media generation.",
    label: "Run question test →",
  },
};
let test: keyof typeof presets = "image";
let current: AgentResponseView | undefined;
let observer: AbortController | undefined;
let busy = false;
let watching = false;
let lastLifecycle = "";
let lastQuestions = "";
let lastGallery = "";
type SavedArtifact = {
  artifact: AgentArtifact;
  conversation: string;
  responseId: string;
};
const gallery = new Map<string, SavedArtifact>();
let selected: string | undefined;
let conversationId: string | undefined;
let conversationCursor: string | null = null;
let history: AgentConversationItem[] = [];
let navigation = 0;
let refreshing = false;
let historyConnected = true;

type Entry = { time: string; message: string; responseId?: string };
let events: Entry[] = [];
try {
  const stored: unknown = JSON.parse(
    sessionStorage.getItem("fal-sdk-events") ?? "[]",
  );
  if (Array.isArray(stored))
    events = stored
      .filter(
        (e): e is Entry =>
          e &&
          typeof e.time === "string" &&
          typeof e.message === "string" &&
          (e.responseId === undefined || typeof e.responseId === "string"),
      )
      .slice(-100);
} catch {
  /* An invalid local log must not prevent SDK use. */
}
function persist(key: string, value: string) {
  try {
    sessionStorage.setItem(key, value);
  } catch {
    /* Storage can be unavailable in private contexts. */
  }
}
function savedResponse() {
  try {
    return sessionStorage.getItem("fal-sdk-response");
  } catch {
    return null;
  }
}
function mode() {
  return (
    document.querySelector('input[name="mode"]:checked') as HTMLInputElement
  ).value;
}
function notice(message = "") {
  $("notice").textContent = message;
  $("notice").hidden = !message;
}
function log(message: string, responseId = current?.id) {
  events.push({ time: new Date().toISOString(), message, responseId });
  events = events.slice(-100);
  persist("fal-sdk-events", JSON.stringify(events));
  renderTimeline();
}
function renderTimeline() {
  const shown = events.filter((e) => !current || e.responseId === current.id);
  $("timeline-empty").hidden = shown.length > 0;
  $("timeline").replaceChildren(
    ...shown
      .slice()
      .reverse()
      .map((event) => {
        const li = document.createElement("li");
        const time = document.createElement("time");
        time.dateTime = event.time;
        time.textContent = new Date(event.time).toLocaleTimeString([], {
          hour: "2-digit",
          minute: "2-digit",
          second: "2-digit",
        });
        const description = document.createElement("p");
        description.textContent = event.message;
        li.append(time, description);
        return li;
      }),
  );
}
function controls() {
  const active = !!current && !terminal(current);
  button("run").disabled = busy || active;
  button("run").textContent = busy
    ? "Working…"
    : conversationId
      ? "Send follow-up →"
      : presets[test].label;
  button("new-chat").disabled = busy;
  ($("conversation-picker") as HTMLSelectElement).disabled = busy;
  ($("response-picker") as HTMLSelectElement).disabled = busy;
  button("refine").disabled = busy || active || !selected;
  button("cancel").disabled = busy || !active;
  button("disconnect").disabled = !watching;
  button("resume").disabled = busy;
  button("load-saved").disabled = busy || !savedResponse();
}
function show(response: AgentResponseView) {
  if (current && current.fal.conversation_id !== response.fal.conversation_id) {
    navigation++;
    history = [];
    gallery.clear();
    selected = undefined;
    lastGallery = "";
  }
  current = response;
  conversationId = response.fal.conversation_id;
  renderHistory();
  persist("fal-sdk-response", response.id);
  input("response-id").value = response.id;
  $("status").textContent = response.status.replaceAll("_", " ");
  $("status").dataset.status = response.status;
  $("phase").textContent =
    response.fal.phase === "waiting_for_input"
      ? "Your answer is needed below."
      : terminal(response)
        ? "Execution finished."
        : "Agent is working. Updates appear as they become available.";
  $("output").textContent = JSON.stringify(response, null, 2);
  $("messages").textContent = response.output
    .filter((item) => item.type === "message")
    .map((message) =>
      message.content
        .filter((part) => part.type === "output_text")
        .map((part) => part.text)
        .join(""),
    )
    .filter(Boolean)
    .join("\n\n");
  if (response.error) notice(response.error.message);
  const questions = JSON.stringify(response.pending_inputs);
  if (questions !== lastQuestions) {
    $("answer").replaceChildren();
    response.pending_inputs.forEach(renderInput);
    lastQuestions = questions;
  }
  const operations = response.output.filter(
    (item) => item.type === "fal.operation",
  );
  $("operations").replaceChildren(
    ...operations.map((op) => {
      const row = document.createElement("div");
      row.className = "operation";
      row.textContent = `${op.name} · ${op.status.replaceAll("_", " ")}${op.error ? ` — ${op.error.message}` : ""}`;
      return row;
    }),
  );
  const lifecycle = `${response.id}:${response.status}:${response.fal.phase}:${operations.map((op) => `${op.id}:${op.status}`).join(",")}:${response.artifacts.length}`;
  if (lifecycle !== lastLifecycle) {
    log(
      `${response.status.replaceAll("_", " ")} · ${response.fal.phase.replaceAll("_", " ")}${operations.length ? ` · ${operations.map((op) => `${op.name}: ${op.status.replaceAll("_", " ")}`).join("; ")}` : ""}${response.artifacts.length ? ` · ${response.artifacts.length} artifact(s)` : ""}`,
      response.id,
    );
    lastLifecycle = lifecycle;
  }
  for (const artifact of response.artifacts) {
    const isNew = !gallery.has(artifact.id);
    gallery.set(artifact.id, {
      artifact,
      conversation: response.fal.conversation_id,
      responseId: response.id,
    });
    if (isNew) selected = artifact.id;
  }
  renderGallery();
  renderTimeline();
  controls();
}
function renderGallery() {
  const hasResult =
    !!current && (!!current.output_text || current.pending_inputs.length > 0);
  $("empty").hidden = gallery.size > 0 || hasResult;
  $("empty").style.display = gallery.size || hasResult ? "none" : "";
  const signature =
    JSON.stringify([...gallery.values()].map((entry) => entry.artifact)) +
    selected;
  if (signature === lastGallery) return;
  lastGallery = signature;
  $("artifact-count").textContent = gallery.size
    ? `${gallery.size} artifact${gallery.size === 1 ? "" : "s"} in this view`
    : "No artifacts yet";
  $("artifacts").replaceChildren();
  let index = 0;
  for (const { artifact } of gallery.values()) {
    const number = ++index;
    const card = document.createElement("article");
    card.className = `artifact${selected === artifact.id ? " selected" : ""}`;
    const body = document.createElement("div");
    body.className = "artifact-body";
    const label = document.createElement("h3");
    label.textContent = `Result ${number}`;
    const meta = document.createElement("div");
    meta.className = "artifact-meta";
    meta.textContent = artifact.id;
    body.append(label, meta);
    for (const file of artifact.files ?? []) {
      if (
        file.mime_type.startsWith("image/") ||
        (artifact.media_type === "image" &&
          file.mime_type === "application/octet-stream")
      ) {
        const image = document.createElement("img");
        image.src = file.url;
        image.alt = `Generated image, result ${number}`;
        image.onerror = () => {
          image.hidden = true;
          const error = document.createElement("p");
          error.className = "hint";
          error.textContent =
            "Preview unavailable. Open the file to inspect it.";
          body.prepend(error);
        };
        card.append(image);
      } else if (
        file.mime_type.startsWith("video/") ||
        file.mime_type.startsWith("audio/")
      ) {
        const media = document.createElement(
          file.mime_type.startsWith("video/") ? "video" : "audio",
        );
        media.controls = true;
        media.src = file.url;
        card.append(media);
      }
      const actions = document.createElement("div");
      actions.className = "artifact-actions";
      const open = document.createElement("a");
      open.href = file.url;
      open.target = "_blank";
      open.rel = "noopener";
      open.textContent = "Open original ↗";
      actions.append(open);
      body.append(actions);
    }
    const choose = document.createElement("button");
    choose.textContent =
      selected === artifact.id ? "Selected for refinement" : "Select to refine";
    choose.setAttribute("aria-pressed", String(selected === artifact.id));
    choose.onclick = () => {
      selected = artifact.id;
      renderGallery();
      controls();
    };
    body.append(choose);
    card.append(body);
    $("artifacts").append(card);
    if (selected === artifact.id)
      $("selected-label").textContent = `Result ${number}`;
  }
  $("refine-section").hidden = !selected;
}
function report(error: unknown) {
  const message = error instanceof Error ? error.message : String(error);
  notice(message);
  log(`Request error: ${message}`);
}
async function observe(id: string) {
  observer?.abort();
  const observation = new AbortController();
  observer = observation;
  watching = true;
  controls();
  const transport = mode();
  $("connection").textContent =
    transport === "stream"
      ? "Connected · streaming snapshots"
      : "Connected · polling every second";
  log(
    `Connected using ${transport === "stream" ? "streaming" : "polling"}`,
    id,
  );
  try {
    if (transport === "poll") {
      while (!observation.signal.aborted) {
        const response = await client.agent.responses.retrieve(id, {
          signal: observation.signal,
        });
        if (observation.signal.aborted) return;
        show(response);
        if (terminal(response) || response.fal.phase === "waiting_for_input")
          break;
        await new Promise((resolve) => setTimeout(resolve, 1000));
      }
    } else {
      for await (const response of client.agent.responses.stream(id, {
        signal: observation.signal,
      })) {
        if (observation.signal.aborted) return;
        show(response);
      }
    }
    if (!observation.signal.aborted)
      $("connection").textContent =
        current?.fal.phase === "waiting_for_input"
          ? "Paused · waiting for your answer"
          : "Up to date · observation finished";
  } catch (error) {
    if (!observation.signal.aborted) {
      $("connection").textContent =
        "Connection failed · load the response to retry";
      throw error;
    }
  } finally {
    if (observer === observation) {
      watching = false;
      controls();
    }
  }
}
async function mutate(action: () => Promise<AgentResponseView>, label: string) {
  if (busy) return;
  busy = true;
  observer?.abort();
  watching = false;
  notice();
  controls();
  $("connection").textContent = "Submitting request…";
  try {
    const response = await action();
    log(label, response.id);
    show(response);
    busy = false;
    controls();
    await observe(response.id);
  } catch (error) {
    report(error);
  } finally {
    busy = false;
    controls();
  }
}
function renderInput(request: AgentInputRequest) {
  const responseId = current!.id;
  const form = document.createElement("form");
  const heading = document.createElement("h3");
  heading.textContent = request.prompt;
  form.append(heading);
  if (request.kind === "clarification") {
    for (const question of request.questions) {
      const field = document.createElement("fieldset");
      const legend = document.createElement("legend");
      legend.textContent = question.text;
      field.append(legend);
      for (const option of question.options) {
        const label = document.createElement("label");
        const choice = document.createElement("input");
        choice.type = question.multiple ? "checkbox" : "radio";
        choice.name = question.id;
        choice.value = option.id;
        label.append(choice, document.createTextNode(option.label));
        field.append(label);
      }
      if (question.allow_text) {
        const free = document.createElement("input");
        free.type = "text";
        free.name = `${question.id}_text`;
        free.placeholder = "Or write your own answer";
        free.setAttribute("aria-label", `Your answer to ${question.text}`);
        field.append(free);
      }
      form.append(field);
    }
    const submit = document.createElement("button");
    submit.className = "primary";
    submit.textContent = "Send answer & continue →";
    form.append(submit);
    form.onsubmit = async (event) => {
      event.preventDefault();
      if (busy) return;
      submit.disabled = true;
      const data = new FormData(form);
      await mutate(
        () =>
          client.agent.responses.answer(responseId, {
            input_request_id: request.id,
            answer: {
              kind: "answers",
              answers: request.questions.map((q) => ({
                question_id: q.id,
                selected_option_ids: data.getAll(q.id).map(String),
                ...(data.get(`${q.id}_text`)
                  ? { text: String(data.get(`${q.id}_text`)) }
                  : {}),
              })),
            },
          }),
        "Answer submitted",
      );
      submit.disabled = false;
    };
  } else if (request.kind === "approval") {
    for (const decision of ["approve", "reject"] as const) {
      const action = document.createElement("button");
      action.type = "button";
      action.textContent = decision === "approve" ? "Approve" : "Reject";
      action.onclick = () =>
        mutate(
          () =>
            client.agent.responses.answer(responseId, {
              input_request_id: request.id,
              answer: { kind: "approval", decision },
            }),
          `Approval: ${decision}`,
        );
      form.append(action);
    }
  }
  $("answer").append(form);
}
for (const preset of document.querySelectorAll<HTMLButtonElement>(
  "[data-preset]",
))
  preset.onclick = () => {
    test = preset.dataset.preset === "question" ? "question" : "image";
    ($("prompt") as HTMLTextAreaElement).value = presets[test].prompt;
    $("test-description").textContent = presets[test].description;
    document
      .querySelectorAll("[data-preset]")
      .forEach((b) =>
        b.setAttribute(
          "aria-pressed",
          String((b as HTMLElement).dataset.preset === test),
        ),
      );
    controls();
  };
$("run").onclick = () => {
  const prompt = ($("prompt") as HTMLTextAreaElement).value.trim();
  if (!prompt) {
    notice("Enter a prompt first.");
    return;
  }
  return mutate(
    () =>
      client.agent.responses.create({
        input: prompt,
        ...(conversationId ? { conversation: conversationId } : {}),
      }),
    "New test accepted",
  );
};
$("refine").onclick = () => {
  const entry = selected && gallery.get(selected);
  const text = ($("refinement") as HTMLTextAreaElement).value.trim();
  if (!entry || !text) {
    notice("Select an artifact and describe the change.");
    return;
  }
  return mutate(
    () =>
      client.agent.responses.create({
        conversation: entry.conversation,
        input: [
          {
            role: "user",
            content: [
              { type: "input_text", text },
              {
                type: "fal.input_artifact",
                artifact_id: entry.artifact.id,
                revision: entry.artifact.revision,
              },
            ],
          },
        ],
      }),
    "Refinement accepted",
  );
};
function renderHistory() {
  $("history").replaceChildren(
    ...history.flatMap((entry) => {
      let text = "";
      if (entry.type === "input")
        text =
          "You: " +
          (typeof entry.input === "string"
            ? entry.input
            : entry.input
                .flatMap((m) =>
                  m.content.map((p) =>
                    p.type === "input_text"
                      ? p.text
                      : p.type === "input_file"
                        ? `[File: ${p.file_url}]`
                        : p.type === "input_image"
                          ? `[Image: ${p.image_url}]`
                          : `[Artifact: ${p.artifact_id}]`,
                  ),
                )
                .join("\n"));
      else if (entry.type === "answer")
        text = "Answer: " + JSON.stringify(entry.answer);
      else if (entry.response_id !== current?.id) {
        if (entry.item.type === "message")
          text =
            "Agent: " +
            entry.item.content
              .map((p) => (p.type === "output_text" ? p.text : p.fallback_text))
              .join("\n");
        else if (entry.item.type === "fal.input_request")
          text = `${entry.item.prompt} (${entry.item.status})`;
        else if (entry.item.type === "fal.operation")
          text = `${entry.item.name}: ${entry.item.status}`;
        else text = `Artifact: ${entry.item.id}`;
      }
      if (!text) return [];
      const li = document.createElement("li");
      li.textContent = text;
      return [li];
    }),
  );
}
async function listChats(more = false) {
  const picker = $("conversation-picker") as HTMLSelectElement;
  const page = await client.agent.conversations.list({
    ...(more && conversationCursor ? { cursor: conversationCursor } : {}),
    limit: 20,
  });
  if (!more) picker.replaceChildren(new Option("Choose a conversation", ""));
  for (const chat of page.data)
    picker.add(new Option(chat.title || chat.id, chat.id));
  if (conversationId) picker.value = conversationId;
  conversationCursor = page.next_cursor;
  $("more-chats").hidden = !conversationCursor;
  $("history-status").textContent =
    page.data.length || more
      ? "Choose a conversation to restore its history."
      : "No conversations yet.";
}
async function refreshHistory() {
  const id = conversationId;
  const version = navigation;
  if (!id || refreshing) return;
  refreshing = true;
  try {
    let entries: AgentConversationItem[] = [];
    for (let attempt = 0; attempt < 3; attempt++) {
      entries = [];
      try {
        let cursor: string | undefined;
        do {
          const page = await client.agent.conversations.items.list(id, {
            limit: 100,
            ...(cursor ? { cursor } : {}),
          });
          entries.push(...page.data);
          cursor = page.next_cursor ?? undefined;
        } while (cursor && version === navigation);
        break;
      } catch (error) {
        if (
          !(error instanceof AgentRequestError && error.status === 409) ||
          attempt === 2
        )
          throw error;
      }
    }
    const metadata = await client.agent.conversations.retrieve(id);
    if (version !== navigation || conversationId !== id) return;
    history = entries;
    const ids = [
      ...new Set([
        ...entries.flatMap((e) => (e.response_id ? [e.response_id] : [])),
        ...metadata.active_response_ids,
      ]),
    ];
    const picker = $("response-picker") as HTMLSelectElement;
    picker.replaceChildren(
      ...ids.map(
        (r) =>
          new Option(
            `${metadata.active_response_ids.includes(r) ? "Active · " : ""}${r}`,
            r,
          ),
      ),
    );
    for (const entry of entries)
      if (entry.type === "output" && entry.item.type === "fal.artifact")
        gallery.set(entry.item.id, {
          artifact: entry.item,
          conversation: id,
          responseId: entry.response_id ?? "",
        });
    renderHistory();
    renderGallery();
    $("history-status").textContent =
      `${entries.length} history items · ${metadata.active_response_ids.length} active responses`;
    const target =
      current?.fal.conversation_id === id
        ? current.id
        : (metadata.active_response_ids.at(-1) ?? ids.at(-1));
    if (target) {
      picker.value = target;
      if (!current || current.id !== target) void observe(target).catch(report);
    }
  } finally {
    refreshing = false;
  }
}
function resetConversation() {
  navigation++;
  historyConnected = true;
  observer?.abort();
  watching = false;
  current = undefined;
  conversationId = undefined;
  history = [];
  gallery.clear();
  selected = undefined;
  lastGallery = "";
  lastQuestions = "";
  for (const id of ["messages", "operations", "answer", "output"])
    $(id).replaceChildren();
  $("status").textContent = "Ready";
  $("phase").textContent = "Start a new conversation.";
  input("response-id").value = "";
  persist("fal-sdk-response", "");
  ($("conversation-picker") as HTMLSelectElement).value = "";
  ($("response-picker") as HTMLSelectElement).replaceChildren();
  renderHistory();
  renderGallery();
  controls();
  notice();
}
$("new-chat").onclick = resetConversation;
$("refresh-chats").onclick = () => {
  void listChats().catch(report);
  void refreshHistory().catch(report);
};
$("more-chats").onclick = () => void listChats(true).catch(report);
$("conversation-picker").onchange = () => {
  const id = ($("conversation-picker") as HTMLSelectElement).value;
  resetConversation();
  conversationId = id || undefined;
  ($("conversation-picker") as HTMLSelectElement).value = id;
  void refreshHistory().catch(report);
};
$("response-picker").onchange = () =>
  void reconnect(($("response-picker") as HTMLSelectElement).value);
// Discover responses created by another client too; snapshot replacement prevents duplication.
setInterval(() => {
  if (!busy && historyConnected) void refreshHistory().catch(report);
}, 5000);
void listChats().catch(report);

async function reconnect(id: string | null) {
  historyConnected = true;
  if (!id) {
    notice("No saved response yet. Run either test to begin.");
    return;
  }
  notice();
  try {
    await observe(id);
  } catch (error) {
    report(error);
  }
}
$("resume").onclick = () =>
  reconnect(input("response-id").value.trim() || savedResponse());
$("load-saved").onclick = () => reconnect(savedResponse());
$("disconnect").onclick = () => {
  historyConnected = false;
  observer?.abort();
  watching = false;
  $("connection").textContent = "Disconnected · server execution is unchanged";
  log("Disconnected locally; execution was not cancelled");
  controls();
};
$("cancel").onclick = () => {
  if (current)
    return mutate(
      () => client.agent.responses.cancel(current!.id),
      "Cancellation requested",
    );
};
document.querySelectorAll<HTMLInputElement>('input[name="mode"]').forEach(
  (choice) =>
    (choice.onchange = () => {
      $("mode-help").textContent =
        mode() === "stream"
          ? "Live snapshots over a persistent connection."
          : "Fetch the current snapshot once per second.";
      if (current) void reconnect(current.id);
    }),
);
const tabs = ["json", "lifecycle"];
function activateTab(name: string, focus = false) {
  for (const tab of tabs) {
    const active = name === tab;
    button(`tab-${tab}`).setAttribute("aria-selected", String(active));
    button(`tab-${tab}`).tabIndex = active ? 0 : -1;
    $(`panel-${tab}`).hidden = !active;
  }
  if (focus) button(`tab-${name}`).focus();
}
tabs.forEach((name, index) => {
  button(`tab-${name}`).onclick = () => activateTab(name);
  button(`tab-${name}`).onkeydown = (event) => {
    const next =
      event.key === "ArrowRight"
        ? (index + 1) % tabs.length
        : event.key === "ArrowLeft"
          ? (index + tabs.length - 1) % tabs.length
          : event.key === "Home"
            ? 0
            : event.key === "End"
              ? tabs.length - 1
              : undefined;
    if (next !== undefined) {
      event.preventDefault();
      activateTab(tabs[next], true);
    }
  };
});
input("response-id").value = savedResponse() ?? "";
renderTimeline();
controls();
// Read-only recovery makes an existing result visible immediately after reload.
if (savedResponse()) void reconnect(savedResponse());
