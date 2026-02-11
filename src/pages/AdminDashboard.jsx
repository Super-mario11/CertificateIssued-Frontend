import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import api from "../services/api.js";
import CertificateCard from "../components/CertificateCard.jsx";

export default function AdminDashboard() {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [query, setQuery] = useState("");
  const [status, setStatus] = useState("all");

  async function loadData() {
    setLoading(true);
    const res = await api.get("/api/admin/certificates");
    setItems(res.data);
    setLoading(false);
  }

  async function handleDelete(id) {
    await api.delete(`/api/admin/certificates/${id}`);
    await loadData();
  }

  useEffect(() => {
    loadData();
  }, []);

  const filteredItems = useMemo(() => {
    const q = query.trim().toLowerCase();
    return items.filter((item) => {
      const matchesStatus = status === "all" ? true : item.status === status;
      const matchesQuery = q
        ? [
            item.student?.fullName || item.student?.name,
            item.courseName,
            item.certificateId,
            item.skillsLearned
          ]
            .filter(Boolean)
            .join(" ")
            .toLowerCase()
            .includes(q)
        : true;
      return matchesStatus && matchesQuery;
    });
  }, [items, query, status]);

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl sm:text-3xl">Admin Dashboard</h1>
          <p className="text-sm text-slate">
            Manage student records and certificates.
          </p>
        </div>
        <Link
          to="/admin/create"
          className="btn btn-primary w-full sm:w-auto"
        >
          Create
        </Link>
      </div>
      <div className="card rounded-2xl p-4">
        <div className="grid gap-4 md:grid-cols-[1fr_200px]">
          <div className="space-y-2">
            <label htmlFor="adminSearch" className="label">
              Search
            </label>
            <input
              id="adminSearch"
              className="input"
              placeholder="Search by student, course, ID, skill"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
            />
          </div>
          <div className="space-y-2">
            <label htmlFor="statusFilter" className="label">
              Status
            </label>
            <select
              id="statusFilter"
              className="input"
              value={status}
              onChange={(e) => setStatus(e.target.value)}
            >
              <option value="all">All</option>
              <option value="active">Active</option>
              <option value="revoked">Revoked</option>
            </select>
          </div>
        </div>
      </div>
      {loading ? (
        <p className="mt-6 text-sm text-slate">Loading...</p>
      ) : filteredItems.length === 0 ? (
        <p className="mt-6 text-sm text-slate">
          No certificates match your search.
        </p>
      ) : (
        <div className="mt-6 grid gap-6 lg:grid-cols-2">
          {filteredItems.map((item) => (
            <CertificateCard
              key={item.id}
              item={item}
              onDelete={handleDelete}
            />
          ))}
        </div>
      )}
    </div>
  );
}
