import "./App.css";
import FrontPage from "./components/FrontPage";
import { BrowserRouter } from "react-router-dom";

function App() {
  return (
    <div>
      <BrowserRouter>
        <FrontPage />
      </BrowserRouter>
    </div>
  );
}

export default App;
