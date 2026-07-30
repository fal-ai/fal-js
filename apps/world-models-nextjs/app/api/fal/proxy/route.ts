import { createRouteHandler } from "@fal-ai/server-proxy/nextjs";

// This sample is intentionally open for localhost. A production customer app
// should require its own user session here before spending against FAL_KEY.
export const { GET, POST, PUT } = createRouteHandler({
  allowedEndpoints: ["alibaba/happy-oyster/**"],
  allowedUrlPatterns: ["fal.run/alibaba/happy-oyster/**"],
});
