import AdminSidebar from "../components/AdminSidebar";

const AdminLayout = ({ children }) => (
  <div style={{ display: "flex" }}>
    <AdminSidebar />
    <main style={{ marginLeft: 220, width: "100%", minHeight: "100vh", background: "#fafbfc" }}>
      {children}
    </main>
  </div>
);

export default AdminLayout;