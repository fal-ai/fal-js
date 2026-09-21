import { secureFetch } from "@fal-sdk-demo/session-fetch";
import {
  AgentRequestError,
  createFalClient,
  type AgentAnswer,
  type AgentArtifact,
  type AgentBlock,
  type AgentInputRequest,
  type AgentRequest,
  type AgentResponseView,
} from "../../src/index";

export function mountAgentWorkspace(root: Document | ShadowRoot) {
  // This host imports only the public SDK and the first-party authentication transport.
  const agent = createFalClient({
    fetch: secureFetch,
    agent: { baseUrl: `${location.origin}/api/agent-v2/sdk` },
  }).agent;
  const $ = (id: string) => root.getElementById(id)!;
  const field = (id: string) => $(id) as HTMLInputElement;
  const button = (id: string) => $(id) as HTMLButtonElement;
  const terminal = (r: AgentResponseView) =>
    ["completed", "failed", "cancelled", "incomplete"].includes(r.status);
  const node = <K extends keyof HTMLElementTagNameMap>(
    tag: K,
    text = "",
    className = "",
  ) => {
    const n = document.createElement(tag);
    n.textContent = text;
    n.className = className;
    return n;
  };
  const key = "fal-agent-workspace-v1";
  type Turn = {
    id: string;
    prompt: string;
    receipts: Array<{ inputId: string; text: string }>;
  };
  type Command = { key: string; label: string } & (
    | { kind: "create"; request: AgentRequest }
    | {
        kind: "answer";
        id: string;
        input: { input_request_id: string; answer: AgentAnswer };
      }
    | { kind: "cancel"; id: string }
  );
  let turns: Turn[] = [];
  let pending: Command | undefined;
  const responses = new Map<string, AgentResponseView>();
  const cards = new Map<
    string,
    { root: HTMLElement; body: HTMLElement; signature: string }
  >();
  let selectedArtifact: AgentArtifact | undefined;
  let selectedResponse = "";
  let busy = false;
  let restoring = true;
  let observer: AbortController | undefined;
  let watching = false;
  const events: string[] = [];
  const signatures = new Map<string, string>();
  function notice(text = "") {
    $("notice").textContent = text;
    $("notice").hidden = !text;
  }
  function save() {
    try {
      sessionStorage.setItem(key, JSON.stringify({ turns, pending }));
    } catch {
      notice(
        "This tab cannot save recovery state. Keep the response ID from the JSON before closing it.",
      );
    }
  }
  function log(text: string) {
    events.push(`${new Date().toLocaleTimeString()} · ${text}`);
    if (events.length > 100) events.shift();
    $("lifecycle").replaceChildren(...events.map((e) => node("li", e)));
  }
  const current = () => responses.get(turns.at(-1)?.id ?? "");
  function controls() {
    const r = current();
    const locked = busy || restoring || !!pending;
    button("send").disabled =
      locked || (!!r && !terminal(r)) || (turns.length > 0 && !r);
    button("new-chat").disabled = locked || (!!r && !terminal(r));
    button("cancel").disabled = locked || !r || terminal(r);
    button("disconnect").disabled = !watching;
    button("reconnect").disabled = busy || restoring || !turns.length;
    button("retry").hidden = !pending || busy || restoring;
    $("composer-state").textContent = restoring
      ? "Restoring this conversation…"
      : busy
        ? "Sending…"
        : pending
          ? "Request not confirmed. Retry with the same key."
          : r && !terminal(r)
            ? r.pending_inputs.length
              ? "Answer the agent above to continue."
              : "Agent is working…"
            : "Ready for your next message.";
    root
      .querySelectorAll<HTMLFieldSetElement>(".decision-fields")
      .forEach((f) => {
        f.disabled = locked;
      });
  }
  function inspect() {
    const r = responses.get(selectedResponse);
    $("json").textContent = r
      ? JSON.stringify(r, null, 2)
      : "Response not loaded yet.";
  }
  function updatePicker() {
    const picker = $("response-picker") as HTMLSelectElement;
    picker.replaceChildren(
      ...turns.map((t, i) => {
        const o = node("option", `Turn ${i + 1} · ${t.id}`);
        o.value = t.id;
        return o;
      }),
    );
    picker.value = selectedResponse;
  }
  function safeUrl(value: string) {
    try {
      const url = new URL(value);
      return ["https:", "http:"].includes(url.protocol) ? url.href : undefined;
    } catch {
      return undefined;
    }
  }
  function reference(artifact?: AgentArtifact) {
    selectedArtifact = artifact;
    $("reference").replaceChildren();
    $("reference").hidden = !artifact;
    if (artifact) {
      $("reference").append(
        node(
          "span",
          `Using ${artifact.media_type ?? artifact.kind} · ${artifact.id} `,
        ),
      );
      const clear = node("button", "Remove reference");
      clear.type = "button";
      clear.onclick = () => reference();
      $("reference").append(clear);
      field("prompt").focus();
    }
  }
  function renderArtifact(
    artifact: AgentArtifact,
    response: AgentResponseView,
  ) {
    const card = node("section", "", "artifact");
    card.append(node("h3", `${artifact.media_type ?? artifact.kind} result`));
    for (const file of artifact.files ?? []) {
      const url = safeUrl(file.url);
      if (!url) continue;
      if (
        file.mime_type.startsWith("image/") ||
        artifact.media_type === "image"
      ) {
        const image = node("img");
        image.src = url;
        image.alt = "Agent generated image";
        image.loading = "lazy";
        image.onerror = () => {
          image.hidden = true;
          card.prepend(node("p", "Preview unavailable. Try opening the file."));
        };
        card.append(image);
      } else if (/^(video|audio)\//.test(file.mime_type)) {
        const media = node(
          file.mime_type.startsWith("video/") ? "video" : "audio",
        );
        media.src = url;
        media.controls = true;
        card.append(media);
      }
      const link = node("a", `Open ${file.role || "file"} ↗`);
      link.href = url;
      link.target = "_blank";
      link.rel = "noopener noreferrer";
      card.append(link);
    }
    card.append(node("small", artifact.id));
    const use = node("button", "Use in next message");
    use.type = "button";
    use.onclick = () => reference(artifact);
    card.append(use);
    if (terminal(response)) {
      const selected = response.fal.final_artifact_ids.includes(artifact.id);
      const final = node(
        "button",
        selected
          ? "Remove from final deliverables"
          : "Mark as final deliverable",
      );
      final.type = "button";
      final.setAttribute("aria-pressed", String(selected));
      final.onclick = async () => {
        final.disabled = true;
        try {
          show(
            await agent.responses.selectFinalArtifacts(response.id, {
              artifact_ids: selected
                ? response.fal.final_artifact_ids.filter(
                    (id) => id !== artifact.id,
                  )
                : [...response.fal.final_artifact_ids, artifact.id],
              expected_sequence_number: response.fal.sequence_number,
            }),
          );
          notice("Final deliverables saved.");
        } catch (error) {
          notice(
            `${error instanceof Error ? error.message : String(error)} Reconnect to load the latest response before retrying.`,
          );
        } finally {
          final.disabled = false;
        }
      };
      card.append(final);
    }
    return card;
  }
  function renderBlock(block: AgentBlock) {
    const card = node("section", "", "block");
    card.append(node("h3", block.fallback_text || block.kind));
    const data = block.data;
    if (
      block.kind === "plan" &&
      data &&
      typeof data === "object" &&
      !Array.isArray(data) &&
      Array.isArray(data.steps)
    ) {
      const list = node("ol");
      for (const step of data.steps)
        if (step && typeof step === "object" && !Array.isArray(step)) {
          const li = node("li", String(step.label ?? "Step"));
          if (step.detail) li.append(node("p", String(step.detail), "muted"));
          const hints = [
            typeof step.endpoint_id === "string" ? step.endpoint_id : "",
            step.requires_approval ? "Approval checkpoint" : "",
          ].filter(Boolean);
          if (hints.length) li.append(node("small", hints.join(" · ")));
          list.append(li);
        }
      card.append(
        list,
        node("small", "Plan preview · use API tests to edit or run this plan."),
      );
    } else if (
      ["asset", "media", "collection"].includes(block.kind) &&
      data &&
      typeof data === "object" &&
      !Array.isArray(data)
    ) {
      if (block.kind === "collection" && typeof data.assetCount === "number")
        card.append(node("p", `${data.assetCount} assets`, "muted"));
      if (typeof data.prompt === "string") card.append(node("p", data.prompt));
      const previews =
        block.kind === "collection"
          ? typeof data.coverImageUrl === "string"
            ? [{ url: data.coverImageUrl, type: "image" }]
            : Array.isArray(data.previewAssets)
              ? data.previewAssets.slice(0, 4)
              : []
          : [data];
      for (const preview of previews) {
        if (!preview || typeof preview !== "object" || Array.isArray(preview))
          continue;
        const url =
          typeof preview.url === "string" ? safeUrl(preview.url) : undefined;
        if (!url) continue;
        if (preview.type === "image") {
          const image = node("img");
          image.src = url;
          image.alt = block.fallback_text || "Library image";
          image.loading = "lazy";
          card.append(image);
        } else if (preview.type === "video" || preview.type === "audio") {
          const media = node(preview.type);
          media.src = url;
          media.controls = true;
          card.append(media);
        }
        const link = node("a", "Open media ↗");
        link.href = url;
        link.target = "_blank";
        link.rel = "noopener noreferrer";
        card.append(link);
      }
      const id =
        block.kind === "collection" ? data.collectionId : data.assetRecordId;
      if (typeof id === "string") card.append(node("small", id));
    } else if (
      block.kind === "export" &&
      data &&
      typeof data === "object" &&
      !Array.isArray(data)
    ) {
      const url = typeof data.url === "string" ? safeUrl(data.url) : undefined;
      if (url) {
        const link = node(
          "a",
          typeof data.zipName === "string"
            ? `Download ${data.zipName}`
            : "Download ZIP",
        );
        link.href = url;
        link.target = "_blank";
        link.rel = "noopener noreferrer";
        card.append(link);
      }
      if (Array.isArray(data.files)) {
        const files = node("ul");
        for (const file of data.files)
          if (
            file &&
            typeof file === "object" &&
            !Array.isArray(file) &&
            typeof file.path === "string"
          )
            files.append(node("li", file.path));
        card.append(files);
      }
      if (data.failedCount || data.truncatedCount)
        card.append(
          node(
            "p",
            `${data.failedCount ?? 0} failed · ${data.truncatedCount ?? 0} excluded by size limit`,
            "notice",
          ),
        );
    } else {
      const details = node("details");
      details.append(
        node("summary", `View ${block.kind} data`),
        node("pre", JSON.stringify(data, null, 2), "text"),
      );
      card.append(details);
    }
    return card;
  }
  function renderDecision(request: AgentInputRequest, responseId: string) {
    const form = node("form", "", "question");
    form.dataset.requestId = request.id;
    form.append(node("h3", request.prompt));
    if (request.status !== "pending") {
      form.append(node("small", request.status));
      const receipts = turns.find((t) => t.id === responseId)?.receipts ?? [];
      for (const receipt of receipts)
        if (receipt.inputId === request.id)
          form.append(node("p", `You answered: ${receipt.text}`, "receipt"));
      return form;
    }
    const fields = node("fieldset", "", "decision-fields");
    form.append(fields);
    if (request.kind === "clarification")
      for (const q of request.questions) {
        const group = node("fieldset");
        group.append(node("legend", q.text));
        for (const option of q.options) {
          const label = node("label", "", "option");
          const choice = node("input");
          choice.type = q.multiple ? "checkbox" : "radio";
          choice.name = q.id;
          choice.value = option.id;
          const caption = node("span", option.label);
          if (option.description)
            caption.append(node("small", ` — ${option.description}`));
          label.append(choice, caption);
          group.append(label);
        }
        if (q.allow_text) {
          const free = node("textarea");
          free.name = `${q.id}_text`;
          free.placeholder = "Or write your own answer";
          free.setAttribute("aria-label", `Your answer to ${q.text}`);
          group.append(free);
        }
        fields.append(group);
      }
    if (request.kind === "approval") {
      for (const decision of request.accepted_answers) {
        const action = node("button", decision.replaceAll("_", " "));
        action.type = "submit";
        action.value = decision;
        fields.append(action);
      }
    } else fields.append(node("button", "Send answer & continue", "primary"));
    const error = node("p", "", "muted");
    error.setAttribute("role", "alert");
    form.append(error);
    form.onsubmit = (e) => {
      e.preventDefault();
      if (busy || pending || restoring) return;
      const data = new FormData(form);
      let answer: AgentAnswer;
      if (request.kind === "clarification") {
        const answers = request.questions.map((q) => ({
          question_id: q.id,
          selected_option_ids: data.getAll(q.id).map(String),
          ...(String(data.get(`${q.id}_text`) ?? "").trim()
            ? { text: String(data.get(`${q.id}_text`)).trim() }
            : {}),
        }));
        if (answers.some((a) => !a.selected_option_ids.length && !a.text)) {
          error.textContent = "Answer each question before continuing.";
          return;
        }
        answer = { kind: "answers", answers };
      } else if (request.kind === "approval") {
        const decision = (e.submitter as HTMLButtonElement | null)?.value as
          | "approve"
          | "reject";
        if (!request.accepted_answers.includes(decision)) return;
        answer = {
          kind: "approval",
          decision,
        };
      } else return;
      const label =
        answer.kind === "answers" && request.kind === "clarification"
          ? answer.answers
              .map(
                (a) =>
                  a.text ||
                  a.selected_option_ids
                    .map(
                      (id) =>
                        request.questions
                          .find((q) => q.id === a.question_id)
                          ?.options.find((o) => o.id === id)?.label ?? id,
                    )
                    .join(", "),
              )
              .join(" · ")
          : answer.kind === "approval"
            ? answer.decision
            : "Answered";
      void mutate({
        kind: "answer",
        id: responseId,
        input: { input_request_id: request.id, answer },
        key: crypto.randomUUID(),
        label,
      });
    };
    return form;
  }
  function show(r: AgentResponseView) {
    const follow =
      window.innerHeight + window.scrollY >=
      document.documentElement.scrollHeight - 220;
    const isNew = !cards.has(r.id);
    responses.set(r.id, r);
    const turn = turns.find((t) => t.id === r.id);
    if (!turn) return;
    $("intro").hidden = true;
    let card = cards.get(r.id);
    if (!card) {
      const root = node("article", "", "turn");
      root.append(node("div", turn.prompt, "user"));
      const body = node("div", "", "assistant");
      root.append(body);
      cards.set(r.id, (card = { root, body, signature: "" }));
      // Recovery may finish out of order; always retain original turn order.
      $("thread").replaceChildren(
        ...turns.flatMap((t) => cards.get(t.id)?.root ?? []),
      );
    }
    const signature = JSON.stringify(r);
    if (card.signature !== signature) {
      // Preserve live inputs and media elements when their output item is unchanged.
      const old = new Map(
        Array.from(card.body.children).map((c) => [
          (c as HTMLElement).dataset.itemId,
          c as HTMLElement,
        ]),
      );
      const children: HTMLElement[] = [];
      const head = node("div", "", "response-head");
      head.append(
        node("strong", "fal Agent"),
        node(
          "span",
          `${r.status.replaceAll("_", " ")} · ${r.fal.phase.replaceAll("_", " ")}`,
        ),
      );
      children.push(head);
      for (const item of r.output) {
        const serialized = JSON.stringify(
          item.type === "fal.artifact"
            ? { item, status: r.status, final: r.fal.final_artifact_ids }
            : item,
        );
        const previous = old.get(item.id);
        if (previous?.dataset.signature === serialized) {
          children.push(previous);
          continue;
        }
        let el: HTMLElement;
        if (item.type === "message") {
          el = node("div");
          for (const part of item.content)
            el.append(
              part.type === "output_text"
                ? node("p", part.text, "text")
                : renderBlock(part),
            );
        } else if (item.type === "fal.artifact") el = renderArtifact(item, r);
        else if (item.type === "fal.input_request")
          el = renderDecision(item, r.id);
        else {
          el = node(
            "div",
            `${item.name} · ${item.status.replaceAll("_", " ")}${item.progress?.message ? ` · ${item.progress.message}` : ""}${item.error ? ` — ${item.error.message}` : ""}`,
            "operation",
          );
          el.dataset.status = item.status;
        }
        el.dataset.itemId = item.id;
        el.dataset.signature = serialized;
        children.push(el);
      }
      if (r.error) children.push(node("div", r.error.message, "notice"));
      const focused = root.activeElement as HTMLElement | null;
      const restoreFocus = focused && card.body.contains(focused);
      card.body.replaceChildren(...children);
      if (restoreFocus && focused.isConnected)
        focused.focus({ preventScroll: true });
      card.signature = signature;
    }
    const state = `${r.status} · ${r.fal.phase} · ${r.artifacts.length} artifacts`;
    if (signatures.get(r.id) !== state) {
      log(`${r.id}: ${state}`);
      signatures.set(r.id, state);
    }
    inspect();
    controls();
    const visible = !!root.querySelector(".layout")?.getClientRects().length;
    if (visible && !restoring && isNew)
      card.root.scrollIntoView({ block: "start" });
    else if (visible && !restoring && follow)
      $("compose").scrollIntoView({ block: "end" });
  }
  function disconnect() {
    observer?.abort();
    observer = undefined;
    watching = false;
    $("connection").textContent = "Disconnected · server execution continues";
    controls();
  }
  async function observe(id: string) {
    disconnect();
    const scope = new AbortController();
    observer = scope;
    watching = true;
    controls();
    const mode = field("transport").value;
    $("connection").textContent =
      mode === "poll"
        ? "Connected · polling"
        : "Connected · streaming snapshots";
    try {
      if (mode === "stream") {
        for await (const r of agent.responses.stream(id, {
          signal: scope.signal,
        })) {
          if (scope.signal.aborted) return;
          show(r);
        }
      } else
        while (!scope.signal.aborted) {
          const r = await agent.responses.retrieve(id, {
            signal: scope.signal,
          });
          if (scope.signal.aborted) return;
          show(r);
          if (terminal(r) || r.fal.phase === "waiting_for_input") break;
          await new Promise<void>((resolve) => {
            const done = () => {
              clearTimeout(timer);
              scope.signal.removeEventListener("abort", done);
              resolve();
            };
            const timer = setTimeout(done, 1000);
            scope.signal.addEventListener("abort", done, { once: true });
          });
        }
      if (!scope.signal.aborted)
        $("connection").textContent =
          responses.get(id)?.fal.phase === "waiting_for_input"
            ? "Up to date · waiting for your answer"
            : "Up to date";
    } catch (error) {
      if (!scope.signal.aborted) {
        notice(
          `Could not observe the response: ${error instanceof Error ? error.message : String(error)}. Reconnect to retrieve it; execution may still be running.`,
        );
        $("connection").textContent = "Connection interrupted";
      }
    } finally {
      if (observer === scope) {
        watching = false;
        controls();
      }
    }
  }
  async function mutate(command: Command) {
    if (busy || restoring) return;
    busy = true;
    pending = command;
    save();
    disconnect();
    notice();
    controls();
    let accepted: AgentResponseView | undefined;
    try {
      const options = { idempotencyKey: command.key };
      accepted =
        command.kind === "create"
          ? await agent.responses.create(command.request, options)
          : command.kind === "answer"
            ? await agent.responses.answer(command.id, command.input, options)
            : await agent.responses.cancel(command.id, options);
      if (
        command.kind === "create" &&
        !turns.some((t) => t.id === accepted!.id)
      ) {
        turns.push({ id: accepted.id, prompt: command.label, receipts: [] });
        field("prompt").value = "";
        field("image-url").value = "";
        reference();
      }
      if (command.kind === "answer") {
        turns
          .find((t) => t.id === command.id)
          ?.receipts.push({
            inputId: command.input.input_request_id,
            text: command.label,
          });
        const card = cards.get(command.id);
        if (card) card.signature = "";
      }
      pending = undefined;
      selectedResponse = accepted.id;
      save();
      updatePicker();
      show(accepted);
      log(`${command.kind} accepted`);
    } catch (error) {
      const rejected =
        error instanceof AgentRequestError &&
        [400, 401, 403, 404, 422].includes(error.status ?? 0);
      if (rejected) {
        pending = undefined;
        save();
      }
      notice(
        `${error instanceof Error ? error.message : String(error)}${rejected ? "\nThe server rejected the request. Correct the input or sign in, then try again." : "\nThe request was not confirmed. Retry sends the same command and idempotency key."}`,
      );
    } finally {
      busy = false;
      controls();
    }
    if (accepted) void observe(accepted.id);
  }
  $("compose").onsubmit = (e) => {
    e.preventDefault();
    if (button("send").disabled) return;
    const text = field("prompt").value.trim();
    if (!text) return;
    const url = field("image-url").value.trim();
    if (url && !safeUrl(url)) {
      notice("Use an http or https image URL.");
      return;
    }
    const content: Extract<
      AgentRequest["input"],
      unknown[]
    >[number]["content"] = [{ type: "input_text", text }];
    if (url) content.push({ type: "input_image", image_url: url });
    if (selectedArtifact)
      content.push({
        type: "fal.input_artifact",
        artifact_id: selectedArtifact.id,
        revision: selectedArtifact.revision,
      });
    const request: AgentRequest = {
      input: [{ role: "user", content }],
      ...(current() ? { conversation: current()!.fal.conversation_id } : {}),
    };
    void mutate({
      kind: "create",
      request,
      key: crypto.randomUUID(),
      label:
        text +
        (selectedArtifact ? `\n↳ Reference: ${selectedArtifact.id}` : "") +
        (url ? `\n↳ Image: ${url}` : ""),
    });
  };
  $("retry").onclick = () => {
    if (pending) void mutate(pending);
  };
  $("cancel").onclick = () => {
    const r = current();
    if (r && !button("cancel").disabled)
      void mutate({
        kind: "cancel",
        id: r.id,
        key: crypto.randomUUID(),
        label: "Cancel execution",
      });
  };
  $("disconnect").onclick = () => {
    disconnect();
    log("Observation disconnected; no cancellation sent");
  };
  $("reconnect").onclick = () => {
    const id = turns.at(-1)?.id;
    if (id) {
      notice();
      void observe(id);
    }
  };
  $("transport").onchange = () => {
    const id = turns.at(-1)?.id;
    if (id && !busy && !restoring) void observe(id);
  };
  $("response-picker").onchange = () => {
    selectedResponse = field("response-picker").value;
    inspect();
  };
  for (const tab of ["json", "lifecycle"])
    $(`${tab}-tab`).onclick = () => {
      for (const t of ["json", "lifecycle"]) {
        $(t).hidden = t !== tab;
        $(`${t}-tab`).classList.toggle("selected", t === tab);
        $(`${t}-tab`).setAttribute("aria-pressed", String(t === tab));
      }
    };
  $("load-resource").onclick = async () => {
    const kind = field("resource-kind").value;
    const id =
      field("resource-id").value.trim() || current()?.fal.conversation_id;
    button("load-resource").disabled = true;
    $("resource-result").textContent = "Loading…";
    try {
      let result: unknown;
      if (kind === "projects") result = await agent.projects.list();
      else if (kind === "models")
        result = await agent.models.list({
          keywords: field("resource-id").value.trim(),
          limit: 10,
        });
      else if (kind === "preferences")
        result = await agent.preferences.retrieve();
      else {
        if (!id) throw new Error("Enter an ID or start a conversation first.");
        if (kind === "context") {
          const [resources, documents, memory] = await Promise.all([
            agent.projects.resources(id),
            agent.projects.documents.list(id),
            agent.projects.memory.retrieve(id),
          ]);
          result = { resources, documents, memory };
        } else if (kind === "settings")
          result = await agent.settings.defaults.retrieve({
            scope: "chat",
            chatId: id,
          });
        else result = await agent.queue.retrieve(id);
      }
      $("resource-result").textContent = JSON.stringify(result, null, 2);
    } catch (error) {
      $("resource-result").textContent =
        error instanceof Error ? error.message : String(error);
    } finally {
      button("load-resource").disabled = false;
    }
  };
  $("generation-summary").onclick = async () => {
    const conversation = current()?.fal.conversation_id;
    if (!conversation) return notice("Start a conversation first.");
    button("generation-summary").disabled = true;
    $("summary-result").textContent = "Loading billed generation costs…";
    try {
      const summary = await agent.conversations.generationSummary(conversation);
      $("summary-result").textContent =
        `${summary.totalCount} completed generations · $${(summary.totalCostNanoUsd / 1e9).toFixed(4)} billed\n${summary.pricedRequestCount} priced requests · ${summary.unpricedRequestCount} still unpriced\nExcludes LLM usage and requests not yet billed.`;
    } catch (error) {
      $("summary-result").textContent =
        error instanceof Error ? error.message : String(error);
    } finally {
      button("generation-summary").disabled = false;
    }
  };
  $("new-chat").onclick = () => {
    if (button("new-chat").disabled) return;
    disconnect();
    turns = [];
    responses.clear();
    cards.clear();
    signatures.clear();
    selectedResponse = "";
    reference();
    field("prompt").value = "";
    field("image-url").value = "";
    $("summary-result").textContent = "";
    $("thread").replaceChildren();
    $("intro").hidden = false;
    save();
    updatePicker();
    inspect();
    notice();
    controls();
  };
  const examples: Record<string, string> = {
    question:
      "Help me pick a visual direction for a small coffee brand. Ask one question using a questions card with 2–3 options. Do not generate media. After I answer, briefly summarize the chosen direction without generating media.",
    image:
      "Generate exactly one square image using fal-ai/flux/schnell: a cobalt blue ceramic mug on a pale stone table, a small orange on the right, cool morning window light, editorial product photography, no text. Proceed without clarification.",
    plan: "Create a short plan for a three-image coffee brand campaign using a plan card. Include concept, hero product image, and detail image. Planning only: do not generate media, do not execute the plan. Ask for my feedback.",
  };
  root.querySelectorAll<HTMLButtonElement>("[data-example]").forEach((b) => {
    b.onclick = () => {
      field("prompt").value = examples[b.dataset.example!];
      field("prompt").focus();
    };
  });
  async function restore() {
    controls();
    try {
      const raw = sessionStorage.getItem(key);
      if (raw) {
        const state = JSON.parse(raw);
        turns = Array.isArray(state.turns) ? state.turns : [];
        pending = state.pending;
      }
      selectedResponse = turns.at(-1)?.id ?? "";
      updatePicker();
      for (const turn of turns) {
        try {
          const restored = await agent.responses.retrieve(turn.id);
          turn.receipts = turn.receipts.map((receipt) =>
            typeof receipt === "string"
              ? {
                  inputId:
                    restored.output.find(
                      (item) => item.type === "fal.input_request",
                    )?.id ?? "",
                  text: receipt,
                }
              : receipt,
          );
          show(restored);
        } catch {
          notice(
            `Could not restore ${turn.id}. Sign in and reconnect. The saved IDs are retained.`,
          );
        }
      }
    } catch {
      notice("Could not read this tab's recovery state.");
    } finally {
      restoring = false;
      controls();
    }
    const r = current();
    if (r && !terminal(r) && !pending) void observe(r.id);
  }
  void restore();
}
