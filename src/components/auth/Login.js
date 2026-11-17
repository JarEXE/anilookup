import React from "react";
import { signInWithEmailAndPassword } from "firebase/auth";
import { auth } from "../../firebase";
import { Link, useLocation, useNavigate } from "react-router-dom";
import toast from "react-hot-toast";
import { returnAfterLogin } from "../../utils/authRedirect";
import { AuthAlert, AuthField, AuthLayout, AuthSubmit } from "./AuthLayout";

const Login = ({ isDarkMode, user }) => {
  const navigate = useNavigate();
  // carries the page to return to (and any pending action) from wherever
  // sent the user here
  const location = useLocation();
  const [email, setEmail] = React.useState("");
  const [password, setPassword] = React.useState("");
  // { email?, password?, form? } messages
  const [errors, setErrors] = React.useState({});
  const [pending, setPending] = React.useState(false);
  // set when this page performs the login, so the "Already logged in!" toast
  // isn't shown right after the "Welcome" one
  const justLoggedIn = React.useRef(false);

  const toastStyle = {
    borderRadius: "10px",
    background: `${isDarkMode ? "var(--d-surface-2)" : "#333"}`,
    color: `${isDarkMode ? "var(--d-ink)" : "#fff"}`,
  };

  const onLogin = async (event) => {
    event.preventDefault();
    if (!email.trim()) {
      setErrors({ email: "Enter your email address." });
      return;
    }
    if (!password) {
      setErrors({ password: "Enter your password." });
      return;
    }

    setPending(true);
    try {
      await signInWithEmailAndPassword(auth, email.trim(), password);
      justLoggedIn.current = true;
      toast.success(`Welcome, ${auth.currentUser.displayName}!`, { style: toastStyle });
    } catch (error) {
      console.log(error.message);
      switch (error.code) {
        case "auth/user-not-found":
          setErrors({ email: "No account uses that email address." });
          break;
        case "auth/invalid-email":
          setErrors({ email: "That isn't a valid email address." });
          break;
        // newer Firebase projects (email enumeration protection) report a
        // wrong password or unknown email as "invalid-credential" instead
        case "auth/wrong-password":
        case "auth/invalid-credential":
          setErrors({ password: "The email or password is incorrect." });
          break;
        case "auth/too-many-requests":
          setErrors({ form: "Too many attempts. Wait a few minutes, or reset your password." });
          break;
        case "auth/network-request-failed":
          setErrors({ form: "Couldn't reach the server. Check your connection and try again." });
          break;
        default:
          setErrors({ form: "Couldn't sign you in. Please try again." });
      }
    } finally {
      setPending(false);
    }
  };

  // clear the errors as soon as the user edits a field again
  React.useEffect(() => {
    setErrors({});
  }, [email, password]);

  // Redirect away once logged in. This used to run during render, which is a
  // React anti-pattern (side effects on every re-render).
  React.useEffect(() => {
    if (user) {
      if (!justLoggedIn.current) {
        toast("Already logged in!", { icon: "⚠️", style: toastStyle });
      }
      // back to the page they came from (or home), finishing any action they
      // started; replace so Back doesn't land on /login and bounce again
      returnAfterLogin(navigate, location);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user]);

  if (user) return null;

  const pendingAdd = location.state && location.state.intent;

  return (
    <AuthLayout
      title="Sign in"
      intro={
        pendingAdd
          ? "Sign in to finish adding this title to your list."
          : "Welcome back. Sign in to see your lists and stats."
      }
      footer={
        <>
          <p>
            New here?{" "}
            <Link to="/register" state={location.state}>
              Create an account
            </Link>
          </p>
          <p>
            <Link to="/reset" state={location.state}>
              Forgot your password?
            </Link>
          </p>
        </>
      }
    >
      <form className="auth-form" onSubmit={onLogin} noValidate>
        {errors.form ? <AuthAlert>{errors.form}</AuthAlert> : null}
        <AuthField
          id="email-address"
          label="Email address"
          name="email"
          type="email"
          autoComplete="email"
          required
          value={email}
          onChange={(event) => setEmail(event.target.value)}
          error={errors.email}
        />
        <AuthField
          id="password"
          label="Password"
          name="password"
          type="password"
          autoComplete="current-password"
          required
          value={password}
          onChange={(event) => setPassword(event.target.value)}
          error={errors.password}
        />
        <AuthSubmit pending={pending} pendingLabel="Signing in…">
          Sign in
        </AuthSubmit>
      </form>
    </AuthLayout>
  );
};

export default Login;
