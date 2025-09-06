import { BrowserRouter as Router, Routes, Route, useLocation, Navigate } from "react-router-dom";
import { Auth, Dashboard, Inventory, Sales, Events, Tables } from "./pages";
import Header from "./components/shared/Header";
import { useSelector } from "react-redux";
import useLoadData from "./hooks/useLoadData";
import FullScreenLoader from "./components/shared/FullScreenLoader";

function Layout() {
  const isLoading = useLoadData();
  const location = useLocation();
  const hideHeaderRoutes = ["/auth"];
  const { isAuth } = useSelector(state => state.user);

  if (isLoading) return <FullScreenLoader />;

  return (
    <>
      {!hideHeaderRoutes.includes(location.pathname) && <Header />}
      <Routes>
        <Route
          path="/"
          element={
            <ProtectedRoutes>
              <Dashboard />
            </ProtectedRoutes>
          }
        />
        <Route
          path="/auth"
          element={isAuth ? <Navigate to="/dashboard" /> : <Auth />}
        />
        <Route
          path="/inventory"
          element={
            <ProtectedRoutes>
              <Inventory />
            </ProtectedRoutes>
          }
        />
        <Route
          path="/sales"
          element={
            <ProtectedRoutes>
              <Sales />
            </ProtectedRoutes>
          }
        />
        <Route
          path="/events"
          element={
            <ProtectedRoutes>
              <Events />
            </ProtectedRoutes>
          }
        />
        <Route
          path="/tables"
          element={
            <ProtectedRoutes>
              <Tables />
            </ProtectedRoutes>
          }
        />
        <Route
          path="/dashboard"
          element={
            <ProtectedRoutes>
              <Dashboard />
            </ProtectedRoutes>
          }
        />
        <Route path="*" element={<div>Not Found</div>} />
      </Routes>
    </>
  );
}

function ProtectedRoutes({ children }) {
  const { isAuth } = useSelector(state => state.user);
  return isAuth ? children : <Navigate to="/auth" />;
}

function App() {
  return (
    <Router>
      <Layout />
    </Router>
  );
}

export default App;
