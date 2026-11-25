import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { createSeizure, getSeizures } from "../api/seizures";

const TYPES = [
  { value: "focal", label: "Focal" },
  { value: "generalized_tonic_clonic", label: "Generalized tonic-clonic" },
  { value: "absence", label: "Absence" },
  { value: "myoclonic", label: "Myoclonic" },
  { value: "atonic", label: "Atonic" },
  { value: "unknown", label: "Unknown" },
];

// Format a Date for a datetime-local input in the user's own time zone
const toLocalInput = (date) => {
  const offsetMs = date.getTimezoneOffset() * 60000;
  return new Date(date.getTime() - offsetMs).toISOString().slice(0, 16);
};

const formatDuration = (totalSeconds) => {
  const minutes = Math.floor(totalSeconds / 60);
  const seconds = totalSeconds % 60;
  return `${minutes}m ${seconds}s`;
};

const typeLabel = (value) =>
  TYPES.find((t) => t.value === value)?.label || value;

export default function Seizures() {
  const [type, setType] = useState("unknown");
  const [startedAt, setStartedAt] = useState(toLocalInput(new Date()));
  const [minutes, setMinutes] = useState(0);
  const [seconds, setSeconds] = useState(0);
  const [triggers, setTriggers] = useState("");
  const [notes, setNotes] = useState("");

  const [seizures, setSeizures] = useState([]);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);

  const loadSeizures = async () => {
    try {
      const data = await getSeizures();
      setSeizures(data.seizures);
    } catch (err) {
      setError(err.response?.data?.message || "Could not load seizures");
    }
  };

  useEffect(() => {
    loadSeizures();
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setMessage("");
    setBusy(true);

    const payload = {
      type,
      startedAt: new Date(startedAt).toISOString(),
      durationSeconds: Number(minutes || 0) * 60 + Number(seconds || 0),
      triggers: triggers
        .split(",")
        .map((t) => t.trim())
        .filter(Boolean),
      notes,
      // Unique id made on the device, used later to avoid duplicates on sync
      clientId: crypto.randomUUID(),
    };

    try {
      await createSeizure(payload);
      setMessage("Seizure saved");
      setStartedAt(toLocalInput(new Date()));
      setMinutes(0);
      setSeconds(0);
      setTriggers("");
      setNotes("");
      await loadSeizures();
    } catch (err) {
      setError(err.response?.data?.message || "Could not save seizure");
    } finally {
      setBusy(false);
    }
  };

  return (
    <div>
      <p>
        <Link to="/dashboard">Back to dashboard</Link>
      </p>
      <h1>Log a seizure</h1>

      <form onSubmit={handleSubmit}>
        <div>
          <label>
            Type
            <select value={type} onChange={(e) => setType(e.target.value)}>
              {TYPES.map((t) => (
                <option key={t.value} value={t.value}>
                  {t.label}
                </option>
              ))}
            </select>
          </label>
        </div>

        <div>
          <label>
            Started at
            <input
              type="datetime-local"
              value={startedAt}
              max={toLocalInput(new Date())}
              onChange={(e) => setStartedAt(e.target.value)}
              required
            />
          </label>
        </div>

        <div>
          <label>
            Minutes
            <input
              type="number"
              min="0"
              value={minutes}
              onChange={(e) => setMinutes(e.target.value)}
            />
          </label>
          <label>
            Seconds
            <input
              type="number"
              min="0"
              max="59"
              value={seconds}
              onChange={(e) => setSeconds(e.target.value)}
            />
          </label>
        </div>

        <div>
          <label>
            Possible triggers (separate with commas)
            <input
              type="text"
              value={triggers}
              onChange={(e) => setTriggers(e.target.value)}
            />
          </label>
        </div>

        <div>
          <label>
            Notes
            <textarea
              value={notes}
              maxLength={1000}
              onChange={(e) => setNotes(e.target.value)}
            />
          </label>
        </div>

        <button type="submit" disabled={busy}>
          {busy ? "Saving..." : "Save seizure"}
        </button>
      </form>

      {message && <p>{message}</p>}
      {error && <p style={{ color: "red" }}>{error}</p>}

      <h2>Your seizures</h2>
      {seizures.length === 0 ? (
        <p>No seizures logged yet.</p>
      ) : (
        <ul>
          {seizures.map((s) => (
            <li key={s._id}>
              <strong>{new Date(s.startedAt).toLocaleString()}</strong>
              {" - "}
              {typeLabel(s.type)}, {formatDuration(s.durationSeconds)}
              {s.triggers.length > 0 && <> | Triggers: {s.triggers.join(", ")}</>}
              {s.notes && <> | Notes: {s.notes}</>}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}