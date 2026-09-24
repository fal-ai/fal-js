import { fal } from "./client";

// The local runner supplies a saved response containing a synthetic image.
// In your app, use a response ID you saved from an earlier run.
const original = await fal.agent.responses.retrieve(
  process.env.EXAMPLE_RESPONSE_ID!,
);
const image = original.artifacts.find(
  (artifact) => artifact.media_type === "image",
);
if (!image) throw new Error("Choose a response with an image to refine.");

const refined = await fal.agent.run({
  conversation: original.fal.conversation_id,
  input: [
    {
      role: "user",
      content: [
        { type: "input_text", text: "Make this image warmer." },
        {
          type: "fal.input_artifact",
          artifact_id: image.id,
          revision: image.revision,
        },
      ],
    },
  ],
});

console.log(refined); // New response, same conversation, no re-upload.
