import React, { useEffect } from "react";
import { addPower } from "../app/rootReducer";
import { useDispatch } from "react-redux";

// the default is that everytime a pdf rendors, the user will get one point
// pre: parameters passed in: setMemoryP, actKey, src, actKind
export default function ProcessPDFMemoryPower(props) {
  let dispatch = useDispatch()

  useEffect(() => {
    dispatch(addPower({module: props.activity.module, power: 1}))
  }, [props.activity])

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
