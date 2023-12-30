const axios = require("axios");

const handler = async function (event, context) {
  try {
    const { imageUrl } = JSON.parse(event.body);

    if (!imageUrl) {
      return {
        statusCode: 400,
        body: JSON.stringify({ error: "Missing image URL" }),
      };
    }

    const response = await axios({
      method: "GET",
      url: imageUrl,
      responseType: "arraybuffer",
    });

    const headers = {
      "Content-Type": response.headers["content-type"],
      "Cache-Control": "public, max-age=604800, immutable",
    };

    console.log(response.data);
    console.log(response);

    return {
      statusCode: 200,
      body: response.data.toString("base64"),
      isBase64Encoded: true,
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
