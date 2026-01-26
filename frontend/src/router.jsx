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
import MemberLogin from "./pages/MemberLogin";
import MemberDashboard from "./pages/MemberDashboard";
import MemberProtectedRoute from "./components/MemberProtectedRoute";
import MemberHistory from "./pages/MemberHistory";
import MemberSignup from "./pages/MemberSignup";

import MemberService from "./pages/MemberService";
import MemberMenu from "./pages/MemberMenu";
import MemberMine from "./pages/MemberMine";

import MemberDeposit from "./pages/MemberDeposit";
import MemberDepositBank from "./pages/MemberDepositBank";
import MemberDepositCrypto from "./pages/MemberDepositCrypto";
import MemberDepositUSDT from "./pages/MemberDepositUSDT";

import DepositCrypto from "./pages/DepositCrypto";

export const router = createBrowserRouter([
  { path: "/login", element: <Login /> },
  
  { path: "/member/login", element: <MemberLogin /> },
  { path: "/member/signup", element: <MemberSignup /> },

  { path: "/", element: <ProtectedRoute><Dashboard /></ProtectedRoute> },

  /* ✅ PUBLIC / TEST ROUTE */
  {
    path: "/member/depositCrypto",
    element: <DepositCrypto />,
  },

  
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

  {
    path: "/member/dashboard",
    element: (
      <MemberProtectedRoute>
        <MemberDashboard />
      </MemberProtectedRoute>
    )
  },

  {
  path: "/member/history",
    element: (
      <MemberProtectedRoute>
        <MemberHistory />
      </MemberProtectedRoute>
    )
  },

  {
    path: "/member/service",
    element: (
      <MemberProtectedRoute>
        <MemberService />
      </MemberProtectedRoute>
    ),
  },

  {
    path: "/member/menu",
    element: (
      <MemberProtectedRoute>
        <MemberMenu />
      </MemberProtectedRoute>
    ),
  },

  {
    path: "/member/mine",
    element: (
      <MemberProtectedRoute>
        <MemberMine />
      </MemberProtectedRoute>
    ),
  },

{
  path: "/member/deposit",
  element: (
    <MemberProtectedRoute>
      <MemberDeposit />
    </MemberProtectedRoute>
  ),
},

{
  path: "/member/deposit/bank",
  element: (
    <MemberProtectedRoute>
      <MemberDepositBank />
    </MemberProtectedRoute>
  ),
},

{
  path: "/member/deposit/crypto",
  element: (
    <MemberProtectedRoute>
      <MemberDepositCrypto />
    </MemberProtectedRoute>
  ),
},

{
  path: "/member/deposit/usdt",
  element: (
    <MemberProtectedRoute>
      <MemberDepositUSDT />
    </MemberProtectedRoute>
  ),
},
  
]);
