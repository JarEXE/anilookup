const axios = require("axios");

const handler = async function (event, context) {
  try {
    const { url, mangaID } = JSON.parse(event.body);

    const languages = ["en"];

    const filters = {
      contentRating: ["safe", "suggestive", "erotica", "pornographic"],
      translatedLanguage: languages,
      limit: 500,
      order: {
        chapter: "desc",
      },
      includes: ["manga", "scanlation_group"],
      includeExternalUrl: 0,
    };

    if (!url) {
      return {
        statusCode: 400,
        body: JSON.stringify({ error: "Missing URL" }),
      };
    }

    const response = await axios({
      method: "GET",
      url: `${url}/manga/${mangaID}/feed`,
      params: filters,
    });

    if (response.status !== 200) {
      return {
        statusCode: response.status,
        body: JSON.stringify({ error: "Failed to fetch mangaID" }),
      };
    }

    const chapters = response.data.data.map((chapter) => {
      return {
        id: chapter.id,
        title: chapter.attributes.title,
        chapter: chapter.attributes.chapter,
        volume: chapter.attributes.volume,
        pages: chapter.attributes.pages,
        published: chapter.attributes.publishAt,
        scanlationGroup: chapter.relationships[0].attributes.name,
      };
    });

    const mangaDexChapters = {
      mangaImage: details.images.jpg.large_image_url,
      mangaTitle: details.title,
      chapters: chapters,
    };

    return {
      statusCode: 200,
      body: JSON.stringify(mangaDexChapters),
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
