import { useEffect, useMemo, useState } from "react";
import styles from "./InventoryForm.module.css";

const initialState = {
  inventory_name: "",
  description: "",
  photo: null
};

function InventoryForm({ onSubmit, submitLabel = "Create inventory", loading = false }) {
  const [values, setValues] = useState(initialState);
  const [errors, setErrors] = useState({});

  const previewUrl = useMemo(
    () => (values.photo ? URL.createObjectURL(values.photo) : ""),
    [values.photo]
  );

  useEffect(() => () => previewUrl && URL.revokeObjectURL(previewUrl), [previewUrl]);

  const validate = () => {
    const next = {};
    if (!values.inventory_name.trim()) next.inventory_name = "Назва інвентарю обов'язкова.";
    if (!values.photo) next.photo = "Фото обов'язкове.";
    setErrors(next);
    return Object.keys(next).length === 0;
  };

  const handleChange = (event) => {
    const { name, value } = event.target;
    setValues((prev) => ({ ...prev, [name]: value }));
  };

  const handleFileChange = (event) => {
    const file = event.target.files?.[0] ?? null;
    setValues((prev) => ({ ...prev, photo: file }));
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    if (!validate()) return;

    const formData = new FormData();
    formData.append("inventory_name", values.inventory_name.trim());
    formData.append("description", values.description.trim());
    formData.append("photo", values.photo);
    await onSubmit(formData);
    setValues(initialState);
  };

  return (
    <form className={`panel ${styles.form}`} onSubmit={handleSubmit}>
      <div className="form-grid">
        <div className="field">
          <label htmlFor="inventory_name">Назва *</label>
          <input
            id="inventory_name"
            name="inventory_name"
            type="text"
            value={values.inventory_name}
            onChange={handleChange}
            placeholder="Наприклад: Палетний візок"
          />
          {errors.inventory_name && <p className="error-text">{errors.inventory_name}</p>}
        </div>

        <div className="field">
          <label htmlFor="description">Опис</label>
          <textarea
            id="description"
            name="description"
            rows={5}
            value={values.description}
            onChange={handleChange}
            placeholder="Додайте короткий опис інвентарю"
          />
        </div>

        <div className="field">
          <label htmlFor="photo">Фото *</label>
          <input id="photo" name="photo" type="file" accept="image/*" onChange={handleFileChange} />
          {errors.photo && <p className="error-text">{errors.photo}</p>}
        </div>

        {previewUrl && (
          <div className={styles.previewBox}>
            <p className="hint">Прев'ю фото:</p>
            <img src={previewUrl} alt="Selected inventory preview" />
          </div>
        )}
      </div>

      <div className={styles.actions}>
        <button className="btn btn-primary" type="submit" disabled={loading}>
          {loading ? "Збереження..." : submitLabel}
        </button>
      </div>
    </form>
  );
}

export default InventoryForm;
