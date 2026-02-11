import { useEffect, useMemo, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import api from "../services/api.js";

export default function PublicList() {
  const { studentId } = useParams();
  const navigate = useNavigate();
  const [searchId, setSearchId] = useState(studentId || "");
  const [filter, setFilter] = useState("");
  const [students, setStudents] = useState([]);
  const [student, setStudent] = useState(null);
  const [loadingList, setLoadingList] = useState(true);
  const [loadingStudent, setLoadingStudent] = useState(false);
  const [error, setError] = useState("");

  async function fetchAllStudents() {
    setLoadingList(true);
    try {
      const res = await api.get("/api/students");
      setStudents(res.data);
    } catch (err) {
      setError("Unable to load student directory.");
    } finally {
      setLoadingList(false);
    }
  }

  async function fetchStudent(id) {
    if (!id) return;
    setLoadingStudent(true);
    setError("");
    setStudent(null);
    try {
      const res = await api.get(`/api/students/${id}/certificates`);
      setStudent(res.data);
    } catch (err) {
      setError("Student not found.");
    } finally {
      setLoadingStudent(false);
    }
  }

  useEffect(() => {
    if (studentId) {
      setLoadingList(false);
      return;
    }
    fetchAllStudents();
  }, [studentId]);

  useEffect(() => {
    setSearchId(studentId || "");
    if (studentId) {
      fetchStudent(studentId);
      return;
    }
    setStudent(null);
    setError("");
  }, [studentId]);

  function handleSubmit(event) {
    event.preventDefault();
    const trimmed = searchId.trim();
    if (!trimmed) {
      setError("Enter a student ID to search.");
      return;
    }
    navigate(`/student/${trimmed}`);
  }

  const filteredStudents = useMemo(() => {
    const q = filter.trim().toLowerCase();
    if (!q) return students;
    return students.filter((item) => {
      const haystack = [
        item.fullName,
        item.name,
        item.email,
        String(item.id)
      ]
        .filter(Boolean)
        .join(" ")
        .toLowerCase();
      return haystack.includes(q);
    });
  }, [students, filter]);

  if (studentId) {
    return (
      <div className="space-y-6">
        <div className="card rounded-2xl p-5">
          <Link to="/certificates" className="text-sm underline">
            Back to students
          </Link>
          {loadingStudent ? (
            <p className="mt-3 text-sm text-slate">Loading student profile...</p>
          ) : null}
          {error ? <p className="mt-3 text-sm text-red-600">{error}</p> : null}

          {student ? (
            <div className="mt-4 space-y-2">
              <h1 className="text-3xl">{student.fullName || student.name}</h1>
              {student.email ? (
                <p className="text-sm text-slate">{student.email}</p>
              ) : null}
              <p className="text-xs uppercase tracking-[0.2em] text-slate">
                Student ID {student.id}
              </p>
            </div>
          ) : null}
        </div>

        {student && (
          <section className="space-y-4">
            <h2 className="text-2xl">Certificates</h2>
            {student.certificates?.length ? (
              <div className="grid gap-4">
                {student.certificates.map((cert) => (
                  <article key={cert.id} className="card rounded-2xl p-5">
                    <div className="flex flex-wrap items-start justify-between gap-4">
                      <div>
                        <p className="text-xs uppercase tracking-[0.2em] text-slate">
                          {cert.certificateId}
                        </p>
                        <h3 className="text-xl">{cert.courseName}</h3>
                      </div>
                      <span
                        className={`rounded-full px-3 py-1 text-xs uppercase tracking-wide ${
                          cert.status === "active"
                            ? "badge text-goldDark"
                            : "bg-slate/15 text-slate"
                        }`}
                      >
                        {cert.status}
                      </span>
                    </div>

                    <div className="mt-4 space-y-2 text-sm">
                      <p>
                        <span className="font-semibold">Student Name:</span>{" "}
                        {student.fullName || student.name}
                      </p>
                      <p>
                        <span className="font-semibold">Course:</span>{" "}
                        {cert.courseName || "-"}
                      </p>
                      <p>
                        <span className="font-semibold">Skills:</span>{" "}
                        {cert.skillsLearned || "-"}
                      </p>
                      <p>
                        <span className="font-semibold">Comments:</span>{" "}
                        {cert.comments || "No comments"}
                      </p>
                      <p>
                        <span className="font-semibold">Issue Date:</span>{" "}
                        {cert.issueDate
                          ? new Date(cert.issueDate).toLocaleDateString()
                          : "-"}
                      </p>
                    </div>

                    <div className="mt-4">
                      <Link
                        to={`/certificate/${cert.certificateId}`}
                        className="btn btn-primary"
                      >
                        View Certificate
                      </Link>
                    </div>
                  </article>
                ))}
              </div>
            ) : (
              <p className="text-sm text-slate">No certificates available.</p>
            )}
          </section>
        )}
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <section className="card rounded-2xl p-5">
        <div className="mb-3 flex items-center gap-3">
          <img
            src="/logo.svg"
            alt="Excellence Computer Center logo"
            className="h-10 w-10 rounded-lg border border-goldSoft/60 bg-white p-1"
            loading="lazy"
          />
          <p className="text-sm text-slate">Excellence Computer Center</p>
        </div>
        <h1 className="text-3xl">Students</h1>
        <p className="text-sm text-slate">
          View student names and certificate names.
        </p>
      </section>

      <form onSubmit={handleSubmit} className="card rounded-2xl p-4">
        <div className="grid gap-4 lg:grid-cols-[1fr_1fr_auto] lg:items-end">
          <div className="space-y-2">
            <label htmlFor="studentSearch" className="label">
              Open Student by ID
            </label>
            <input
              id="studentSearch"
              className="input"
              placeholder="e.g. 1024"
              value={searchId}
              onChange={(e) => setSearchId(e.target.value)}
            />
          </div>
          <div className="space-y-2">
            <label htmlFor="studentFilter" className="label">
              Filter Directory
            </label>
            <input
              id="studentFilter"
              className="input"
              placeholder="Search by name, email, or ID"
              value={filter}
              onChange={(e) => setFilter(e.target.value)}
            />
          </div>
          <button type="submit" className="btn btn-primary">
            Open Profile
          </button>
        </div>
        {error ? (
          <p className="mt-3 text-sm text-red-600">{error}</p>
        ) : null}
      </form>

      {loadingStudent ? <p className="text-sm text-slate">Loading...</p> : null}

      <section className="space-y-4">
        <h2 className="text-2xl">Student Directory</h2>
        {loadingList ? (
          <p className="text-sm text-slate">Loading student directory...</p>
        ) : filteredStudents.length === 0 ? (
          <p className="text-sm text-slate">No students found.</p>
        ) : (
          <div className="grid gap-4 lg:grid-cols-2">
            {filteredStudents.map((item) => (
              <article key={item.id} className="card rounded-2xl p-4">
                <p className="text-xs uppercase tracking-[0.2em] text-slate">
                  Student ID {item.id}
                </p>
                <h3 className="text-xl">{item.fullName || item.name}</h3>
                <p className="mt-2 text-sm text-slate">
                  Certificate Name:
                  {" "}
                  {(item.certificates || []).length
                    ? item.certificates.map((cert) => cert.courseName).join(", ")
                    : "No certificates"}
                </p>
                <div className="mt-4 flex flex-wrap items-center gap-3">
                  <Link to={`/student/${item.id}`} className="btn btn-primary">
                    View Certificates
                  </Link>
                </div>
              </article>
            ))}
          </div>
        )}
      </section>
    </div>
  );
}
