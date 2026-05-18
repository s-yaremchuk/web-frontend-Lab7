import { Link } from "react-router-dom";
import { useEffect, useState } from "react";
import InventoryTable from "../components/inventory/InventoryTable";
import ConfirmModal from "../components/inventory/ConfirmModal";
import { useInventory } from "../store/InventoryContext";
import styles from "./AdminInventory.module.css";

function AdminInventory() {
  const { list, loading, error, setError, loadInventory, removeInventory } = useInventory();
  const [selected, setSelected] = useState(null);
  const [removing, setRemoving] = useState(false);

  useEffect(() => {
    loadInventory();
  }, [loadInventory]);

  const handleDelete = async () => {
    if (!selected) return;
    const selectedId = selected.id ?? selected._id;
    if (!selectedId) {
      setError("Не вдалося визначити ідентифікатор позиції для видалення.");
      return;
    }
    setRemoving(true);
    setError("");
    try {
      await removeInventory(selectedId);
      setSelected(null);
    } catch (err) {
      setError(err?.response?.data?.message || err.message || "Failed to delete inventory.");
    } finally {
      setRemoving(false);
    }
  };

  return (
    <section className={styles.section}>
      <div className={styles.headerRow}>
        <h2>Адмін-панель інвентарю</h2>
        <Link className="btn btn-primary" to="/admin/inventory/create">
          + Додати інвентар
        </Link>
      </div>

      {loading && <div className="status-box">Завантаження списку...</div>}
      {!loading && error && <div className="status-box status-error">{error}</div>}
      {!loading && !error && list.length === 0 && (
        <div className="status-box">Поки немає інвентарю. Додайте першу позицію.</div>
      )}
      {!loading && !error && list.length > 0 && <InventoryTable items={list} onDelete={setSelected} />}

      <ConfirmModal
        isOpen={Boolean(selected)}
        title="Підтвердження видалення"
        description={
          selected
            ? `Ви дійсно хочете видалити "${selected.inventory_name}"? Цю дію не можна скасувати.`
            : ""
        }
        onCancel={() => setSelected(null)}
        onConfirm={handleDelete}
        confirming={removing}
      />
    </section>
  );
}

export default AdminInventory;
