# `apps/docs`

Placeholder. The docs site is **Astro Starlight** (decided — see `docs/adr/0002-astro-starlight-for-docs.md`).

Scaffold it when Phase 3 pays for it, from this directory:

```sh
pnpm create astro@latest . -- --template starlight --no-git --skip-houston
```

Then delete this README and wire `dev` / `build` scripts so Turborepo picks them up.
