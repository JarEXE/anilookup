import axios from "axios";
import * as cheerio from "cheerio";

const USER_AGENT =
  "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36";

class Mangafreak {
  constructor() {
    this.session = axios.create({
      // headers: {
      //   "User-Agent": USER_AGENT,
      // },
    });
  }

  async sessionGet(url) {
    try {
      const response = await this.session.get(url);
      return response.data;
    } catch (error) {
      console.log("Error:", error.message);
      return null;
    }
  }

  async getMangaData(initialData) {
    assert("slug" in initialData, "Manga slug is missing in initial data");

    const html = await this.sessionGet(
      `https://w15.mangafreak.net/Manga/${initialData.slug}`
    );
    if (!html) {
      return null;
    }

    const $ = cheerio.load(html);
    const data = {
      ...initialData,
      authors: [],
      scanlators: [],
      genres: [],
      status: null,
      synopsis: null,
      chapters: [],
      serverId: "mangafreak",
    };

    const detailsContainerElement = $(".manga_series_data");

    data.name = detailsContainerElement.find("h1").text().trim();
    data.cover = $(".manga_series_image img").attr("src");

    detailsContainerElement.find("div").each((index, element) => {
      const textSplit = $(element).text().trim().split(":");
      if (textSplit.length !== 2) {
        return;
      }

      const [label, value] = textSplit.map((str) => str.trim());
      if (label === "Status") {
        data.status =
          value === "COMPLETED"
            ? "complete"
            : value === "ON-GOING"
            ? "ongoing"
            : null;
      } else if (label === "Author" || label === "Artist") {
        if (!data.authors.includes(value)) {
          data.authors.push(value);
        }
      }
    });

    detailsContainerElement
      .find(".series_sub_genre_list > a")
      .each((index, element) => {
        data.genres.push($(element).text().trim());
      });

    data.synopsis = $(".manga_series_description p").text().trim();

    $(".manga_series_list tr").each((index, element) => {
      const tdsElements = $(element).find("td");

      const slug = tdsElements.eq(0).find("a").attr("href").split("/").pop();
      const title = tdsElements.eq(0).find("a").text().trim();
      const date = tdsElements.eq(1).text().trim();

      data.chapters.push({
        slug,
        title,
        date: convertDateString(date),
      });
    });

    return data;
  }

  async getMangaChapterPageImage(mangaSlug, mangaName, chapterSlug, page) {
    const referer = `https://w15.mangafreak.net/${chapterSlug}`;
    const headers = { referer };

    const response = await this.session.get(
      `https://images.mangafreak.net/mangas/${page.slug}`,
      {
        headers,
      }
    );

    if (response.status !== 200) {
      return null;
    }

    const buffer = response.data;
    // const mime_type = getBufferMimeType(buffer);
    // if (!mime_type.startsWith("image")) {
    //   return null;
    // }

    return {
      buffer,
      //mime_type,
      name: page.slug.split("/").pop(),
    };
  }

  getMangaUrl(slug, url) {
    return `https://w15.mangafreak.net/Manga/${slug}`;
  }

  async getLatestUpdates() {
    const html = await this.sessionGet(
      "https://w15.mangafreak.net/Latest_Releases"
    );
    if (!html) {
      return null;
    }

    const $ = cheerio.load(html);
    const results = [];

    $(".latest_releases_item").each((index, element) => {
      const imgElement = $(element).find(".latest_releases_item img");
      const aElement = $(element).find(".latest_releases_info a");
      results.push({
        name: aElement.text().trim(),
        slug: aElement.attr("href").split("/").pop(),
        cover: imgElement.attr("src"),
      });
    });

    return results;
  }

  async getMostPopulars() {
    const html = await this.sessionGet("https://w15.mangafreak.net");
    if (!html) {
      return null;
    }
    const $ = cheerio.load(html);
    const results = [];

    $(".featured_item").each((index, element) => {
      const imgElement = $(element).find(".featured_item_image a img");
      const aElement = $(element).find(".featured_item_info a");
      results.push({
        name: aElement.text().trim(),
        slug: aElement.attr("href").split("/").pop(),
        cover: imgElement.attr("src"),
      });
    });
    return results;
  }

  async search(term) {
    const html = await this.sessionGet(
      `https://w15.mangafreak.net/Find/${term}`
    );
    if (!html) {
      return null;
    }

    const $ = cheerio.load(html);
    const results = [];

    $(".manga_search_item").each((index, item) => {
      const aElement = $(item).find("h3 a");
      results.push({
        slug: aElement.attr("href").trim().split("/").pop(),
        name: aElement.text().trim(),
        cover: $(item).find("span a img").attr("src"),
      });
    });

    return results;
  }
}

const assert = (condition, message) => {
  if (!condition) {
    throw new Error(message);
  }
};

const convertDateString = (dateString) => {
  const year = new Intl.DateTimeFormat("en", { year: "numeric" }).format(
    dateString
  );
  const month = new Intl.DateTimeFormat("en", { month: "2-digit" }).format(
    dateString
  );
  const day = new Intl.DateTimeFormat("en", { day: "2-digit" }).format(
    dateString
  );

  const formattedDate = `${year}/${month}/${day}`;

  return formattedDate;
};

// const getBufferMimeType = async (buffer) => {
//   try {
//     const { mime, ext } = await getImageInfo(buffer);

//     if (mime) {
//       return mime;
//     }

//     return getMimeTypeFromExtension(ext);
//   } catch (error) {
//     console.log("Error getting image MIME type:", error.message);
//     return null;
//   }
// };

// const getImageInfo = async (buffer) => {
//   return new Promise((resolve, reject) => {
//     sharp(buffer).metadata((error, metadata) => {
//       if (error) {
//         reject(error);
//       } else {
//         const { format } = metadata;
//         const mime = `image/${format.toLowerCase()}`;
//         resolve({
//           mime,
//           ext: format,
//         });
//       }
//     });
//   });
// };

// const getMimeTypeFromExtension = () => {
//   const extensionToMimeType = {
//     jpg: "image/jpeg",
//     jpeg: "image/jpeg",
//     png: "image/png",
//     gif: "image/gif",
//   };

//   return (
//     extensionToMimeType[extensionToMimeType.toLowerCase()] ||
//     "application/octet-stream"
//   );
// };

export default Mangafreak;
