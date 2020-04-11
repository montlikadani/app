import React, {useContext} from 'react';
import {Col} from "react-bootstrap";
import {increaseBrightness, isHexDark} from "../util/Utils";
import AppContext from "../../context/AppContext";
import Badge from "react-bootstrap/Badge";
import {FaRegAddressCard, FaRegBell} from "react-icons/all";

const ProfileSidebar = (props) => {
    const context = useContext(AppContext);
    const themeColor = isHexDark(context.theme) && context.user.darkMode ? increaseBrightness(context.theme, 40) : context.theme;
    const settings = props.currentNode === "settings" ? {color: themeColor} : {};
    const settingsIcon = props.currentNode === "settings" ? {color: themeColor} : {color: "rgba(0,0,0,.5) !important"};
    const notifications = props.currentNode === "notifications" ? {color: themeColor} : {};
    const notificationsIcon = props.currentNode === "notifications" ? {color: themeColor} : {color: "rgba(0,0,0,.5) !important"};


    return <Col xs={12} md={3} className="mt-4" id="sidebar">
        <ul className="pl-0 mb-1" style={{listStyle: "none", fontSize: "1.1rem", fontWeight: 500, lineHeight: "2rem"}}>
            <li>
                <a href="#!" onClick={() => props.reRouteTo("settings")} style={settings}>
                    <FaRegAddressCard className="fa-sm mr-1 move-top-2px" style={settingsIcon}/> Settings
                </a>
            </li>
            <li>
                <a href="#!" onClick={() => props.reRouteTo("notifications")} style={notifications}>
                    <FaRegBell className="fa-sm mr-1 move-top-2px" style={notificationsIcon}/> Notifications <Badge variant="warning" className="move-top-2px">Soon</Badge>
                </a>
            </li>
        </ul>
    </Col>
};

export default ProfileSidebar;