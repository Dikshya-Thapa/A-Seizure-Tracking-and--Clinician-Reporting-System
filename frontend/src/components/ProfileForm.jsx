import { useState } from "react";
import { updateProfile } from "../api/users";
import { useAuth } from "../context/AuthContext";

const SELF_ASSIGNABLE_ROLES = ["patient", "caregiver"];

export default function ProfileForm() {
  const { user, login } = useAuth();
  const [name, setName] = useState(user.name || "");
  const [role, setRole] = useState(user.role);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);

  const canChangeRole = SELF_ASSIGNABLE_ROLES.includes(user.role);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setMessage("");
    setBusy(true);

    const updates = { name };
    if (canChangeRole && role !== user.role) {
      updates.role = role;
    }

    try {
      const data = await updateProfile(updates);
      // The server returns a new token because the token carries the role
      login(data.token, data.user);
      setMessage("Profile updated");
    } catch (err) {
      setError(err.response?.data?.message || "Could not update profile");
    } finally {
      setBusy(false);
    }
  };

  return (
    <form onSubmit={handleSubmit}>
      <h2>Profile</h2>

      <label>
        Name
        <input
          type="text"
          value={name}
          onChange={(e) => setName(e.target.value)}
          required
        />
      </label>

      <label>
        I am a
        <select
          value={role}
          onChange={(e) => setRole(e.target.value)}
          disabled={!canChangeRole}
        >
          {canChangeRole ? (
            <>
              <option value="patient">Patient</option>
              <option value="caregiver">Caregiver</option>
            </>
          ) : (
            <option value={user.role}>{user.role}</option>
          )}
        </select>
      </label>

      <button type="submit" disabled={busy}>
        {busy ? "Saving..." : "Save"}
      </button>

      {message && <p>{message}</p>}
      {error && <p style={{ color: "red" }}>{error}</p>}
    </form>
  );
}