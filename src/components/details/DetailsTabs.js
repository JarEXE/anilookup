import React from "react";

// Accessible tabs (WAI-ARIA tabs pattern): arrow keys / Home / End move
// between tabs, only the active panel is rendered. The selected tab is owned
// by the caller (kept in the URL), so back/forward works.
function DetailsTabs({ tabs, activeTab, onChange, children }) {
  const idFor = (key) => `details-tab-${key}`;
  const panelIdFor = (key) => `details-panel-${key}`;
  const tabRefs = React.useRef({});

  const focusTab = (index) => {
    const tab = tabs[(index + tabs.length) % tabs.length];
    onChange(tab.key);
    const element = tabRefs.current[tab.key];
    if (element) element.focus();
  };

  const handleKeyDown = (event, index) => {
    if (event.key === "ArrowRight") focusTab(index + 1);
    else if (event.key === "ArrowLeft") focusTab(index - 1);
    else if (event.key === "Home") focusTab(0);
    else if (event.key === "End") focusTab(tabs.length - 1);
    else return;
    event.preventDefault();
  };

  return (
    <div className="details-tabs">
      <div className="details-tabs__bar">
        <div className="details-tabs__list" role="tablist" aria-label="Sections">
          {tabs.map((tab, index) => {
            const selected = tab.key === activeTab;
            return (
              <button
                key={tab.key}
                ref={(element) => {
                  tabRefs.current[tab.key] = element;
                }}
                type="button"
                role="tab"
                id={idFor(tab.key)}
                aria-selected={selected}
                aria-controls={panelIdFor(tab.key)}
                tabIndex={selected ? 0 : -1}
                className="details-tabs__tab"
                onClick={() => onChange(tab.key)}
                onKeyDown={(event) => handleKeyDown(event, index)}
              >
                {tab.label}
              </button>
            );
          })}
        </div>
      </div>
      <div
        className="details-tabs__panel"
        role="tabpanel"
        id={panelIdFor(activeTab)}
        aria-labelledby={idFor(activeTab)}
        tabIndex={0}
      >
        {children}
      </div>
    </div>
  );
}

export default DetailsTabs;
