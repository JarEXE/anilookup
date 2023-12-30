const axios = require("axios");

const handler = async function (event, context) {
  try {
    const { url, title } = JSON.parse(event.body);

    console.log(`URL is ${url}`);
    console.log(typeof url);
    console.log(typeof JSON.stringify(url));

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

    const response = await axios({
      method: "GET",
      url: `${url}/manga`,
      params: filters,
    });

    console.log(`Response: ${response}`);

    if (!response.ok) {
      return {
        statusCode: response.status,
        body: JSON.stringify({ error: "Failed to fetch mangaID" }),
      };
    }

    const mangaID = response.data.data[0].id;

    console.log(`Your manga ID is ${mangaID}`);

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
