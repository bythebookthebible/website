import React, { useState } from "react"
import { scriptureFromKey } from '../../util'
import defaultIcon from './images/defaultIcon.png'
import { storage } from "../../firebase"
import { useAsyncEffect, useMemoryResources } from "../../common/hooks"

export default function Thumbnail({module, kind}) {
  let iconRef = useMemoryResources(resources => resources[module].icon)
  let verse = scriptureFromKey(module)
  let [src, setSrc] = useState(defaultIcon)
  
  useAsyncEffect(async abort => {
    if(iconRef) {
      const downloadUrl = await storage.ref(iconRef[0]).getDownloadURL()
      if(!abort.current) setSrc(downloadUrl)
    }
  }, [iconRef])

  return (ThumbnailByKind[kind] && ThumbnailByKind[kind]({verse, src})) 
    || ThumbnailByKind['default']({verse, src})
}

const ThumbnailByKind = {
  dragon: ({src, verse}) => null,

  echo: ({src, verse}) => null,

  schmash: ({src, verse}) => null,

  color: ({src, verse}) => null,

  activity: ({src, verse}) => null,


  karaoke: ({src, verse}) => null,

  dance: ({src, verse}) => null,

  speedyZoom: ({src, verse}) => null,

  blooper: ({src, verse}) => null,


  watch: ({src, verse}) => null,

  discussion: ({src, verse}) => null,

  mySchmo: ({src, verse}) => null,

  colorPrint: ({src, verse}) => null,

  bookmark: ({src, verse}) => null,

  game: ({src, verse}) => null,

  notebook: ({src, verse}) => null,


  kidRecite: ({src, verse}) => null,

  intro: ({src, verse}) => null,

  joSchmo: ({src, verse}) => null,

  roSchmo: ({src, verse}) => null,


  princess: ({src, verse}) => null,

  book: ({src, verse}) => null,


  music: ({src, verse}) => null,

  review: ({src, verse}) => null,

  default: ({src, verse}) => <svg xmlns="http://www.w3.org/2000/svg" xmlnsXlink="http://www.w3.org/1999/xlink" viewBox="0 0 143.17 108.06">
    <defs>
      <style>{".cls-1{fill:#7fc6e2;}.cls-2{fill:#fff;}.cls-3{font-size:10.22px;fill:#231f20;stroke-width:0.21px;font-family:Helvetica-Light, Helvetica;font-weight:300;}.cls-3,.cls-4{stroke:#231f20;stroke-miterlimit:10;}.cls-4{stroke-width:0.2px;opacity:0.3;fill:url(#linear-gradient);}.cls-5{fill:#00aeef;}"}</style>
      <linearGradient id="linear-gradient" x1="-22.55" y1="150.45" x2="23.34" y2="150.45" gradientTransform="translate(71.09 -117.05)" gradientUnits="userSpaceOnUse">
        <stop offset="0" stop-opacity="0"/>
        <stop offset="1"/>
      </linearGradient>
    </defs>
    <rect class="cls-1" x="3.33" y="5.78" width="135.7" height="96.24" rx="6.89"/>
    <rect class="cls-2" x="7.5" y="56.36" width="127.62" height="41.31" rx="7.79"/>
    <text class="cls-3" transform="translate(11.42 82.25) scale(0.99 1)">
      {`${verse.book} ${verse.chapter}:${verse.verses}`}
    </text>
    <image width="3726" height="1996" transform="translate(7.31 10.49) scale(0.03 0.03)" xlinkHref={src}/>
    <rect class="cls-4" x="48.54" y="-30.59" width="45.9" height="127.99" rx="6.73" transform="translate(38.08 104.9) rotate(-90)"/>
    <ellipse class="cls-2" cx="70.95" cy="43.88" rx="13.95" ry="14.02"/>
    <path class="cls-5" d="M69.45,48.75c-.69.4-1.25.08-1.26-.71l0-2.72,0-2.88,0-2.71c0-.79.55-1.13,1.24-.74l2.37,1.33,2.51,1.41,2.37,1.33a.76.76,0,0,1,0,1.44l-2.34,1.39-2.48,1.47Z"/>
  </svg>,
}