import React, { Component, useState, useEffect, useRef, useReducer} from 'react'
import mainMap from '../images/maps/MainMap.svg'
import palaceMap from '../images/maps/palaceDoors.svg'
import readingTree from '../images/maps/TestTree.svg'
import ButtonMap from './buttonMap'

let Tree = props => <div>
    <h1>Tree</h1>
    <ButtonMap src={readingTree} buttons={[
        {id:'Palace', dispatch: {type:'newView', view:'map', viewSelected:'home'}},
        {id:'Branch1', dispatch: {type:'newView', view:'activity', activity:{key:'39-007-0001-10', kind:'Music Video'}}},
        {id:'Branch2', dispatch: {type:'newView', view:'activity', activity:{key:'39-007-0007-11', kind:'Music Video'}}},
        {id:'Branch3', dispatch: {type:'newView', view:'activity', activity:{key:'39-007-0012-14', kind:'Music Video'}}},
        {id:'Branch4', dispatch: {type:'newView', view:'activity', activity:{key:'39-007-0015-20', kind:'Music Video'}}},
        {id:'Branch5', dispatch: {type:'newView', view:'activity', activity:{key:'39-007-0021-23', kind:'Music Video'}}},
        {id:'Branch6', dispatch: {type:'newView', view:'activity', activity:{key:'39-007-0024-29', kind:'Music Video'}}},
    ]}/>
</div>

let Map = props => <div>
    <ButtonMap src={mainMap} buttons={[
        {id:'Memory_Palace',  dispatch: {type:'newView', view:'map', viewSelected:'palace'}},
        {id:'City_Center',    dispatch: {type:'newView', view:'moduleSelector', viewSelected:'dragon'}},
        {id:'Water_Well',     dispatch: {type:'newView', view:'moduleSelector', viewSelected:'dragon'}},
        {id:'Jo_Schmo_House', dispatch: {type:'newView', view:'moduleSelector', viewSelected:'dragon'}},
        {id:'Art_Gazebo',     dispatch: {type:'newView', view:'moduleSelector', viewSelected:'dragon'}},
        {id:'Dragon',         dispatch: {type:'newView', view:'moduleSelector', viewSelected:'dragon'}},
        {id:'Game_Factory',   dispatch: {type:'newView', view:'moduleSelector', viewSelected:'dragon'}},
        {id:'Book_Tree',      dispatch: {type:'newView', view:'moduleSelector', viewSelected:'dragon'}},
    ]}/>
</div>

let Palace = props => <div>
    <ButtonMap src={palaceMap} buttons={[
        {id:'Psalms_Proverbs', dispatch: {type:'newView', view:'palace'}},
        {id:'Matthew', dispatch: {type:'newView', view:'palace'}},
        {id:'James', dispatch: {type:'newView', view:'palace'}},
        {id:'Ephesians', dispatch: {type:'newView', view:'palace'}},
    ]}/>
</div>

export default {
    home:<Map />,
    tree:<Tree />,
    palace:<Palace />,
}
