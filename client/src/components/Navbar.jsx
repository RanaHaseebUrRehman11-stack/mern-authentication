import { Link, useNavigate } from "react-router-dom";
import "../styles/auth.css";

function Navbar(){

    const navigate = useNavigate();


    const logout = () => {

        console.log("Logout button clicked");


        localStorage.removeItem("token");


        console.log(
            "Token after logout:",
            localStorage.getItem("token")
        );


        navigate("/login");

    };


    return(

        <nav className="navbar">

            <div className="nav-links">
                <Link to="/register" className="nav-link">Register</Link>
                <Link to="/login" className="nav-link">Login</Link>
                <Link to="/profile" className="nav-link">Profile</Link>
            </div>

            <button onClick={logout} className="logout-btn">
                Logout
            </button>

        </nav>

    );

}

export default Navbar;