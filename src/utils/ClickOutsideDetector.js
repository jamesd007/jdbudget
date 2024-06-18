import React, { useEffect, useRef, forwardRef } from "react";

const ClickOutsideDetector = forwardRef(function ClickOutsideDetector(
  { listen, onClickOutside, ignore, ...props },
  ref
) {
  const container = useRef(null);

  const onKeyUp = (e) => {
    // If the user hits ESC, it's considered a click outside!
    if (e.keyCode === 27) onClickOutside();
    // handleEvent(e);
  };

  const handleEvent = (e) => {
    if (container.current?.contains(e.target)) return;

    // This ignore prop is used mostly for the buttons/links that toggle menus and drawers
    if (ignore && ignore.contains && ignore.contains(e.target)) {
      return;
    }

    onClickOutside();
  };

  useEffect(() => {
    if (listen && onClickOutside) {
      // Add listeners
      document.addEventListener("mousedown", handleEvent, false);
      document.addEventListener("touchend", handleEvent, false);
      document.addEventListener("keyup", onKeyUp);

      return () => {
        // Remove listeners
        document.removeEventListener("mousedown", handleEvent, false);
        document.removeEventListener("touchend", handleEvent, false);
        document.removeEventListener("keyup", onKeyUp);
      };
    }
  });

  return <div ref={container} {...props} />;
});

export default ClickOutsideDetector;
