import Navbar from "./molecules/Navbar";
import { Outlet } from "react-router";

const Dashboard = () => {
  const isAuthenticated = !!localStorage.getItem("access_token");
  return (
    <>
      <div className="dashboard-layout">
        <main className="content">
      {isAuthenticated && <Navbar />}
          <Outlet />
        </main>
      </div>
    </>
  );
};

export default Dashboard;
