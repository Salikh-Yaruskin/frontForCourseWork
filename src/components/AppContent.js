import React, { useContext } from 'react';
import { jwtDecode } from 'jwt-decode';

import WelcomeContent from './WelcomeContent';
import LoginForm from './LoginForm';
import Buttons from './Buttons';
import AdminPage from './AdminPage';
import TeacherPage from './TeacherPage';
import TeacherProfile from './TeacherProfile';
import UserListPage from './UserListPage';
import FacultiesListPage from './FacultiesListPage';
import DepartmentListPage from './DepartmentListPage';
import CategoriesPage from './CategoriesPage';
import CreateCoursePage from './CreateCoursePage';

import { request, setAuthHeader } from '../helpers/axios_helper';
import { AuthContext } from './AuthContext';

export default function AppContent() {
  const { role, setRole, view, setView } = useContext(AuthContext);

  const login = () => setView('login');
  const logout = () => {
    setAuthHeader(null);
    setRole(null);
    setView('welcome');
  };
  const onLogin = (e, username, password) => {
    e.preventDefault();
    request('POST', '/api/v1/auth/token', { username, password })
      .then(res => {
        const token = res.data;
        setAuthHeader(token);
        const { role: userRole } = jwtDecode(token);
        setRole(userRole);
        setView('messages');
      })
      .catch(() => logout());
  };

  return (
    <div>
      <Buttons login={login} logout={logout} />

      {view === 'welcome' && <WelcomeContent />}
      {view === 'login' && <LoginForm onLogin={onLogin} />}
      {view === 'messages' && role === 'ADMIN' && <AdminPage />}
      {view === 'messages' && role === 'TEACHER' && <TeacherPage />}
      {view === 'manageUsers' && role === 'ADMIN' && <UserListPage />}
      {view === 'managerFaculties' && role === 'ADMIN' && <FacultiesListPage />}
      {view === 'managerDepartments' && role === 'ADMIN' && <DepartmentListPage />}
      {view === 'managerCategories' && role === 'ADMIN' && <CategoriesPage />}
      {view === "manageProfile" && role === 'TEACHER' && <TeacherProfile />}
      {view === "managerCourses" && role === 'ADMIN' && <CreateCoursePage />}

    </div>
  );
}
