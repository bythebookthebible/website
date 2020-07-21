import React from 'react';
import './colorPalette.css';

export default function ColorPalette(props) {
    let colors = ['#FFFFFF', '#8E53A1', '#6ABD46', '#71CCDC', '#F7ED45', '#F7DAAF', '#EC2527', '#F16824', '#CECCCC', '#5A499E', '#06753D', '#024259', '#FDD209', '#7D4829', '#931B1E', '#B44426', '#979797', '#C296C5', '#54B948', '#3C75BB', '#F7ED45', '#E89D5E', '#F26F68', '#F37123', '#676868', '#9060A8', '#169E49', '#3CBEB7', '#FFCD37', '#E5B07D', '#EF3C46', '#FDBE17', '#4E4D4E', '#6B449B', '#BACD3F', '#1890CA', '#FCD55A', '#D8C077', '#A62E32', '#F16A2D', '#343433', '#583E98', '#BA539F', '#9D2482', '#DD64A5', '#DB778D', '#EC4394', '#E0398C', '#68AF46', '#4455A4', '#FBEE34', '#AD732A', '#D91E36', '#F99B2A']
    // let colors = ['#800000', 'red', '#e6194B', '#fabed4', '#9A6324', 'orange', '#f58231', '#ffd8b1', '#808000', '#bfef45', 'yellow', '#ffe119', '#fffac8','green', '#3cb44b', '#aaffc3', '#469990', '#000075', 'blue', '#4363d8', '#42d4f4', 'purple', '#911eb4', '#f032e6', '#dcbeff', '#000000', '#a9a9a9', '#ffffff'];
    return (
        <div className='color-palette'>
            {console.log("color-pal")}
            {colors.map(color => {
                let activeClass = props.currentColor === color ? 'color-swatch-active' : '';
                return (
                    <div onClick={() => {props.changeColor(color)}}>
                        <div className={'color-swatch ${activeClass}'} style={{backgroundColor: color}}></div>
                    </div>    
                )
            })}
        </div>
    )
}