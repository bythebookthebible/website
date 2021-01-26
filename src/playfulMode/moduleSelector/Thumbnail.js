import React, { useState } from "react"
import { scriptureFromKey } from '../../util'
import defaultIcon from './images/defaultIcon.png'
import { storage } from "../../firebase"
import { useAsyncEffect, useMemoryResources } from "../../common/hooks"

export default function Thumbnail({module, kind}) {
  let verse = scriptureFromKey(module)

  // Fetch icon
  let iconRef = useMemoryResources(resources => resources[module].icon)
  let [iconSrc, setIconSrc] = useState(defaultIcon)

  useAsyncEffect(async abort => {
    if(iconRef) {
      const downloadUrl = await storage.ref(iconRef[0]).getDownloadURL()
      if(!abort.current) setIconSrc(downloadUrl)
    }
  }, [iconRef])

  // Fetch thumbnail
  let thumbnailRef = useMemoryResources(resources => resources[module].icon)
  let [thumbnailSrc, setThumbnailSrc] = useState(defaultIcon)

  useAsyncEffect(async abort => {
    if(thumbnailRef) {
      const downloadUrl = await storage.ref(thumbnailRef[0]).getDownloadURL()
      if(!abort.current) setThumbnailSrc(downloadUrl)
    }
  }, [thumbnailRef])

  return (ThumbnailByKind[kind] && ThumbnailByKind[kind]({verse, iconSrc, thumbnailSrc})) 
    || ThumbnailByKind['default']({verse, iconSrc, thumbnailSrc})
}

const thumbnails = {
  video: ({thumbnailSrc, verse}) => <svg xmlns="http://www.w3.org/2000/svg" xmlnsXlink="http://www.w3.org/1999/xlink" viewBox="0 0 143.17 108.06">
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
    <image width="3726" height="1996" transform="translate(7.31 10.49) scale(0.03 0.03)" xlinkHref={thumbnailSrc}/>
    <rect class="cls-4" x="48.54" y="-30.59" width="45.9" height="127.99" rx="6.73" transform="translate(38.08 104.9) rotate(-90)"/>
    <ellipse class="cls-2" cx="70.95" cy="43.88" rx="13.95" ry="14.02"/>
    <path class="cls-5" d="M69.45,48.75c-.69.4-1.25.08-1.26-.71l0-2.72,0-2.88,0-2.71c0-.79.55-1.13,1.24-.74l2.37,1.33,2.51,1.41,2.37,1.33a.76.76,0,0,1,0,1.44l-2.34,1.39-2.48,1.47Z"/>
  </svg>,

  pdf: ({iconSrc, verse}) => <svg xmlns="http://www.w3.org/2000/svg" xmlnsXlink="http://www.w3.org/1999/xlink" viewBox="0 0 380.71 507.48">
    <defs>
      <style>{".cls-1,.cls-4{fill:#fff;}.cls-1,.cls-2,.cls-3,.cls-4{stroke:#00aeef;stroke-miterlimit:10;}.cls-1{stroke-width:12px;}.cls-2{fill:#00aeef;stroke-width:5.61px;}.cls-3{fill:none;stroke-width:8px;}.cls-4{stroke-width:8.79px;}.cls-5{font-size:46px;fill:#231f20;font-family:Helvetica-Light, Helvetica;font-weight:300;}"}</style>
    </defs>
    <path class="cls-1" d="M298.6,364.86h-218a23.43,23.43,0,0,1-23.43-23.43V45.49A23.43,23.43,0,0,1,80.57,22.06L238.9,20.93l83.55,85.63L322,341.43A23.43,23.43,0,0,1,298.6,364.86Z"/>
    <path class="cls-2" d="M325.3,101.83H260.45A20.46,20.46,0,0,1,240,81.38V16.53Z"/>
    <image x="140" y="140" width="100" height="100" xlinkHref={iconSrc}/>
    <circle class="cls-3" cx="189.79" cy="192.89" r="55.58"/>
    <rect class="cls-4" x="7.52" y="413.07" width="363.57" height="85.37" rx="20.69"/>
    <text class="cls-5" transform="translate(57.44 471.68)">
      {`${verse.book} ${verse.chapter}:${verse.verses}`}
    </text>
  </svg>,
}

const ThumbnailByKind = {
  dragon: thumbnails["video"],
  echo: thumbnails["video"],
  schmash: thumbnails["video"],
  color: thumbnails["pdf"],
  activity: thumbnails["video"],

  karaoke: thumbnails["video"],
  dance: thumbnails["video"],
  speedyZoom: thumbnails["video"],
  blooper: thumbnails["video"],

  watch: thumbnails["video"],

  discussion: thumbnails["pdf"],
  mySchmo: thumbnails["pdf"],
  colorPrint: thumbnails["pdf"],
  bookmark: thumbnails["pdf"],
  game: thumbnails["video"],
  notebook: thumbnails["pdf"],

  kidRecite: thumbnails["video"],
  intro: thumbnails["video"],
  joSchmo: thumbnails["video"],
  roSchmo: thumbnails["video"],

  princess: thumbnails["video"],
  book: thumbnails["pdf"],

  music: thumbnails["video"],
  review: thumbnails["video"],
}