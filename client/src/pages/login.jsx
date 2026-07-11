import { useState } from "react";
import { Link } from "react-router-dom";
import api from "../services/api";
import "../styles/auth.css";

function Login(){

    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");

    const handleLogin = async (e) => {

        e.preventDefault();

        try{

            const response = await api.post("/login", {
                email,
                password
            });

            console.log("Backend response:", response.data);

            const token = response.data.token;

            localStorage.setItem("token", token);

            const savedToken = localStorage.getItem("token");

            console.log("Saved Token:", savedToken);

            alert("Login successful");

        }
        catch(error){

            console.log("Login Error:", error.response);

            alert(
                error.response?.data?.message ||
                "Login failed"
            );

        }

    };


    return(
        <div className="auth-page">
            <div className="auth-card">

                <div className="auth-header">
                    <div className="auth-icon">🔒</div>
                    <h1 className="auth-title">Welcome back</h1>
                    <p className="auth-subtitle">Login to continue</p>
                </div>

                <form onSubmit={handleLogin}>

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
                        Login
                    </button>

                </form>

                <p className="auth-footer">
                    Don't have an account?{" "}
                    <Link to="/register" className="auth-link">
                        Register
                    </Link>
                </p>

            </div>
        </div>
    );

}

export default Login;