import React from "react";

// Previous / Page [n] of N / Next. The number is editable so long lists
// (hundreds of pages) can still be jumped through.
function Pager({ id = "page-jump", label = "Pages", page, lastPage, hasNext, onPage }) {
  const [draft, setDraft] = React.useState(String(page));
  React.useEffect(() => setDraft(String(page)), [page]);

  const submit = (event) => {
    event.preventDefault();
    const value = parseInt(draft, 10);
    if (!Number.isInteger(value)) {
      setDraft(String(page));
      return;
    }
    const target = Math.min(Math.max(value, 1), lastPage);
    setDraft(String(target));
    if (target !== page) onPage(target);
  };

  return (
    <nav className="landing-pager" aria-label={label}>
      <button
        type="button"
        className="landing-pager__button"
        disabled={page <= 1}
        onClick={() => onPage(page - 1)}
      >
        Previous
      </button>
      <form className="landing-pager__jump" onSubmit={submit}>
        <label htmlFor={id}>Page</label>
        <input
          id={id}
          type="number"
          inputMode="numeric"
          min={1}
          max={lastPage}
          value={draft}
          onChange={(event) => setDraft(event.target.value)}
          onBlur={submit}
        />
        <span>of {lastPage}</span>
      </form>
      <button
        type="button"
        className="landing-pager__button"
        disabled={!hasNext}
        onClick={() => onPage(page + 1)}
      >
        Next
      </button>
    </nav>
  );
}

export default Pager;
