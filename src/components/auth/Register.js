import React from "react";
import { useNavigate } from "react-router-dom";
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
              background: `${isDarkMode ? "#0dcaf0" : "#333"}`,
              color: `${isDarkMode ? "#333" : "#fff"}`,
            },
          });
          navigate("/");
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

  const loginRoute = () => {
    navigate("/login");
  };

  const homeRoute = () => {
    setTimeout(() => {
      navigate("/");
    }, 2000);
  };

  const inputError = {
    border: `2px solid ${isDarkMode ? "#ffc107" : "red"}`,
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
            className={`card text-bg-${isDarkMode ? "secondary" : "light"}`}
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
                        style={{ color: `${isDarkMode ? "#ffc107" : "red"}` }}
                      >
                        Email cannot be empty!
                      </small>
                    </div>
                  ) : emailError ? (
                    <div className="error-message">
                      <small
                        style={{ color: `${isDarkMode ? "#ffc107" : "red"}` }}
                      >
                        Email invalid!
                      </small>
                    </div>
                  ) : emailTaken ? (
                    <div className="error-message">
                      <small
                        style={{ color: `${isDarkMode ? "#ffc107" : "red"}` }}
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
                        style={{ color: `${isDarkMode ? "#ffc107" : "red"}` }}
                      >
                        Username cannot be empty!
                      </small>
                    </div>
                  ) : usernameLength ? (
                    <div className="error-message">
                      <small
                        style={{ color: `${isDarkMode ? "#ffc107" : "red"}` }}
                      >
                        Username must be between 3 and 15 characters!
                      </small>
                    </div>
                  ) : usernameTaken ? (
                    <div className="error-message">
                      <small
                        style={{ color: `${isDarkMode ? "#ffc107" : "red"}` }}
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
                        style={{ color: `${isDarkMode ? "#ffc107" : "red"}` }}
                      >
                        Password Cannot be empty!
                      </small>
                    </div>
                  ) : passwordTooShort ? (
                    <div className="error-message">
                      <small
                        style={{ color: `${isDarkMode ? "#ffc107" : "red"}` }}
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
                        style={{ color: `${isDarkMode ? "#ffc107" : "red"}` }}
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
                <a
                  href="#/"
                  style={{ color: `${isDarkMode ? "#17a2b8" : null}` }}
                  onClick={() => {
                    loginRoute();
                  }}
                >
                  Sign in
                </a>
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
          {homeRoute()}
        </>
      )}
    </>
  );
};

export default Register;
