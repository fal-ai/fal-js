# The fal-serverless JS Client

![NPM](https://img.shields.io/npm/v/@fal/serverless-js)
![License](https://img.shields.io/github/license/fal-ai/serverless-js)
![Build](https://img.shields.io/github/actions/workflow/status/fal-ai/serverless-js/build)


## About the project

This project aims to provide a seamless and idiomatic way to run your fal serverless functions from JavaScript.

The project is written in TypeScript, so developers get type-safety out of the box.

## Getting Started

The serverless-js library is a client for the fal serverless Python functions. Check the [quickstart guide](https://docs.fal.ai/fal-serverless/quickstart) in order to create your functions.

### Library

The client library is build as a thin layer on top of the platform standards.

> **Note:**
> Make sure you followed the [fal-serverless getting started] so you get your credentials and register your functions. 

1. First you need to configure your credentials:

```ts
import * as fal from "@fal/serverless-js";

fal.config({
  credentials: {
    userId: "USER_ID",
    keyId: "KEY_ID",
    keySecret: "KEY_SECRET"
  }
});
```

2. Get your function id and run it:

```ts
const result = await fal.run("my-function-alias");
```

## Roadmap

See the [open feature requests](https://github.com/fal-ai/serverless-js/labels/enhancement) for a list of proposed features and join the discussion.

## Contributing

Contributions are what make the open source community such an amazing place to be learn, inspire, and create. Any contributions you make are **greatly appreciated**.

1. Make sure you read our [Code of Conduct](https://github.com/fal-ai/serverless-js/blob/main/CODE_OF_CONDUCT.md)
1. Fork the project and clone your fork
1. Setup the local environment with `npm install`
1. Create a feature branch (`git checkout -b feature/add-cool-thing`) or a bugfix branch (`git checkout -b fix/smash-that-bug`)
1. Commit the changes (`git commit -m 'Some meaningful message'`)
1. Push to the branch (`git push --set-upstream origin feature/add-cool-thing`)
1. Open a Pull Request

Check the [good first issue queue](https://github.com/fal-ai/serverless-js/labels/good+first+issue), your contribution will be welcome!

## License

Distributed under the MIT License. See [LICENSE](https://github.com/fal-ai/serverless-js/blob/main/LICENSE) for more information.
