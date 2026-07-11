import { useState } from "react";
import { Link } from "react-router-dom";
import api from "../services/api";
import "../styles/auth.css";

function Register(){

    const [username, setUsername] = useState("");
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");

    const handleRegister = async (e) => {

        e.preventDefault();

        try{

            const response = await api.post("/register", {
                username,
                email,
                password
            });

            console.log(response.data);
            alert("User registered successfully");

        }
        catch(error){

            console.log(error);
            alert("Registration failed");

        }

    };


    return(
        <div className="auth-page">
            <div className="auth-card">

                <div className="auth-header">
                    <div className="auth-icon">👤</div>
                    <h1 className="auth-title">Create account</h1>
                    <p className="auth-subtitle">Register to get started</p>
                </div>

                <form onSubmit={handleRegister}>

                    <label className="auth-label">Username</label>
                    <input
                        type="text"
                        placeholder="Enter username"
                        value={username}
                        onChange={(e)=>setUsername(e.target.value)}
                        className="auth-input"
                    />

                    <label className="auth-label">Email</label>
                    <input
                        type="email"
                        placeholder="Enter email"
                        value={email}
                        onChange={(e)=>setEmail(e.target.value)}
                        className="auth-input"
                    />

                    <label className="auth-label">Password</label>
                    <input
                        type="password"
                        placeholder="Enter password"
                        value={password}
                        onChange={(e)=>setPassword(e.target.value)}
                        className="auth-input"
                    />

                    <button type="submit" className="auth-button">
                        Register
                    </button>

                </form>

                <p className="auth-footer">
                    Already have an account?{" "}
                    <Link to="/login" className="auth-link">
                        Log in
                    </Link>
                </p>

            </div>
        </div>
    )

}

export default Register;