## The fal.ai App Generator

Generate a new full stack app configured with [fal.ai](https://fal.ai) proxy and models.

```sh
npx @fal-ai/create-app
```

Run the generator with fixed Node: `22.23.4+` on Node 22, `24.22.1+` on Node
24, or `26.12.1+` on Node 26. Older Node, Node 23/25, and Bun are rejected
before downloads. Update the Node runtime used by `npx` first: the initial
package download happens before this generator can run.

The generator installs with npm under that same Node executable. It writes the
runtime requirement and npm version into the generated project and updates its
Node version file. It no longer selects an arbitrary Bun or Yarn from PATH.
Git and npm use temporary CA stores that remove the affected eMudhra/AAA roots,
retain other roots and configured private CAs, and keep certificate verification
enabled. The temporary files are removed after generation. Git must support
explicit CA file/directory settings; native or managed trust outside these
clients must be verified separately.
