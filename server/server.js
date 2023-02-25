import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { createServer as createViteServer } from "vite";
import express from "express";
import compression from "compression";
import universalCookie from "universal-cookie-express";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const resolve = (p) => path.resolve(__dirname, p);

export async function createServer() {
  const isProd = process.env.NODE_ENV === "production";
  const isDev = !isProd;

  let vite, template, render;

  const app = express();

  if (isDev) {
    vite = await createViteServer();
    app.use(vite.middlewares);
  }

  if (isProd) {
    app.use(compression());
    app.use("/", express.static(resolve("../dist/client"), { index: false }));
  }

  app.use(express.json());
  app.use(express.urlencoded({ extended: true }));
  app.use(universalCookie());

  template = isProd
    ? fs.readFileSync(resolve("../dist/client/index.html"), "utf-8")
    : "";

  app.use("*", async (req, res, next) => {
    const url = req.originalUrl;

    try {
      if (isProd) {
        render = (await import("../dist/server/entry-server.js")).render;
      } else {
        template = fs.readFileSync(resolve("../index.html"), "utf-8");
        template = await vite.transformIndexHtml(url, template);
        render = (await vite.ssrLoadModule("/src/entry-server.tsx")).render;
      }

      const appHtml = await render(url, {
        universalCookies: req.universalCookies,
      });

      const html = template.replace(`<!--root-->`, appHtml);

      res.status(200).set({ "Content-Type": "text/html" }).end(html);
    } catch (e) {
      if (isDev) {
        vite.ssrFixStacktrace(e);
      }

      next(e);
    }
  });

  app.listen(8080);
}

void createServer();
