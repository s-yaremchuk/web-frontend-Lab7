import { Link } from "react-router-dom";
import { getInventoryPhotoUrl } from "../../services/inventoryApi";
import styles from "./InventoryTable.module.css";

const truncate = (value, max = 90) => {
  if (!value) return "—";
  return value.length > max ? `${value.slice(0, max)}...` : value;
};

function InventoryTable({ items, onDelete }) {
  return (
    <div className={styles.wrapper}>
      <table className={styles.table}>
        <thead>
          <tr>
            <th>Назва</th>
            <th>Опис</th>
            <th>Фото</th>
            <th>Дії</th>
          </tr>
        </thead>
        <tbody>
          {items.map((item) => (
            <tr key={item.id ?? item._id}>
              <td>{item.inventory_name || "—"}</td>
              <td>{truncate(item.description)}</td>
              <td>
                <img
                  className={styles.preview}
                  src={item.photo_url || getInventoryPhotoUrl(item.id ?? item._id)}
                  alt={item.inventory_name || "Inventory photo"}
                />
              </td>
              <td>
                <div className={styles.actions}>
                  <Link className="btn btn-secondary" to={`/admin/inventory/${item.id ?? item._id}`}>
                    Переглянути
                  </Link>
                  <Link
                    className="btn btn-primary"
                    to={`/admin/inventory/${item.id ?? item._id}/edit`}
                  >
                    Редагувати
                  </Link>
                  <button className="btn btn-danger" type="button" onClick={() => onDelete(item)}>
                    Видалити
                  </button>
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

export default InventoryTable;
