import React from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { returnAfterLogin } from "../../utils/authRedirect";
import { createUserWithEmailAndPassword, updateProfile } from "firebase/auth";
import { collection, query, where, doc, setDoc, getDocs } from "firebase/firestore";
import { auth, db } from "../../firebase";
import toast from "react-hot-toast";
import { AuthAlert, AuthField, AuthLayout, AuthLoading, AuthSubmit } from "./AuthLayout";

const USERNAME_HINT = "3 to 15 characters. Shown on your profile.";
const PASSWORD_HINT = "At least 6 characters.";

const Register = ({ isDarkMode, user }) => {
  const navigate = useNavigate();
  // the page to return to, passed along from the login page
  const location = useLocation();

  const [email, setEmail] = React.useState("");
  const [username, setUsername] = React.useState("");
  const [password, setPassword] = React.useState("");
  const [passwordConfirm, setPasswordConfirm] = React.useState("");
  // { email?, username?, password?, passwordConfirm?, form? } messages
  const [errors, setErrors] = React.useState({});
  const [pending, setPending] = React.useState(false);

  // clear a field's error as soon as it's edited
  const clear = (field) => setErrors((prev) => ({ ...prev, [field]: undefined, form: undefined }));

  // first problem only, in the order the fields appear
  const validate = () => {
    if (!email.trim()) return { email: "Enter your email address." };
    if (!username) return { username: "Choose a username." };
    if (username.length < 3 || username.length > 15)
      return { username: "Usernames are 3 to 15 characters long." };
    if (!password) return { password: "Choose a password." };
    if (password.length < 6) return { password: "Passwords need at least 6 characters." };
    if (password !== passwordConfirm) return { passwordConfirm: "The passwords don't match." };
    return null;
  };

  const onSubmit = async (event) => {
    event.preventDefault();
    const problem = validate();
    if (problem) {
      setErrors(problem);
      return;
    }

    setPending(true);
    try {
      // username availability (checked after the form is valid, so no lookup
      // is made for an empty or malformed name)
      const taken = await getDocs(query(collection(db, "users"), where("username", "==", username)));
      if (!taken.empty) {
        setErrors({ username: "That username is already taken." });
        return;
      }

      const { user: created } = await createUserWithEmailAndPassword(auth, email.trim(), password);
      await updateProfile(auth.currentUser, { displayName: username });
      await setDoc(doc(db, "users", created.uid), { photoUrl: "", username });

      toast.success("Account created. Welcome!", {
        style: {
          borderRadius: "10px",
          background: `${isDarkMode ? "var(--d-surface-2)" : "#333"}`,
          color: `${isDarkMode ? "var(--d-ink)" : "#fff"}`,
        },
      });
      returnAfterLogin(navigate, location);
    } catch (error) {
      console.log(error);
      switch (error.code) {
        case "auth/invalid-email":
          setErrors({ email: "That isn't a valid email address." });
          break;
        case "auth/email-already-in-use":
          setErrors({ email: "An account already uses that email address." });
          break;
        case "auth/weak-password":
          setErrors({ password: "Choose a stronger password." });
          break;
        case "auth/network-request-failed":
          setErrors({ form: "Couldn't reach the server. Check your connection and try again." });
          break;
        default:
          setErrors({ form: "Couldn't create your account. Please try again." });
      }
    } finally {
      setPending(false);
    }
  };

  // Already logged in: show the spinner briefly, then go back. This used to be
  // started from inside render, which queued a new timer on every re-render.
  React.useEffect(() => {
    if (!user) {
      return;
    }
    const timer = setTimeout(() => {
      returnAfterLogin(navigate, location);
    }, 2000);
    return () => clearTimeout(timer);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user, navigate]);

  if (user) return <AuthLoading />;

  return (
    <AuthLayout
      title="Create an account"
      intro="Keep lists of what you watch and read, and see your stats."
      footer={
        <p>
          Already have an account?{" "}
          <Link to="/login" state={location.state}>
            Sign in
          </Link>
        </p>
      }
    >
      <form className="auth-form" onSubmit={onSubmit} noValidate>
        {errors.form ? <AuthAlert>{errors.form}</AuthAlert> : null}
        <AuthField
          id="email-address"
          label="Email address"
          type="email"
          autoComplete="email"
          required
          value={email}
          onChange={(event) => {
            setEmail(event.target.value);
            clear("email");
          }}
          error={errors.email}
        />
        <AuthField
          id="username"
          label="Username"
          type="text"
          autoComplete="username"
          required
          maxLength={15}
          value={username}
          onChange={(event) => {
            setUsername(event.target.value);
            clear("username");
          }}
          error={errors.username}
          hint={USERNAME_HINT}
        />
        <AuthField
          id="password"
          label="Password"
          type="password"
          autoComplete="new-password"
          required
          value={password}
          onChange={(event) => {
            setPassword(event.target.value);
            clear("password");
            clear("passwordConfirm");
          }}
          error={errors.password}
          hint={PASSWORD_HINT}
        />
        <AuthField
          id="password-confirm"
          label="Confirm password"
          type="password"
          autoComplete="new-password"
          required
          value={passwordConfirm}
          onChange={(event) => {
            setPasswordConfirm(event.target.value);
            clear("passwordConfirm");
          }}
          error={errors.passwordConfirm}
        />
        <AuthSubmit pending={pending} pendingLabel="Creating account…">
          Create account
        </AuthSubmit>
      </form>
    </AuthLayout>
  );
};

export default Register;
