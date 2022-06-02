import React, { useEffect } from "react";
import { addPower } from "../app/createRootReducer";
import { useDispatch } from "react-redux";
import { useMemoryResources, useCachedStorage } from "../common/hooks";
import { resoucesForKinds } from "../util";

// the default is that everytime a pdf rendors, the user will get one point
// pre: parameters passed in: setMemoryP, actKey, src, actKind
export default function ProcessPDFMemoryPower(props) {
  let {activity, isActive, onRepeat} = props
  let dispatch = useDispatch()
  
  let resources = useMemoryResources()
  let url = resources && resources[activity.module][resoucesForKinds[activity.kind][0]][0]
  let version = resources && resources[activity.module].version
  let src = useCachedStorage({url, version});

  useEffect(() => {
    dispatch(addPower(activity.module, 1))
  }, [activity.module, activity.kind])

  return <>
    <div className="embed-responsive embed-responsive-17by22">
      <object
        data={src}
        type="application/pdf"
        style={{overflow: "auto" }}
      ></object>
    </div>
    <br />
    <a href={src}>Download</a>
  </>
}
