// Local development only.
//
// `npm start` (react-scripts) automatically loads this file into its dev
// server. On Netlify, requests to /.netlify/functions/<name> are handled by the
// serverless functions in /functions. The plain CRA dev server knows nothing
// about those, so locally every MangaDex/favicon call used to 404.
//
// This mounts the very same function handlers into the dev server, so the app
// behaves the same locally as it does live. Nothing here is part of the
// production bundle.
const path = require("path");
const fs = require("fs");
const express = require("express");

const FUNCTIONS_DIR = path.join(__dirname, "..", "functions");

module.exports = function (app) {
  app.all(
    "/.netlify/functions/:name",
    // functions receive the raw body string, exactly like on Netlify
    express.text({ type: () => true, limit: "10mb" }),
    async (req, res) => {
      const { name } = req.params;
      const file = path.join(FUNCTIONS_DIR, name, `${name}.js`);

      if (!/^[\w-]+$/.test(name) || !fs.existsSync(file)) {
        res.status(404).json({ error: `No local function named "${name}"` });
        return;
      }

      try {
        // re-require on every call so edits to a function apply without
        // restarting the dev server
        delete require.cache[require.resolve(file)];
        const { handler } = require(file);

        const result = await handler(
          {
            body: typeof req.body === "string" ? req.body : "",
            httpMethod: req.method,
            headers: req.headers,
            path: req.path,
            queryStringParameters: req.query,
          },
          {},
        );

        res.status(result.statusCode || 200);
        res.set({ "Content-Type": "application/json", ...result.headers });
        // binary responses (images) come base64-encoded, as Netlify expects
        res.send(
          result.isBase64Encoded ? Buffer.from(result.body, "base64") : result.body,
        );
      } catch (error) {
        console.error(`[local function ${name}]`, error);
        res.status(500).json({ error: "Local function crashed" });
      }
    },
  );
};
