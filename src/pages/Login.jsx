import { useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import api from "../services/api.js";

export default function Login() {
  const navigate = useNavigate();
  const location = useLocation();
  const search = new URLSearchParams(location.search);
  const fromQuery = search.get("from");
  const reason = search.get("reason");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [forgotMessage, setForgotMessage] = useState("");
  const [isSendingReset, setIsSendingReset] = useState(false);

  async function handleSubmit(event) {
    event.preventDefault();
    setError("");
    setForgotMessage("");
    try {
      const res = await api.post("/api/auth/login", { password });
      localStorage.setItem("token", res.data.token);
      const redirectTo =
        location.state?.from?.pathname || fromQuery || "/admin/dashboard";
      navigate(redirectTo);
    } catch (err) {
      setError(err?.response?.data?.message || "Login failed. Check credentials.");
    }
  }

  async function handleForgotPassword() {
    setError("");
    setForgotMessage("");
    setIsSendingReset(true);

    try {
      const res = await api.post("/api/auth/forgot-password");
      setForgotMessage(
        res?.data?.message || "If the account exists, a reset link has been sent."
      );
    } catch (_err) {
      setForgotMessage("If the account exists, a reset link has been sent.");
    } finally {
      setIsSendingReset(false);
    }
  }

  return (
    <div className="mx-auto max-w-md">
      <div className="card rounded-2xl p-6">
        <div className="mb-4 flex items-center gap-3">
          <img
            src="/logo.svg"
            alt="Excellence Computer Center logo"
            className="h-10 w-10 rounded-lg border border-goldSoft/60 bg-white p-1"
            loading="lazy"
          />
          <p className="text-sm text-slate">Excellence Computer Center</p>
        </div>
        <h1 className="text-2xl">Admin Login</h1>
        <p className="text-sm text-slate">
          Enter your password to continue.
        </p>
        {reason === "session-expired" ? (
          <p className="mt-2 text-sm text-red-600">
            Your session expired. Please sign in again.
          </p>
        ) : null}
        <form onSubmit={handleSubmit} className="mt-6 space-y-4">
          <div className="space-y-2">
            <label htmlFor="adminPassword" className="label">
              Admin Password
            </label>
            <input
              id="adminPassword"
              className="input"
              type="password"
              placeholder="Enter password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
          </div>
          {error ? <p className="text-sm text-red-600">{error}</p> : null}
          {forgotMessage ? (
            <p className="text-sm text-emerald-700">{forgotMessage}</p>
          ) : null}
          <button
            type="submit"
            className="btn btn-primary w-full"
          >
            Sign In
          </button>
          <button
            type="button"
            className="btn btn-outline w-full"
            onClick={handleForgotPassword}
            disabled={isSendingReset}
          >
            {isSendingReset ? "Sending reset link..." : "Forgot Password"}
          </button>
        </form>
      </div>
    </div>
  );
}
