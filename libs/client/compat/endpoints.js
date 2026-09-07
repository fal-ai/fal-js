"use strict";
// The `./endpoints` subpath exports types only, so there is nothing to
// re-export at runtime. This file deliberately does not require
// `@fal-ai/types`: that package is an optional peer, and requiring it would
// turn a missing optional dependency into a runtime crash.
Object.defineProperty(exports, "__esModule", { value: true });
