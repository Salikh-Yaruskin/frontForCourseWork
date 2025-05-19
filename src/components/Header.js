// src/Header.js
import React, { useContext } from 'react';
import { AuthContext } from './AuthContext';

export default function Header({ pageTitle, logoSrc }) {
  const { role, setView } = useContext(AuthContext);

  return (
    <header className="App-header d-flex justify-content-between align-items-center px-4">
      <div className="d-flex align-items-center">
        <img src={logoSrc} className="App-logo" alt="logo" />
        <h1 className="App-title ml-3">{pageTitle}</h1>
      </div>

      {role === 'ADMIN' && (
        <nav>
          <button
            className="btn btn-sm btn-light mr-2"
            onClick={() => setView('manageUsers')}
          >
            Управление пользователями
          </button>
          <button
            className="btn btn-sm btn-light mr-2"
            onClick={() => setView('managerFaculties')}
            >
            Управление Факультетами
          </button>
          <button
            className="btn btn-sm btn-light mr-2"
            onClick={() => setView('managerDepartments')}
            >
            Управление кафедрами
          </button>
          <button
            className="btn btn-sm btn-light mr-2"
            onClick={() => setView('managerCategories')}
            >
            Управление категориями
          </button>
          <button
            className="btn btn-sm btn-light mr-2"
            onClick={() => setView('managerCourses')}
            >
            Создание курса
          </button>
        </nav>
      )}
      {role === "TEACHER" && (
        <nav>
          <button
            className="btn btn-sm btn-light mr-2"
            onClick={() => setView('manageProfile')}
          >
            Профиль
          </button>
        </nav>
      )}
    </header>
  );
}
