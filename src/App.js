import Routex from "./utils/Routex";
import CustomNavbar from "./components/CustomNavbar";
import Footer from "./components/Footer";
function App() {
  return (
    <div className="flex flex-col min-h-screen">
      <CustomNavbar />
        <div className="flex-0 mt-10">
        <Routex />

        </div>
      <Footer />
    </div>
  );
}

export default App;
