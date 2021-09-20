// @ts-nocheck
import { Plugin } from "/Volumes/work/git/text-filters-code/node_modules/@umijs/runtime";

const plugin = new Plugin({
  validKeys: [
    "modifyClientRenderOpts",
    "patchRoutes",
    "rootContainer",
    "render",
    "onRouteChange",
    "__mfsu",
    "getInitialState",
    "initialStateConfig",
    "request",
  ],
});

export { plugin };
