import { BrowserRouter, Routes, Route } from "react-router-dom";

import Register from "./pages/Register";
import Login from "./pages/Login";
import Profile from "./pages/Profile";

import Navbar from "./components/Navbar";
import ProtectedRoute from "./components/ProtectedRoute";


function App(){

  return(

    <BrowserRouter>

      <Navbar />

      <Routes>

        <Route 
          path="/register" 
          element={<Register />}
        />

        <Route 
          path="/login" 
          element={<Login />}
        />


        <Route 
          path="/profile" 
          element={
            <ProtectedRoute>
              <Profile />
            </ProtectedRoute>
          }
        />


      </Routes>

    </BrowserRouter>

  )

}

export default App;