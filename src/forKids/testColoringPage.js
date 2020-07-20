import React from 'react';

export default class TestColoringPage extends React.Component {
	render () {
		return (
          
        <svg version="1.1" id="Layer_1" xmlns="http://www.w3.org/2000/svg" viewBox="0 -5 150 80">
            // {/* <style type="text/css">
            //     .blue{fill:#28B7FF;stroke:none;}
            //     .yellow{fill:#FFFF00;stroke:none;}
            //     .pink{fill:#FF4BBD;stroke:none;}
            //     .white{fill:#FFFFFF;stroke:none;}
            // </style> */}
            <g id='stand_1'>
                <rect x="10" y="10" width="12" height="52" fill='#28B7FF' stroke='none' />
            </g>
            <g id='glow_1'>
                <rect onClick={() => this.props.onFill(0) } x="11" y="11" width="10" height="50" fill={this.props.fillColors[0]} stroke='none' />
            </g>
            
            <g id='stand_2'>
                <rect x="25" y="10" width="12" height="52" fill='#28B7FF' stroke='none' />
            </g>
            <g id='glow_2'>
                <rect onClick={() => this.props.onFill(1) } x="26" y="11" width="10" height="50" fill={this.props.fillColors[1]} stroke='none' />
            </g>
            
            <g id='stand_3'>
                <rect x="40" y="10" width="12" height="52" fill='#28B7FF' stroke='none' />
            </g>
            <g id='glow_3'>
                <rect onClick={() => this.props.onFill(2) } x="41" y="11" width="10" height="50" fill={this.props.fillColors[2]} stroke='none' />
            </g>
            
            <g id='stand_4'>
                <rect x="55" y="10" width="12" height="52" fill='#28B7FF' stroke='none' />
            </g>
            <g id='glow_4'>
                <rect onClick={() => this.props.onFill(3) } x="56" y="11" width="10" height="50" fill={this.props.fillColors[3]} stroke='none' />
            </g>
            
            <g id='stand_5'>
                <rect x="70" y="10" width="12" height="52" fill='#28B7FF' stroke='none' />
            </g>
            <g id='glow_5'>
                <rect onClick={() => this.props.onFill(4) } x="71" y="11" width="10" height="50" fill={this.props.fillColors[4]} stroke='none' />
            </g>
            
            <g id='stand_6'>
                <rect x="85" y="10" width="12" height="52" fill='#28B7FF' stroke='none' />
            </g>
            <g id='glow_6'>
                <rect onClick={() => this.props.onFill(5) } x="86" y="11" width="10" height="50" fill={this.props.fillColors[5]} stroke='none' />
            </g>
            
            <g id='stand_7'>
                <rect x="100" y="10" width="12" height="52" fill='#28B7FF' stroke='none' />
            </g>
            <g id='glow_7'>
                <rect onClick={() => this.props.onFill(6) } x="101" y="11" width="10" height="50" fill={this.props.fillColors[6]} stroke='none' />
            </g>
            
            <g id='stand_8'>
                <rect x="115" y="10" width="12" height="52" fill='#28B7FF' stroke='none'/>
            </g>
            <g id='glow_8'>
                <rect onClick={() => this.props.onFill(7) } x="116" y="11" width="10" height="50" fill={this.props.fillColors[7]} stroke='none' />
            </g>

// {/* <svg xmlns="http://www.w3.org/2000/svg" width="793.70076" height="793.7067066666666">
//                 <title>Sun Flower Template</title>
//                 <g id="layer2" transform="translate(114 66)" display="inline">
//                 <g id="svg_27" transform="matrix(0.849029 0 0 0.849029 65.2874 25.9633)">
//                     <path id="svg_28" onClick={() => this.props.onFill(0)} fill={this.props.fillColors[0]} fill-rule="evenodd" stroke="#000000" stroke-width="8" d="m335.662872,237.986206c29.202484,-24.342041 60.58606,-230.559322 9.385345,-295.979031c-73.760437,41.40971 -167.217957,217.611736 -116.882584,287.760891c50.335403,70.149139 107.90538,6.715332 107.497238,8.21814z"/>
//                     <path id="svg_29" onClick={() => this.props.onFill(1)} fill={this.props.fillColors[1]} fill-rule="evenodd" stroke="#000000" stroke-width="8" d="m386.044678,310.854431c37.9216,-2.697144 183.860779,-151.734833 180.521729,-234.741455c-84.056488,-9.480042 -262.842316,78.93425 -262.968384,165.273926c-0.126099,86.339691 83.655823,68.486267 82.446655,69.467529z"/>
//                     <path id="svg_30" onClick={() => this.props.onFill(2)} fill={this.props.fillColors[2]} fill-rule="evenodd" stroke="#000000" stroke-width="8" d="m389.714386,408.724213c33.877747,17.251678 235.782501,-35.140503 275.741852,-107.972504c-67.11853,-51.482727 -265.888855,-67.969208 -310.536072,5.930603c-44.647278,73.899811 36.336273,101.825043 34.79422,102.041901z"/>
//                     <path id="svg_31" onClick={() => this.props.onFill(3)} fill={this.props.fillColors[3]} fill-rule="evenodd" stroke="#000000" stroke-width="8" d="m329.107666,470.122833c19.955872,32.358643 219.640503,92.662323 291.658508,51.253998c-30.533752,-78.886414 -191.705597,-196.3815 -268.282593,-156.500183c-76.577026,39.881256 -21.946136,105.863251 -23.375916,105.246185z"/>
//                     <path id="svg_32" onClick={() => this.props.onFill(4)} fill={this.props.fillColors[4]} fill-rule="evenodd" stroke="#000000" stroke-width="8" d="m262.062073,475.924225c-6.152496,37.516205 105.063141,213.985992 186.588898,229.948456c28.676453,-79.580444 -15.959839,-273.974518 -99.926239,-294.079315c-83.96637,-20.104828 -85.987854,65.534363 -86.662659,64.130859z"/>
//                     <path id="svg_33" onClick={() => this.props.onFill(5)} fill={this.props.fillColors[5]} fill-rule="evenodd" stroke="#000000" stroke-width="8" d="m184.72879,458.800507c-26.9543,26.810242 -40.124664,234.985687 16.618103,295.661163c69.843018,-47.721313 147.481354,-231.443237 91.185608,-296.905792c-56.295715,-65.462585 -108.07843,2.777466 -107.803711,1.244629z"/>
//                     <path id="svg_34" onClick={() => this.props.onFill(6)} fill={this.props.fillColors[6]} fill-rule="evenodd" stroke="#000000" stroke-width="8" d="m112.00724,385.084015c-36.075912,11.993652 -140.613815,192.499359 -116.845932,272.100494c83.789322,-11.606873 235.148872,-141.498169 213.913979,-225.185822c-21.234863,-83.687744 -97.99691,-45.664795 -97.068047,-46.914673z"/>
//                     <path id="svg_35" onClick={() => this.props.onFill(7)} fill={this.props.fillColors[7]} fill-rule="evenodd" stroke="#000000" stroke-width="8" d="m86.959099,304.477875c-37.260666,-7.547424 -217.755577,97.009186 -236.747414,177.882935c78.45546,31.62442 274.379066,-5.730591 297.601486,-88.888702c23.222473,-83.158112 -62.281731,-88.372253 -60.854073,-88.994232z"/>
//                     <path id="svg_36" onClick={() => this.props.onFill(8)} fill={this.props.fillColors[8]} fill-rule="evenodd" stroke="#000000" stroke-width="8" d="m153.065643,223.719513c-23.262451,-32.12149 -224.293907,-83.6772 -289.189682,-37.585815c39.131607,79.234161 209.680809,191.333527 279.184448,146.57312c69.503647,-44.760376 8.543472,-109.546234 10.005234,-108.987305z"/>
//                     <path id="svg_37" onClick={() => this.props.onFill(9)} fill={this.props.fillColors[9]} fill-rule="evenodd" stroke="#000000" stroke-width="8" d="m254.876236,181.401382c-2.983047,-39.547852 -147.19648,-188.793056 -226.621056,-183.538116c-8.185791,87.990494 78.34198,272.831589 160.993904,271.12468c82.651855,-1.706879 64.675018,-88.828537 65.627151,-87.586563z"/>
//                     <path id="svg_39" onClick={() => this.props.onFill(10)} fill={this.props.fillColors[10]} fill-rule="evenodd" stroke="#000000" stroke-width="8" d="m297.780762,228.182648c20,-28.571426 -1.799683,-218.680733 -62.857147,-264.285713c-55.34317,54.395012 -95.714279,232.85714 -34.285706,282.857155c61.428589,50 97.142853,-20 97.142853,-18.571442z"/>
//                     <path id="svg_40" onClick={() => this.props.onFill(11)} fill={this.props.fillColors[11]} fill-rule="evenodd" stroke="#000000" stroke-width="8" d="m359.904236,280.578674c32.923309,-11.505737 126.28775,-178.538239 103.373322,-251.220833c-76.694275,11.81813 -213.714111,133.078697 -193.065979,209.545174c20.648102,76.466522 90.527191,40.516205 89.692657,41.675659z"/>
//                     <path id="svg_41" onClick={() => this.props.onFill(12)} fill={this.props.fillColors[12]} fill-rule="evenodd" stroke="#000000" stroke-width="8" d="m386.685059,366.340057c34.139862,7.127197 200.288086,-87.801941 218.152039,-161.887756c-71.798462,-29.439301 -251.733093,3.758179 -273.490448,79.916473c-21.757385,76.158295 56.651459,81.408508 55.338409,81.971283z"/>
//                     <path id="svg_42" onClick={() => this.props.onFill(13)} fill={this.props.fillColors[13]} fill-rule="evenodd" stroke="#000000" stroke-width="8" d="m347.79303,435.268402c25.447235,23.848816 216.726807,29.222717 270.527771,-24.752167c-45.999084,-62.496185 -216.934692,-127.761536 -275.138855,-74.042389c-58.204163,53.719116 6.025208,98.997101 4.611084,98.794556z"/>
//                     <path id="svg_43" onClick={() => this.props.onFill(14)} fill={this.props.fillColors[14]} fill-rule="evenodd" stroke="#000000" stroke-width="8" d="m289.832733,456.525024c3.57373,34.692291 144.463379,164.179321 220.47583,158.708496c6.252594,-77.347168 -80.004333,-238.71109 -159.173523,-236.320709c-79.169128,2.390381 -60.367462,78.692444 -61.302307,77.612213z"/>
//                     <path id="svg_44" onClick={() => this.props.onFill(15)} fill={this.props.fillColors[15]} fill-rule="evenodd" stroke="#000000" stroke-width="8" d="m217.252625,459.959686c-17.416229,30.215942 20.978363,217.679657 85.801453,257.751923c50.357513,-59.04071 74.915833,-240.356537 9.337463,-284.774414c-65.578369,-44.417877 -95.013611,28.445526 -95.138916,27.022491z"/>
//                     <path id="svg_45" onClick={() => this.props.onFill(16)} fill={this.props.fillColors[16]} fill-rule="evenodd" stroke="#000000" stroke-width="8" d="m135.147919,412.184082c-29.0541,19.292145 -78.199806,204.228516 -38.0187,268.984314c71.387581,-30.422058 174.154198,-181.807587 135.232918,-250.790222c-38.921219,-68.982635 -97.736008,-16.864197 -97.214218,-18.194092z"/>
//                     <path id="svg_46" onClick={() => this.props.onFill(17)} fill={this.props.fillColors[17]} fill-rule="evenodd" stroke="#000000" stroke-width="8" d="m93.591728,346.846466c-34.801437,2.277344 -169.452995,138.239563 -166.820915,214.403168c77.060196,9.133057 241.528839,-71.045624 242.092804,-150.248871c0.564026,-79.203217 -76.386223,-63.260406 -75.271889,-64.154297z"/>
//                     <path id="svg_47" onClick={() => this.props.onFill(18)} fill={this.props.fillColors[18]} fill-rule="evenodd" stroke="#000000" stroke-width="8" d="m132.697845,259.456573c-28.317528,-22.84375 -218.686081,-20.149323 -265.05571,36.258942c53.694321,60.736755 231.634315,118.970612 282.403305,62.632751c50.769012,-56.337799 -18.776062,-99.035065 -17.347595,-98.891693z"/>
//                     <path id="svg_48" onClick={() => this.props.onFill(19)} fill={this.props.fillColors[19]} fill-rule="evenodd" stroke="#000000" stroke-width="8" d="m212.655304,197.512878c-12.149918,-34.294296 -175.706383,-131.745445 -244.757141,-107.996216c13.909821,79.865845 134.9562,222.699982 207.717178,201.315826c72.760971,-21.384125 35.898392,-94.190201 37.039963,-93.319611z"/>
//                     <path id="svg_49" onClick={() => this.props.onFill(20)} fill={this.props.fillColors[20]} fill-rule="evenodd" stroke="#000000" stroke-width="8" stroke-linecap="round" stroke-dashoffset="0" d="m356.352203,353.182648a120.714287,120.714287 0 1 1 -241.428581,0a120.714287,120.714287 0 1 1 241.428581,0z"/>
//                     <path id="svg_50" opacity="0.810241" onClick={() => this.props.onFill(21)} fill={this.props.fillColors[21]} fill-rule="evenodd" stroke-width="1.3" stroke-linecap="round" stroke-dashoffset="0" d="m309.209381,355.325439a72.857147,72.857147 0 1 1 -145.714294,0a72.857147,72.857147 0 1 1 145.714294,0z"/>
//                 </g>
//                 </g> */}
            </svg>
		)
	}
}


