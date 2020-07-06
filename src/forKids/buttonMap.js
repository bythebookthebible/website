import React, { useContext } from "react";
import { ReactSVG } from "react-svg";

import $ from "jquery";
import { DispatchContext } from "./kidModeApp"

export default function ButtonMap(props) {
    let dispatch = useContext(DispatchContext)

    return <ReactSVG src={props.src} afterInjection={(err, svg) => {
        for (let button of props.buttons) {
            $("#" + button.id).click(() => {
                button.dispatch && dispatch(button.dispatch)
                button.onClick && button.onClick()
            });
        }
    }}/>
}
