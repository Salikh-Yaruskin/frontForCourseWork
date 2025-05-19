import React, { useState, useEffect } from 'react';
import { request } from '../helpers/axios_helper';

export default function CreateCoursePage() {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [categoryId, setCategoryId] = useState('');
  const [published, setPublished] = useState(false);
  const [modules, setModules] = useState([
    { order: 1, title: '', content: '', tests: [
      { name: '', questions: [ { questionTitle: '', options: ['', ''], correctAnswer: 0 } ] }
    ] }
  ]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(false);

  // Fetch categories
  useEffect(() => {
    request('GET', '/api/v1/courses/categories')
      .then(res => setCategories(res.data))
      .catch(err => setError(err))
      .finally(() => setLoading(false));
  }, []);

  const handleAddModule = () => {
    setModules(prev => [
      ...prev,
      { order: prev.length + 1, title: '', content: '', tests: [
        { name: '', questions: [ { questionTitle: '', options: ['', ''], correctAnswer: 0 } ] }
      ] }
    ]);
  };

  const handleModuleChange = (idx, field, value) => {
    const updated = [...modules];
    updated[idx][field] = value;
    setModules(updated);
  };

  const handleAddTest = (moduleIdx) => {
    const updated = [...modules];
    updated[moduleIdx].tests.push({ name: '', questions: [ { questionTitle: '', options: ['', ''], correctAnswer: 0 } ] });
    setModules(updated);
  };

  const handleTestChange = (mIdx, tIdx, field, value) => {
    const updated = [...modules];
    updated[mIdx].tests[tIdx][field] = value;
    setModules(updated);
  };

  const handleAddQuestion = (mIdx, tIdx) => {
    const updated = [...modules];
    updated[mIdx].tests[tIdx].questions.push({ questionTitle: '', options: ['', ''], correctAnswer: 0 });
    setModules(updated);
  };

  const handleQuestionChange = (mIdx, tIdx, qIdx, field, value) => {
    const updated = [...modules];
    const question = updated[mIdx].tests[tIdx].questions[qIdx];
    if (field === 'options') {
      question.options = value;
    } else {
      question[field] = value;
    }
    setModules(updated);
  };

  const handleAddOption = (mIdx, tIdx, qIdx) => {
    const updated = [...modules];
    updated[mIdx].tests[tIdx].questions[qIdx].options.push('');
    setModules(updated);
  };

  const handleSubmit = e => {
    e.preventDefault();
    const payload = { title, description, categoryId, published, modules };
    request('POST', '/api/v1/admin/courses', payload)
      .then(() => {
        setSuccess(true);
        setError(null);
      })
      .catch(err => {
        setError(err);
        setSuccess(false);
      });
  };

  if (loading) return <p>Загрузка категорий…</p>;
  if (error) return <p className="text-danger">Ошибка: {error.message}</p>;

  return (
    <div className="container mt-4">
      <h2>Создать курс</h2>
      {success && <div className="alert alert-success">Курс успешно создан!</div>}
      <form onSubmit={handleSubmit}>
        <div className="form-group mb-3">
          <label>Название</label>
          <input type="text" className="form-control" value={title} onChange={e => setTitle(e.target.value)} required />
        </div>
        <div className="form-group mb-3">
          <label>Описание</label>
          <textarea className="form-control" value={description} onChange={e => setDescription(e.target.value)} required />
        </div>
        <div className="form-group mb-3">
          <label>Категория</label>
          <select className="form-control" value={categoryId} onChange={e => setCategoryId(e.target.value)} required>
            <option value="">-- Выберите категорию --</option>
            {categories.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
          </select>
        </div>

        {modules.map((mod, mIdx) => (
          <div key={mIdx} className="border p-3 mb-3">
            <h5>Модуль {mod.order}</h5>
            <div className="form-group mb-3">
              <label>Заголовок модуля</label>
              <input type="text" className="form-control" value={mod.title} onChange={e => handleModuleChange(mIdx, 'title', e.target.value)} required />
            </div>
            <div className="form-group mb-3">
              <label>Контент</label>
              <textarea className="form-control" value={mod.content} onChange={e => handleModuleChange(mIdx, 'content', e.target.value)} required />
            </div>
            <button type="button" className="btn btn-sm btn-secondary mb-2" onClick={() => handleAddTest(mIdx)}>+ Добавить тест</button>
            {mod.tests.map((test, tIdx) => (
              <div key={tIdx} className="border p-2 mb-2">
                <h6>Тест {tIdx + 1}</h6>
                <div className="form-group mb-3">
                  <label>Название теста</label>
                  <input type="text" className="form-control" value={test.name} onChange={e => handleTestChange(mIdx, tIdx, 'name', e.target.value)} required />
                </div>
                <button type="button" className="btn btn-sm btn-outline-secondary mb-2" onClick={() => handleAddQuestion(mIdx, tIdx)}>+ Вопрос</button>
                {test.questions.map((q, qIdx) => (
                  <div key={qIdx} className="p-2 mb-2" style={{ backgroundColor: '#f9f9f9' }}>
                    <div className="form-group">
                      <label>Вопрос</label>
                      <input type="text" className="form-control" value={q.questionTitle} onChange={e => handleQuestionChange(mIdx, tIdx, qIdx, 'questionTitle', e.target.value)} required />
                    </div>
                    {q.options.map((opt, oIdx) => (
                      <div key={oIdx} className="form-inline mb-1 ms-5">
                        <label className="mr-2">Опция {oIdx + 1}</label>
                        <input type="text" className="form-control mr-2" value={opt} onChange={e => {
                          const newOpts = [...q.options]; newOpts[oIdx] = e.target.value; handleQuestionChange(mIdx, tIdx, qIdx, 'options', newOpts);
                        }} required />
                        <div className="form-check">
                          <input className="form-check-input" type="radio" name={`correct-${mIdx}-${tIdx}-${qIdx}`} checked={q.correctAnswer === oIdx} onChange={() => handleQuestionChange(mIdx, tIdx, qIdx, 'correctAnswer', oIdx)} />
                          <label className="form-check-label">Верный ответ</label>
                        </div>
                      </div>
                    ))}
                    <button type="button" className="btn btn-sm btn-outline-secondary ms-5" onClick={() => handleAddOption(mIdx, tIdx, qIdx)}>+ Опция</button>
                  </div>
                ))}
              </div>
            ))}
          </div>
        ))}
        <button type="button" className="btn btn-secondary mb-3" onClick={handleAddModule}>+ Добавить модуль</button>

        <div className="form-group form-check mb-3">
          <input type="checkbox" className="form-check-input" id="published" checked={published} onChange={e => setPublished(e.target.checked)} />
          <label className="form-check-label" htmlFor="published">Опубликовать</label>
        </div>

        <button type="submit" className="btn btn-primary">Создать курс</button>
      </form>
    </div>
  );
}
