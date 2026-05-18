import { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import { getInventoryById, getInventoryPhotoUrl } from "../services/inventoryApi";
import styles from "./AdminInventoryDetails.module.css";

function AdminInventoryDetails() {
  const { id } = useParams();
  const [item, setItem] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const load = async () => {
      setLoading(true);
      setError("");
      try {
        const data = await getInventoryById(id);
        setItem(data);
      } catch (err) {
        setError(err?.response?.data?.message || err.message || "Failed to load inventory details.");
      } finally {
        setLoading(false);
      }
    };

    load();
  }, [id]);

  if (loading) return <div className="status-box">Завантаження деталей...</div>;
  if (error) return <div className="status-box status-error">{error}</div>;
  if (!item) return <div className="status-box">Позицію не знайдено.</div>;

  return (
    <section className={`panel ${styles.section}`}>
      <div className={styles.header}>
        <h2>{item.inventory_name}</h2>
        <div className={styles.actions}>
          <Link className="btn btn-secondary" to="/admin/inventory">
            До списку
          </Link>
          <Link className="btn btn-primary" to={`/admin/inventory/${id}/edit`}>
            Редагувати
          </Link>
        </div>
      </div>

      <p className={styles.description}>{item.description || "Опис відсутній."}</p>
      <img
        className={styles.image}
        src={item.photo_url || getInventoryPhotoUrl(item.id || id)}
        alt={item.inventory_name || "Inventory"}
      />
    </section>
  );
}

export default AdminInventoryDetails;
