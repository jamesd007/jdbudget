import React, { useEffect, useState, useRef } from "react";
import "../styles/Modals.css";
import "../utils/ClickOutsideDetector";
import ClickOutsideDetector from "../utils/ClickOutsideDetector";
import Draggable from "react-draggable";

const Modals = (props) => {
  const [hover, setHover] = useState(false);
  const [OKToHover, setOKToHover] = useState(false);
  const titleW = useRef(null);

  useEffect(() => {
    if (titleW.current?.offsetWidth < titleW.current?.scrollWidth)
      setOKToHover(true);
    else setOKToHover(false);
    return () => {};
  }, []);

  const toggleHover = () => {
    setHover(!hover);
  };

  const hoverStyle = props.title
    ? { marginLeft: (-props.title.length * 1).toString() + "px" }
    : { marginLeft: "0px" };
  // marginLeft: mleft + "px",

  const handleClose = () => {
    props.onClose();
  };

  return (
    // <div>
    <div className="modal-new" style={props.mainStyle}>
      {/* <Draggable
          handle=".handle"
          defaultPosition={
            props.unConventional !== "image" ? { x: 0, y: 50 } : {}
          }
        > */}
      <ClickOutsideDetector
        caller="Modals"
        listen
        onClickOutside={() => {
          handleClose();
        }}
        // onClickOutside={() => {
        //     props.onClickOutside()
        //     props.clickOutsideActive && props.onClose()
        // }}
        onClick={() => {}}
      >
        <div
          className={props.overWritemncn ? {} : "modal-content-new"}
          style={props.style}
        >
          <div
            className="modal-header-new"
            style={props.noBckgrnd ? { backgroundColor: "transparent" } : {}}
          >
            <div
              className="handle"
              style={{
                width: "100%",
                textAlign: "left",
                cursor: "pointer",
              }}
            >
              <h2
                ref={titleW}
                className="modal-title-new"
                style={hover ? (OKToHover ? hoverStyle : {}) : {}}
                onMouseEnter={toggleHover}
                onMouseLeave={toggleHover}
              >
                {props.title}
              </h2>
            </div>
            <button
              type="button"
              className="close-modal"
              style={props.buttonStyle}
              data-dismiss="modal" //bootstrap??
              aria-label="Close"
              onClick={() => {
                props.onClose();
                // if (!props.noHistoryBack) history.goBack()
                // if (props.setclickOutsideActive)
                //  props.setclickOutsideActive(true)
              }}
              title="Close Modal"
            >
              <span aria-hidden="true">&times; </span>
            </button>
          </div>

          <div
            className={
              props.switchScrollOff
                ? "modal-body-new hide-scrollbar"
                : "modal-body-new"
            }
            style={props.styleBody}
          >
            {/* this is modal content */}
            {props.children}
          </div>
          <div
            className="modal-footer-new"
            style={
              props.footer
                ? props.noBckgrnd
                  ? {
                      minHeight: "2.58rem",
                      backgroundColor: "transparent",
                    }
                  : { minHeight: "2.58rem" }
                : {}
            }
          >
            {/* style={props.noBckgrnd ? { backgroundColor: "transparent" } : {}}> */}
            {props.footer}
          </div>
        </div>
      </ClickOutsideDetector>
      {/* </Draggable> */}
    </div>

    // </div>
  );
};

export default Modals;
