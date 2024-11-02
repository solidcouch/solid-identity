# SoId - Solid Identity

With _Solid Identity_, you can give your Solid service a Solid-OIDC-compatible identity.

## Packages

- [`@soid/core`](https://npmjs.com/package/@soid/core) - Core methods.
- [`@soid/koa`](https://npmjs.com/package/@soid/koa) - Koa middleware.

## How does it work?

There are three endpoints that need to be set up:

- `/.well-known/openid-configuration`
- `/path/to/jwks`
- `/path/to/webId` - unless you want to use custom webId

For more details, you can check the output of `getEndpoints(webId: string, issuer?: string)` from the `@soid/core` package.

## Limitations

The identity &mdash; particularly the `.well-known` endpoint &mdash; must be hosted at the root URL (not at a subpath). Therefore, you'll likely need a dedicated (sub)domain for the service.
