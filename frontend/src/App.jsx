
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import LoginPage from './pages/LoginPage';
import FeedPage from './pages/FeedPage';
import Layout from './components/Layout';
import ProfilePage from './pages/Profile';
import AdminPage from './pages/AdminPage';
import WeeklyPlanPage from './pages/WeeklyPlanPage';
import JournalPage from './pages/JournalPage';

function App() {
  return (
    <Router>
      <AuthProvider>
        <Routes>
          <Route path="/login" element={<LoginPage />} />
          <Route path="/" element={<Layout />}>
            <Route index element={<FeedPage />} />
            <Route path="profile" element={<ProfilePage />} />
            <Route path="weekly-plan" element={<WeeklyPlanPage />} />
            <Route path="journal" element={<JournalPage />} />
            <Route path="admin" element={<AdminPage />} />
            {/* Add Journal, Todo routes here */}
          </Route>
        </Routes>
      </AuthProvider>
    </Router>
  );
}

export default App;
