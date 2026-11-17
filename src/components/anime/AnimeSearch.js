import React from "react";
import toast from "react-hot-toast";
import useUrlParams from "../../hooks/useUrlParams";
import useUserList from "../../hooks/useUserList";
import useApiResource from "../details/useApiResource";
import { sfwQuery, withoutNsfw } from "../../utils/nsfw";
import ListStats from "../stats/ListStats";
import SearchBox from "../search/SearchBox";
import HeroFacts from "../landing/HeroFacts";
import Spotlight from "../landing/Spotlight";
import AiringToday from "../landing/AiringToday";
import TopList from "../landing/TopList";
import SignInPrompt from "../landing/SignInPrompt";
import { GenreLinks } from "../landing/BrowseLinks";
import {
  ComingSoon,
  FanRecs,
  TopCharacters,
  upcomingPath,
} from "../landing/Discover";

const TOP_OPTIONS = [
  { value: "airing", label: "Airing", query: "filter=airing" },
  { value: "upcoming", label: "Upcoming", query: "filter=upcoming" },
  { value: "series", label: "Series", query: "type=tv" },
  { value: "movies", label: "Movies", query: "type=movie" },
];

function AnimeSearch({ isDarkMode, allowNSFW, user }) {
  const notifyBadSearch = () =>
    toast.error("Type a title to search.", {
      style: {
        borderRadius: "10px",
        background: `${isDarkMode ? "var(--d-surface-2)" : "#333"}`,
        color: `${isDarkMode ? "var(--d-ink)" : "#fff"}`,
      },
    });

  const [{ top: selectedOption }, updateUrlParams] = useUrlParams({
    top: "airing",
  });

  const {
    items: listItems,
    status: listLoadStatus,
    reload: reloadList,
  } = useUserList("anime", user);

  const season = useApiResource(
    `/seasons/now?order_by=members&sort=desc&limit=10${sfwQuery(allowNSFW)}`,
  );
  // also feeds the "Coming soon" row further down (same request, cached)
  const upcoming = useApiResource(upcomingPath(allowNSFW));

  const total = (resource) =>
    resource.pagination && resource.pagination.items
      ? resource.pagination.items.total
      : null;

  return (
    <div className="landing">
      <div className="search-hero landing-hero">
        <h1 className="search-hero__title">Look up any anime</h1>
        <SearchBox
          type="anime"
          variant="hero"
          onEmptySubmit={notifyBadSearch}
        />
        <HeroFacts
          facts={[
            { value: total(season), label: "new this season" },
            { value: total(upcoming), label: "announced" },
          ]}
        />
      </div>

      <Spotlight
        id="season-heading"
        type="anime"
        title="This season"
        kicker="#1 this season"
        items={withoutNsfw(season.data, "anime", allowNSFW)}
        status={season.status}
        onRetry={season.retry}
        listItems={user ? listItems : null}
      />

      <div className="landing-band">
        <div className="landing-band__main">
          <AiringToday allowNSFW={allowNSFW} />
        </div>
        <aside className="landing-side" aria-label="Your list and genres">
          {user ? (
            <ListStats
              type="anime"
              items={listItems}
              status={listLoadStatus}
              onRetry={reloadList}
              compact
            />
          ) : (
            <SignInPrompt type="anime" />
          )}
          <GenreLinks type="anime" allowNSFW={allowNSFW} />
        </aside>
      </div>

      <TopList
        type="anime"
        title="Top anime"
        options={TOP_OPTIONS}
        selected={selectedOption}
        onSelect={(value) => updateUrlParams({ top: value, page: null })}
        allowNSFW={allowNSFW}
        listItems={user ? listItems : null}
        isDarkMode={isDarkMode}
      />

      <ComingSoon allowNSFW={allowNSFW} />

      <div className="landing-pair">
        <FanRecs type="anime" allowNSFW={allowNSFW} />
        <TopCharacters />
      </div>

      <footer className="landing-footer">
        Powered by <a href="https://api.tenrai.org">Tenrai</a>
      </footer>
    </div>
  );
}

export default AnimeSearch;
