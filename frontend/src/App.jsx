
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import LoginPage from './pages/LoginPage';
import FeedPage from './pages/FeedPage';
import ChatPage from './pages/ChatPage';
import Layout from './components/Layout';
import ProfilePage from './pages/Profile';
import AdminPage from './pages/AdminPage';

function App() {
  return (
    <Router>
      <AuthProvider>
        <Routes>
          <Route path="/login" element={<LoginPage />} />
          <Route path="/" element={<Layout />}>
            <Route index element={<FeedPage />} />
            <Route path="chat" element={<ChatPage />} />
            <Route path="profile" element={<ProfilePage />} />
            <Route path="admin" element={<AdminPage />} />
            {/* Add Journal, Todo routes here */}
          </Route>
        </Routes>
      </AuthProvider>
    </Router>
  );
}

export default App;
