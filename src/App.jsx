import Routex from "./utils/Routex";
import CustomNavbar from "./components/CustomNavbar";
import Footer from "./components/Footer";
import usePageTracking from "./utils/usePageTracking";
function App() {
  usePageTracking();
  return (
  
    <div className="flex flex-col min-h-screen">
      <CustomNavbar />
        <div className="flex-0 mt-1">
        <Routex />

        </div>
      <Footer />
    </div>
  );
}

export default App;
