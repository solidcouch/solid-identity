# SoId - Solid Identity

With _Solid Identity_, you can give your Solid service a Solid-OIDC-compatible identity.

## Packages

- [`@ldhop/core`](https://npmjs.com/package/@ldhop/core) - Core methods.
- [`@ldhop/koa`](https://npmjs.com/package/@ldhop/koa) - Koa middleware.

## How does it work?

There are three endpoints that need to be set up:

- `/.well-known/openid-configuration`
- `/path/to/jwks`
- `/path/to/webId`

For more details, you can check the output of `getEndpoints(webId)` from the `@soid/core` package.

## Limitations

The identity &mdash; particularly the `.well-known` endpoint &mdash; must be hosted at the root URL (not at a subpath). Therefore, you'll likely need a dedicated (sub)domain for the service.
