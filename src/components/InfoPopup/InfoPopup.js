// Context help component: an icon of an i within a circle that raises a popup on
// mouseover. Intended to be placed next to components and controls to explain their 
// function and usage.
// Each instance has a unique "index", which matches an attribute in public/help.yaml.
// The yaml file provides the title and text to be displayed in the popup. 

import React from "react";
import PropTypes from "prop-types";

import "./InfoPopup.css";
import { OverlayTrigger, Popover } from "react-bootstrap";
import { InfoCircle } from "react-bootstrap-icons";
import useStore from '../../store/useStore.js'



function InfoPopup({
  label = <InfoCircle />,
  placement = "right",
  index
}) {

  const helpText = useStore((state) => state.helpText);

  return (
    <OverlayTrigger
      key={`${index}-help-popup`}
      placement={placement}
      overlay={
        <Popover id={helpText[index] ? helpText[index].title : "Loading"}>
          <Popover.Header>{helpText[index] ? helpText[index].title : "Loading"}</Popover.Header>
          <Popover.Body>{helpText[index] ? helpText[index].body : "Loading"}</Popover.Body>
        </Popover>
      }
    >
      {label}
    </OverlayTrigger>
  );
}

InfoPopup.propTypes = {
  placement: PropTypes.string,
  title: PropTypes.string,
  children: PropTypes.any,
};

export default InfoPopup;