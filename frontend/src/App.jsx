import { Routes, Route, Navigate } from 'react-router-dom'
import { useAuth } from './context/AuthContext'
import Navbar from './components/Navbar'
import LoginPage from './pages/LoginPage'
import RegisterPage from './pages/RegisterPage'
import ProblemListPage from './pages/ProblemListPage'
import ProblemDetailPage from './pages/ProblemDetailPage'

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
      <Route path="/" element={<Navigate to="/problems" />} />
      <Route path="/problems" element={
        <ProtectedRoute>
          <Layout>
            <ProblemListPage />
          </Layout>
        </ProtectedRoute>
      } />
      <Route path="/problems/:id" element={
        <ProtectedRoute>
          <Layout>
            <ProblemDetailPage />
          </Layout>
        </ProtectedRoute>
      } />
    </Routes>
  )
}

export default App