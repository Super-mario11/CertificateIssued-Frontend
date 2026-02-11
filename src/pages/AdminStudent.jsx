import { useEffect, useMemo, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import api from "../services/api.js";
import { handleImageError } from "../utils/imageFallback.js";

const emptyCertificate = {
  courseName: "",
  skillsLearned: "",
  comments: "",
  issueDate: "",
  status: "active",
  certificateUrl: "",
  handoverUrl: ""
};

export default function AdminStudent() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [student, setStudent] = useState(null);
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [profileImage, setProfileImage] = useState("");
  const [allowMultiple, setAllowMultiple] = useState(true);
  const [newCert, setNewCert] = useState({ ...emptyCertificate });
  const [uploading, setUploading] = useState({});
  const [notice, setNotice] = useState("");
  const persistedAllowMultiple = student?.allowMultipleCertificates ?? true;
  const modeChangePending = allowMultiple !== persistedAllowMultiple;
  const singleLimitReached =
    !persistedAllowMultiple && (student?.certificates?.length || 0) > 0;

  async function loadStudent() {
    const res = await api.get(`/api/admin/students/${id}`);
    setStudent(res.data);
    setName(res.data.fullName || res.data.name);
    setEmail(res.data.email || "");
    setProfileImage(res.data.profileImage || "");
    setAllowMultiple(
      typeof res.data.allowMultipleCertificates === "boolean"
        ? res.data.allowMultipleCertificates
        : true
    );
  }

  useEffect(() => {
    loadStudent();
  }, [id]);

  const stats = useMemo(() => {
    if (!student) return { total: 0, active: 0, revoked: 0 };
    const active = student.certificates.filter((cert) => cert.status === "active").length;
    return {
      total: student.certificates.length,
      active,
      revoked: student.certificates.length - active
    };
  }, [student]);

  async function handleNameSave() {
    const trimmed = name.trim();
    if (!trimmed) {
      setNotice("Student full name cannot be empty.");
      return;
    }
    setNotice("");
    try {
      await api.put(`/api/admin/students/${id}`, {
        fullName: trimmed,
        email: email.trim() || undefined,
        profileImage: profileImage.trim() || undefined,
        allowMultipleCertificates: allowMultiple
      });
      await loadStudent();
      setNotice("");
    } catch (err) {
      setNotice(err?.response?.data?.message || "Unable to save student profile.");
    }
  }

  async function handleUpload(event, field) {
    const file = event.target.files?.[0];
    if (!file) return;
    setUploading((prev) => ({ ...prev, [field]: true }));
    const data = new FormData();
    data.append("file", file);
    data.append("studentName", name.trim() || "student");
    data.append("courseName", newCert.courseName || "");
    data.append("assetType", field);
    try {
      const res = await api.post("/api/uploads", data);
      setNewCert((prev) => ({ ...prev, [field]: res.data.url }));
      setNotice("");
    } catch (err) {
      setNotice(
        err?.response?.data?.message ||
          "Upload failed. You can also paste the certificate image URL."
      );
    } finally {
      setUploading((prev) => ({ ...prev, [field]: false }));
    }
  }

  async function handleAddCertificate(event) {
    event.preventDefault();
    if (modeChangePending) {
      setNotice("Save profile first to apply the certificate mode change.");
      return;
    }
    if (singleLimitReached) {
      setNotice("This student can only have one certificate.");
      return;
    }
    if (!newCert.courseName.trim() || !newCert.skillsLearned.trim()) {
      setNotice("Course name and skills learned are required.");
      return;
    }
    if (!newCert.certificateUrl.trim()) {
      setNotice("Please upload the certificate image.");
      return;
    }
    setNotice("");
    try {
      await api.post(`/api/admin/students/${id}/certificates`, {
        courseName: newCert.courseName,
        skillsLearned: newCert.skillsLearned,
        comments: newCert.comments || undefined,
        issueDate: newCert.issueDate || undefined,
        status: newCert.status,
        certificateUrl: newCert.certificateUrl,
        handoverUrl: newCert.handoverUrl || undefined
      });
      setNewCert({ ...emptyCertificate });
      await loadStudent();
      setNotice("Certificate added successfully.");
    } catch (err) {
      setNotice(err?.response?.data?.message || "Unable to add certificate.");
    }
  }

  async function handleDelete(certId) {
    await api.delete(`/api/admin/certificates/${certId}`);
    await loadStudent();
  }

  if (!student) return <p className="text-sm text-slate">Loading...</p>;

  return (
    <div className="space-y-10">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <Link to="/admin/dashboard" className="text-sm underline">
            Back to dashboard
          </Link>
          <h1 className="text-3xl mt-2">Student Workspace</h1>
          <p className="text-sm text-slate">
            Update profile details, issue certificates, and review history in one place.
          </p>
        </div>
        <button
          type="button"
          className="btn btn-outline"
          onClick={() => navigate(`/admin/create`)}
        >
          New Student Intake
        </button>
      </div>

      <div className="grid gap-6 lg:grid-cols-[1.4fr_0.6fr]">
        <div className="card rounded-2xl p-5">
          <p className="text-xs uppercase tracking-[0.2em] text-slate">
            Student Details
          </p>
          <div className="mt-3 flex flex-wrap items-center justify-between gap-3">
            <div>
              <h2 className="text-2xl">{student.fullName || student.name}</h2>
              <p className="text-sm text-slate">
                Primary profile information used on certificates.
              </p>
            </div>
            <button
              type="button"
              className="btn btn-primary"
              onClick={handleNameSave}
            >
              Save Profile
            </button>
          </div>
          <div className="mt-6 grid gap-4 md:grid-cols-2">
            <div className="space-y-2">
              <label htmlFor="studentNameEdit" className="label">
                Full Name
              </label>
              <input
                id="studentNameEdit"
                className="input"
                value={name}
                onChange={(e) => setName(e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <label htmlFor="studentEmailEdit" className="label">
                Email (Optional)
              </label>
              <input
                id="studentEmailEdit"
                type="email"
                className="input"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
            </div>
          </div>
          <div className="mt-4 space-y-2">
            <label htmlFor="studentProfileImageEdit" className="label">
              Profile Image URL (Optional)
            </label>
            <input
              id="studentProfileImageEdit"
              className="input"
              value={profileImage}
              onChange={(e) => setProfileImage(e.target.value)}
            />
          </div>
          <div className="mt-4 space-y-2">
            <label htmlFor="allowMultipleStudent" className="label">
              Certificate Mode
            </label>
            <select
              id="allowMultipleStudent"
              className="input"
              value={allowMultiple ? "multiple" : "single"}
              onChange={(e) => setAllowMultiple(e.target.value === "multiple")}
            >
              <option value="multiple">Allow multiple certificates</option>
              <option value="single">Allow only one certificate</option>
            </select>
          </div>
          {notice ? (
            <div className="mt-4 rounded-xl border border-red-200 bg-red-50 p-3 text-sm text-red-700">
              {notice}
            </div>
          ) : null}
        </div>

        <div className="card rounded-2xl p-5">
          <p className="text-xs uppercase tracking-[0.2em] text-slate">
            Certificate Snapshot
          </p>
          <h2 className="text-2xl mt-2">At a Glance</h2>
          <div className="mt-5 space-y-4 text-sm">
            <div className="rounded-xl border border-goldSoft bg-goldSoft/40 px-4 py-3">
              <p className="text-xs uppercase tracking-wide text-slate">
                Total Certificates
              </p>
              <p className="text-2xl font-semibold">{stats.total}</p>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-slate">Active</span>
              <span className="font-semibold">{stats.active}</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-slate">Revoked</span>
              <span className="font-semibold">{stats.revoked}</span>
            </div>
          </div>
          <div className="mt-6 text-xs text-slate">
            Tip: Keep certificates active unless a credential needs to be withdrawn.
          </div>
        </div>
      </div>

      <div className="card rounded-2xl p-5">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <p className="text-xs uppercase tracking-[0.2em] text-slate">
              Certificate Builder
            </p>
            <h2 className="text-2xl mt-2">Issue a New Certificate</h2>
            <p className="text-sm text-slate">
              Add course information, upload the credential, and publish it to the
              student record.
            </p>
          </div>
        </div>
        <form
          onSubmit={handleAddCertificate}
          className="mt-6 grid gap-6 lg:grid-cols-[1.1fr_0.9fr]"
        >
          <div className="space-y-4">
            {singleLimitReached ? (
              <div className="rounded-xl border border-goldSoft bg-goldSoft/40 p-4 text-sm text-slate">
                This student is limited to one certificate. To add another, switch
                the certificate mode to “Allow multiple certificates”.
              </div>
            ) : null}
            {modeChangePending ? (
              <div className="rounded-xl border border-goldSoft bg-goldSoft/40 p-4 text-sm text-slate">
                Certificate mode has changed. Save profile to apply this change
                before issuing certificates.
              </div>
            ) : null}
            <div className="rounded-xl border border-goldSoft bg-goldSoft/40 p-4 text-sm text-slate">
              Certificate details appear on the student portal and the public
              verification page.
            </div>
            <div className="space-y-2">
              <label className="label" htmlFor="courseName">
                Course Name
              </label>
              <input
                id="courseName"
                className="input"
                value={newCert.courseName}
                onChange={(e) =>
                  setNewCert({ ...newCert, courseName: e.target.value })
                }
                required
              />
            </div>
            <div className="space-y-2">
              <label className="label" htmlFor="skillsLearned">
                Skills Learned
              </label>
              <input
                id="skillsLearned"
                className="input"
                value={newCert.skillsLearned}
                onChange={(e) =>
                  setNewCert({ ...newCert, skillsLearned: e.target.value })
                }
                required
              />
            </div>
            <div className="space-y-2">
              <label className="label" htmlFor="comments">
                Comments
              </label>
              <textarea
                id="comments"
                className="input"
                value={newCert.comments}
                onChange={(e) =>
                  setNewCert({ ...newCert, comments: e.target.value })
                }
                rows={3}
              />
            </div>
            <div className="grid gap-4 md:grid-cols-2">
              <div className="space-y-2">
                <label className="label" htmlFor="issueDate">
                  Issue Date
                </label>
                <input
                  id="issueDate"
                  className="input"
                  type="date"
                  value={newCert.issueDate}
                  onChange={(e) =>
                    setNewCert({ ...newCert, issueDate: e.target.value })
                  }
                />
              </div>
              <div className="space-y-2">
                <label className="label" htmlFor="status">
                  Status
                </label>
                <select
                  id="status"
                  className="input"
                  value={newCert.status}
                  onChange={(e) =>
                    setNewCert({ ...newCert, status: e.target.value })
                  }
                >
                  <option value="active">Active</option>
                  <option value="revoked">Revoked</option>
                </select>
              </div>
            </div>
          <button
            type="submit"
            className="btn btn-primary"
            disabled={singleLimitReached || modeChangePending}
          >
            Add Certificate
          </button>
        </div>
          <div className="frame rounded-2xl p-3">
            <div className="flex items-center justify-between">
              <p className="label">Credential File</p>
              <span className="text-xs text-slate">PNG or JPG</span>
            </div>
            <input type="file" onChange={(e) => handleUpload(e, "certificateUrl")} />
            {uploading.certificateUrl ? (
              <p className="text-sm text-slate">Uploading...</p>
            ) : null}
            <div className="space-y-2">
              <label className="label" htmlFor="certificateUrlManualStudent">
                Or paste image URL
              </label>
              <input
                id="certificateUrlManualStudent"
                className="input"
                placeholder="https://..."
                value={newCert.certificateUrl}
                onChange={(e) =>
                  setNewCert({ ...newCert, certificateUrl: e.target.value })
                }
              />
            </div>
            {newCert.certificateUrl ? (
                      <img
                        src={newCert.certificateUrl}
                        alt="Certificate preview"
                        className="w-full rounded-xl border border-goldSoft shadow-md"
                        loading="lazy"
                        onError={handleImageError}
                      />
            ) : (
              <p className="text-xs text-slate">
                Upload to preview the certificate image before publishing.
              </p>
            )}
            <div className="mt-4 border-t border-goldSoft pt-4 text-xs text-slate">
              <p className="label mb-2">Handover Image (Optional)</p>
              <input type="file" onChange={(e) => handleUpload(e, "handoverUrl")} />
              {uploading.handoverUrl ? (
                <p className="text-sm text-slate">Uploading...</p>
              ) : null}
              <input
                className="input mt-2"
                placeholder="Or paste handover image URL"
                value={newCert.handoverUrl}
                onChange={(e) =>
                  setNewCert({ ...newCert, handoverUrl: e.target.value })
                }
              />
            </div>
          </div>
        </form>
      </div>

        <div className="space-y-4">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div>
              <h2 className="text-2xl">Issued Certificates</h2>
              <p className="text-sm text-slate">
                Review active and revoked credentials with quick actions.
              </p>
            </div>
          <span className="text-sm text-slate">{stats.total} total</span>
        </div>
        {student.certificates.length === 0 ? (
          <p className="text-sm text-slate">No certificates yet.</p>
        ) : (
          <div className="grid gap-6 lg:grid-cols-2">
            {student.certificates.map((cert) => (
              <div key={cert.id} className="card rounded-2xl p-6">
                <div className="flex flex-wrap items-start justify-between gap-4">
                  <div className="space-y-2">
                    <p className="text-xs uppercase tracking-[0.2em] text-slate">
                      {cert.certificateId}
                    </p>
                    <h3 className="text-xl">{cert.courseName}</h3>
                    <p className="text-sm text-slate">{cert.skillsLearned}</p>
                    {cert.issueDate ? (
                      <p className="text-xs text-slate">Issued {cert.issueDate}</p>
                    ) : null}
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
                <div className="mt-4 grid gap-4 md:grid-cols-[120px_1fr]">
                  <div className="rounded-xl border border-goldSoft bg-goldSoft/40 p-2">
                    {cert.certificateUrl ? (
                      <img
                        src={cert.certificateUrl}
                        alt="Certificate"
                        className="h-28 w-full rounded-lg object-cover"
                        loading="lazy"
                        onError={handleImageError}
                      />
                    ) : (
                      <div className="flex h-28 items-center justify-center text-xs text-slate">
                        No preview
                      </div>
                    )}
                  </div>
                  <div className="space-y-2 text-sm">
                    {cert.comments ? (
                      <p className="text-slate">{cert.comments}</p>
                    ) : (
                      <p className="text-xs text-slate">No comments added.</p>
                    )}
                    <div className="flex flex-wrap items-center gap-3 text-sm">
                      <Link to={`/admin/edit/${cert.id}`} className="underline">
                        Edit
                      </Link>
                      <Link
                        to={`/certificate/${cert.certificateId}`}
                        className="underline"
                      >
                        Public
                      </Link>
                      <button
                        type="button"
                        onClick={() => handleDelete(cert.id)}
                        className="text-red-600 underline"
                      >
                        Delete
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
