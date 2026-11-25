import { useAuth } from "../context/AuthContext";

export default function Dashboard() {
  const { user, logout } = useAuth();

  return (
    <div>
      <h1>Dashboard</h1>
      <p>Email: {user.email}</p>
      <p>Name: {user.name || "Not set"}</p>
      <p>Role: {user.role}</p>
      <button onClick={logout}>Log out</button>
    </div>
  );
}