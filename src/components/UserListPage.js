import React, { useEffect, useState, useMemo } from 'react';
import { request } from '../helpers/axios_helper';

export default function UsersList() {
  const [users, setUsers] = useState([]);
  const [loadingUsers, setLoadingUsers] = useState(true);
  const [errorUsers, setErrorUsers] = useState(null);

  const [departments, setDepartments] = useState([]);
  const [loadingDepts, setLoadingDepts] = useState(true);
  const [errorDepts, setErrorDepts] = useState(null);

  const [filterDept, setFilterDept] = useState('');

  const [page, setPage] = useState(0);
  const [size] = useState(10);
  const [totalPages, setTotalPages] = useState(0);
  const [totalElements, setTotalElements] = useState(0);
  const [sortField, setSortField] = useState('username');
  const [sortDir, setSortDir] = useState('asc');

  const [modalEditOpen, setModalEditOpen] = useState(false);
  const [modalUser, setModalUser] = useState(null);
  const [editUsername, setEditUsername] = useState('');
  const [editEmail, setEditEmail] = useState('');
  const [editRole, setEditRole] = useState('TEACHER');
  const [editDept, setEditDept] = useState('');

  const [modalCreateOpen, setModalCreateOpen] = useState(false);
  const [newUser, setNewUser] = useState({ username: '', email: '', password: '' });
  const [createLoading, setCreateLoading] = useState(false);
  const [createError, setCreateError] = useState(null);

  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    fetchDepartmentsList();
  }, []);

  useEffect(() => {
    if (filterDept) {
      fetchDepartmentUsers(filterDept, page);
    } else {
      fetchUsers(page);
    }
  }, [filterDept, page, sortField, sortDir, searchQuery]);

  const fetchUsers = (pageNumber = 0) => {
    setLoadingUsers(true);
    setErrorUsers(null);

    const url = `/api/v1/admin/users`
      + `?page=${pageNumber}`
      + `&size=${size}`
      + `&sort=${sortField},${sortDir}`
      + `&search=${encodeURIComponent(searchQuery)}`;

    request('GET', url)
      .then(res => {
        setUsers(res.data.content);
        setTotalPages(res.data.totalPages);
        setTotalElements(res.data.totalElements);
      })
      .catch(err => setErrorUsers(err))
      .finally(() => setLoadingUsers(false));
  };

  const changeSort = (field) => {
    if (field === sortField) {
      setSortDir(prev => prev === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortDir('asc');
    }
    setPage(0);
  };

  const fetchDepartmentUsers = (deptId, pageNumber = 0) => {
    setLoadingUsers(true);
    setErrorUsers(null);

    const url = `/api/v1/university/departments/${deptId}/users`
      + `?page=${pageNumber}`
      + `&size=${size}`
      + `&sort=${sortField},${sortDir}`
      + `&search=${encodeURIComponent(searchQuery)}`;

    request('GET', url)
      .then(res => {
        setUsers(res.data.content);
        setTotalPages(res.data.totalPages);
        setTotalElements(res.data.totalElements);
      })
      .catch(err => setErrorUsers(err))
      .finally(() => setLoadingUsers(false));
  };

  const fetchDepartmentsList = () => {
    setLoadingDepts(true);
    setErrorDepts(null);
    request('GET', '/api/v1/university/departments')
      .then(res => setDepartments(res.data))
      .catch(err => setErrorDepts(err))
      .finally(() => setLoadingDepts(false));
  };

  const deptLookup = useMemo(() => {
    return departments.reduce((acc, d) => {
      acc[d.id] = d.departmentName;
      return acc;
    }, {});
  }, [departments]);

  const deleteUser = (username) => {
    if (!window.confirm(`Вы уверены, что хотите удалить "${username}"?`)) return;
    request('DELETE', `/api/v1/admin/users/${username}`)
      .then(() => setUsers(prev => prev.filter(u => u.username !== username)))
      .catch(err => alert(`Ошибка при удалении: ${err.message}`));
  };

  const openEditModal = (user) => {
    setModalUser(user);
    setEditUsername(user.username);
    setEditEmail(user.email);
    setEditRole(user.role);
    setEditDept(user.departmentId?.toString() || '');
    setModalEditOpen(true);
  };

  const closeEditModal = () => {
    setModalEditOpen(false);
    setModalUser(null);
  };

  const saveUser = () => {
    if (!modalUser) return;
    const payload = {
      username: editUsername,
      email: editEmail,
      role: editRole,
      departmentId: Number(editDept)
    };
    request(
      'PUT',
      `/api/v1/admin/users/${modalUser.username}/department`,
      payload
    )
      .then(res => {
        setUsers(prev => prev.map(u => u.username === modalUser.username ? res.data : u));
        closeEditModal();
      })
      .catch(err => alert(`Не удалось сохранить: ${err.message}`));
  };

  const openCreateModal = () => {
    setNewUser({ username: '', email: '', password: '' });
    setCreateError(null);
    setModalCreateOpen(true);
  };
  const closeCreateModal = () => setModalCreateOpen(false);

  const createTeacher = () => {
    setCreateLoading(true);
    setCreateError(null);
    request(
      'POST',
      '/api/v1/users/register',
      { ...newUser },
      { responseType: 'text', transformResponse: [data => data] }
    )
      .then(() => {
        setCreateLoading(false);
        closeCreateModal();
        if (filterDept) fetchDepartmentUsers(filterDept);
        else fetchUsers(page);
      })
      .catch(err => {
        setCreateLoading(false);
        setCreateError(err);
      });
  };

  return (
    <>
      <h2>Список пользователей</h2>
      <div className="d-flex mb-3 align-items-center">
        <button className="btn btn-success me-3" onClick={openCreateModal}>
          Создать учителя
        </button>
        <input
          type="text"
          className="form-control me-3"
          style={{ maxWidth: 200 }}
          placeholder="Поиск…"
          value={searchQuery}
          onChange={e => {
            setSearchQuery(e.target.value);
            setPage(0);
          }}
        />
        <div>
          {!loadingDepts && !errorDepts && (
            <select
              className="form-select"
              value={filterDept}
              onChange={e => { setFilterDept(e.target.value); setPage(0); }}
            >
              <option value="">-- Все кафедры --</option>
              {departments.map(d => (
                <option key={d.id} value={d.id}>{d.departmentName}</option>
              ))}
            </select>
          )}
        </div>
      </div>

      {loadingUsers ? (
        <p>Загрузка списка пользователей…</p>
      ) : errorUsers ? (
        <p className="text-danger">Ошибка: {errorUsers.message}</p>
      ) : (
        <>
          <table className="table table-striped">
            <thead>
              <tr>
                <th onClick={() => changeSort('username')} style={{ cursor: 'pointer' }}>
                  Username {sortField === 'username' ? (sortDir === 'asc' ? '↑' : '↓') : ''}
                </th>
                <th onClick={() => changeSort('email')} style={{ cursor: 'pointer' }}>
                  Email {sortField === 'email' ? (sortDir === 'asc' ? '↑' : '↓') : ''}
                </th>
                <th>Role</th>
                <th>Department</th>
                <th>Действия</th>
              </tr>
            </thead>
            <tbody>
              {users.map(u => (
                <tr key={u.username}>
                  <td>{u.username}</td>
                  <td>{u.email}</td>
                  <td>{u.role}</td>
                  <td>{u.departmentId != null ? deptLookup[u.departmentId] || '—' : '—'}</td>
                  <td>
                    {u.role === 'TEACHER' ? (
                      <>
                        <button className="btn btn-sm btn-primary me-2" onClick={() => openEditModal(u)}>Изменить</button>
                        <button className="btn btn-sm btn-danger" onClick={() => deleteUser(u.username)}>Удалить</button>
                      </>
                    ) : (
                      <span className="text-muted">—</span>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          {totalPages > 1 && (
            <nav aria-label="Page navigation">
              <ul className="pagination justify-content-center">
                <li className={`page-item ${page === 0 ? 'disabled' : ''}`}>
                  <button className="page-link" onClick={() => setPage(prev => prev - 1)}>Previous</button>
                </li>
                <li className="page-item disabled">
                  <span className="page-link">Стр. {page + 1} из {totalPages}</span>
                </li>
                <li className={`page-item ${page + 1 === totalPages ? 'disabled' : ''}`}>
                  <button className="page-link" onClick={() => setPage(prev => prev + 1)}>Next</button>
                </li>
              </ul>
            </nav>
          )}
        </>
      )}

      {modalEditOpen && (
        <>
          <div className="modal-backdrop show"></div>
          <div className="modal show" style={{ display: 'block' }} tabIndex="-1">
            <div className="modal-dialog">
              <div className="modal-content">
                <div className="modal-header">
                  <h5 className="modal-title">Изменить пользователя</h5>
                </div>
                <div className="modal-body">
                  {loadingDepts && <p>Загрузка департаментов…</p>}
                  {errorDepts && <p className="text-danger">Ошибка: {errorDepts.message}</p>}
                  {!loadingDepts && !errorDepts && (
                    <>
                      <div className="mb-3">
                        <label>Username</label>
                        <input type="text" className="form-control" value={editUsername} onChange={e => setEditUsername(e.target.value)} />
                      </div>
                      <div className="mb-3">
                        <label>Email</label>
                        <input type="email" className="form-control" value={editEmail} onChange={e => setEditEmail(e.target.value)} />
                      </div>
                      <div className="mb-3">
                        <label>Role</label>
                        <select className="form-select" value={editRole} onChange={e => setEditRole(e.target.value)}>
                          <option value="ADMIN">ADMIN</option>
                          <option value="TEACHER">TEACHER</option>
                        </select>
                      </div>
                      <div className="mb-3">
                        <label>Department</label>
                        <select className="form-select" value={editDept} onChange={e => setEditDept(e.target.value)}>
                          <option value="" disabled hidden>--Кафедра--</option>
                          {departments.map(d => (
                            <option key={d.id} value={d.id}>{d.departmentName}</option>
                          ))}
                        </select>
                      </div>
                    </>
                  )}
                </div>
                <div className="modal-footer">
                  <button className="btn btn-secondary" onClick={closeEditModal}>Отмена</button>
                  <button className="btn btn-primary" onClick={saveUser} disabled={loadingDepts}>Сохранить</button>
                </div>
              </div>
            </div>
          </div>
        </>
      )}

      {modalCreateOpen && (
        <>
          <div className="modal-backdrop show"></div>
          <div className="modal show" style={{ display: 'block' }} tabIndex="-1">
            <div className="modal-dialog">
              <div className="modal-content">
                <div className="modal-header">
                  <h5 className="modal-title">Создать учителя</h5>
                </div>
                <div className="modal-body">
                  {createError && <p className="text-danger">Ошибка: {createError.message}</p>}
                  <div className="mb-3">
                    <label>Username</label>
                    <input type="text" className="form-control" value={newUser.username} onChange={e => setNewUser(prev => ({ ...prev, username: e.target.value }))} />
                  </div>
                  <div className="mb-3">
                    <label>Email</label>
                    <input type="email" className="form-control" value={newUser.email} onChange={e => setNewUser(prev => ({ ...prev, email: e.target.value }))} />
                  </div>
                  <div className="mb-3">
                    <label>Password</label>
                    <input type="password" className="form-control" value={newUser.password} onChange={e => setNewUser(prev => ({ ...prev, password: e.target.value }))} />
                  </div>
                </div>
                <div className="modal-footer">
                  <button className="btn btn-secondary" onClick={closeCreateModal}>Отмена</button>
                  <button className="btn btn-success" onClick={createTeacher} disabled={createLoading}>{createLoading ? 'Создание...' : 'Создать'}</button>
                </div>
              </div>
            </div>
          </div>
        </>
      )}
    </>
  );
}
