import { createContext, useCallback, useContext, useMemo, useState } from "react";
import * as inventoryApi from "../services/inventoryApi";

const InventoryContext = createContext(null);
const resolveId = (item) => item?.id ?? item?._id;

export function InventoryProvider({ children }) {
  const [list, setList] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const loadInventory = useCallback(async () => {
    setLoading(true);
    setError("");
    try {
      const items = await inventoryApi.getInventory();
      setList(items);
    } catch (err) {
      setError(err?.response?.data?.message || err.message || "Failed to load inventory.");
    } finally {
      setLoading(false);
    }
  }, []);

  const prependInventory = useCallback((item) => {
    setList((prev) => [item, ...prev]);
  }, []);

  const upsertInventory = useCallback((item) => {
    const itemId = resolveId(item);
    if (!itemId) return;
    setList((prev) => {
      const index = prev.findIndex((entry) => String(resolveId(entry)) === String(itemId));
      if (index === -1) return [{ ...item, id: itemId }, ...prev];
      const next = [...prev];
      next[index] = { ...next[index], ...item, id: itemId };
      return next;
    });
  }, []);

  const removeInventoryFromStore = useCallback((id) => {
    setList((prev) => prev.filter((item) => String(resolveId(item)) !== String(id)));
  }, []);

  const removeInventory = useCallback(async (id) => {
    await inventoryApi.deleteInventory(id);
    removeInventoryFromStore(id);
  }, [removeInventoryFromStore]);

  const value = useMemo(
    () => ({
      list,
      loading,
      error,
      setError,
      loadInventory,
      prependInventory,
      upsertInventory,
      removeInventory
    }),
    [list, loading, error, loadInventory, prependInventory, upsertInventory, removeInventory]
  );

  return <InventoryContext.Provider value={value}>{children}</InventoryContext.Provider>;
}

export function useInventory() {
  const context = useContext(InventoryContext);
  if (!context) {
    throw new Error("useInventory must be used within InventoryProvider");
  }
  return context;
}
