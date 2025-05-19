import React, { useEffect, useState, useRef } from 'react';
import { request } from '../helpers/axios_helper';
import Modal from 'bootstrap/js/dist/modal';

function FacultiesListPage() {
  const [faculties, setFaculties] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const [facultyName, setFacultyName] = useState('');
  const [phoneNumber, setPhoneNumber] = useState('');
  const [email, setEmail] = useState('');
  const [editingId, setEditingId] = useState(null);
  const [creating, setCreating] = useState(false);
  const [updating, setUpdating] = useState(false);

  const modalRef = useRef(null);
  const modalInstanceRef = useRef(null);

  useEffect(() => {
    fetchFaculties();
  }, []);

  useEffect(() => {
    if (modalRef.current && !modalInstanceRef.current) {
      modalInstanceRef.current = new Modal(modalRef.current);
    }
  }, []);

  const fetchFaculties = () => {
    setLoading(true);
    request('GET', 'api/v1/university/faculties')
      .then(res => setFaculties(res.data))
      .catch(err => setError(err))
      .finally(() => setLoading(false));
  };

  const openModal = () => {
    if (modalRef.current) {
      modalInstanceRef.current = new Modal(modalRef.current);
      modalInstanceRef.current.show();
    }
  };
  const closeModal = () => modalInstanceRef.current?.hide();

  const resetForm = () => {
    setFacultyName('');
    setPhoneNumber('');
    setEmail('');
    setEditingId(null);
    setCreating(false);
    setUpdating(false);
    closeModal();
  };

  const handleCreateFaculty = () => {
    setCreating(true);
    request('POST', 'api/v1/admin/university/faculties', { facultyName, phoneNumber, email })
      .then(() => {
        fetchFaculties();
        resetForm();
      })
      .catch(err => {
        console.error('Ошибка при создании факультета:', err);
      });
  };

  const handleEditClick = (faculty) => {
    setEditingId(faculty.id);
    setFacultyName(faculty.facultyName);
    setPhoneNumber(faculty.phoneNumber);
    setEmail(faculty.email);
    openModal();
  };

  const handleUpdateFaculty = () => {
    if (!editingId) return;
    setUpdating(true);
    request('PUT', `api/v1/admin/university/faculties/${editingId}`, { facultyName, phoneNumber, email })
      .then(() => {
        fetchFaculties();
        resetForm();
      })
      .catch(err => {
        console.error('Ошибка при обновлении факультета:', err);
      });
  };

  const handleDeleteFaculty = (id) => {
    if (!window.confirm('Вы уверены, что хотите удалить этот факультет?')) return;
    request('DELETE', `api/v1/admin/university/faculties/${id}`)
      .then(fetchFaculties)
      .catch(err => console.error('Ошибка при удалении факультета:', err));
  };

  if (loading) return <p>Загрузка списка факультетов...</p>;
  if (error) return <p className="text-danger">Ошибка: {error.message}</p>;

  return (
    <>
      <h2>Список факультетов</h2>
      <button className="btn btn-primary mb-3" onClick={() => { resetForm(); openModal(); }}>
        Создать факультет
      </button>

      <table className="table table-striped">
        <thead>
          <tr>
            <th>Id</th>
            <th>Факультет</th>
            <th>Контактный телефон</th>
            <th>Почта</th>
            <th>Действия</th>
          </tr>
        </thead>
        <tbody>
          {faculties.map(f => (
            <tr key={f.id}>
              <td>{f.id}</td>
              <td>{f.facultyName}</td>
              <td>{f.phoneNumber}</td>
              <td>{f.email}</td>
              <td>
                <button className="btn btn-sm btn-primary me-2" onClick={() => handleEditClick(f)}>
                  Изменить
                </button>
                <button className="btn btn-sm btn-danger" onClick={() => handleDeleteFaculty(f.id)}>
                  Удалить
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>

      <div className="modal fade" ref={modalRef} id="facultyModal" tabIndex="-1" aria-labelledby="facultyModalLabel" aria-hidden="true">
        <div className="modal-dialog">
          <div className="modal-content">
            <div className="modal-header">
              <h5 className="modal-title" id="facultyModalLabel">
                {editingId ? `Изменить факультет #${editingId}` : 'Создать факультет'}
              </h5>
              <button type="button" className="btn-close" onClick={closeModal} aria-label="Закрыть" />
            </div>
            <div className="modal-body">
              {editingId && (
                <div className="mb-3">
                  <label htmlFor="facultyId" className="form-label">ID</label>
                  <input
                    type="text"
                    id="facultyId"
                    className="form-control"
                    value={editingId}
                    readOnly
                  />
                </div>
              )}
              <div className="mb-3">
                <label htmlFor="facultyName" className="form-label">Название факультета</label>
                <input type="text" id="facultyName" name="facultyName" autoComplete="organization" className="form-control" value={facultyName} onChange={e => setFacultyName(e.target.value)} />
              </div>
              <div className="mb-3">
                <label htmlFor="phoneNumber" className="form-label">Контактный телефон</label>
                <input type="tel" id="phoneNumber" name="phoneNumber" autoComplete="tel" className="form-control" value={phoneNumber} onChange={e => setPhoneNumber(e.target.value)} />
              </div>
              <div className="mb-3">
                <label htmlFor="email" className="form-label">Почта</label>
                <input type="email" id="email" name="email" autoComplete="email" className="form-control" value={email} onChange={e => setEmail(e.target.value)} />
              </div>
            </div>
            <div className="modal-footer">
              <button type="button" className="btn btn-secondary" onClick={resetForm}>Отменить</button>
              <button
                type="button"
                className="btn btn-primary"
                onClick={editingId ? handleUpdateFaculty : handleCreateFaculty}
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
}

export default FacultiesListPage;
