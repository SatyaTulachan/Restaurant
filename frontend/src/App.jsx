import { Routes, Route, Link } from "react-router-dom";
import MenuPage from "./pages/MenuPage";
import TablesPage from "./pages/TablesPage";
import OrdersPage from "./pages/OrdersPage";

function App() {
  return (
    <div>
      <h1>Sundhara Thakali Chulho</h1>
      <nav>
        <Link to="/">Menu</Link> |{" "}
        <Link to="/tables">Tables</Link> |{" "}
        <Link to="/orders">Orders</Link>
      </nav>

      <Routes>
        <Route path="/" element={<MenuPage />} />
        <Route path="/tables" element={<TablesPage />} />
        <Route path="/orders" element={<OrdersPage />} />
      </Routes>
    </div>
  );
}

export default App;
