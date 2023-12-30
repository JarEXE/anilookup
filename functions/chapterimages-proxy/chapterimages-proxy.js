const axios = require("axios");

const handler = async function (event, context) {
  try {
    const { url, chapterID } = JSON.parse(event.body);

    if (!url) {
      return {
        statusCode: 400,
        body: JSON.stringify({ error: "Missing URL" }),
      };
    }

    const response = await axios({
      method: "GET",
      url: `${url}/at-home/server/${chapterID}`,
    });

    const host = response.data.baseUrl;
    const chapterHash = response.data.chapter.hash;
    const data = response.data.chapter.data;
    //const dataSaver = response.data.chapter.dataSaver;

    const imageUrls = data.map((entry, index) => {
      return `${host}/data/${chapterHash}/${entry}`;
    });

    if (response.status !== 200) {
      return {
        statusCode: response.status,
        body: JSON.stringify({ error: "Failed to fetch chapter images" }),
      };
    }

    // Fetch images in parallel
    const imageRequests = imageUrls.map(async (imageUrl) => {
      const response = await axios({
        method: "GET",
        url: imageUrl,
        responseType: "arraybuffer",
      });

      return {
        data: response.data.toString("base64"),
        contentType: response.headers["content-type"],
      };
    });

    const imageResponses = await Promise.all(imageRequests);

    const headers = {
      "Access-Control-Allow-Origin": "*", // Adjust this to match your React app's domain
      "Access-Control-Allow-Methods": "OPTIONS, POST, GET",
      "Access-Control-Allow-Headers": "Content-Type",
    };

    // Prepare the response for multiple images
    const responseData = imageResponses.map(({ data, contentType }) => ({
      data,
      contentType,
    }));

    return {
      statusCode: 200,
      body: JSON.stringify(responseData),
      headers,
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
