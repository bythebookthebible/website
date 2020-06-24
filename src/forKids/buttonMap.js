import React, { Component, useEffect, useState } from "react";
import { ReactSVG } from "react-svg";

import $ from "jquery";
export default function ButtonMap(props) {
  return (
    <ReactSVG
      src={props.src}
      afterInjection={(err, svg) => {
        for (let button of props.buttons) {
          $("#" + button.id).click(button.onClick);
        }
      }}
    />
  );
}
