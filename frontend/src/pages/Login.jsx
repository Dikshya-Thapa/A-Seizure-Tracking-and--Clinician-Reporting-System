import { useState } from "react";
import { Navigate } from "react-router-dom";
import { requestOtp, verifyOtp } from "../api/auth";
import { useAuth } from "../context/AuthContext";

export default function Login() {
  const { user, login } = useAuth();
  const [email, setEmail] = useState("");
  const [otp, setOtp] = useState("");
  const [step, setStep] = useState("email");
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);

  // Already logged in
  if (user) {
    return <Navigate to="/dashboard" replace />;
  }

  const errorText = (err) =>
    err.response?.data?.message || "Something went wrong. Please try again.";

  const handleRequest = async (e) => {
    e.preventDefault();
    setError("");
    setMessage("");
    setBusy(true);
    try {
      const data = await requestOtp(email);
      setMessage(data.message);
      setStep("otp");
    } catch (err) {
      setError(errorText(err));
    } finally {
      setBusy(false);
    }
  };

  const handleVerify = async (e) => {
    e.preventDefault();
    setError("");
    setMessage("");
    setBusy(true);
    try {
      const data = await verifyOtp(email, otp);
      login(data.token, data.user);
    } catch (err) {
      setError(errorText(err));
      setBusy(false);
    }
  };

  return (
    <div>
      <h1>Login</h1>

      {step === "email" && (
        <form onSubmit={handleRequest}>
          <label>
            Email
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </label>
          <button type="submit" disabled={busy}>
            {busy ? "Sending..." : "Send OTP"}
          </button>
        </form>
      )}

      {step === "otp" && (
        <form onSubmit={handleVerify}>
          <p>Enter the 6-digit code sent to {email}</p>
          <label>
            OTP
            <input
              type="text"
              inputMode="numeric"
              maxLength={6}
              value={otp}
              onChange={(e) => setOtp(e.target.value)}
              required
            />
          </label>
          <button type="submit" disabled={busy}>
            {busy ? "Verifying..." : "Verify"}
          </button>
          <button
            type="button"
            onClick={() => {
              setStep("email");
              setOtp("");
              setError("");
              setMessage("");
            }}
          >
            Change email
          </button>
        </form>
      )}

      {message && <p>{message}</p>}
      {error && <p style={{ color: "red" }}>{error}</p>}
    </div>
  );
}