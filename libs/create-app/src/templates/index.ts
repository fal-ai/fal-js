import { code } from "coldstitch";
import { Context } from "../core/context";

export type GeneratedFile = {
  filename: string;
  content: string;
};

export type SourceCodeGenerator = {
  proxy: (context: Context) => GeneratedFile;
  view: (context: Context) => GeneratedFile;
};

export const svelte = code`
import { createRequestHandler } from '@fal-ai/serverless-proxy/svelte';
import { FAL_KEY } from '$env/static/private';

export const { GET, POST, PUT } = createRequestHandler({ credentials: FAL_KEY });
`;

function fileExtension(context: Context): string {
  return context.typescript ? "ts" : "js";
}

export const svelteCode: SourceCodeGenerator = {
  proxy: (context) => ({
    filename: `src/routes/api/fal/proxy/+server.${fileExtension(context)}`,
    content: code`
      import { createRequestHandler } from '@fal-ai/serverless-proxy/svelte';
      import { FAL_KEY } from '$env/static/private';

      export const { GET, POST, PUT } = createRequestHandler({ credentials: FAL_KEY });
    `.toCodeString(),
  }),
  view: (context) => ({
    filename: "src/routes/+page.svelte",
    content: code`
    `.toCodeString(),
  }),
};
