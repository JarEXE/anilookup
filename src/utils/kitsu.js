// Looks up the Kitsu banner cover for a title
export async function fetchKitsuCover(type, title) {
  try {
    const response = await fetch(
      // kitsu.app is Kitsu's current domain (kitsu.io is the legacy one).
      // The title is encoded so "&", "#", "?" etc. don't break the query.
      `https://kitsu.app/api/edge/${type}?filter[text]=${encodeURIComponent(
        title,
      )}&page[limit]=${
        type === "anime" ? "5" : "1"
      }`,
    );
    const kitsuData = await response.json();

    if (type === "anime") {
      const matchingItem = kitsuData.data.find(
        (item) =>
          item.attributes.canonicalTitle === title ||
          // can be null on some Kitsu entries
          (item.attributes.abbreviatedTitles || []).includes(title) ||
          item.attributes.titles.en === title ||
          item.attributes.titles.en_jp === title ||
          item.attributes.titles.ja_jp === title,
      );

      return matchingItem && matchingItem.attributes.coverImage
        ? matchingItem.attributes.coverImage.original
        : "";
    }

    const firstItem = kitsuData.data[0];
    return firstItem && firstItem.attributes.coverImage != null
      ? `${firstItem.attributes.coverImage.original}`
      : "";
  } catch (error) {
    console.log(error);
    return "";
  }
}
