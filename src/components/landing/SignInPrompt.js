import React from "react";
import { Link, useLocation } from "react-router-dom";
import { loginState } from "../../utils/authRedirect";

// Shown in the stats spot to signed-out visitors.
function SignInPrompt({ type }) {
  const location = useLocation();
  const verb = type === "anime" ? "watch" : "read";
  return (
    <section className="landing-signin" aria-labelledby={`signin-${type}`}>
      <h2 className="landing-side__title" id={`signin-${type}`}>
        Keep track of what you {verb}
      </h2>
      <p>Sign in to save {type} to your lists and see your stats here.</p>
      <div className="landing-signin__actions">
        <Link to="/login" state={loginState(location)} className="landing-button">
          Sign in
        </Link>
        <Link to="/register" state={loginState(location)}>Create an account</Link>
      </div>
    </section>
  );
}

export default SignInPrompt;
