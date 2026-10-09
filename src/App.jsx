
import { AuthProvider } from "./context/AuthContext";
import AppRoutes from "./Routes/AppRoutes";


function App() {
  return (
    <AuthProvider>  
      <AppRoutes />
    </AuthProvider>
  );  
}

export default App;