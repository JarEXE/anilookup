import React from "react";
import { fullNumber } from "../details/format";

// A short line of live numbers under the search box. Each fact keeps its
// space while loading, so nothing jumps when the numbers arrive.
function HeroFacts({ facts }) {
  return (
    <ul className="landing-facts">
      {facts.map((fact) => (
        <li key={fact.label} className="landing-facts__item">
          <strong>
            {typeof fact.value === "number"
              ? `${fullNumber(fact.value)}${fact.plus ? "+" : ""}`
              : "–"}
          </strong>{" "}
          {fact.label}
        </li>
      ))}
    </ul>
  );
}

export default HeroFacts;
