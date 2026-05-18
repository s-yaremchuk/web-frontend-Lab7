import styles from "./ConfirmModal.module.css";

function ConfirmModal({ isOpen, title, description, onCancel, onConfirm, confirming = false }) {
  if (!isOpen) return null;

  return (
    <div className={styles.backdrop} role="dialog" aria-modal="true" aria-labelledby="confirm-title">
      <div className={styles.modal}>
        <h3 id="confirm-title">{title}</h3>
        <p>{description}</p>
        <div className={styles.actions}>
          <button type="button" className="btn btn-secondary" onClick={onCancel} disabled={confirming}>
            Скасувати
          </button>
          <button type="button" className="btn btn-danger" onClick={onConfirm} disabled={confirming}>
            {confirming ? "Видалення..." : "Підтвердити"}
          </button>
        </div>
      </div>
    </div>
  );
}

export default ConfirmModal;
