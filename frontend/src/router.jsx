import { createBrowserRouter } from "react-router-dom";
import ProtectedRoute from "./components/ProtectedRoute";
import Login from "./pages/Login";
import DashboardMain from "./pages/DashboardMain";
import Users from "./pages/Users";
import Tasks from "./pages/Tasks";
import Sets from "./pages/Sets";
import Members from "./pages/Members"; // ← ADD THIS
import CreateMember from "./pages/CreateMember";
import AssignSets from "./pages/AssignSets";
import AssignSetCreate from "./pages/AssignSetCreate"; // ✅ add
import VipWalletAddresses from "./pages/VipWalletAddresses";

import MemberLogin from "./pages/MemberLogin";
import MemberDashboard from "./pages/MemberDashboard";
import MemberProtectedRoute from "./components/MemberProtectedRoute";
import MemberHistory from "./pages/MemberHistory";
import MemberSignup from "./pages/MemberSignup";

import MemberService from "./pages/MemberService";
import MemberMenu from "./pages/MemberMenu";
import MemberMine from "./pages/MemberMine";
import Teams from "./pages/Teams";
import MemberDeposit from "./pages/MemberDeposit";
import MemberDepositCrypto from "./pages/MemberDepositCrypto";
import MemberDepositUSDT from "./pages/MemberDepositUSDT";
import MemberDepositBank from "./pages/MemberDepositBank";

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

// Beneficiary Management
import Beneficiaries from "./pages/Beneficiaries";
import BeneficiaryManagement from "./pages/BeneficiaryManagement";
import AddCryptoBeneficiary from "./pages/AddCryptoBeneficiary";
import AddBankBeneficiary from "./pages/AddBankBeneficiary";

// Profile Guide
import CompleteProfileGuide from "./pages/CompleteProfileGuide";

// Rules and Instructions
import RulesAndInstructions from "./pages/RulesAndInstructions";

// Task Instructions Guide
import TaskInstructionsGuide from "./pages/TaskInstructionsGuide";

// Withdrawal Guide
import WithdrawalGuide from "./pages/WithdrawalGuide";

// Platform Guide
import PlatformGuide from "./pages/PlatformGuide";

// Security Account Safety
import SecurityAccountSafety from "./pages/SecurityAccountSafety";

// Platform Rules Guide
import PlatformRulesGuide from "./pages/PlatformRulesGuide";

import SupportInbox from "./pages/SupportInbox";
import SupportChat from "./pages/SupportChat";

import CsLogin from "./pages/CsLogin";

import ProfileEdit from "./pages/ProfileEdit";

import CustomerService from "./pages/CustomerService";

export const router = createBrowserRouter([
  { path: "/login", element: <Login /> },
  
  { path: "/member/login", element: <MemberLogin /> },
  { path: "/member/signup", element: <MemberSignup /> },

  {
    path: "/cs/login",
    element: <CsLogin />,
  },

  { path: "/", element: <ProtectedRoute><DashboardMain /></ProtectedRoute> },

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
    path: "/member/customerService",
    element: (
      <MemberProtectedRoute>
        <CustomerService />
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
    path: "/member/teams",
    element: (
      <MemberProtectedRoute>
        <Teams />
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

// Beneficiary Management Routes
{
  path: "/beneficiary-management",
  element: (
    <MemberProtectedRoute>
      <BeneficiaryManagement />
    </MemberProtectedRoute>
  ),
},

// {
//   path: "/member/teams",
//   element: (
//     <MemberProtectedRoute>
//       <Teams />
//     </MemberProtectedRoute>
//   ),
// },

// Beneficiary Management Routes
// {
//   path: "/beneficiary-management",
//   element: (
//     <MemberProtectedRoute>
//       <BeneficiaryManagement />
//     </MemberProtectedRoute>
//   ),
// },

{
  path: "/beneficiary-management",
  element: (
    <MemberProtectedRoute>
      <Beneficiaries />
    </MemberProtectedRoute>
  ),
},

{
  path: "/beneficiary/add/crypto",
  element: (
    <MemberProtectedRoute>
      <AddCryptoBeneficiary />
    </MemberProtectedRoute>
  ),
},

{
  path: "/beneficiary/add/bank",
  element: (
    <MemberProtectedRoute>
      <AddBankBeneficiary />
    </MemberProtectedRoute>
  ),
},

// Profile Guide
{
  path: "/profile/complete-guide",
  element: (
    <MemberProtectedRoute>
      <CompleteProfileGuide />
    </MemberProtectedRoute>
  ),
},

// Rules and Instructions
{
  path: "/rules-and-instructions",
  element: (
    <MemberProtectedRoute>
      <RulesAndInstructions />
    </MemberProtectedRoute>
  ),
},

// Task Instructions Guide
{
  path: "/task-instructions-guide",
  element: (
    <MemberProtectedRoute>
      <TaskInstructionsGuide />
    </MemberProtectedRoute>
  ),
},

// Withdrawal Guide
{
  path: "/withdrawal-guide",
  element: (
    <MemberProtectedRoute>
      <WithdrawalGuide />
    </MemberProtectedRoute>
  ),
},

// Platform Guide
{
  path: "/platform-guide",
  element: (
    <MemberProtectedRoute>
      <PlatformGuide />
    </MemberProtectedRoute>
  ),
},

// Security Account Safety
{
  path: "/security-account-safety",
  element: (
    <MemberProtectedRoute>
      <SecurityAccountSafety />
    </MemberProtectedRoute>
  ),
},

// Platform Rules Guide
{
  path: "/platform-rules-guide",
  element: (
    <MemberProtectedRoute>
      <PlatformRulesGuide />
    </MemberProtectedRoute>
  ),
},

{
  path: "/support",
  element: (
      <SupportInbox />
  ),
},

{
  path: "/support/:id",
  element: (
      <SupportChat />
  ),
},

{
  path: "/member-profile-edit",
  element: (
    <MemberProtectedRoute>
      <ProfileEdit />
    </MemberProtectedRoute>
  ),
},

{
  path: "/vip-wallets",
  element: (
    <ProtectedRoute roles={["owner", "admin"]}>
      <VipWalletAddresses />
    </ProtectedRoute>
  ),
},

]);
