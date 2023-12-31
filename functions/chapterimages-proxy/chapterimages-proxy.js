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

    console.log(`Image URLs: ${imageUrls}`);

    if (response.status !== 200) {
      return {
        statusCode: response.status,
        body: JSON.stringify({ error: "Failed to fetch chapter images" }),
      };
    }

    if (!imageUrls) {
      return {
        statusCode: 400,
        body: JSON.stringify({ error: "Invalid or missing image URLs" }),
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
        contentType: response.headers["content-type"],
        data: response.data,
      };
    });

    const imageResponses = await Promise.all(imageRequests);

    console.log(`imageresponses: ${imageResponses}`);

    // Prepare the response for multiple images
    const responseData = imageResponses.map(({ contentType, data }) => ({
      contentType,
      data,
    }));

    console.log(responseData);
    console.log(JSON.stringify(responseData));

    return {
      statusCode: 200,
      body: JSON.stringify(responseData),
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
