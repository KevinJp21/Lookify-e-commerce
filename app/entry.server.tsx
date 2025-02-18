/**
 * By default, Remix will handle generating the HTTP Response for you.
 * You are free to delete this file if you'd like to, but if you ever want it revealed again, you can run `npx remix reveal` ✨
 * For more information, see https://remix.run/file-conventions/entry.server
 */

import { PassThrough } from "node:stream";

import type { AppLoadContext, EntryContext } from "@remix-run/node";
import { createReadableStreamFromReadable } from "@remix-run/node";
import { RemixServer } from "@remix-run/react";
import { isbot } from "isbot";
import { renderToPipeableStream } from "react-dom/server";

import { createInstance } from "i18next";
import i18nServer from "./modules/i18n.server";
import { I18nextProvider, initReactI18next } from "react-i18next";
import * as i18n from "~/i18n";
import { ProductProvider } from "~/hooks/ProductContext";
const ABORT_DELAY = 5_000;

export default function handleRequest(
  request: Request,
  responseStatusCode: number,
  responseHeaders: Headers,
  remixContext: EntryContext,
  // This is ignored so we can keep it in the template for visibility.  Feel
  // free to delete this parameter in your app if you're not using it!
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  loadContext: AppLoadContext
){

  responseHeaders.set(
    "Content-Security-Policy",
    "default-src 'self'; " +
    "connect-src 'self' https://quickstart-0b4313f5.myshopify.com https://vercel.live wss://ws-us3.pusher.com; " +
    "style-src 'self' 'unsafe-inline' https://fonts.googleapis.com https://vercel.live; " +
    "font-src 'self' https://fonts.gstatic.com https://vercel.live https://assets.vercel.com; " +
    "img-src 'self' data: https: https://vercel.live https://vercel.com blob:; " +
    "script-src 'self' 'unsafe-inline' https://cdn.shopify.com https://vercel.live; " +
    "media-src 'self' https://cdn.shopify.com; " +
    "frame-src 'self' https://vercel.live; " +
    "upgrade-insecure-requests"
  );
  
	return isbot(request.headers.get("user-agent") || "")
    ? handleBotRequest(
        request,
        responseStatusCode,
        responseHeaders,
        remixContext
      )
    : handleBrowserRequest(
        request,
        responseStatusCode,
        responseHeaders,
        remixContext
      );
}

async function handleBotRequest(
  request: Request,
  responseStatusCode: number,
  responseHeaders: Headers,
  remixContext: EntryContext
){

	let instance = createInstance();
	let lng = await i18nServer.getLocale(request);
	let ns = i18nServer.getRouteNamespaces(remixContext);

	await instance.use(initReactI18next).init({
		...i18n,
		lng,
		ns,
	});

  return new Promise((resolve, reject) => {
    let shellRendered = false;
    const { pipe, abort } = renderToPipeableStream(
		<I18nextProvider i18n={instance}>
			<ProductProvider>
      <RemixServer
        context={remixContext}
        url={request.url}
        abortDelay={ABORT_DELAY}
      />
	  </ProductProvider>
	  </I18nextProvider>,
      {
        onAllReady() {
          shellRendered = true;
          const body = new PassThrough();
          const stream = createReadableStreamFromReadable(body);

          responseHeaders.set("Content-Type", "text/html");

          resolve(
            new Response(stream, {
              headers: responseHeaders,
              status: responseStatusCode,
            })
          );

          pipe(body);
        },
        onShellError(error: unknown) {
          reject(error);
        },
        onError(error: unknown) {
          responseStatusCode = 500;
          // Log streaming rendering errors from inside the shell.  Don't log
          // errors encountered during initial shell rendering since they'll
          // reject and get logged in handleDocumentRequest.
          if (shellRendered) {
            console.error(error);
          }
        },
      }
    );

    setTimeout(abort, ABORT_DELAY);
  });
}

async function handleBrowserRequest(
  request: Request,
  responseStatusCode: number,
  responseHeaders: Headers,
  remixContext: EntryContext
) {

	let instance = createInstance();
	let lng = await i18nServer.getLocale(request);
	let ns = i18nServer.getRouteNamespaces(remixContext);

	await instance.use(initReactI18next).init({
		...i18n,
		lng,
		ns,
	});

  return new Promise((resolve, reject) => {
    let shellRendered = false;
    const { pipe, abort } = renderToPipeableStream(
		<I18nextProvider i18n={instance}>
			<ProductProvider>
      <RemixServer
        context={remixContext}
        url={request.url}
        abortDelay={ABORT_DELAY}
      />
	  </ProductProvider>
	  </I18nextProvider>,
      {
        onShellReady() {
          shellRendered = true;
          const body = new PassThrough();
          const stream = createReadableStreamFromReadable(body);

          responseHeaders.set("Content-Type", "text/html");

          resolve(
            new Response(stream, {
              headers: responseHeaders,
              status: responseStatusCode,
            })
          );

          pipe(body);
        },
        onShellError(error: unknown) {
          reject(error);
        },
        onError(error: unknown) {
          responseStatusCode = 500;
          // Log streaming rendering errors from inside the shell.  Don't log
          // errors encountered during initial shell rendering since they'll
          // reject and get logged in handleDocumentRequest.
          if (shellRendered) {
            console.error(error);
          }
        },
      }
    );

    setTimeout(abort, ABORT_DELAY);
  });
}