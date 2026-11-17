import React from "react";
import { sendPasswordResetEmail } from "firebase/auth";
import { auth } from "../../firebase";
import { Link, useLocation, useNavigate } from "react-router-dom";
import toast from "react-hot-toast";
import { AuthAlert, AuthField, AuthLayout, AuthSubmit } from "./AuthLayout";

const Reset = ({ isDarkMode, user }) => {
  const navigate = useNavigate();
  // keeps the page to return to after the user signs in again
  const location = useLocation();
  const [email, setEmail] = React.useState("");
  const [errors, setErrors] = React.useState({});
  const [pending, setPending] = React.useState(false);

  const toastStyle = {
    borderRadius: "10px",
    background: `${isDarkMode ? "var(--d-surface-2)" : "#333"}`,
    color: `${isDarkMode ? "var(--d-ink)" : "#fff"}`,
  };

  const onSubmit = async (event) => {
    event.preventDefault();
    if (!email.trim()) {
      setErrors({ email: "Enter the email address you signed up with." });
      return;
    }
    setPending(true);
    try {
      await sendPasswordResetEmail(auth, email.trim());
      navigate("/login", { state: location.state });
      toast.success(`Reset link sent to ${email.trim()}`, { style: toastStyle });
    } catch (error) {
      console.log(`${error.code}: ${error.message}`);
      if (error.code === "auth/invalid-email") {
        setErrors({ email: "That isn't a valid email address." });
      } else if (error.code === "auth/user-not-found") {
        setErrors({ email: "No account uses that email address." });
      } else {
        setErrors({ form: "Couldn't send the reset email. Please try again." });
      }
    } finally {
      setPending(false);
    }
  };

  // Redirect away if already logged in. This used to run during render, which
  // is a React anti-pattern (side effects on every re-render).
  React.useEffect(() => {
    if (user) {
      toast("Already logged in!", { icon: "⚠️", style: toastStyle });
      // replace so Back doesn't land here and bounce straight back
      navigate("/", { replace: true });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user]);

  if (user) return null;

  return (
    <AuthLayout
      title="Reset your password"
      intro="Enter your email address and we'll send you a link to choose a new password."
      footer={
        <p>
          Remembered it?{" "}
          <Link to="/login" state={location.state}>
            Back to sign in
          </Link>
        </p>
      }
    >
      <form className="auth-form" onSubmit={onSubmit} noValidate>
        {errors.form ? <AuthAlert>{errors.form}</AuthAlert> : null}
        <AuthField
          id="email-address"
          label="Email address"
          name="email"
          type="email"
          autoComplete="email"
          required
          value={email}
          onChange={(event) => {
            setEmail(event.target.value);
            setErrors({});
          }}
          error={errors.email}
        />
        <AuthSubmit pending={pending} pendingLabel="Sending…">
          Send reset link
        </AuthSubmit>
      </form>
    </AuthLayout>
  );
};

export default Reset;
