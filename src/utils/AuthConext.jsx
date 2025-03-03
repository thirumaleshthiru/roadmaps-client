import { useState, useContext, createContext} from "react";
import Cookies from "js-cookie";

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
    const [token, setToken] = useState(Cookies.get("token") || null);
  
    function login(newToken) {
        Cookies.set("token", newToken, { expires: 1});
   
        setToken(newToken);
    
    }

    function logout() {
        Cookies.remove("token");
      
        setToken(null);
    }

    return (
        <AuthContext.Provider value={{ token,  login, logout }}>
            {children}
        </AuthContext.Provider>
    );
}

export function useAuth() {
    return useContext(AuthContext);
}
