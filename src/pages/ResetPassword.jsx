import { useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import api from "../services/api.js";

export default function ResetPassword() {
  const navigate = useNavigate();
  const location = useLocation();
  const token = new URLSearchParams(location.search).get("token") || "";

  const [newPassword, setNewPassword] = useState("");
  const [error, setError] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  async function handleSubmit(event) {
    event.preventDefault();
    setError("");
    setIsSubmitting(true);

    try {
      await api.post("/api/auth/reset-password", { token, newPassword });
      navigate("/login");
    } catch (err) {
      setError(
        err?.response?.data?.message ||
          "Unable to reset password. Try requesting a new link."
      );
    } finally {
      setIsSubmitting(false);
    }
  }

  if (!token) {
    return (
      <div className="mx-auto max-w-md">
        <div className="card rounded-2xl p-6">
          <h1 className="text-2xl">Reset Password</h1>
          <p className="mt-2 text-sm text-red-600">
            Reset token is missing or invalid.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-md">
      <div className="card rounded-2xl p-6">
        <h1 className="text-2xl">Reset Password</h1>
        <p className="text-sm text-slate">Set a new admin password.</p>

        <form onSubmit={handleSubmit} className="mt-6 space-y-4">
          <div className="space-y-2">
            <label htmlFor="newPassword" className="label">
              New Password
            </label>
            <input
              id="newPassword"
              className="input"
              type="password"
              placeholder="Enter new password"
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              required
              minLength={6}
            />
          </div>
          {error ? <p className="text-sm text-red-600">{error}</p> : null}
          <button type="submit" className="btn btn-primary w-full" disabled={isSubmitting}>
            {isSubmitting ? "Resetting..." : "Reset Password"}
          </button>
        </form>
      </div>
    </div>
  );
}

