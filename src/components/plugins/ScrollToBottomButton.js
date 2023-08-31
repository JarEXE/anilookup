import React from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faArrowDown, faArrowUp } from "@fortawesome/free-solid-svg-icons";

function ScrollToBottomButton({ isDarkMode }) {
  const [isAtBottom, setIsAtBottom] = React.useState(false);

  const scrollToTop = () => {
    window.scrollTo({
      top: 0,
      behavior: "smooth",
    });
  };

  const handleScroll = () => {
    // Check if the user is at the bottom of the page
    const isBottom =
      window.innerHeight + window.scrollY >= document.body.offsetHeight - 100;

    setIsAtBottom(isBottom);
  };

  React.useEffect(() => {
    // Add a scroll event listener to detect scroll position
    window.addEventListener("scroll", handleScroll);

    // Clean up the event listener when the component unmounts
    return () => {
      window.removeEventListener("scroll", handleScroll);
    };
  }, []);

  const scrollToBottom = () => {
    // javascript is used to handle smooth scrolling on mobile browsers
    const body = document.body;
    const html = document.documentElement;
    const height = Math.max(
      body.scrollHeight,
      body.offsetHeight,
      html.clientHeight,
      html.scrollHeight,
      html.offsetHeight
    );

    window.scrollTo({
      top: height,
      behavior: "smooth",
    });
  };

  return (
    <button
      onClick={isAtBottom ? scrollToTop : scrollToBottom}
      className={`${isDarkMode ? "scroll-button-dark" : "scroll-button"}`}
    >
      <FontAwesomeIcon icon={isAtBottom ? faArrowUp : faArrowDown} />
    </button>
  );
}

export default ScrollToBottomButton;
