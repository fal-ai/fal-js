import { mountAgentWorkspace } from "./agent-workspace";

const sections = ["api", "agent"] as const;
type Section = (typeof sections)[number];
let mounted = false;
function activate(section: Section, focus = false) {
  if (section === "agent" && !mounted) {
    const template = document.getElementById(
      "agent-workspace-template",
    ) as HTMLTemplateElement;
    const root = document
      .getElementById("agent-workspace-host")!
      .attachShadow({ mode: "open" });
    root.append(template.content.cloneNode(true));
    mountAgentWorkspace(root);
    mounted = true;
  }
  for (const name of sections) {
    const selected = name === section;
    const tab = document.getElementById(`playground-tab-${name}`)!;
    tab.setAttribute("aria-selected", String(selected));
    tab.tabIndex = selected ? 0 : -1;
    document.getElementById(`playground-panel-${name}`)!.hidden = !selected;
  }
  // URL state supports sharing/reload without navigating or remounting either view.
  history.replaceState(null, "", section === "agent" ? "#agent" : "#api");
  if (focus) document.getElementById(`playground-tab-${section}`)!.focus();
}
for (const [index, section] of sections.entries()) {
  const tab = document.getElementById(`playground-tab-${section}`)!;
  tab.onclick = () => activate(section);
  tab.onkeydown = (event) => {
    const next =
      event.key === "ArrowRight" || event.key === "ArrowLeft"
        ? sections[1 - index]
        : event.key === "Home"
          ? "api"
          : event.key === "End"
            ? "agent"
            : undefined;
    if (next) {
      event.preventDefault();
      activate(next, true);
    }
  };
}
window.addEventListener("hashchange", () =>
  activate(location.hash === "#agent" ? "agent" : "api"),
);
activate(location.hash === "#agent" ? "agent" : "api");
