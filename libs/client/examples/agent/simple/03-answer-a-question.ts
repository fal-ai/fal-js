import { fal } from "./client";

const response = await fal.agent.run({
  input: "Ask me to choose a visual style before generating an image.",
});
const request = response.pending_inputs[0];

if (request?.kind === "clarification") {
  const question = request.questions[0];
  // This demo chooses the first option of the fixture's one question.
  // In your app, use the user's selection and answer every required question.
  const chosenOption = question.options[0];

  await fal.agent.responses.answer(response.id, {
    input_request_id: request.id,
    answer: {
      kind: "answers",
      answers: [
        {
          question_id: question.id,
          selected_option_ids: [chosenOption.id],
        },
      ],
    },
  });

  const continued = await fal.agent.responses.wait(response.id);
  console.log(continued); // Same response ID. May ask another question.
} else {
  console.log(response); // Finished, failed, or a different kind of decision.
}
