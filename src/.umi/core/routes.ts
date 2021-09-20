// @ts-nocheck
import React from "react";
import { ApplyPluginsType } from "/Volumes/work/git/text-filters-code/node_modules/@umijs/runtime";
import * as umiExports from "./umiExports";
import { plugin } from "./plugin";

export function getRoutes() {
  const routes = [
    {
      path: "/",
      component: require("@/layouts/index.tsx").default,
      routes: [],
    },
  ];

  // allow user to extend routes
  plugin.applyPlugins({
    key: "patchRoutes",
    type: ApplyPluginsType.event,
    args: { routes },
  });

  return routes;
}
