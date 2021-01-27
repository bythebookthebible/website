import React from 'react'
// import SvgButtonExtra from '../../../SVGButtons'

import Background from './SuperStage.Background.svg'
import Bloopers from './SuperStage.Bloopers.svg'
import Dance from './SuperStage.Dance.svg'
import Karaoke from './SuperStage.Karaoke.svg'
import Speed from './SuperStage.Speed.svg'

export default () => <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1780 1000">
  {/* <SvgButtonExtra /> */}
  <image id="Background" x="0" y="0" width="1780" href={Background} />
  <image id="Karaoke" x="70" y="510" width="2800" href={Karaoke} />
  <image id="Dance" x="450" y="590" width="2400" href={Dance} />
  <image id="Speed" x="840" y="760" width="2000" href={Speed} />
  <image id="Blooper" x="1350" y="470" width="1400" href={Bloopers} />
</svg>
