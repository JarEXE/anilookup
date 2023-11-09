import React from "react";
import { sendPasswordResetEmail } from "firebase/auth";
import { auth } from "../../firebase";
import { useNavigate } from "react-router-dom";
import toast from "react-hot-toast";

const Reset = ({ isDarkMode, user }) => {
  const navigate = useNavigate();
  const [email, setEmail] = React.useState("");
  const [emailEmpty, setEmailEmpty] = React.useState(false);

  const onSubmit = async (event) => {
    event.preventDefault();

    if (email.length === 0) {
      setEmailEmpty(true);
      return;
    } else {
      sendPasswordResetEmail(auth, email)
        .then(() => {
          navigate("/login");
          toast.success(`Password reset email sent to ${email}`, {
            style: {
              borderRadius: "10px",
              background: `${isDarkMode ? "#0dcaf0" : "#333"}`,
              color: `${isDarkMode ? "#333" : "#fff"}`,
            },
          });
        })
        .catch((error) => {
          const errorCode = error.code;
          const errorMessage = error.message;

          console.log(`${errorCode}: ${errorMessage}`);
        });
      return;
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

  const inputError = {
    border: `2px solid ${isDarkMode ? "#ffc107" : "red"}`,
  };

  React.useEffect(() => {
    setEmailEmpty(false);
  }, [email]);

  if (user) {
    notifyLoggedIn();
    navigate("/");
    return;
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
          className={`card text-bg-${isDarkMode ? "secondary" : "light"}`}
          style={{ boxShadow: "0px 0px 10px 5px rgba(0, 0, 0, 0.5)" }}
        >
          <div className="card-header">Password Reset</div>
          <div className="card-body">
            <form>
              <div className="mb-3">
                <label htmlFor="email-address" className="form-label">
                  Password reset email will be sent to the provided email
                  address
                </label>
                <input
                  className="form-control"
                  id="email-address"
                  name="email"
                  type="email"
                  required
                  placeholder="Email address"
                  onChange={(event) => setEmail(event.target.value)}
                  style={emailEmpty ? inputError : null}
                />
                {emailEmpty ? (
                  <div className="error-message">
                    <small
                      style={{ color: `${isDarkMode ? "#ffc107" : "red"}` }}
                    >
                      Email cannot be empty!
                    </small>
                  </div>
                ) : null}
              </div>

              <div>
                <button className="btn btn-success" onClick={onSubmit}>
                  Send
                </button>
              </div>
            </form>
          </div>
          <div className="card-footer text-body-secondary"></div>
        </div>
      </div>
    );
  }
};

export default Reset;
