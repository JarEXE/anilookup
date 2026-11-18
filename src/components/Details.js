import React from "react";
import { useNavigate, useParams } from "react-router-dom";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faBookOpen } from "@fortawesome/free-solid-svg-icons";
import dateFormat from "dateformat";
import ListAddButton from "./plugins/ListAddButton";
import { API_URL, apiFetch } from "../config/api";
import useNotify from "../hooks/useNotify";
import useUrlParams from "../hooks/useUrlParams";
import LoadError from "./plugins/LoadError";
import { fetchKitsuCover } from "../utils/kitsu";
import ErrorPage from "./ErrorPage";
import NsfwRedirect from "./plugins/NsfwRedirect";
import { isNsfw } from "../utils/nsfw";
import { lookupManga } from "./reader/mangadex";
import DetailsHeader from "./details/DetailsHeader";
import DetailsTabs from "./details/DetailsTabs";
import OverviewTab from "./details/OverviewTab";
import StatsTab from "./details/StatsTab";
import CharactersTab from "./details/CharactersTab";
import EpisodesTab from "./details/EpisodesTab";
import RelatedTab from "./details/RelatedTab";
import Recommendations from "./details/Recommendations";

const tabsFor = (type) => [
  { key: "overview", label: "Overview" },
  { key: "stats", label: "Stats" },
  { key: "characters", label: "Characters" },
  ...(type === "anime" ? [{ key: "episodes", label: "Episodes" }] : []),
  { key: "related", label: "Related" },
];

// Each manga author's role on this manga ("Story & Art", ...), which only the
// author's own page lists.
async function fetchAuthorPositions(details) {
  const positions = [];
  for (const author of details.authors || []) {
    try {
      const response = await apiFetch(`${API_URL}/people/${author.mal_id}/full`);
      const json = await response.json();
      const entry = json && json.data && (json.data.manga || []).find(
        (item) => item.manga.mal_id === details.mal_id,
      );
      if (entry) positions.push({ authorId: author.mal_id, position: entry.position });
    } catch (error) {
      // one failing author shouldn't drop the others
      console.log(error);
    }
  }
  return positions;
}

// Rendered at /anime/:id and /manga/:id (?tab=overview|stats|characters|
// episodes|related). Everything comes from the URL, so it works on direct
// visits, refreshes and back/forward.
function Details({ isDarkMode, type, allowNSFW }) {
  const { id } = useParams();
  const navigate = useNavigate();
  const itemId = `/${type}/${id}`;
  const notify = useNotify(isDarkMode);

  const [details, setDetails] = React.useState(null);
  const [kitsuCover, setKitsuCover] = React.useState("");
  const [loading, setLoading] = React.useState(true);
  const [notFound, setNotFound] = React.useState(false);
  const [loadError, setLoadError] = React.useState(false);
  const [reloadKey, setReloadKey] = React.useState(0);
  const [authorPositions, setAuthorPositions] = React.useState(null);
  // MangaDex's entry for this manga ({ found, id, languages }), for "Read"
  const [mangaDex, setMangaDex] = React.useState(null);
  const [checkingMangaDex, setCheckingMangaDex] = React.useState(false);

  const tabs = tabsFor(type);
  const [{ tab: tabParam }, updateUrlParams] = useUrlParams({ tab: "overview" });
  const activeTab = tabs.some((t) => t.key === tabParam) ? tabParam : "overview";

  // details + Kitsu banner
  React.useEffect(() => {
    let cancelled = false;

    (async () => {
      try {
        setLoading(true);
        setLoadError(false);
        // retries automatically while rate limited
        const response = await apiFetch(`${API_URL}${itemId}/full`);
        if (cancelled) return;

        if (response.status === 404 || response.status === 400) {
          setNotFound(true);
          setLoading(false);
          return;
        }
        if (response.status === 429) {
          setLoadError(true);
          setLoading(false);
          notify("Too many requests! Please wait a moment then try again.");
          return;
        }
        if (!response.ok) throw new Error(`HTTP ${response.status}`);

        const json = await response.json();
        const cover = await fetchKitsuCover(type, json.data.title);
        if (cancelled) return;

        setKitsuCover(cover);
        setDetails(json.data);
        setLoading(false);
      } catch (error) {
        if (cancelled) return;
        console.log(error);
        setLoadError(true);
        setLoading(false);
        notify("Failed to load this page. Please try again.");
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [itemId, type, notify, reloadKey]);

  // manga only: author roles, and whether MangaDex has it (for "Read")
  React.useEffect(() => {
    if (!details || type !== "manga") return;
    // about to be redirected away; skip the lookups
    if (!allowNSFW && isNsfw(details, type)) return;
    let cancelled = false;

    fetchAuthorPositions(details).then((positions) => {
      if (!cancelled) setAuthorPositions(positions);
    });

    setCheckingMangaDex(true);
    lookupManga(details)
      .then((result) => {
        if (!cancelled) setMangaDex(result);
      })
      .catch((error) => console.log("MangaDex lookup:", error))
      .finally(() => {
        if (!cancelled) setCheckingMangaDex(false);
      });

    return () => {
      cancelled = true;
    };
  }, [details, type, allowNSFW]);

  const openReader = () => {
    navigate(`/manga/${id}/read`, { state: { mangaDex } });
  };

  if (notFound) {
    return <ErrorPage isDarkMode={isDarkMode} />;
  }

  if (loadError) {
    return (
      <LoadError
        isDarkMode={isDarkMode}
        message="Couldn't load this page right now."
        onRetry={() => setReloadKey((key) => key + 1)}
        minHeight="80vh"
      />
    );
  }

  if (loading || !details) {
    return (
      <div className="details-loading" role="status" aria-busy="true">
        <span className="loader" />
        <span className="visually-hidden">Loading…</span>
      </div>
    );
  }

  // NSFW content is off: opened from the address bar or history, or the
  // toggle was just switched off while on this page
  if (!allowNSFW && isNsfw(details, type)) {
    return <NsfwRedirect type={type} isDarkMode={isDarkMode} />;
  }

  const actions = (
    <>
      <ListAddButton
        isDarkMode={isDarkMode}
        itemType={type}
        itemId={itemId}
        title={details.title}
        type={details.type}
        image={details.images.jpg.image_url}
        released={
          details.aired
            ? details.aired.from
            : details.published
              ? details.published.from
              : "?"
        }
        date={dateFormat(new Date(), "isoDateTime")}
      />
      {type === "manga" && ((mangaDex && mangaDex.found) || checkingMangaDex) ? (
        <button
          type="button"
          className="details-action"
          onClick={openReader}
          disabled={!(mangaDex && mangaDex.found)}
          aria-busy={checkingMangaDex}
        >
          <FontAwesomeIcon icon={faBookOpen} aria-hidden="true" />
          {checkingMangaDex ? "Checking…" : "Read"}
        </button>
      ) : null}
    </>
  );

  let panel;
  if (activeTab === "stats") {
    panel = <StatsTab details={details} type={type} isDarkMode={isDarkMode} />;
  } else if (activeTab === "characters") {
    panel = <CharactersTab details={details} type={type} isDarkMode={isDarkMode} />;
  } else if (activeTab === "episodes") {
    panel = <EpisodesTab details={details} isDarkMode={isDarkMode} />;
  } else if (activeTab === "related") {
    panel = <RelatedTab details={details} allowNSFW={allowNSFW} />;
  } else {
    panel = (
      <OverviewTab details={details} type={type} authorPositions={authorPositions} />
    );
  }

  return (
    <article className="details-page">
      <DetailsHeader
        details={details}
        type={type}
        kitsuCover={kitsuCover}
        isDarkMode={isDarkMode}
        actions={actions}
      />
      <DetailsTabs
        tabs={tabs}
        activeTab={activeTab}
        onChange={(key) => updateUrlParams({ tab: key })}
      >
        {panel}
      </DetailsTabs>
      <Recommendations details={details} type={type} allowNSFW={allowNSFW} />
    </article>
  );
}

export default Details;
