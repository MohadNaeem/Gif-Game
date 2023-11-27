import React from 'react'
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom'
import BottomNav from './components/BottomNav/BottomNav'
import AdminSideNav from './components/AdminSideBar'
import DepositPage from './pages/DepositPage'
import NotFoundPage from './pages/NotFoundPage'
import MyAccountPage from './pages/MyAccountPage'
import RewardsPage from './pages/RewardsPage'
import WithdrawPage from './pages/WithdrawPage'
import LoginPage from './pages/LoginPage'
import SignupPage from './pages/SignupPage'
import TableErrorPage from './pages/TableErrorPage'
import ActiveUsersPage from './pages/AdminControl/pages/ActiveUsersPage'
import AppUsersPage from './pages/AdminControl/pages/AppUsersPage'
import TransactionsPage from './pages/AdminControl/pages/TransactionsPage'
import VerificationsPage from './pages/AdminControl/pages/VerificationsPage'
import WithdrawReqPage from './pages/AdminControl/pages/WithdrawReqPage'
import ChooseTablePage from './pages/ChooseTablePage'
import TermsConditionsPage from './pages/TermsConditionsPage'
import TermsConditionsSet from './pages/AdminControl/pages/TermsConditionsSet'
import ReportIssuePage from './pages/ReportIssuePage'
import ReportedIssuesPage from './pages/AdminControl/pages/ReportedIssues'
import TablePage from './pages/TablePage'
import SettingsPage from './pages/AdminControl/pages/SettingsPage'
import UserPage from './pages/AdminControl/pages/UserPage'

function App() {
  return (
    <div>
      <Router>
        <AdminSideNav />
        <Routes>
          <Route path='/login' element={<LoginPage />} />
          <Route path='/signup' element={<SignupPage />} />
          <Route path='/signup/:referrerID' element={<SignupPage />} />
          <Route path='/' element={<ChooseTablePage />} />
          <Route path='/live' element={<ChooseTablePage />} />
          <Route path='/:time/table/:number' element={<TablePage />} />
          <Route path='/table/:number/:error' element={<TableErrorPage />} />
          <Route path='/myAccount' element={<MyAccountPage userData={null} />} />
          <Route path='/termsConditions' element={<TermsConditionsPage />} />
          <Route path='/report' element={<ReportIssuePage />} />
          <Route path='/deposit' element={<DepositPage />} />
          <Route path='/rewards' element={<RewardsPage />} />
          <Route path='/withdraw' element={<WithdrawPage />} />

          <Route path='/admin/allUsers' element={<AppUsersPage />} />
          <Route path='/admin/activeUsers' element={<ActiveUsersPage />} />
          <Route path='/admin/transactions' element={<TransactionsPage />} />
          <Route path='/admin/withdrawRequests' element={<WithdrawReqPage />} />
          <Route path='/admin/verfications' element={<VerificationsPage />} />
          <Route path='/admin/settings' element={<SettingsPage />} />
          <Route path='/admin/termsSet' element={<TermsConditionsSet />} />
          <Route
            path='/admin/reportedIssues'
            element={<ReportedIssuesPage />}
          />
           <Route path="/admin/user/:userId" element={<UserPage />} />

          <Route path='*' element={<NotFoundPage />} />
        </Routes>
        <BottomNav />
      </Router>
    </div>
  )
}

export default App
