import { useState } from "react";
import { useNavigate } from "react-router-dom";
import InventoryForm from "../components/inventory/InventoryForm";
import { createInventory } from "../services/inventoryApi";
import { useInventory } from "../store/InventoryContext";
import styles from "./AdminInventoryCreate.module.css";

function AdminInventoryCreate() {
  const navigate = useNavigate();
  const { prependInventory } = useInventory();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (formData) => {
    setLoading(true);
    setError("");
    try {
      const created = await createInventory(formData);
      if (created?.id) prependInventory(created);
      navigate("/admin/inventory");
    } catch (err) {
      setError(err?.response?.data?.message || err.message || "Failed to create inventory.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <section className={styles.section}>
      <h2>Створення інвентарю</h2>
      {error && <div className="status-box status-error">{error}</div>}
      <InventoryForm onSubmit={handleSubmit} loading={loading} submitLabel="Створити позицію" />
    </section>
  );
}

export default AdminInventoryCreate;
