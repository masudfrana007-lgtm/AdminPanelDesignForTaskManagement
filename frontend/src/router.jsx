import { createBrowserRouter } from "react-router-dom";
import ProtectedRoute from "./components/ProtectedRoute";
import Login from "./pages/Login";
import Dashboard from "./pages/Dashboard";
import Users from "./pages/Users";
import Tasks from "./pages/Tasks";
import Sets from "./pages/Sets";

export const router = createBrowserRouter([
  { path: "/login", element: <Login /> },
  { path: "/", element: <ProtectedRoute><Dashboard /></ProtectedRoute> },
  { path: "/users", element: <ProtectedRoute roles={["admin","owner"]}><Users /></ProtectedRoute> },
  { path: "/tasks", element: <ProtectedRoute roles={["owner"]}><Tasks /></ProtectedRoute> },
  { path: "/sets", element: <ProtectedRoute roles={["owner","agent"]}><Sets /></ProtectedRoute> }
]);
