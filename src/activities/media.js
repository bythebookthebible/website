import React from "react"
import "../../node_modules/video-react/dist/video-react.css"

import { RepetitionMemoryVideo, MemeoryPowerVideo, EchoMemoryVideo } from "./processVideoMemoryPower"
import PopupBookGenerator from './popupBookGenerator'
import { kinds } from "../util"
import MemoryPowerPDF from "./processPDFMemoryPower"
import MemoryPowerColoring from "./processCPMemoryPower"

export const media = {
  [kinds.watch]: <MemeoryPowerVideo />,
  [kinds.karaoke]: <MemeoryPowerVideo />,
  [kinds.dance]: <MemeoryPowerVideo />,
  [kinds.joSchmo]: <MemeoryPowerVideo />,
  [kinds.intro]: <MemeoryPowerVideo />,
  [kinds.princessRead]: <MemeoryPowerVideo />,
  [kinds.blooper]: <MemeoryPowerVideo />,
  [kinds.review]: <MemeoryPowerVideo />,
  [kinds.smash]: <MemeoryPowerVideo />,
  [kinds.speedyWeedy]: <MemeoryPowerVideo />,
  [kinds.kidSchmo]: <MemeoryPowerVideo />, 
  [kinds.kidRecite]: <MemeoryPowerVideo />,
  
  [kinds.craft]: <MemoryPowerPDF />,
  [kinds.schmoment]: <MemoryPowerPDF />,
  [kinds.discussion]: <MemoryPowerPDF />,
  
  // should be separated into different components, rather than included with simple video
  [kinds.speed]: <MemeoryPowerVideo />,
  [kinds.echo]: <MemeoryPowerVideo />,

  [kinds.coloring]: <MemoryPowerColoring />,
  [kinds.book]: <PopupBookGenerator />,

  // Only in adult version
  // [kinds.music]: ,
  // [kinds.teacherGuide]: ,
};