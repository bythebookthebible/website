import React from 'react'
// import SvgButtonExtra from '../../../SVGButtons'

import Background from './MainMap.Background.svg'
import FamilySchmuddle from './MainMap.FamilySchmuddle.svg'
import MemoryMission from './MainMap.MemoryMission.svg'
import ReadingTree from './MainMap.ReadingTree.svg'
import SchmideoCenter from './MainMap.SchmideoCenter.svg'
import SchmoTown from './MainMap.SchmoTown.svg'
import SuperStage from './MainMap.SuperStage.svg'
import MemoryPalace from './MainMap.MemoryPalace.svg'
import MemoryWood from './MainMap.MemoryWood.svg'
import Top from './MainMap.Top.svg'

export default () => <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1780 1000">
  {/* <SvgButtonExtra /> */}
  <image id="Background" x="0" y="0" width="1780" href={Background} />
  <image id="MemoryPalace" x="350" y="0" width="250" href={MemoryPalace} />
  <image id="MemoryMission" x="1320" y="30" width="450" href={MemoryMission} />
  <image id="SchmideoCenter" x="630" y="310" width="450" href={SchmideoCenter} />
  <image id="FamilySchmuddle" x="1100" y="320" width="250" href={FamilySchmuddle} />
  <image id="ReadingTree" x="1360" y="220" width="350" href={ReadingTree} />
  <image id="MemoryWood" x="160" y="450" width="480" href={MemoryWood} />
  <image id="SuperStage" x="510" y="700" width="500" href={SuperStage} />
  <image id="SchmoTown" x="1310" y="600" width="480" href={SchmoTown} />
  <image id="Top" x="0" y="0" width="1780" href={Top} />

  <defs><style>{".q-1{fill:#fff;stroke:#000}.q-2{font-size:40px;fill:#231f20;stroke:#231f20;stroke-miterlimit:10;stroke-width:0.78px;font-family: Helvetica;}"}</style></defs>
  <g id="Help">
    <circle class="q-1" cx="1740" cy="40" r="30"/>
    <text class="q-2" x="1728" y="54">?</text>
  </g>

  <defs><style>{".b1-1{fill:#fff100;stroke:#c9ba00;stroke-miterlimit:10;stroke-width:5px;}.b1-2{font-size:15px;font-family:Helvetica;font-weight:300;}"}</style></defs>
  <g id="Button1">
    <rect class="b1-1" x="45" y="110" width="140" height="140" rx="14.4"/>
    <text class="b1-2" x="55" y="230">Watch</text>
  </g>

  <defs><style>{".b2-1{fill:#ffa9e0;stroke:#eb008b;stroke-miterlimit:10;stroke-width:5px;}.b2-2{font-size:15px;font-family:Helvetica;font-weight:300;}"}</style></defs>
  <g id="Button2">
    <rect class="b2-1" x="45" y="270" width="140" height="140" rx="14.4"/>
    <text class="b2-2" x="55" y="390">Lesson</text>
  </g>

  <defs><style>{".b3-1{fill:#88e3ff;stroke:#00adee;stroke-miterlimit:10;stroke-width:5px;}.b3-2{font-size:15px;font-family:Helvetica;font-weight:300;}"}</style></defs>
  <g id="Button3">
    <rect class="b3-1" x="45" y="430" width="140" height="140" rx="14.4"/>
    <text class="b3-2" x="55" y="550">Discussion</text>
  </g>

  <defs><style>{".b4-1{fill:#fff100;stroke:#c9ba00;stroke-miterlimit:10;stroke-width:5px;}.b4-2{font-size:15px;font-family:Helvetica;font-weight:300;}"}</style></defs>
  <g id="Button4">
    <rect class="b4-1" x="45" y="590" width="140" height="140" rx="14.4"/>
    <text class="b4-2" x="55" y="710">Chapter Review</text>
  </g>

  <defs><style>{".b5-1{fill:#ffa9e0;stroke:#eb008b;stroke-miterlimit:10;stroke-width:5px;}.b5-2{font-size:15px;font-family:Helvetica;font-weight:300;}"}</style></defs>
  <g id="Button5">
    <rect class="b5-1" x="45" y="750" width="140" height="140" rx="14.4"/>
    <text class="b5-2" x="55" y="870">Loop</text>
  </g>
</svg>
