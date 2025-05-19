import React, { useEffect, useState, useRef, useMemo  } from 'react';
import { request } from "../helpers/axios_helper";
import Modal from 'bootstrap/js/dist/modal';

function DepartmentListPage() {
  const [departments, setDepartments] = useState([]);
  const [error, setError] = useState(null);
  const [departmentsLoading, setDepartmentsLoading] = useState(false);
  const [facultiesLoading, setFacultiesLoading] = useState(false);

  const [faculties, setFaculties] = useState([]);
  const [departmentName, setDepartmentName] = useState('');
  const [facultyName, setFacultyName] = useState('');
  const [facultyId, setFacultyId] = useState('');
  const [editingId, setEditingId] = useState(null);

  const [creating, setCreating] = useState(false);
  const [updating, setUpdating] = useState(false);

  const modalRef = useRef(null);
  const modalInstanceRef = useRef(null);

  useEffect(() => {
    fetchDepartments();
    fetchFaculties();

    if (modalRef.current && !modalInstanceRef.current) {
      modalInstanceRef.current = new Modal(modalRef.current, {
        backdrop: 'static',
        keyboard: true
      });
    }
  }, []);

  const fetchDepartments = () => {
    setDepartmentsLoading(true);
    request('GET', "/api/v1/university/departments")
      .then(res => setDepartments(res.data))
      .catch(err => setError(err))
      .finally(() => setDepartmentsLoading(false));
  };

  const fetchFaculties = () => {
    setFacultiesLoading(true);
    request('GET', "/api/v1/university/faculties")
      .then(res => setFaculties(res.data))
      .catch(err => setError(err))
      .finally(() => setFacultiesLoading(false));
  };

  const facultyLookup = useMemo(() => {
    return faculties.reduce((acc, f) => {
      acc[f.id] = f.facultyName;
      return acc;
    }, {});
  }, [faculties]);

  const handletEditClick = (department) => {
    setEditingId(department.id);
    setDepartmentName(department.departmentName);
    setFacultyName(department.facultyName);
    setFacultyId(department.facultyId);
    openModal();
  }

  const openModal = () => {
    if (modalRef.current) {
      fetchFaculties()
      modalInstanceRef.current = new Modal(modalRef.current);
      modalInstanceRef.current.show();
    }
  };

  const resetForm = () => {
    setDepartmentName('');
    setFacultyName('');
    setEditingId(null);
    setCreating(false);
    setUpdating(false);
    closeModal();
  };

  const closeModal = () => modalInstanceRef.current?.hide();

  const handleCreateDepartment = () => {
    setCreating(true);
    request('POST', "/api/v1/admin/university/departments", { departmentName, facultyName })
      .then(() => {
        fetchDepartments();
        closeModal();
      })
      .catch(err => setError(err))
      .finally(() => setCreating(false));
  };

  const handletUpdateDepartment = () => {
    if (!editingId) return;
    setUpdating(true);
    request('PUT', `/api/v1/admin/university/departments/${editingId}`, { departmentName, facultyName })
      .then(() => {
        fetchDepartments();
        resetForm();
      })
      .catch(err => {
        console.error('Ошибка при обновлении кафедры:', err);
      });
  }

  const handlerDeleteDepartment = (id) => {
    if (!window.confirm('Вы уверены, что хотите удалить эту кафедру?')) return;
    request("DELETE", `/api/v1/admin/university/departments/${id}`)
      .then(fetchDepartments)
      .catch(err => console.error('Ошибка при удалении кафедры:', err));
  }

  if (departmentsLoading) return <p>Загрузка списка кафедр...</p>;
  if (error) return <p className="text-danger">Ошибка: {error.message}</p>;

  return (
    <>
      <h2>Список Кафедр</h2>

      <button className="btn btn-primary mb-3" onClick={openModal}>
        Создать кафедру
      </button>

      <table className='table table-striped'>
        <thead>
          <tr>
            <th>Id</th>
            <th>Название кафедры</th>
            <th>Факультет</th>
            <th>Действия</th>
          </tr>
        </thead>
        <tbody>
          {departments.map(d => (
            <tr key={d.id}>
              <td>{d.id}</td>
              <td>{d.departmentName}</td>
              <td>
                {facultyLookup[d.facultyId]
                  ? facultyLookup[d.facultyId]
                  : d.facultyId}
              </td>
              <td>
                <button className="btn btn-sm btn-primary me-2" onClick={() => handletEditClick(d)}>
                  Изменить
                </button>
                <button className='btn btn-sm btn-danger' onClick={() => handlerDeleteDepartment(d.id)}>Удалить</button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>

      <div
        className="modal fade"
        ref={modalRef}
        id="departmentModal"
        tabIndex="-1"
        aria-labelledby="departmentModalLabel"
        aria-hidden="true"
      >
        <div className="modal-dialog">
          <div className="modal-content">
            <div className="modal-header">
              <h5 className='modal-title' id="departmentModalLabel">Создать кафедру</h5>
              <button
                type="button"
                className="btn-close"
                onClick={closeModal}
                aria-label="Закрыть"
              />
            </div>
            <div className="modal-body">
              {facultiesLoading ? (
                <p>Загрузка списка факультетов...</p>
              ) : (
                <>
                  <div className='mb-3'>
                    <label htmlFor="departmentName" className="form-label">Название кафедры</label>
                    <input
                      type="text"
                      id="departmentName"
                      className="form-control"
                      value={departmentName}
                      onChange={e => setDepartmentName(e.target.value)}
                    />
                  </div>
                  <div className="mb-3">
                    <label htmlFor="facultySelect" className="form-label">Факультет</label>
                    <select
                      id="facultySelect"
                      className='form-control'
                      value={facultyName}
                      onChange={e => setFacultyName(e.target.value)}
                    >
                      <option value="">-- Выберите кафедру --</option>
                      {faculties.map(f => (
                        <option key={f.id} value={f.facultyName}>{f.facultyName}</option>
                      ))}
                    </select>
                  </div>
                </>
              )}
            </div>
            <div className="modal-footer">
              <button
                type="button"
                className="btn btn-secondary"
                data-bs-dismiss="modal"
                onClick={resetForm}
              >
                Отменить
              </button>
              <button
                type="button"
                className="btn btn-primary"
                onClick={editingId ? handletUpdateDepartment : handleCreateDepartment}
                disabled={creating || updating}
              >
                {editingId ? (updating ? 'Сохранение...' : 'Сохранить') : (creating ? 'Сохранение...' : 'Создать')}
              </button>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default DepartmentListPage;