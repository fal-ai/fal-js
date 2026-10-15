// Keep native import(): the vendor exports ESM only. The client otherwise
// compiles to CommonJS, which would rewrite a TypeScript import() to require().
exports.loadHappyOysterSdk = () => import("@happy-oyster/js-sdk");
