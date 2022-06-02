import React from "react"
import "../../node_modules/video-react/dist/video-react.css"

import { MemeoryPowerVideo as Video, EchoMemoryVideo, RepetitionMemoryVideo } from "./processVideoMemoryPower"
import PopupBookGenerator from './popupBookGenerator'
import { kinds } from "../util"
import MemoryPowerPDF from "./processPDFMemoryPower"
import MemoryPowerColoring from "./processCPMemoryPower"

export const media = {
  [kinds.dragon]: <Video />,
  [kinds.echo]: <Video />,
  [kinds.schmash]: <Video />,
  [kinds.color]: <MemoryPowerColoring />,
  [kinds.activity]: <Video />,

  [kinds.karaoke]: <Video />,
  [kinds.dance]: <Video />,
  [kinds.speedyZoom]: <Video />,
  [kinds.blooper]: <Video />,

  [kinds.watch]: <Video />,

  [kinds.discussion]: <MemoryPowerPDF />,
  [kinds.mySchmo]: <MemoryPowerPDF />, 
  [kinds.colorPrint]: <MemoryPowerPDF />,
  [kinds.bookmark]: <MemoryPowerPDF />,
  [kinds.game]: <Video />,
  [kinds.notebook]: <MemoryPowerPDF />,

  [kinds.kidRecite]: <Video />,
  [kinds.intro]: <Video />,
  [kinds.joSchmo]: <Video />,
  [kinds.roSchmo]: <Video />,

  [kinds.music]: <Video />,
  [kinds.princess]: <Video />,
  [kinds.popupBook]: <PopupBookGenerator />,

  [kinds.review]: <Video />,

  // Only in adult version
  // [kinds.music]: ,
}
