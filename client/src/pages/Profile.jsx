import { useEffect, useState } from "react";
import api from "../services/api";
import "../styles/auth.css";

function Profile(){

    const [user, setUser] = useState(null);


    useEffect(()=>{

        const getProfile = async()=>{

            try{

                const token = localStorage.getItem("token");

                const response = await api.get("/profile", {
                    headers:{
                        Authorization: token
                    }
                });


                setUser(response.data.user);

            }
            catch(error){

                console.log("Profile Error:", error.response);

            }

        };


        getProfile();

    },[]);


    return(

        <div className="auth-page">
            <div className="auth-card">

                <h1 className="auth-title" style={{textAlign: "center", marginBottom: "24px"}}>Profile</h1>

                {
                    user ? (

                        <div className="profile-row">

                            <div className="profile-avatar">
                                {user.username?.charAt(0).toUpperCase()}
                            </div>

                            <div>
                                <h2 className="profile-name">
                                    {user.username}
                                </h2>

                                <p className="profile-email">
                                    {user.email}
                                </p>
                            </div>

                        </div>

                    )
                    :
                    (
                        <p className="auth-subtitle" style={{textAlign: "center"}}>Loading...</p>
                    )
                }

            </div>
        </div>

    );

}

export default Profile;