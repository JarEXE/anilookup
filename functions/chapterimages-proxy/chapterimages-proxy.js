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

    console.log(imageUrls);

    if (response.status !== 200) {
      return {
        statusCode: response.status,
        body: JSON.stringify({ error: "Failed to fetch chapter images" }),
      };
    }

    return {
      statusCode: 200,
      body: JSON.stringify(imageUrls),
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
