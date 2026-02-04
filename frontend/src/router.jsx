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
import Profile from "./pages/Profile";

import WithdrawalMethod from "./pages/WithdrawalMethod";
import WithdrawBank from "./pages/WithdrawBank";
import WithdrawByCrypto from "./pages/WithdrawByCrypto";

import TaskList from "./pages/TaskList";
import TaskDetail from "./pages/TaskDetail";

import AmazonVip1 from "./pages/AmazonVip1";
import AlibabaVip2 from "./pages/AlibabaVip2";
import AliexpressVip3 from "./pages/AliexpressVip3";

import MemberTasks from "./pages/MemberTasks";

import MemberWallet from "./pages/MemberWallet";
import CreateMemberDeposit from "./pages/CreateMemberDeposit";
import CreateMemberWithdrawal from "./pages/CreateMemberWithdrawal";

import DepositRecord from "./pages/DepositRecord";
import WithdrawalRecord from "./pages/WithdrawalRecord";

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
    path: "/members/:memberId/wallet",
    element: (
      <ProtectedRoute roles={["owner","agent"]}>
        <MemberWallet />
      </ProtectedRoute>
    )
  },
  {
    path: "/members/:memberId/wallet/deposit/new",
    element: (
      <ProtectedRoute roles={["owner","agent"]}>
        <CreateMemberDeposit />
      </ProtectedRoute>
    )
  },
  {
    path: "/members/:memberId/wallet/withdraw/new",
    element: (
      <ProtectedRoute roles={["owner","agent"]}>
        <CreateMemberWithdrawal />
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

{
  path: "/profile",
  element: (
    <MemberProtectedRoute>
      <Profile />
    </MemberProtectedRoute>
  ),
},  

{
  path: "/member/withdraw",
  element: (
    <MemberProtectedRoute>
      <WithdrawalMethod />
    </MemberProtectedRoute>
  ),
},

{
  path: "/member/withdraw/crypto",
  element: (
    <MemberProtectedRoute>
      <WithdrawByCrypto />
    </MemberProtectedRoute>
  ),
},

{
  path: "/member/withdraw/bank",
  element: (
    <MemberProtectedRoute>
      <WithdrawBank />
    </MemberProtectedRoute>
  ),
},

{
  path: "/member/tasks",
  element: (
    <MemberProtectedRoute>
      <TaskList />
    </MemberProtectedRoute>
  ),
},

{
  path: "/member/task-detail",
  element: (
    <MemberProtectedRoute>
      <TaskDetail />
    </MemberProtectedRoute>
  ),
},

{
  path: "/member/vip/amazon",
  element: (
    <MemberProtectedRoute>
      <AmazonVip1 />
    </MemberProtectedRoute>
  ),
},

{
  path: "/member/vip/alibaba",
  element: (
    <MemberProtectedRoute>
      <AlibabaVip2 />
    </MemberProtectedRoute>
  ),
},

{
  path: "/member/vip/aliexpress",
  element: (
    <MemberProtectedRoute>
      <AliexpressVip3 />
    </MemberProtectedRoute>
  ),
},

{
  path: "/member/tasks-set",
  element: (
    <MemberProtectedRoute>
      <MemberTasks />
    </MemberProtectedRoute>
  ),
},

{
  path: "/member/deposit/records",
  element: (
    <MemberProtectedRoute>
      <DepositRecord />
    </MemberProtectedRoute>
  ),
},

{
  path: "/member/withdraw/records",
  element: (
    <MemberProtectedRoute>
      <WithdrawalRecord />
    </MemberProtectedRoute>
  ),
},

]);
