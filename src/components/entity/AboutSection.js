import React from "react";

const CLAMP_CHARS = 600;

// MAL marks spoilers as [Spoiler]...[/Spoiler] (any case, possibly across
// several lines). Each one is swapped for a placeholder token before the text
// is split into facts and paragraphs, so a spoiler never breaks a line apart,
// and is turned back into a <Spoiler> when rendered.
const SPOILER = /\[spoiler\]([\s\S]*?)\[\/spoiler\]/gi;
const TOKEN = /\uE000(\d+)\uE000/g;
const tokenFor = (index) => `\uE000${index}\uE000`;
const isOnlyTokens = (line) => line.replace(TOKEN, "").trim() === "";

// MAL bios usually open with "Key: value" lines ("Blood type: A",
// "Hometown: Tokachi, Hokkaido, Japan"). Those become a facts list; the rest
// stays prose. Returns { facts, paragraphs, spoilers }.
export function splitAbout(text) {
  const spoilers = [];
  const withTokens = (text || "").replace(/\r/g, "").replace(SPOILER, (_, inner) => {
    spoilers.push(inner.trim());
    return tokenFor(spoilers.length - 1);
  });

  const facts = [];
  const prose = [];
  withTokens
    .split("\n")
    .map((line) => line.trim())
    .forEach((line) => {
      if (!line) return;
      if (prose.length === 0) {
        const match = /^([A-Z][A-Za-z ./'()-]{1,28}):\s*(.{0,120})$/.exec(line);
        // "Label: value" (values may contain full stops, e.g. "December 5,
        // 1999 a.t.b. (Sagittarius)"; an empty value is filled by a spoiler
        // on the next line, e.g. "Bounty:")
        if (match) {
          facts.push({ label: match[1], value: match[2] });
          return;
        }
        // a spoiler on its own line inside the facts belongs to the fact
        // above it ("Devil fruit: Gomu Gomu no Mi" + "[Spoiler] / ...")
        if (facts.length && isOnlyTokens(line)) {
          const last = facts[facts.length - 1];
          last.value = last.value ? `${last.value} ${line}` : line;
          return;
        }
        // an empty "Label:" not followed by a spoiler is a heading for the
        // text that follows, not a fact: keep it with the text
        if (facts.length && !facts[facts.length - 1].value) {
          prose.push(`${facts.pop().label}:`);
        }
      }
      prose.push(line);
    });

  // same for an empty label left at the very end
  if (facts.length && !facts[facts.length - 1].value) {
    prose.push(`${facts.pop().label}:`);
  }
  return { facts, paragraphs: prose, spoilers };
}

// A hidden spoiler: a button until revealed, then the text with a way to
// hide it again.
function Spoiler({ children }) {
  const [open, setOpen] = React.useState(false);
  return open ? (
    <span className="spoiler spoiler--open">
      <span className="spoiler__text">{children}</span>
      <button type="button" className="spoiler__toggle" aria-expanded="true" onClick={() => setOpen(false)}>
        Hide spoiler
      </button>
    </span>
  ) : (
    <button type="button" className="spoiler spoiler__toggle" aria-expanded="false" onClick={() => setOpen(true)}>
      Show spoiler
    </button>
  );
}

// text with placeholder tokens -> text and <Spoiler>s
function withSpoilers(text, spoilers) {
  const parts = [];
  let last = 0;
  text.replace(TOKEN, (token, index, offset) => {
    if (offset > last) parts.push(text.slice(last, offset));
    parts.push(<Spoiler key={`s${offset}`}>{spoilers[Number(index)]}</Spoiler>);
    last = offset + token.length;
    return token;
  });
  if (last < text.length) parts.push(text.slice(last));
  return parts;
}

// visible length, counting each spoiler as its button
const visibleLength = (text) => text.replace(TOKEN, "Show spoiler").length;

// Cut a paragraph to about `room` characters at a word break, never through a
// spoiler token.
function cutParagraph(paragraph, room) {
  let cut = paragraph.slice(0, room);
  const open = cut.lastIndexOf("\uE000");
  // an odd number of markers means the cut landed inside a token
  if ((cut.match(/\uE000/g) || []).length % 2 === 1) cut = cut.slice(0, open);
  else cut = cut.replace(/\s+\S*$/, "");
  return `${cut.trimEnd()}…`;
}

// "About" with the bio's facts beside it (or under it on phones). Long bios
// are clamped with "Read more". `aside` adds more side content (links...).
function AboutSection({ id, title = "About", text, emptyText, aside }) {
  const { facts, paragraphs, spoilers } = React.useMemo(() => splitAbout(text), [text]);
  const [expanded, setExpanded] = React.useState(false);
  const fullLength = paragraphs.reduce((sum, p) => sum + visibleLength(p) + 1, 0);
  const long = fullLength > CLAMP_CHARS;

  // clamp by whole paragraphs, cutting the last one at a word
  const shown = [];
  let used = 0;
  for (const paragraph of paragraphs) {
    const length = visibleLength(paragraph);
    if (!expanded && long && used + length > CLAMP_CHARS) {
      shown.push(cutParagraph(paragraph, Math.max(CLAMP_CHARS - used, 120)));
      break;
    }
    shown.push(paragraph);
    used += length;
  }

  return (
    <section className="entity-about" aria-labelledby={id}>
      <div className="entity-about__main">
        <h2 className="details-heading" id={id}>
          {title}
        </h2>
        {paragraphs.length ? (
          <>
            {shown.map((paragraph, index) => (
              <p key={index} className="entity-about__text">
                {withSpoilers(paragraph, spoilers)}
              </p>
            ))}
            {long ? (
              <button
                type="button"
                className="details-text-button"
                aria-expanded={expanded}
                onClick={() => setExpanded(!expanded)}
              >
                {expanded ? "Show less" : "Read more"}
              </button>
            ) : null}
          </>
        ) : (
          <p className="details-muted">{emptyText}</p>
        )}
      </div>
      {facts.length || aside ? (
        <aside className="entity-about__aside">
          {facts.length ? (
            <dl className="entity-info">
              {facts.map((fact, index) => (
                <div key={`${fact.label}-${index}`} className="entity-info__row">
                  <dt>{fact.label}</dt>
                  <dd>{withSpoilers(fact.value, spoilers)}</dd>
                </div>
              ))}
            </dl>
          ) : null}
          {aside}
        </aside>
      ) : null}
    </section>
  );
}

export default AboutSection;
