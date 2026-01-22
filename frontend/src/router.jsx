import { createBrowserRouter } from "react-router-dom";
import ProtectedRoute from "./components/ProtectedRoute";
import Login from "./pages/Login";
import Dashboard from "./pages/Dashboard";
import Users from "./pages/Users";
import Tasks from "./pages/Tasks";
import Sets from "./pages/Sets";
import Members from "./pages/Members"; // ← ADD THIS
import CreateMember from "./pages/CreateMember";
import AssignSets from "./pages/AssignSets";
import AssignSetCreate from "./pages/AssignSetCreate"; // ✅ add

export const router = createBrowserRouter([
  { path: "/login", element: <Login /> },

  { path: "/", element: <ProtectedRoute><Dashboard /></ProtectedRoute> },

  {
    path: "/users",
    element: (
      <ProtectedRoute roles={["admin","owner"]}>
        <Users />
      </ProtectedRoute>
    )
  },

  {
    path: "/tasks",
    element: (
      <ProtectedRoute roles={["owner"]}>
        <Tasks />
      </ProtectedRoute>
    )
  },

  {
    path: "/sets",
    element: (
      <ProtectedRoute roles={["owner","agent"]}>
        <Sets />
      </ProtectedRoute>
    )
  },

  {
    path: "/members",
    element: (
      <ProtectedRoute roles={["owner","agent"]}>
        <Members />
      </ProtectedRoute>
    )
  },   

  {
    path: "/members/create",
    element: (
      <ProtectedRoute roles={["owner","agent"]}>
        <CreateMember />
      </ProtectedRoute>
    )
  },

  {
    path: "/assign-sets",
    element: (
      <ProtectedRoute roles={["owner","agent"]}>
        <AssignSets />
      </ProtectedRoute>
    )
  },

  {
    path: "/assign-sets/create",
    element: (
      <ProtectedRoute roles={["owner","agent"]}>
        <AssignSetCreate />
      </ProtectedRoute>
    )
  },
  
]);
