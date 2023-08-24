const fetch = require("node-fetch");

const handler = async function (event, context) {
  try {
    const { url } = JSON.parse(event.body);

    if (!url) {
      return {
        statusCode: 400,
        body: JSON.stringify({ error: "Missing URL" }),
      };
    }

    let domain;
    const parsedURL = new URL(url);
    domain = parsedURL.hostname;

    const response = await fetch(
      `https://www.google.com/s2/favicons?domain=${domain}`
    );

    console.log(response.url);

    if (!response.ok) {
      return {
        statusCode: response.status,
        body: JSON.stringify({ error: "Failed to fetch favicon" }),
      };
    }

    //const blob = await response.blob();
    const faviconUrl = response.url;

    return {
      statusCode: 200,
      body: JSON.stringify({ faviconUrl }),
    };
  } catch (error) {
    console.error("Error handling request:", error);

    return {
      statusCode: 500,
      body: JSON.stringify({ error: "Internal Server Error" }),
    };
  }
};

module.exports = { handler };
