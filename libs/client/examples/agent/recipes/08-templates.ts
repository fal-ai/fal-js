import type { AgentClient, AgentJson } from "@fal-ai/client";

/** Run one of the account's saved Agent templates with new inputs. */
export async function runTemplate(
  agent: AgentClient,
  templateId: string,
  inputs: Record<string, AgentJson>,
  idempotencyKey: string,
) {
  const template = await agent.templates.retrieve(templateId);
  console.log(
    "Inputs:",
    template.inputs.map((input) => `${input.key} (${input.type})`),
  );
  // Persist the key first. A retry with it returns the same run, never a second one.
  const accepted = await agent.templates.run(
    template.id,
    { version_id: template.versionId, inputs },
    { idempotencyKey },
  );
  // The run is a normal Agent response, so the existing helpers observe it.
  return agent.responses.wait(accepted.id);
}
