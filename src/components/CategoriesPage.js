import React, { useEffect, useState } from 'react'
import { request } from "../helpers/axios_helper";

const CategoriesPage = () => {
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const [newName, setNewName] = useState('');
  const [editId, setEditId] = useState(null);
  const [editName, setEditName] = useState('');

  useEffect(() => {
    fetchCategories();
  }, []);

  const fetchCategories = () => {
    setLoading(true);
    setError(null);
    request("GET", `/api/v1/courses/categories`)
      .then(res => setCategories(res.data))
      .catch(err => setError(err))
      .finally(() => setLoading(false));
  };

  const createCategory = () => {
    if (!newName.trim()) return;
    request('POST', 'api/v1/admin/courses/categories', { name: newName })
      .then(() => {
        setNewName('');
        fetchCategories();
      })
      .catch(err => alert(`Ошибка при создании: ${err.message}`));
  };

  const startEdit = (c) => {
    setEditId(c.id);
    setEditName(c.name);
  };

  const saveEdit = () => {
    if (!editName.trim()) return;
    // Передаём name в строке запроса
    request(
      'PATCH',
      `/api/v1/admin/courses/categories/${editId}?name=${encodeURIComponent(editName)}`
    )
      .then(() => {
        setEditId(null);
        setEditName('');
        fetchCategories();
      })
      .catch(err => alert(`Ошибка при обновлении: ${err.message}`));
  };


  const deleteCategory = (id) => {
    if (!window.confirm('Удалить категорию?')) return;
    request('DELETE', `api/v1/admin/courses/categories/${id}`)
      .then(() => fetchCategories())
      .catch(err => alert(`Ошибка при удалении: ${err.message}`));
  };

  if (loading) return <p>Загрузка категорий…</p>;
  if (error) return <p className="text-danger">Ошибка: {error.message}</p>;

  return (
    <>
      <div className="d-flex mb-4">
        <input
          type="text"
          className="form-control me-2"
          placeholder="Новая категория"
          value={newName}
          onChange={e => setNewName(e.target.value)}
        />
        <button className="btn btn-success" onClick={createCategory}>
          Создать
        </button>
      </div>

      <h1 className="mb-4">Категории курсов</h1>
      <div className="row">
        {categories.map(c => (
          <div className="col-sm-6 col-md-4 col-lg-3 mb-4" key={c.id}>
            <div className="card h-100">
              <div className="card-body d-flex flex-column">
                {editId === c.id ? (
                  <>
                    <input
                      type="text"
                      className="form-control mb-2"
                      value={editName}
                      onChange={e => setEditName(e.target.value)}
                    />
                    <div className="d-flex gap-2 mt-auto">
                      <button
                        className="btn btn-primary btn-sm"
                        onClick={saveEdit}
                      >
                        Сохранить
                      </button>
                      <button
                        className="btn btn-secondary btn-sm"
                        onClick={() => setEditId(null)}
                      >
                        Отмена
                      </button>
                    </div>
                  </>
                ) : (
                  <>
                    <h5 className="card-title">{c.name}</h5>
                    <p className="card-text text-muted mt-auto">ID: {c.id}</p>
                    <div className="mt-3">
                      <button className="btn btn-sm btn-outline-primary me-2" onClick={() => startEdit(c)}>
                        Изменить
                      </button>
                      <button className="btn btn-sm btn-outline-danger" onClick={() => deleteCategory(c.id)}>
                        Удалить
                      </button>
                    </div>
                  </>
                )}
              </div>
            </div>
          </div>
        ))}
      </div>
    </>
  )
}

export default CategoriesPage