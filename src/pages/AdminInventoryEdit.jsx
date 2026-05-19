import { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import {
  getInventoryById,
  getInventoryPhotoUrl,
  updateInventoryPhoto,
  updateInventoryText
} from "../services/inventoryApi";
import { useInventory } from "../store/InventoryContext";
import styles from "./AdminInventoryEdit.module.css";

function AdminInventoryEdit() {
  const { id } = useParams();
  const { upsertInventory } = useInventory();
  const [item, setItem] = useState(null);
  const [textForm, setTextForm] = useState({ inventory_name: "", description: "" });
  const [photoFile, setPhotoFile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [textLoading, setTextLoading] = useState(false);
  const [photoLoading, setPhotoLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  useEffect(() => {
    const load = async () => {
      setLoading(true);
      setError("");
      try {
        const data = await getInventoryById(id);
        setItem(data);
        setTextForm({
          inventory_name: data.inventory_name || "",
          description: data.description || ""
        });
      } catch (err) {
        setError(err?.response?.data?.message || err.message || "Failed to load inventory.");
      } finally {
        setLoading(false);
      }
    };
    load();
  }, [id]);

  const handleTextSubmit = async (event) => {
    event.preventDefault();
    if (!textForm.inventory_name.trim()) {
      setError("Назва інвентарю обов'язкова.");
      return;
    }

    setTextLoading(true);
    setError("");
    setSuccess("");
    try {
      const updated = await updateInventoryText(id, {
        inventory_name: textForm.inventory_name.trim(),
        description: textForm.description.trim()
      });
      setItem((prev) => {
        const merged = { ...prev, ...updated, id: prev?.id || id };
        upsertInventory(merged);
        return merged;
      });
      setSuccess("Текстові дані успішно оновлені.");
    } catch (err) {
      setError(err?.response?.data?.message || err.message || "Failed to update text data.");
    } finally {
      setTextLoading(false);
    }
  };

  const handlePhotoSubmit = async (event) => {
    event.preventDefault();
    if (!photoFile) {
      setError("Оберіть файл для оновлення фото.");
      return;
    }

    const formData = new FormData();
    formData.append("photo", photoFile);
    setPhotoLoading(true);
    setError("");
    setSuccess("");
    try {
      const updated = await updateInventoryPhoto(id, formData);
      setItem((prev) => {
        const merged = { ...prev, ...updated, id: prev?.id || id };
        upsertInventory(merged);
        return merged;
      });
      setPhotoFile(null);
      setSuccess("Фото успішно оновлене.");
    } catch (err) {
      setError(err?.response?.data?.message || err.message || "Failed to update photo.");
    } finally {
      setPhotoLoading(false);
    }
  };

  if (loading) return <div className="status-box">Завантаження форми редагування...</div>;
  if (error && !item) return <div className="status-box status-error">{error}</div>;
  if (!item) return <div className="status-box">Позицію не знайдено.</div>;

  return (
    <section className={styles.section}>
      <div className={styles.header}>
        <h2>Редагування: {item.inventory_name}</h2>
        <div className={styles.actions}>
          <Link className="btn btn-secondary" to="/admin/inventory">
            До списку
          </Link>
          <Link className="btn btn-secondary" to={`/admin/inventory/${id}`}>
            До деталей
          </Link>
        </div>
      </div>

      {error && <div className="status-box status-error">{error}</div>}
      {success && <div className="status-box">{success}</div>}

      <div className={styles.grid}>
        <form className={`panel ${styles.form}`} onSubmit={handleTextSubmit}>
          <h3>Оновлення текстових даних</h3>
          <div className="field">
            <label htmlFor="edit_name">Назва *</label>
            <input
              id="edit_name"
              type="text"
              value={textForm.inventory_name}
              onChange={(event) =>
                setTextForm((prev) => ({ ...prev, inventory_name: event.target.value }))
              }
            />
          </div>
          <div className="field">
            <label htmlFor="edit_description">Опис</label>
            <textarea
              id="edit_description"
              rows={6}
              value={textForm.description}
              onChange={(event) =>
                setTextForm((prev) => ({ ...prev, description: event.target.value }))
              }
            />
          </div>
          <button className="btn btn-primary" type="submit" disabled={textLoading}>
            {textLoading ? "Збереження..." : "Оновити текст"}
          </button>
        </form>

        <form className={`panel ${styles.form}`} onSubmit={handlePhotoSubmit}>
          <h3>Оновлення фотографії</h3>
          <img
            className={styles.preview}
            src={item.photo_url || getInventoryPhotoUrl(item.id || id)}
            alt={item.inventory_name || "Inventory"}
          />
          <div className="field">
            <label htmlFor="edit_photo">Нове фото *</label>
            <input
              id="edit_photo"
              type="file"
              accept="image/*"
              onChange={(event) => setPhotoFile(event.target.files?.[0] ?? null)}
            />
          </div>
          <button className="btn btn-primary" type="submit" disabled={photoLoading}>
            {photoLoading ? "Оновлення..." : "Оновити фото"}
          </button>
        </form>
      </div>
    </section>
  );
}

export default AdminInventoryEdit;
