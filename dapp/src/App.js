import { Routes, Route} from "react-router-dom";
import { Home } from "./components/Pages/Home/Home";
import { Navbar } from "./components/WebElements/Navbar/Navbar";
import { Exchange } from "./components/Pages/Exchange/Exchange";
import './App.scss';



function App() {
  return (
    <div className="App">
      <Navbar/>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/exchange" element={<Exchange />}/>
      </Routes>
    </div>
  );
}

export default App;
