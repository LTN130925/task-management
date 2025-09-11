import { Avatar, Dropdown, Layout, Menu, Space } from 'antd';
import { Link, Route, Routes, useLocation, useNavigate } from 'react-router-dom';
import Login from './pages/Login';
import TasksList from './pages/TasksList';
import ProjectsList from './pages/ProjectsList';
import Profile from './pages/Profile';
import ProtectedRoute from './components/ProtectedRoute';
import { getAccessToken, clearAuth } from './store/auth';
import Register from './pages/Register';
import ForgotPassword from './pages/ForgotPassword';
import Otp from './pages/Otp';
import ResetPassword from './pages/ResetPassword';
import { useEffect, useState } from 'react';
import { getProfile } from './api/user';

const { Header, Content } = Layout;

export default function App() {
  const location = useLocation();
  const navigate = useNavigate();
  const token = getAccessToken();
  const [user, setUser] = useState<any>();

  const selectedKey = location.pathname.startsWith('/tasks')
    ? 'tasks'
    : location.pathname.startsWith('/projects')
    ? 'projects'
    : '';

  useEffect(() => {
    (async () => {
      if (!token) {
        setUser(undefined);
        return;
      }
      try {
        const res = await getProfile();
        setUser(res.data);
      } catch (_) {
        // ignore
      }
    })();
  }, [token]);

  return (
    <Layout style={{ minHeight: '100vh' }}>
      <Header style={{ display: 'flex', alignItems: 'center' }}>
        <div style={{ color: '#fff', fontWeight: 600, marginRight: 24 }}>Task Management</div>
        <Menu
          theme="dark"
          mode="horizontal"
          selectedKeys={[selectedKey]}
          style={{ flex: 1 }}
          items={[
            { key: 'tasks', label: <Link to="/tasks">Tasks</Link> },
            { key: 'projects', label: <Link to="/projects">Projects</Link> },
          ]}
        />
        {token ? (
          <Dropdown
            menu={{
              items: [
                {
                  key: 'profile',
                  label: <Link to="/profile">Hồ sơ cá nhân</Link>,
                },
                {
                  type: 'divider',
                },
                {
                  key: 'logout',
                  label: (
                    <a
                      onClick={() => {
                        clearAuth();
                        navigate('/login');
                      }}
                    >
                      Đăng xuất
                    </a>
                  ),
                },
              ],
            }}
            placement="bottomRight"
          >
            <Space style={{ color: '#fff', cursor: 'pointer' }}>
              <Avatar size={32} src={user?.avatar} />
              <span>{user?.fullName || 'User'}</span>
            </Space>
          </Dropdown>
        ) : (
          <Link to="/login" style={{ color: '#fff' }}>
            Login
          </Link>
        )}
      </Header>
      <Content style={{ padding: 24 }}>
        <Routes>
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route path="/forgot" element={<ForgotPassword />} />
          <Route path="/otp" element={<Otp />} />

          <Route
            path="/tasks"
            element={
              <ProtectedRoute>
                <TasksList />
              </ProtectedRoute>
            }
          />
          <Route
            path="/projects"
            element={
              <ProtectedRoute>
                <ProjectsList />
              </ProtectedRoute>
            }
          />
          <Route
            path="/profile"
            element={
              <ProtectedRoute>
                <Profile />
              </ProtectedRoute>
            }
          />
          <Route
            path="/reset"
            element={
              <ProtectedRoute>
                <ResetPassword />
              </ProtectedRoute>
            }
          />
          <Route path="*" element={<Login />} />
        </Routes>
      </Content>
    </Layout>
  );
}
