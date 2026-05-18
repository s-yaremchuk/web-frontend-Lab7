import { Link, Navigate, Route, Routes } from "react-router-dom";
import AdminInventory from "./pages/AdminInventory";
import AdminInventoryCreate from "./pages/AdminInventoryCreate";
import AdminInventoryEdit from "./pages/AdminInventoryEdit";
import AdminInventoryDetails from "./pages/AdminInventoryDetails";

function App() {
  return (
    <div className="app-shell">
      <header className="app-header">
        <div className="container header-content">
          <h1>Inventory Admin</h1>
          <nav className="header-nav">
            <Link to="/admin/inventory">Inventory</Link>
            <Link to="/admin/inventory/create">Create</Link>
          </nav>
        </div>
      </header>

      <main className="container app-main">
        <Routes>
          <Route path="/" element={<Navigate to="/admin/inventory" replace />} />
          <Route path="/admin/inventory" element={<AdminInventory />} />
          <Route path="/admin/inventory/create" element={<AdminInventoryCreate />} />
          <Route path="/admin/inventory/:id" element={<AdminInventoryDetails />} />
          <Route path="/admin/inventory/:id/edit" element={<AdminInventoryEdit />} />
          <Route path="*" element={<Navigate to="/admin/inventory" replace />} />
        </Routes>
      </main>
    </div>
  );
}

export default App;
