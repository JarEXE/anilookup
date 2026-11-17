import React from "react";
import { Link } from "react-router-dom";
import Menu from "@mui/material/Menu";
import MenuItem from "@mui/material/MenuItem";
import Divider from "@mui/material/Divider";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faArrowRightFromBracket,
  faBookOpen,
  faEye,
  faUser,
} from "@fortawesome/free-solid-svg-icons";
import { listUrl } from "../stats/listStatuses";

export const ABOUT_URL = "https://github.com/JarEXE/anilookup";

// The signed-in user's menu: an avatar button (their initial, like the
// profile page) opening a plain dropdown. Replaces the radial menu, which
// hid its options behind icon-only tooltips and blurred the whole page.
function AccountMenu({ user, onSignOut }) {
  const [anchor, setAnchor] = React.useState(null);
  // Where the menu mounts: the app's root, so it picks up the app's colour
  // tokens in both themes. It's captured once and never changes. (Deriving it
  // from `anchor` made it switch to <body> while the menu was closing, which
  // stranded MUI's invisible full-screen backdrop over the page and made
  // nothing clickable until a reload.)
  const [container, setContainer] = React.useState(null);
  const open = Boolean(anchor);
  const close = () => setAnchor(null);
  const name = user.displayName || "Account";

  return (
    <>
      <button
        type="button"
        className="account-button"
        id="account-button"
        aria-haspopup="menu"
        aria-expanded={open}
        aria-controls={open ? "account-menu" : undefined}
        onClick={(event) => {
          if (!container)
            setContainer(event.currentTarget.closest(".App") || document.body);
          setAnchor(event.currentTarget);
        }}
      >
        <span className="account-button__avatar" aria-hidden="true">
          {name.charAt(0).toUpperCase()}
        </span>
        <span className="visually-hidden">Account menu for {name}</span>
      </button>
      <Menu
        id="account-menu"
        anchorEl={anchor}
        open={open}
        onClose={close}
        container={container}
        anchorOrigin={{ vertical: "bottom", horizontal: "right" }}
        transformOrigin={{ vertical: "top", horizontal: "right" }}
        MenuListProps={{ "aria-labelledby": "account-button", dense: false }}
        slotProps={{ paper: { className: "account-menu", elevation: 0 } }}
      >
        <li className="account-menu__who" aria-hidden="true">
          <strong>{name}</strong>
          <span>{user.email}</span>
        </li>
        <Divider />
        <MenuItem component={Link} to="/profile" onClick={close}>
          <FontAwesomeIcon icon={faUser} fixedWidth aria-hidden="true" />
          Profile
        </MenuItem>
        <MenuItem component={Link} to={listUrl("anime")} onClick={close}>
          <FontAwesomeIcon icon={faEye} fixedWidth aria-hidden="true" />
          Anime list
        </MenuItem>
        <MenuItem component={Link} to={listUrl("manga")} onClick={close}>
          <FontAwesomeIcon icon={faBookOpen} fixedWidth aria-hidden="true" />
          Manga list
        </MenuItem>
        {/* <MenuItem component="a" href={ABOUT_URL} target="_blank" rel="noreferrer" onClick={close}>
          <FontAwesomeIcon icon={faCircleInfo} fixedWidth aria-hidden="true" />
          About AniLookup
          <span className="visually-hidden"> (opens GitHub in a new tab)</span>
        </MenuItem> */}
        <Divider />
        <MenuItem
          onClick={() => {
            close();
            onSignOut();
          }}
        >
          <FontAwesomeIcon
            icon={faArrowRightFromBracket}
            fixedWidth
            aria-hidden="true"
          />
          Sign out
        </MenuItem>
      </Menu>
    </>
  );
}

export default AccountMenu;
