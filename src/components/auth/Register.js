import React from "react";
import { Link, useNavigate } from "react-router-dom";
import { createUserWithEmailAndPassword, updateProfile } from "firebase/auth";
import {
  collection,
  query,
  where,
  doc,
  setDoc,
  getDocs,
} from "firebase/firestore";
import { auth, db } from "../../firebase";
import toast from "react-hot-toast";

const Register = ({ isDarkMode, user }) => {
  const navigate = useNavigate();

  const [email, setEmail] = React.useState("");
  const [username, setUsername] = React.useState("");
  const [usernameLength, setusernameLength] = React.useState(false);
  const [usernameEmpty, setUsernameEmpty] = React.useState(false);
  const [usernameTaken, setUsernameTaken] = React.useState(false);
  const [password, setPassword] = React.useState("");
  const [passwordConfirm, setPasswordConfirm] = React.useState("");
  const [emailError, setEmailError] = React.useState(false);
  const [emailEmpty, setEmailEmpty] = React.useState(false);
  const [emailTaken, setEmailTaken] = React.useState(false);
  const [passwordMismatch, setPasswordMismatch] = React.useState(false);
  const [passwordEmpty, setPasswordEmpty] = React.useState(false);
  const [passwordTooShort, setPasswordTooShort] = React.useState(false);

  const onSubmit = async (event) => {
    event.preventDefault();

    // username availablity check
    try {
      // query database for any existing user that has desired username
      const takenName = query(
        collection(db, "users"),
        where("username", "==", username)
      );

      const takenNameQuery = await getDocs(takenName);

      // takennamequery.empty will return true if no results and false if username already exists
      if (takenNameQuery.empty === false) {
        setUsernameTaken(true);
        throw new Error("Username taken!");
      } else {
        setUsernameTaken(false);

        // validate rest of form if username is available
        await validationChecks();
      }
    } catch (error) {
      console.log(error);
      return;
    }
  };

  React.useEffect(() => {
    setEmailError(false);
    setEmailEmpty(false);
    setEmailTaken(false);
  }, [email]);

  React.useEffect(() => {
    setUsernameEmpty(false);
    setusernameLength(false);
    setUsernameTaken(false);
  }, [username]);

  React.useEffect(() => {
    setPasswordMismatch(false);
  }, [passwordConfirm, password]);

  React.useEffect(() => {
    setPasswordEmpty(false);
  }, [password]);

  React.useEffect(() => {
    setPasswordTooShort(false);
  }, [password]);

  const validationChecks = async () => {
    if (email.length === 0) {
      setEmailEmpty(true);
      return;
    } else if (username.length === 0) {
      setUsernameEmpty(true);
      return;
    } else if (username.length < 3 || username.length > 15) {
      setusernameLength(true);
      return;
    } else if (password.length === 0) {
      setPasswordEmpty(true);
      return;
    } else if (password !== passwordConfirm) {
      setPasswordMismatch(true);
      return;
    } else if (password.length < 6) {
      setPasswordTooShort(true);
      return;
    } else {
      await createUserWithEmailAndPassword(auth, email, password)
        .then(async (userCredential) => {
          // registered
          const user = userCredential.user;

          // set the username
          await updateProfile(auth.currentUser, {
            displayName: username,
          });

          // update database
          await setDoc(doc(db, "users", user.uid), {
            photoUrl: "",
            username: username,
          });

          toast.success("Successfully Registered!", {
            style: {
              borderRadius: "10px",
              background: `${isDarkMode ? "var(--d-surface-2)" : "#333"}`,
              color: `${isDarkMode ? "var(--d-ink)" : "#fff"}`,
            },
          });
          navigate("/", { replace: true });
        })
        .catch((error) => {
          console.log(error);
          const errorMessage = error.message;
          console.log(errorMessage);
          if (errorMessage === "Firebase: Error (auth/invalid-email).") {
            setEmailError(true);
            return;
          } else if (
            errorMessage === "Firebase: Error (auth/email-already-in-use)."
          ) {
            setEmailTaken(true);
            return;
          }
        });
    }
  };

  // Already logged in: show the spinner briefly, then go home. This used to be
  // started from inside render, which queued a new timer on every re-render.
  React.useEffect(() => {
    if (!user) {
      return;
    }
    const timer = setTimeout(() => {
      navigate("/", { replace: true });
    }, 2000);
    return () => clearTimeout(timer);
  }, [user, navigate]);

  const inputError = {
    border: `2px solid ${isDarkMode ? "var(--d-warning)" : "red"}`,
  };

  return (
    <>
      {!user ? (
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
            <div className="card-header">Registration Form</div>
            <div className="card-body">
              <form>
                <div className="mb-3">
                  <label htmlFor="email-address" className="form-label">
                    Email address
                  </label>
                  <input
                    className="form-control"
                    type="email"
                    label="Email address"
                    value={email}
                    placeholder="Email address"
                    onChange={(event) => setEmail(event.target.value)}
                    style={
                      emailError || emailEmpty || emailTaken ? inputError : null
                    }
                  />
                  {emailEmpty ? (
                    <div className="error-message">
                      <small
                        style={{ color: `${isDarkMode ? "var(--d-warning)" : "red"}` }}
                      >
                        Email cannot be empty!
                      </small>
                    </div>
                  ) : emailError ? (
                    <div className="error-message">
                      <small
                        style={{ color: `${isDarkMode ? "var(--d-warning)" : "red"}` }}
                      >
                        Email invalid!
                      </small>
                    </div>
                  ) : emailTaken ? (
                    <div className="error-message">
                      <small
                        style={{ color: `${isDarkMode ? "var(--d-warning)" : "red"}` }}
                      >
                        An account with that email address is already
                        registered!
                      </small>
                    </div>
                  ) : null}
                </div>

                <div className="mb-3">
                  <label htmlFor="username" className="form-label">
                    Username
                  </label>
                  <input
                    className="form-control"
                    type="text"
                    label="Username"
                    value={username}
                    onChange={(event) => setUsername(event.target.value)}
                    required={true}
                    placeholder="Username"
                    style={
                      usernameEmpty || usernameLength || usernameTaken
                        ? inputError
                        : null
                    }
                  />
                  {usernameEmpty ? (
                    <div className="error-message">
                      <small
                        style={{ color: `${isDarkMode ? "var(--d-warning)" : "red"}` }}
                      >
                        Username cannot be empty!
                      </small>
                    </div>
                  ) : usernameLength ? (
                    <div className="error-message">
                      <small
                        style={{ color: `${isDarkMode ? "var(--d-warning)" : "red"}` }}
                      >
                        Username must be between 3 and 15 characters!
                      </small>
                    </div>
                  ) : usernameTaken ? (
                    <div className="error-message">
                      <small
                        style={{ color: `${isDarkMode ? "var(--d-warning)" : "red"}` }}
                      >
                        Username is Already taken!
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
                    type="password"
                    label="Create password"
                    value={password}
                    onChange={(event) => setPassword(event.target.value)}
                    required={true}
                    placeholder="Password"
                    style={
                      passwordEmpty || passwordTooShort ? inputError : null
                    }
                  />
                  {passwordEmpty ? (
                    <div className="error-message">
                      <small
                        style={{ color: `${isDarkMode ? "var(--d-warning)" : "red"}` }}
                      >
                        Password Cannot be empty!
                      </small>
                    </div>
                  ) : passwordTooShort ? (
                    <div className="error-message">
                      <small
                        style={{ color: `${isDarkMode ? "var(--d-warning)" : "red"}` }}
                      >
                        Password cannot be less than 6 characters!
                      </small>
                    </div>
                  ) : null}
                </div>

                <div className="mb-3">
                  <label htmlFor="passwordconfirm" className="form-label">
                    Confirm Password
                  </label>
                  <input
                    className="form-control"
                    type="password"
                    label="Confirm password"
                    value={passwordConfirm}
                    onChange={(event) => setPasswordConfirm(event.target.value)}
                    required={true}
                    placeholder="Confirm Password"
                    style={passwordMismatch ? inputError : null}
                  />
                  {passwordMismatch && (
                    <div className="error-message">
                      <small
                        style={{ color: `${isDarkMode ? "var(--d-warning)" : "red"}` }}
                      >
                        Passwords do not match!
                      </small>
                    </div>
                  )}
                </div>

                <button
                  className="btn btn-success"
                  type="submit"
                  onClick={onSubmit}
                >
                  Register
                </button>
              </form>
            </div>
            <div className="card-footer text-body-secondary">
              <p className="text-sm text-center" style={{ marginBottom: "0" }}>
                Already have an account?{" "}
                <Link
                  to="/login"
                  style={{ color: `${isDarkMode ? "var(--d-accent)" : null}` }}
                >
                  Sign in
                </Link>
              </p>
            </div>
          </div>
        </div>
      ) : (
        <>
          <div
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              minHeight: "80vh",
            }}
          >
            <span className="loader"></span>
          </div>
        </>
      )}
    </>
  );
};

export default Register;
