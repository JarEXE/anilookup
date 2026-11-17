import React from "react";
import {
  updateProfile,
  updatePassword,
  EmailAuthProvider,
  reauthenticateWithCredential,
} from "firebase/auth";
import { collection, doc, getDocs, query, setDoc, where } from "firebase/firestore";
import { auth, db } from "../../firebase";
import toast from "react-hot-toast";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faChevronDown, faEye, faBookOpen } from "@fortawesome/free-solid-svg-icons";
import { goToLogin } from "../../utils/authRedirect";
import { listUrl } from "../stats/listStatuses";
import { AuthAlert, AuthField, AuthLayout, AuthLoading, AuthSubmit } from "./AuthLayout";

const memberSince = (account) => {
  const created = account && account.metadata && account.metadata.creationTime;
  if (!created) return null;
  return new Date(created).toLocaleDateString("en", { month: "long", year: "numeric" });
};

const Profile = ({ isDarkMode }) => {
  const navigate = useNavigate();
  const location = useLocation();
  const [loading, setLoading] = React.useState(true);
  const [savedName, setSavedName] = React.useState("");
  const [username, setUsername] = React.useState("");
  const [changingPassword, setChangingPassword] = React.useState(false);
  const [currentPassword, setCurrentPassword] = React.useState("");
  const [password, setPassword] = React.useState("");
  const [passwordConfirm, setPasswordConfirm] = React.useState("");
  // { username?, currentPassword?, password?, passwordConfirm?, form? }
  const [errors, setErrors] = React.useState({});
  const [pending, setPending] = React.useState(false);

  const clear = (field) => setErrors((prev) => ({ ...prev, [field]: undefined, form: undefined }));

  React.useEffect(() => {
    const unsubscribe = auth.onAuthStateChanged((user) => {
      if (user) {
        setUsername(user.displayName || "");
        setSavedName(user.displayName || "");
        setLoading(false);
      } else {
        // replace so Back doesn't return to /profile and bounce to login again
        goToLogin(navigate, location, { replace: true });
      }
    });

    // Clean up the subscription when the component unmounts
    return () => unsubscribe();
    // `location` is only read at the moment of redirecting to sign in; no need
    // to re-subscribe to auth changes whenever the URL changes
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [navigate]);

  const validate = () => {
    if (!username) return { username: "Enter a username." };
    if (username.length < 3 || username.length > 15)
      return { username: "Usernames are 3 to 15 characters long." };
    if (changingPassword) {
      if (!currentPassword) return { currentPassword: "Enter your current password." };
      if (!password) return { password: "Choose a new password." };
      if (password.length < 6) return { password: "Passwords need at least 6 characters." };
      if (password !== passwordConfirm) return { passwordConfirm: "The passwords don't match." };
    }
    return null;
  };

  const onSubmit = async (event) => {
    event.preventDefault();
    const problem = validate();
    if (problem) {
      setErrors(problem);
      return;
    }
    const nameChanged = username !== savedName;
    if (!nameChanged && !changingPassword) {
      setErrors({ form: "Nothing to save yet. Change your username or password first." });
      return;
    }

    setPending(true);
    const account = auth.currentUser;
    try {
      if (nameChanged) {
        // usernames are unique (the same check as registering)
        const taken = await getDocs(query(collection(db, "users"), where("username", "==", username)));
        if (taken.docs.some((d) => d.id !== account.uid)) {
          setErrors({ username: "That username is already taken." });
          return;
        }
      }

      if (changingPassword) {
        const credential = EmailAuthProvider.credential(account.email, currentPassword);
        try {
          await reauthenticateWithCredential(account, credential);
        } catch (error) {
          // a wrong current password used to throw unhandled here
          if (["auth/wrong-password", "auth/invalid-credential"].includes(error.code)) {
            setErrors({ currentPassword: "That isn't your current password." });
            return;
          }
          throw error;
        }
        await updatePassword(account, password);
      }

      if (nameChanged) {
        await updateProfile(account, { displayName: username });
        // keep the uniqueness record in step (it wasn't updated before, so the
        // old name stayed "taken" and the new one wasn't reserved)
        await setDoc(doc(db, "users", account.uid), { username }, { merge: true });
        setSavedName(username);
      }

      setChangingPassword(false);
      setCurrentPassword("");
      setPassword("");
      setPasswordConfirm("");
      toast.success(
        nameChanged && changingPassword
          ? "Username and password updated."
          : nameChanged
            ? "Username updated."
            : "Password updated.",
        {
          style: {
            borderRadius: "10px",
            background: `${isDarkMode ? "var(--d-surface-2)" : "#333"}`,
            color: `${isDarkMode ? "var(--d-ink)" : "#fff"}`,
          },
        },
      );
    } catch (error) {
      console.log(error);
      if (error.code === "auth/too-many-requests") {
        setErrors({ form: "Too many attempts. Wait a few minutes and try again." });
      } else if (error.code === "auth/network-request-failed") {
        setErrors({ form: "Couldn't reach the server. Check your connection and try again." });
      } else {
        setErrors({ form: "Couldn't save your changes. Please try again." });
      }
    } finally {
      setPending(false);
    }
  };

  if (loading) return <AuthLoading />;

  const account = auth.currentUser;
  const since = memberSince(account);

  return (
    <AuthLayout title="Your profile" wide>
      <div className="profile-summary">
        <span className="profile-summary__avatar" aria-hidden="true">
          {(savedName || "?").charAt(0).toUpperCase()}
        </span>
        <div className="profile-summary__text">
          <p className="profile-summary__name">{savedName}</p>
          <p className="profile-summary__meta">
            {account.email}
            {since ? <span>Member since {since}</span> : null}
          </p>
        </div>
      </div>
      <ul className="profile-links" aria-label="Your lists">
        <li>
          <Link to={listUrl("anime")}>
            <FontAwesomeIcon icon={faEye} aria-hidden="true" />
            Anime list
          </Link>
        </li>
        <li>
          <Link to={listUrl("manga")}>
            <FontAwesomeIcon icon={faBookOpen} aria-hidden="true" />
            Manga list
          </Link>
        </li>
      </ul>

      <form className="auth-form" onSubmit={onSubmit} noValidate>
        {errors.form ? <AuthAlert>{errors.form}</AuthAlert> : null}
        <h2 className="auth-section-title">Account</h2>
        <AuthField
          id="email-address"
          label="Email address"
          type="email"
          value={account.email}
          readOnly
          hint="Your email address can't be changed here."
        />
        <AuthField
          id="username"
          label="Username"
          type="text"
          autoComplete="username"
          maxLength={15}
          required
          value={username}
          onChange={(event) => {
            setUsername(event.target.value);
            clear("username");
          }}
          error={errors.username}
          hint="3 to 15 characters."
        />

        <h2 className="auth-section-title">Password</h2>
        <button
          type="button"
          className="auth-toggle"
          aria-expanded={changingPassword}
          aria-controls="password-fields"
          onClick={() => {
            setChangingPassword(!changingPassword);
            setErrors({});
          }}
        >
          {changingPassword ? "Keep my current password" : "Change password"}
          <FontAwesomeIcon icon={faChevronDown} aria-hidden="true" />
        </button>
        {changingPassword ? (
          <div id="password-fields" className="auth-form__group">
            <AuthField
              id="current-password"
              label="Current password"
              type="password"
              autoComplete="current-password"
              required
              value={currentPassword}
              onChange={(event) => {
                setCurrentPassword(event.target.value);
                clear("currentPassword");
              }}
              error={errors.currentPassword}
            />
            <AuthField
              id="new-password"
              label="New password"
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
              hint="At least 6 characters."
            />
            <AuthField
              id="new-password-confirm"
              label="Confirm new password"
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
          </div>
        ) : null}

        <AuthSubmit pending={pending} pendingLabel="Saving…">
          Save changes
        </AuthSubmit>
      </form>
    </AuthLayout>
  );
};

export default Profile;
