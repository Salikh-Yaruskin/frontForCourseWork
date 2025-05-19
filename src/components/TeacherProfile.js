import React, { useEffect, useState } from 'react';
import { request } from '../helpers/axios_helper';

const TeacherProfile = () => {
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    request('GET', '/api/v1/users/me')
      .then(res => setProfile(res.data))
      .catch(err => setError(err))
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <p>Загрузка профиля…</p>;
  if (error) return <p className="text-danger">Ошибка: {error.message}</p>;

  return (
    <div className="card mx-auto" style={{ maxWidth: 500 }}>
      <div className="card-header">
        <h5 className="mb-0">Профиль</h5>
      </div>
      <ul className="list-group list-group-flush">
        <li className="list-group-item">
          <strong>Имя:</strong> {profile.username}
        </li>
        <li className="list-group-item">
          <strong>Почта:</strong> {profile.email}
        </li>
        <li className="list-group-item">
          <strong>Должность:</strong> {profile.role}
        </li>
        <li className="list-group-item">
          <strong>Кафедра: </strong> {profile.departmentName}
        </li>
      </ul>
    </div>
  );
}

export default TeacherProfile