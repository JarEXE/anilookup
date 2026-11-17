// Sending someone to sign in, then back to where they were.
//
// Every route to /login carries `state.from` (the page they were on) and,
// optionally, `state.intent` (what they were trying to do there, e.g. add a
// title to a list). After signing in (or registering), they are returned to
// `from` with the intent, and the page finishes the action.

const AUTH_PAGES = /^\/(login|register|reset)(\/|\?|#|$)/;

// the state to put on a link or navigation to /login
export function loginState(location, intent) {
  const from = `${location.pathname}${location.search}${location.hash}`;
  // already on an auth page: keep whatever it was carrying
  if (AUTH_PAGES.test(location.pathname)) return location.state || null;
  return intent ? { from, intent } : { from };
}

export function goToLogin(navigate, location, { intent, replace = false } = {}) {
  navigate("/login", { replace, state: loginState(location, intent) });
}

// Where to go after signing in: the remembered page if it's a page inside
// this app, otherwise home.
export function returnPath(location) {
  const from = location.state && location.state.from;
  if (
    typeof from === "string" &&
    from.startsWith("/") &&
    !from.startsWith("//") &&
    !AUTH_PAGES.test(from)
  ) {
    return from;
  }
  return "/";
}

// Navigates back after signing in, handing over the pending action (if any).
export function returnAfterLogin(navigate, location) {
  const intent = location.state && location.state.intent;
  navigate(returnPath(location), {
    replace: true,
    state: intent ? { intent } : null,
  });
}
