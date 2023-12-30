const fetch = require("node-fetch");
const axios = require("axios");

const handler = async function (event, context) {
  try {
    const { url } = JSON.parse(event.body.url);
    const title = event.body.title;

    const filters = {
      contentRating: ["safe", "suggestive", "erotica", "pornographic"],
      title: title,
    };

    if (!url) {
      return {
        statusCode: 400,
        body: JSON.stringify({ error: "Missing URL" }),
      };
    }
    const parsedURL = new URL(url);

    const response = await axios({
      method: "GET",
      url: `${parsedURL}/manga`,
      params: filters,
    });

    console.log(parsedURL);
    console.log(response.url);

    if (!response.ok) {
      return {
        statusCode: response.status,
        body: JSON.stringify({ error: "Failed to fetch favicon" }),
      };
    }

    const mangaID = response.data.data[0].id;

    return {
      statusCode: 200,
      body: JSON.stringify(mangaID),
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
