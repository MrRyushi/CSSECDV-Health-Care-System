import { useEffect, useState } from "react";
import pfp from './pfp.jpg'
import sub from './sub.png'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faHouse, faUser, faInbox, faArrowRightFromBracket } from '@fortawesome/free-solid-svg-icons'
import { signOut } from "firebase/auth";
import { config } from '../../../firebase/Firebase';
import { useContext } from 'react';
import { AuthContext } from '../../../AuthContext';
import { useNavigate } from "react-router-dom";
import ChangePasswordPopup from "../components/ChangePasswordPopup";

const house = <FontAwesomeIcon icon={faHouse} />
const profile = <FontAwesomeIcon icon={faUser} />
const inbox = <FontAwesomeIcon icon={faInbox} />
const logout = <FontAwesomeIcon icon={faArrowRightFromBracket} rotation={180} />
    
function Sidebar(props) {
    const { isLoggedIn, setIsLoggedIn } = useContext(AuthContext);
    const selected = props.selected;
    const name = props.adminName;
    const [showPopup, setShowPopup] = useState(false);
    const navigate = useNavigate();
    function logOut() {
        signOut(config.auth).then(() => {
            console.log("Logged out");
            navigate("/login");
            window.location.reload();
        }).catch((error) => {
            // An error happened.
        });
    }

    return (
        <nav className="flex flex-col w-64 px-12 pt-4 pb-6 navbar" style={{ boxShadow: "rgba(0, 0, 0, 0.25) 0px 54px 55px, rgba(0, 0, 0, 0.12) 0px -12px 30px, rgba(0, 0, 0, 0.12) 0px 4px 6px, rgba(0, 0, 0, 0.17) 0px 12px 13px, rgba(0, 0, 0, 0.09) 0px -3px 5px" }}>
            <div className="mt-10">
                <img className="w-10 h-10 block mx-auto mb-3" src={sub}></img>
                <img className="rounded-full w-40 h-40 mb-8" src={pfp}></img>
                <h1 className="mx-auto text-center uppercase text-2xl text-blue-800 font-bold">{props.name}</h1>
            </div>
            <div className="mt-12 space-y-12">
                {selected == "dashboard" ? (
                    <div className="w-52 h-10 bg-indigo-600 bg-opacity-60 rounded-tl-[19px] rounded-bl-[19px] shadow ps-2 pt-1">
                        <button className="text-xl " onClick={() => props.changeSelected("dashboard")}>{house}</button>
                        <button className="text-xl ms-3 exo" onClick={() => props.changeSelected("dashboard")}> Dashboard</button>
                    </div>
                ) : (
                    <div className="w-52 h-10 hover:bg-indigo-300 hover:bg-opacity-60 hover:rounded-tl-[19px] hover:rounded-bl-[19px] ps-2 pt-1">
                        <button className="text-xl" onClick={() => props.changeSelected("dashboard")}>{house}</button>
                        <button className="text-xl ms-3 exo" onClick={() => props.changeSelected("dashboard")}> Dashboard</button>
                    </div>
                )}

                <div className="mt-3">
                    <button className="text-xl me-10 w-52 h-10 hover:bg-indigo-300 hover:bg-opacity-60 hover:rounded-tl-[19px] hover:rounded-bl-[19px] ps-2 pt-1" onClick={() => setShowPopup(true)}>Change Password</button>
                    {showPopup && <ChangePasswordPopup onClose={() => setShowPopup(false)} />}
                </div>

                <div className="w-52 h-10 hover:bg-indigo-300 hover:bg-opacity-60 hover:rounded-tl-[19px] hover:rounded-bl-[19px] ps-2 pt-1">
                    <button className="text-xl" onClick={logOut}>{logout}</button>-
                    <button className="text-xl ms-3 exo" onClick={logOut}>Log Out</button>
                </div>
            </div>
            
        </nav>
    )
}

export default Sidebar;