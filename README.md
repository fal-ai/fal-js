# The fal.ai JS client

![@fal-ai/serverless-client npm package](https://img.shields.io/npm/v/@fal-ai/serverless-client?color=%237527D7&label=client&style=flat-square)
![@fal-ai/serverless-proxy npm package](https://img.shields.io/npm/v/@fal-ai/serverless-proxy?color=%237527D7&label=proxy&style=flat-square)
![Build](https://img.shields.io/github/actions/workflow/status/fal-ai/fal-js/build.yml?style=flat-square)
![License](https://img.shields.io/github/license/fal-ai/fal-js?style=flat-square)

## About the Project

The fal serverless JavaScript/TypeScript Client is a robust and user-friendly library designed for seamless integration of fal serverless functions in Web, Node.js, and React Native applications. Developed in TypeScript, it provides developers with type safety right from the start.

## Getting Started

The `@fal-ai/serverless-client` library serves as a client for fal serverless Python functions. For guidance on creating your functions, refer to the [quickstart guide](https://fal.ai/docs).

### Client Library

This client library is crafted as a lightweight layer atop platform standards like `fetch`. This ensures a hassle-free integration into your existing codebase. Moreover, it addresses platform disparities, guaranteeing flawless operation across various JavaScript runtimes.

> **Note:**
> Ensure you've reviewed the [getting started guide](https://fal.ai/docs) to acquire your credentials, browser existing APIs, or create your custom functions.

1. Install the client library
   ```sh
   npm install --save @fal-ai/serverless-client
   ```
2. Start by configuring your credentials:

   ```ts
   import * as fal from '@fal-ai/serverless-client';

   fal.config({
     // Can also be auto-configured using environment variables:
     credentials: 'FAL_KEY',
   });
   ```

3. Retrieve your function id and execute it:
   ```ts
   const result = await fal.run('user/app-alias');
   ```

The result's type is contingent upon your Python function's output. Types in Python are mapped to their corresponding types in JavaScript.

See the available [model APIs](https://fal.ai/models) for more details.

### The fal client proxy

Although the fal client is designed to work in any JS environment, including directly in your browser, **it is not recommended** to store your credentials in your client source code. The common practice is to use your own server to serve as a proxy to serverless APIs. Luckily fal supports that out-of-the-box with plug-and-play proxy functions for the most common engines/frameworks.

For example, if you are using Next.js, you can:

1. Instal the proxy library
   ```sh
   npm install --save @fal-ai/serverless-proxy
   ```
2. Add the proxy as an API endpoint of your app, see an example here in [pages/api/fal/proxy.ts](https://github.com/fal-ai/fal-js/blob/main/apps/demo-nextjs-page-router/pages/api/fal/proxy.ts)
   ```ts
   export { handler as default } from '@fal-ai/serverless-proxy/nextjs';
   ```
3. Configure the client to use the proxy:
   ```ts
   import * as fal from '@fal-ai/serverless-client';
   fal.config({
     proxyUrl: '/api/fal/proxy',
   });
   ```
4. Make sure your server has `FAL_KEY` as environment variable with a valid API Key. That's it! Now your client calls will route through your server proxy, so your credentials are protected.

See [libs/proxy](./libs/proxy/) for more details.

### The example Next.js app

You can find a minimal Next.js + fal application examples in [apps/demo-nextjs-page-router/](https://github.com/fal-ai/fal-js/blob/main/apps/demo-nextjs-page-router).

1. Run `npm install` on the repository root.
2. Create a `.env.local` file and add your API Key as `FAL_KEY` environment variable (or export it any other way your prefer).
3. Run `npx nx serve demo-nextjs-page-router` to start the Next.js app (`demo-nextjs-app-router` is also available if you're interested in the app router version).

Check our [Next.js integration docs](https://fal.ai/docs/integrations/nextjs) for more details.

## Roadmap

See the [open feature requests](https://github.com/fal-ai/fal-js/labels/enhancement) for a list of proposed features and join the discussion.

## Contributing

Contributions are what make the open source community such an amazing place to be learn, inspire, and create. Any contributions you make are **greatly appreciated**.

1. Make sure you read our [Code of Conduct](https://github.com/fal-ai/fal-js/blob/main/CODE_OF_CONDUCT.md)
2. Fork the project and clone your fork
3. Setup the local environment with `npm install`
4. Create a feature branch (`git checkout -b feature/add-cool-thing`) or a bugfix branch (`git checkout -b fix/smash-that-bug`)
5. Commit the changes (`git commit -m 'feat(client): added a cool thing'`) - use [conventional commits](https://conventionalcommits.org)
6. Push to the branch (`git push --set-upstream origin feature/add-cool-thing`)
7. Open a Pull Request

Check the [good first issue queue](https://github.com/fal-ai/fal-js/labels/good+first+issue), your contribution will be welcome!

## License

Distributed under the MIT License. See [LICENSE](https://github.com/fal-ai/fal-js/blob/main/LICENSE) for more information.
