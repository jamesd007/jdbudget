import { useContext } from "react";
import "./App.css";
import FrontPage from "./components/FrontPage";
import { BrowserRouter } from "react-router-dom";
import LoginForm from "./forms/LoginForm";
import { UserProvider } from "./contexts/UserContext";
import { UserContext } from "./contexts/UserContext";
import { DataProvider } from "./providers/DataProvider";
import { registerLocale, setDefaultLocale } from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import enZA from "date-fns/locale/en-ZA"; // Import English (South Africa) locale
// Register and set the default locale globally
registerLocale("en-ZA", enZA);
setDefaultLocale("en-ZA");

function AppContent() {
  const { user } = useContext(UserContext);
  return user ? <FrontPage /> : <LoginForm />;
}

function App() {
  return (
    <div>
      <UserProvider>
        <DataProvider>
          <BrowserRouter>
            <AppContent />
          </BrowserRouter>
        </DataProvider>
      </UserProvider>
    </div>
  );
}

export default App;
