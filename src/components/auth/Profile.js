import React from "react";
import {
  updateProfile,
  updatePassword,
  EmailAuthProvider,
  reauthenticateWithCredential,
} from "firebase/auth";
import { auth } from "../../firebase";
import toast from "react-hot-toast";
import Collapsible from "react-collapsible";
import { Alert } from "@mui/material";
import { useNavigate } from "react-router-dom";

const Profile = ({ isDarkMode, user }) => {
  const navigate = useNavigate();
  const [loading, setLoading] = React.useState(true);
  const [username, setUsername] = React.useState("");
  const [usernameLength, setusernameLength] = React.useState(false);
  const [usernameEmpty, setUsernameEmpty] = React.useState(false);
  const [currentPassword, setCurrentPassword] = React.useState("");
  const [password, setPassword] = React.useState("");
  const [passwordConfirm, setPasswordConfirm] = React.useState("");
  const [passwordMismatch, setPasswordMismatch] = React.useState(false);
  const [passwordEmpty, setPasswordEmpty] = React.useState(false);
  const [passwordTooShort, setPasswordTooShort] = React.useState(false);
  const [isRequired, setIsRequired] = React.useState(false);
  const [showFailedProfileUpdateWarning, setShowProfileUpdateWarning] =
    React.useState(false);

  const onSubmit = async (event) => {
    await user;
    event.preventDefault();

    if (username.length === 0) {
      setUsernameEmpty(true);
      return;
    } else if (username.length < 3 || username.length > 15) {
      setusernameLength(true);
      return;
    } else if (isRequired === true && password.length === 0) {
      setPasswordEmpty(true);
      return;
    } else if (isRequired === true && password !== passwordConfirm) {
      setPasswordMismatch(true);
      return;
    } else if (isRequired === true && password.length < 6) {
      setPasswordTooShort(true);
      return;
    } else {
      if (isRequired) {
        const email = auth.currentUser.email;

        const credential = EmailAuthProvider.credential(email, currentPassword);

        await reauthenticateWithCredential(auth.currentUser, credential);

        await updatePassword(auth.currentUser, password);

        await updateProfile(auth.currentUser, {
          displayName: username,
        })
          .then(() => {
            toast.success("Profile updated!", {
              style: {
                borderRadius: "10px",
                background: `${isDarkMode ? "var(--d-surface-2)" : "#333"}`,
                color: `${isDarkMode ? "var(--d-ink)" : "#fff"}`,
              },
            });
          })
          .catch((error) => {
            console.log(error);
            setShowProfileUpdateWarning(true);
          });
      } else {
        await updateProfile(auth.currentUser, {
          displayName: username,
        })
          .then(() => {
            toast.success("Profile updated!", {
              style: {
                borderRadius: "10px",
                background: `${isDarkMode ? "var(--d-surface-2)" : "#333"}`,
                color: `${isDarkMode ? "var(--d-ink)" : "#fff"}`,
              },
            });
          })
          .catch((error) => {
            console.log(error);
            setShowProfileUpdateWarning(true);
          });
      }
    }
  };

  const allowPasswordChange = () => {
    setIsRequired(true);
  };

  const disallowPasswordChange = () => {
    setIsRequired(false);
  };

  React.useEffect(() => {
    const unsubscribe = auth.onAuthStateChanged((user) => {
      if (user) {
        setUsername(user.displayName);
        setLoading(false);
      } else {
        // replace so Back doesn't return to /profile and bounce to login again
        navigate("/login", { replace: true });
      }
    });

    // Clean up the subscription when the component unmounts
    return () => unsubscribe();
  }, [navigate]);

  React.useEffect(() => {
    setUsernameEmpty(false);
    setusernameLength(false);
    setShowProfileUpdateWarning(false);
  }, [username]);

  React.useEffect(() => {
    setPasswordMismatch(false);
    setShowProfileUpdateWarning(false);
  }, [passwordConfirm, password]);

  React.useEffect(() => {
    setPasswordEmpty(false);
    setShowProfileUpdateWarning(false);
  }, [password]);

  React.useEffect(() => {
    setPasswordTooShort(false);
    setShowProfileUpdateWarning(false);
  }, [password]);

  const inputError = {
    border: `2px solid ${isDarkMode ? "var(--d-warning)" : "red"}`,
  };

  if (loading) {
    return (
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
    );
  } else {
    return (
      <div
        className="container"
        style={{
          marginTop: "10%",
          maxWidth: "900px",
        }}
      >
        {showFailedProfileUpdateWarning ? (
          <Alert className="mb-2" variant="filled" severity="error">
            Profile update failed! Please try again or submit an issue on github
            if this problem persists.
          </Alert>
        ) : null}
        <div
          className={`card ${isDarkMode ? "card--dark" : "text-bg-light"}`}
          style={{ boxShadow: "0px 0px 10px 5px rgba(0, 0, 0, 0.5)" }}
        >
          <div className="card-header">Edit Profile</div>
          <div className="card-body">
            <div className="mb-3">
              <label htmlFor="email-address" className="form-label">
                Email address
              </label>
              <input
                className="form-control"
                type="email"
                label="Email address"
                value={auth.currentUser.email}
                placeholder="Email address"
                readOnly
                disabled
              />
            </div>
            <form>
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
                  style={usernameEmpty || usernameLength ? inputError : null}
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
                ) : null}
              </div>

              <Collapsible
                trigger={`🔑 Change Password`}
                className="mb-3"
                onOpening={allowPasswordChange}
                onClose={disallowPasswordChange}
              >
                <div className="mb-3 mt-2">
                  <label htmlFor="currentpassword" className="form-label">
                    Current Password
                  </label>
                  <input
                    className="form-control"
                    type="password"
                    label="Current Password"
                    value={currentPassword}
                    onChange={(event) => setCurrentPassword(event.target.value)}
                    required={isRequired}
                    placeholder="Current Password"
                  />
                </div>

                <div className="mb-3 mt-2">
                  <label htmlFor="password" className="form-label">
                    New Password
                  </label>
                  <input
                    className="form-control"
                    type="password"
                    label="New Password"
                    value={password}
                    onChange={(event) => setPassword(event.target.value)}
                    required={isRequired}
                    placeholder="New Password"
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
                    Confirm New Password
                  </label>
                  <input
                    className="form-control"
                    type="password"
                    label="Confirm New password"
                    value={passwordConfirm}
                    onChange={(event) => setPasswordConfirm(event.target.value)}
                    required={isRequired}
                    placeholder="Confirm New Password"
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
              </Collapsible>

              <button
                className="btn btn-success"
                type="submit"
                onClick={onSubmit}
              >
                Save
              </button>
            </form>
          </div>
        </div>
      </div>
    );
  }
};
export default Profile;
