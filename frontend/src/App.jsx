import { Routes, Route, Navigate } from 'react-router-dom'
import { useAuth } from './context/AuthContext'
import Navbar from './components/Navbar'
import LoginPage from './pages/LoginPage'
import RegisterPage from './pages/RegisterPage'
import ProblemListPage from './pages/ProblemListPage'
import ProblemDetailPage from './pages/ProblemDetailPage'
import ProfilePage from './pages/ProfilePage'
import LeaderboardPage from './pages/LeaderboardPage'
import AdminPage from './pages/AdminPage'
import CreateProblemPage from './pages/CreateProblemPage'
import ContestListPage from './pages/ContestListPage'
import ContestDetailPage from './pages/ContestDetailPage'
import SettingsPage from './pages/SettingsPage'
import ContestProblemPage from './pages/ContestProblemPage'
import ContestScoreboardPage from './pages/ContestScoreboardPage'
import LandingPage from './pages/LandingPage'
import AboutPage from './pages/AboutPage'
import ContactPage from './pages/ContactPage'


const ProtectedRoute = ({ children }) => {
  const { isLoggedIn } = useAuth()
  return isLoggedIn ? children : <Navigate to="/login" />
}


const AdminRoute = ({ children }) => {
  const { isLoggedIn, isAdmin } = useAuth()
  if (!isLoggedIn) return <Navigate to="/login" />
  if (!isAdmin) return <Navigate to="/problems" />
  return children
}

const Layout = ({ children }) => (
  <>
    <Navbar />
    <main>{children}</main>
  </>
)

function App() {
  return (
    <Routes>
      <Route path="/login" element={<LoginPage />} />
      <Route path="/register" element={<RegisterPage />} />
      <Route path="/" element={<LandingPage />} />
      <Route path="/about" element={<AboutPage />} />
      <Route path="/contact" element={<ContactPage />} />
      <Route path="/problems" element={
        <ProtectedRoute>
          <Layout><ProblemListPage /></Layout>
        </ProtectedRoute>
      } />
      <Route path="/problems/:id" element={
        <ProtectedRoute>
          <Layout><ProblemDetailPage /></Layout>
        </ProtectedRoute>
      } />
      <Route path="/profile/:username" element={
        <ProtectedRoute>
          <Layout><ProfilePage /></Layout>
        </ProtectedRoute>
      } />
      <Route path="/leaderboard" element={
        <ProtectedRoute>
          <Layout><LeaderboardPage /></Layout>
        </ProtectedRoute>
      } />
      <Route path="/admin" element={
        <AdminRoute>
          <Layout><AdminPage /></Layout>
        </AdminRoute>
      } />
      <Route path="/admin/problems/create" element={
        <AdminRoute>
          <Layout><CreateProblemPage /></Layout>
        </AdminRoute>
      } />
      <Route path="/contests" element={
        <ProtectedRoute>
          <Layout><ContestListPage /></Layout>
        </ProtectedRoute>
      } />
      <Route path="/contests/:id" element={
        <ProtectedRoute>
          <Layout><ContestDetailPage /></Layout>
        </ProtectedRoute>
      } />
      <Route path="/contests/:id/problems/:problemId" element={
        <ProtectedRoute>
          <Layout><ContestProblemPage /></Layout>
        </ProtectedRoute>
      } />
      <Route path="/contests/:id/scoreboard" element={
        <ProtectedRoute>
          <Layout><ContestScoreboardPage /></Layout>
        </ProtectedRoute>
      } />
      <Route path="/settings" element={
        <ProtectedRoute>
          <Layout><SettingsPage /></Layout>
        </ProtectedRoute>
      } />
    </Routes>
  )
}

export default App