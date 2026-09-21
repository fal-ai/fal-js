import { mountAgentWorkspace } from "./agent-workspace";

import { mountAgency } from "./agency";
let delegationMounted = false;
const sections = ["api", "agent", "delegation"] as const;
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
  if (section === "delegation" && !delegationMounted) {
    mountAgency(
      document
        .getElementById("delegation-host")!
        .attachShadow({ mode: "open" }),
    );
    delegationMounted = true;
  }
  for (const name of sections) {
    const selected = name === section;
    const tab = document.getElementById(`playground-tab-${name}`)!;
    tab.setAttribute("aria-selected", String(selected));
    tab.tabIndex = selected ? 0 : -1;
    document.getElementById(`playground-panel-${name}`)!.hidden = !selected;
  }
  // URL state supports sharing/reload without navigating or remounting either view.
  history.replaceState(null, "", `#${section}`);
  if (focus) document.getElementById(`playground-tab-${section}`)!.focus();
}
for (const [index, section] of sections.entries()) {
  const tab = document.getElementById(`playground-tab-${section}`)!;
  tab.onclick = () => activate(section);
  tab.onkeydown = (event) => {
    const next =
      event.key === "ArrowRight" || event.key === "ArrowLeft"
        ? sections[
            (index + (event.key === "ArrowRight" ? 1 : sections.length - 1)) %
              sections.length
          ]
        : event.key === "Home"
          ? "api"
          : event.key === "End"
            ? "delegation"
            : undefined;
    if (next) {
      event.preventDefault();
      activate(next, true);
    }
  };
}
window.addEventListener("hashchange", () =>
  activate(
    sections.find((section) => location.hash === `#${section}`) ?? "api",
  ),
);
activate(sections.find((section) => location.hash === `#${section}`) ?? "api");
