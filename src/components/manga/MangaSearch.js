import React from "react";
import useUrlParams from "../../hooks/useUrlParams";
import useUserList from "../../hooks/useUserList";
import useApiResource from "../details/useApiResource";
import { sfwQuery, withoutNsfw } from "../../utils/nsfw";
import ListStats from "../stats/ListStats";
import SearchBox from "../search/SearchBox";
import HeroFacts from "../landing/HeroFacts";
import Spotlight from "../landing/Spotlight";
import NewSeries from "../landing/NewSeries";
import TopList from "../landing/TopList";
import SignInPrompt from "../landing/SignInPrompt";
import { GenreLinks, MagazineLinks } from "../landing/BrowseLinks";
import { FanRecs } from "../landing/Discover";

const TOP_OPTIONS = [
  { value: "publishing", label: "Publishing", query: "filter=publishing" },
  { value: "manga", label: "Manga", query: "type=manga" },
  { value: "manhwa", label: "Manhwa", query: "type=manhwa" },
  { value: "manhua", label: "Manhua", query: "type=manhua" },
  { value: "novel", label: "Novels", query: "type=novel" },
];
const DOUJIN_OPTION = {
  value: "doujin",
  label: "Doujinshi",
  query: "type=doujin",
};

const NEW_SERIES_LIMIT = 25;

// series in `items` that started this calendar month (up to today)
function startedThisMonth(items) {
  const now = new Date();
  return items.filter((item) => {
    const from =
      item.published && item.published.from && new Date(item.published.from);
    return (
      from &&
      from <= now &&
      from.getUTCFullYear() === now.getFullYear() &&
      from.getUTCMonth() === now.getMonth()
    );
  }).length;
}

function MangaSearch({ isDarkMode, allowNSFW, user }) {
  const [{ top: selectedOption }, updateUrlParams] = useUrlParams({
    top: "publishing",
  });

  // The signed-in user's manga list (Firestore), shared by the stats panel and
  // the status badges on the cards.
  const {
    items: listItems,
    status: listLoadStatus,
    reload: reloadList,
  } = useUserList("manga", user);

  // Doujinshi is only offered while NSFW content is on (as before)
  const topOptions = allowNSFW ? [...TOP_OPTIONS, DOUJIN_OPTION] : TOP_OPTIONS;
  const topOptionAllowed = topOptions.some((o) => o.value === selectedOption);

  React.useEffect(() => {
    if (!topOptionAllowed) {
      updateUrlParams({ top: null, page: null }, { replace: true });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [topOptionAllowed]);

  // the 25 most-read series still publishing: the spotlight shows the top
  // five, and their magazines make up "Browse by magazine"
  const popular = useApiResource(
    `/manga?status=publishing&order_by=members&sort=desc&limit=25${sfwQuery(allowNSFW)}`,
  );
  const fresh = useApiResource(
    `/manga?status=publishing&order_by=start_date&sort=desc&limit=${NEW_SERIES_LIMIT}${sfwQuery(allowNSFW)}`,
  );
  const popularItems = withoutNsfw(popular.data, "manga", allowNSFW);
  const freshItems = withoutNsfw(fresh.data, "manga", allowNSFW);
  const newThisMonth =
    fresh.status === "ready" ? startedThisMonth(freshItems) : null;

  return (
    <div className="landing">
      <div className="search-hero landing-hero">
        <h1 className="search-hero__title">Look up any manga</h1>
        <SearchBox
          type="manga"
          variant="hero"
        />
        <HeroFacts
          facts={[
            {
              value:
                popular.pagination && popular.pagination.items
                  ? popular.pagination.items.total
                  : null,
              label: "still publishing",
            },
            {
              value: newThisMonth,
              // the list holds the newest 25, so a full list means "at least"
              plus:
                newThisMonth !== null &&
                (fresh.data || []).length >= NEW_SERIES_LIMIT &&
                newThisMonth === freshItems.length,
              label: "new series this month",
            },
          ]}
        />
      </div>

      <Spotlight
        id="popular-heading"
        type="manga"
        title="Popular right now"
        kicker="#1 most read, still publishing"
        items={popularItems}
        status={popular.status}
        onRetry={popular.retry}
        listItems={user ? listItems : null}
      />

      <div className="landing-band">
        <div className="landing-band__main">
          <NewSeries
            items={freshItems}
            status={fresh.status}
            onRetry={fresh.retry}
          />
        </div>
        <aside className="landing-side" aria-label="Your list and magazines">
          {user ? (
            <ListStats
              type="manga"
              items={listItems}
              status={listLoadStatus}
              onRetry={reloadList}
              compact
            />
          ) : (
            <SignInPrompt type="manga" />
          )}
          <MagazineLinks items={popularItems} status={popular.status} />
        </aside>
      </div>

      {topOptionAllowed ? (
        <TopList
          type="manga"
          title="Top manga"
          options={topOptions}
          selected={selectedOption}
          onSelect={(value) => updateUrlParams({ top: value, page: null })}
          allowNSFW={allowNSFW}
          listItems={user ? listItems : null}
          isDarkMode={isDarkMode}
        />
      ) : null}

      <div className="landing-pair">
        <FanRecs type="manga" allowNSFW={allowNSFW} />
        <div className="landing-section landing-half">
          <GenreLinks type="manga" allowNSFW={allowNSFW} />
        </div>
      </div>

      <footer className="landing-footer">
        Powered by <a href="https://api.tenrai.org">Tenrai</a>
      </footer>
    </div>
  );
}

export default MangaSearch;
