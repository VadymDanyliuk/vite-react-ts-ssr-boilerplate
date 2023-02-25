import React from "react";
import ReactDOM from "react-dom/server";
import { StaticRouter } from "react-router-dom/server";
import { Cookies } from "react-cookie";
import { App } from "./components/App";
import { Providers } from "./components/Providers";

interface RenderOptions {
  universalCookies: Cookies;
}

export function render(url: string, { universalCookies }: RenderOptions) {
  return ReactDOM.renderToString(
    <StaticRouter location={url}>
      <Providers universalCookies={universalCookies}>
        <App />
      </Providers>
    </StaticRouter>
  );
}
