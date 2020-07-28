import React, { Component, useState, useEffect, useRef, useContext } from "react";
import { DispatchContext, StateContext } from "./kidModeApp";

// the default is that everytime a pdf rendors, the user will get one point
// pre: parameters passed in: setMemoryP, actKey, src, actKind
export default function ProcessPDFMemoryPower(props) {
    let dispatch = useContext(DispatchContext)
    let state = useContext(StateContext)

    useEffect(() => {
        dispatch({type:'addMemoryPower', power: 1})
    }, [state.activity.key, state.activity.kind])

    return <>
        <div className="embed-responsive embed-responsive-17by22">
          <object
            data={props.src}
            type="application/pdf"
            style={{overflow: "auto" }}
          ></object>
        </div>
        <br />
        <a href={props.src}>Download</a>
      </>
}
