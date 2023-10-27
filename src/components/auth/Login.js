import React from "react";
import { signInWithEmailAndPassword } from "firebase/auth";
import { auth } from "../../firebase";
import { useNavigate } from "react-router-dom";
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

          toast.success(`Welcome, ${auth.currentUser.displayName}!`, {
            style: {
              borderRadius: "10px",
              background: `${isDarkMode ? "#0dcaf0" : "#333"}`,
              color: `${isDarkMode ? "#333" : "#fff"}`,
            },
          });
          navigate("/");
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
            errorMessage === "Firebase: Error (auth/wrong-password)."
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
        background: `${isDarkMode ? "#0dcaf0" : "#333"}`,
        color: `${isDarkMode ? "#333" : "#fff"}`,
      },
    });

  const registerRoute = () => {
    navigate("/register");
  };

  const resetRoute = () => {
    navigate("/reset");
  };

  const inputError = {
    border: `2px solid ${isDarkMode ? "#ffc107" : "red"}`,
  };

  React.useEffect(() => {
    setEmailEmpty(false);
    setEmailInvalid(false);
  }, [email]);

  React.useEffect(() => {
    setPasswordEmpty(false);
  }, [password]);

  if (user) {
    notifyLoggedIn();
    navigate("/");
    return;
  } else {
    return (
      <div
        className="container"
        style={{
          position: "relative",
          top: "50%",
          left: "50%",
          transform: "translate(-50%, -50%)",
          maxWidth: "900px",
        }}
      >
        <div
          className={`card text-bg-${isDarkMode ? "secondary" : "light"}`}
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
                      style={{ color: `${isDarkMode ? "#ffc107" : "red"}` }}
                    >
                      A user with that email address does not exist!
                    </small>
                  </div>
                ) : emailEmpty ? (
                  <div className="error-message">
                    <small
                      style={{ color: `${isDarkMode ? "#ffc107" : "red"}` }}
                    >
                      Email cannot be empty!
                    </small>
                  </div>
                ) : emailInvalid ? (
                  <div className="error-message">
                    <small
                      style={{ color: `${isDarkMode ? "#ffc107" : "red"}` }}
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
                      style={{ color: `${isDarkMode ? "#ffc107" : "red"}` }}
                    >
                      Password cannot be empty!
                    </small>
                  </div>
                ) : passwordIncorrect ? (
                  <div className="error-message">
                    <small
                      style={{ color: `${isDarkMode ? "#ffc107" : "red"}` }}
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
              <a
                href="#/"
                onClick={() => {
                  registerRoute();
                }}
              >
                Register!
              </a>
            </p>
            <p className="text-sm text-center" style={{ marginBottom: "0" }}>
              <a
                href="/reset"
                onClick={() => {
                  resetRoute();
                }}
              >
                Forgot Password?
              </a>
            </p>
          </div>
        </div>
      </div>
    );
  }
};

export default Login;
