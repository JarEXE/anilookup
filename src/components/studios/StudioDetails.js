import React from "react";
import { useParams } from "react-router-dom";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faArrowUpRightFromSquare } from "@fortawesome/free-solid-svg-icons";
import { API_URL, apiFetch } from "../../config/api";
import useApiResource from "../details/useApiResource";
import { sfwQuery, withoutNsfw } from "../../utils/nsfw";
import Favicon from "../plugins/Favicon";
import LoadError from "../plugins/LoadError";
import ErrorPage from "../ErrorPage";
import EntityHeader from "../entity/EntityHeader";
import AboutSection from "../entity/AboutSection";
import Spotlight from "../landing/Spotlight";
import { fullNumber } from "../details/format";
import StudioWorks from "./StudioWorks";

const formatDate = (iso) =>
  new Date(iso).toLocaleDateString("en", {
    year: "numeric",
    month: "long",
    day: "numeric",
    timeZone: "UTC",
  });

// Rendered at /studio/:id?type=...&sort=...&page=...
function StudioDetails({ isDarkMode, allowNSFW }) {
  const { id: studioId } = useParams();
  const [studio, setStudio] = React.useState(null);
  const [status, setStatus] = React.useState("loading");
  const [reloadKey, setReloadKey] = React.useState(0);

  React.useEffect(() => {
    let cancelled = false;
    setStatus("loading");
    (async () => {
      try {
        // retries by itself while rate limited
        const response = await apiFetch(`${API_URL}/producers/${studioId}/full`);
        if (cancelled) return;
        if (response.status === 404 || response.status === 400) {
          setStatus("notfound");
          return;
        }
        if (!response.ok) throw new Error(`HTTP ${response.status}`);
        const json = await response.json();
        if (cancelled) return;
        setStudio(json.data);
        setStatus("ready");
      } catch (error) {
        if (cancelled) return;
        console.error("Error loading studio:", error);
        setStatus("error");
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [studioId, reloadKey]);

  // its most popular titles, for the "Known for" spotlight
  const popular = useApiResource(
    `/anime?producers=${studioId}&order_by=members&sort=desc&limit=7${sfwQuery(allowNSFW)}`,
    status === "ready",
  );

  if (status === "notfound") return <ErrorPage isDarkMode={isDarkMode} />;
  if (status === "error") {
    return (
      <LoadError
        isDarkMode={isDarkMode}
        message="Couldn't load this studio right now."
        onRetry={() => setReloadKey((key) => key + 1)}
        minHeight="80vh"
      />
    );
  }
  if (status !== "ready" || !studio) {
    return (
      <div className="details-loading" role="status" aria-busy="true">
        <span className="loader" />
        <span className="visually-hidden">Loading…</span>
      </div>
    );
  }

  const titles = studio.titles || [];
  const name = (titles.find((t) => t.type === "Default") || titles[0] || { title: "Studio" }).title;
  const japanese = (titles.find((t) => t.type === "Japanese") || {}).title;
  const links = studio.external || [];
  const website = links.find((link) => !/twitter|x\.com|facebook|instagram|youtube|wikipedia/i.test(link.url));
  const popularItems = withoutNsfw(popular.data, "anime", allowNSFW);

  return (
    <article className="entity-page">
      <EntityHeader
        image={studio.images && studio.images.jpg && studio.images.jpg.image_url}
        imageKind="logo"
        title={name}
        subtitle={japanese && japanese !== name ? japanese : null}
        actions={
          <>
            {website ? (
              <a className="details-action" href={website.url} target="_blank" rel="noreferrer">
                <Favicon url={website.url} />
                Official site
                <span className="visually-hidden"> (opens in a new tab)</span>
              </a>
            ) : null}
            <a className="details-action" href={studio.url} target="_blank" rel="noreferrer">
              View on MAL
              <FontAwesomeIcon icon={faArrowUpRightFromSquare} aria-hidden="true" />
              <span className="visually-hidden"> (opens in a new tab)</span>
            </a>
          </>
        }
        facts={[
          { label: "Founded", value: studio.established ? formatDate(studio.established) : null },
          { label: "Titles", value: typeof studio.count === "number" ? fullNumber(studio.count) : null },
          { label: "Favorites", value: studio.favorites ? fullNumber(studio.favorites) : null },
        ]}
      />

      <AboutSection
        id="about-heading"
        text={studio.about}
        emptyText="No description available."
        aside={
          links.length ? (
            <div>
              <h3 className="details-subheading">Links</h3>
              <ul className="entity-links">
                {links.map((link) => (
                  <li key={link.url}>
                    <a href={link.url} target="_blank" rel="noreferrer">
                      <Favicon url={link.url} />
                      {link.name}
                      <span className="visually-hidden"> (opens in a new tab)</span>
                    </a>
                  </li>
                ))}
              </ul>
            </div>
          ) : null
        }
      />

      {popularItems.length >= 2 || popular.status !== "ready" ? (
        <Spotlight
          id="known-heading"
          type="anime"
          title="Known for"
          subtitle={`The most-watched anime ${name} worked on`}
          kicker={`#1 most watched`}
          items={popularItems}
          status={popular.status === "idle" ? "loading" : popular.status}
          onRetry={popular.retry}
        />
      ) : null}

      <StudioWorks studioId={studioId} allowNSFW={allowNSFW} isDarkMode={isDarkMode} />
    </article>
  );
}

export default StudioDetails;
