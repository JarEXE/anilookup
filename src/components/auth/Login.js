import React from "react";
import { signInWithEmailAndPassword } from "firebase/auth";
import { auth } from "../../firebase";
import { Link, useNavigate } from "react-router-dom";
import toast from "react-hot-toast";

const Login = ({ isDarkMode, user }) => {
  const navigate = useNavigate();
  const [email, setEmail] = React.useState("");
  const [emailError, setEmailError] = React.useState(false);
  const [emailInvalid, setEmailInvalid] = React.useState(false);
  const [emailEmpty, setEmailEmpty] = React.useState(false);
  const [password, setPassword] = React.useState("");
  const [passwordEmpty, setPasswordEmpty] = React.useState(false);
  const [passwordIncorrect, setPasswordIncorrect] = React.useState(false);
  // set when this page performs the login, so the "Already logged in!" toast
  // isn't shown right after the "Welcome" one
  const justLoggedIn = React.useRef(false);

  const onLogin = async (event) => {
    event.preventDefault();

    if (email.length === 0) {
      setEmailEmpty(true);
      return;
    } else if (password.length === 0) {
      setPasswordEmpty(true);
      return;
    } else {
      await signInWithEmailAndPassword(auth, email, password)
        .then(async () => {
          // Signed in
          justLoggedIn.current = true;

          toast.success(`Welcome, ${auth.currentUser.displayName}!`, {
            style: {
              borderRadius: "10px",
              background: `${isDarkMode ? "var(--d-surface-2)" : "#333"}`,
              color: `${isDarkMode ? "var(--d-ink)" : "#fff"}`,
            },
          });
        })
        .catch((error) => {
          const errorMessage = error.message;
          console.log(errorMessage);
          if (errorMessage === "Firebase: Error (auth/user-not-found).") {
            setEmailError(true);
            return;
          } else if (errorMessage === "Firebase: Error (auth/invalid-email).") {
            setEmailInvalid(true);
            return;
          } else if (
            errorMessage === "Firebase: Error (auth/wrong-password)." ||
            // newer Firebase projects (email enumeration protection) report
            // a wrong password / unknown email as this single code instead
            errorMessage === "Firebase: Error (auth/invalid-credential)."
          ) {
            setPasswordIncorrect(true);
            return;
          }
        });
    }
  };

  const notifyLoggedIn = () =>
    toast("Already logged in!", {
      icon: "⚠️",
      style: {
        borderRadius: "10px",
        background: `${isDarkMode ? "var(--d-surface-2)" : "#333"}`,
        color: `${isDarkMode ? "var(--d-ink)" : "#fff"}`,
      },
    });

  const inputError = {
    border: `2px solid ${isDarkMode ? "var(--d-warning)" : "red"}`,
  };

  // clear the error messages as soon as the user edits the field again
  React.useEffect(() => {
    setEmailEmpty(false);
    setEmailInvalid(false);
    setEmailError(false);
  }, [email]);

  React.useEffect(() => {
    setPasswordEmpty(false);
    setPasswordIncorrect(false);
  }, [password]);

  // Redirect away once logged in. This used to run during render, which is a
  // React anti-pattern (side effects on every re-render).
  React.useEffect(() => {
    if (user) {
      if (!justLoggedIn.current) {
        notifyLoggedIn();
      }
      // replace so Back doesn't land on /login and bounce straight back here
      navigate("/", { replace: true });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user]);

  if (user) {
    return null;
  } else {
    return (
      <div
        className="container"
        style={{
          marginTop: "10%",
          maxWidth: "900px",
        }}
      >
        <div
          className={`card ${isDarkMode ? "card--dark" : "text-bg-light"}`}
          style={{ boxShadow: "0px 0px 10px 5px rgba(0, 0, 0, 0.5)" }}
        >
          <div className="card-header">Login Details</div>
          <div className="card-body">
            <form>
              <div className="mb-3">
                <label htmlFor="email-address" className="form-label">
                  Email address
                </label>
                <input
                  className="form-control"
                  id="email-address"
                  name="email"
                  type="email"
                  required
                  placeholder="Email address"
                  onChange={(event) => setEmail(event.target.value)}
                  style={
                    emailError || emailEmpty || emailInvalid ? inputError : null
                  }
                />
                {emailError ? (
                  <div className="error-message">
                    <small
                      style={{ color: `${isDarkMode ? "var(--d-warning)" : "red"}` }}
                    >
                      A user with that email address does not exist!
                    </small>
                  </div>
                ) : emailEmpty ? (
                  <div className="error-message">
                    <small
                      style={{ color: `${isDarkMode ? "var(--d-warning)" : "red"}` }}
                    >
                      Email cannot be empty!
                    </small>
                  </div>
                ) : emailInvalid ? (
                  <div className="error-message">
                    <small
                      style={{ color: `${isDarkMode ? "var(--d-warning)" : "red"}` }}
                    >
                      Invalid email address!
                    </small>
                  </div>
                ) : null}
              </div>

              <div className="mb-3">
                <label htmlFor="password" className="form-label">
                  Password
                </label>
                <input
                  className="form-control"
                  id="password"
                  name="password"
                  type="password"
                  required
                  placeholder="Password"
                  onChange={(event) => setPassword(event.target.value)}
                  style={passwordEmpty || passwordIncorrect ? inputError : null}
                />
                {passwordEmpty ? (
                  <div className="error-message">
                    <small
                      style={{ color: `${isDarkMode ? "var(--d-warning)" : "red"}` }}
                    >
                      Password cannot be empty!
                    </small>
                  </div>
                ) : passwordIncorrect ? (
                  <div className="error-message">
                    <small
                      style={{ color: `${isDarkMode ? "var(--d-warning)" : "red"}` }}
                    >
                      Password incorrect!
                    </small>
                  </div>
                ) : null}
              </div>

              <div>
                <button className="btn btn-success" onClick={onLogin}>
                  Login
                </button>
              </div>
            </form>
          </div>
          <div className="card-footer text-body-secondary">
            <p className="text-sm text-center" style={{ marginBottom: "0" }}>
              No account yet?{" "}
              <Link to="/register">Register!</Link>
            </p>
            <p className="text-sm text-center" style={{ marginBottom: "0" }}>
              <Link to="/reset">Forgot Password?</Link>
            </p>
          </div>
        </div>
      </div>
    );
  }
};

export default Login;
