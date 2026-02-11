import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import api from "../services/api.js";
import { handleImageError } from "../utils/imageFallback.js";

export default function AdminEdit() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [form, setForm] = useState(null);
  const [uploading, setUploading] = useState(false);

  useEffect(() => {
    async function load() {
      const res = await api.get(`/api/admin/certificates/${id}`);
      const data = res.data;
      setForm({
        studentName: data.student?.fullName || data.student?.name || "",
        studentEmail: data.student?.email || "",
        studentProfileImage: data.student?.profileImage || "",
        courseName: data.courseName,
        skillsLearned: data.skillsLearned,
        comments: data.comments || "",
        issueDate: data.issueDate?.slice(0, 10) || "",
        status: data.status,
        certificateUrl: data.certificateUrl,
        handoverUrl: data.handoverUrl || ""
      });
    }
    load();
  }, [id]);

  async function handleUpload(event, field) {
    const file = event.target.files?.[0];
    if (!file) return;
    setUploading(true);
    const data = new FormData();
    data.append("file", file);
    data.append("studentName", form?.studentName?.trim() || "student");
    data.append("courseName", form?.courseName || "");
    data.append("assetType", field);
    const res = await api.post("/api/uploads", data);
    setForm((prev) => ({ ...prev, [field]: res.data.url }));
    setUploading(false);
  }

  async function handleSubmit(event) {
    event.preventDefault();
    await api.put(`/api/admin/certificates/${id}`, {
      student: {
        fullName: form.studentName,
        email: form.studentEmail || undefined,
        profileImage: form.studentProfileImage || undefined
      },
      certificate: {
        courseName: form.courseName,
        skillsLearned: form.skillsLearned,
        comments: form.comments || undefined,
        issueDate: form.issueDate || undefined,
        status: form.status,
        certificateUrl: form.certificateUrl,
        handoverUrl: form.handoverUrl || undefined
      }
    });
    navigate("/admin/dashboard");
  }

  if (!form) return <p className="text-sm text-slate">Loading...</p>;

  return (
    <div className="mx-auto max-w-3xl">
      <div className="card rounded-2xl p-6">
        <h1 className="text-2xl">Edit Certificate</h1>
        <p className="text-sm text-slate">
          Update details or upload a new image.
        </p>
        <form onSubmit={handleSubmit} className="mt-6 space-y-4">
          <div className="grid gap-6 lg:grid-cols-[1.1fr_0.9fr]">
            <div className="space-y-4">
              <div className="space-y-2">
                <label htmlFor="studentName" className="label">
                  Full Name
                </label>
                <input
                  id="studentName"
                  className="input"
                  placeholder="Student Full Name"
                  value={form.studentName}
                  onChange={(e) =>
                    setForm({ ...form, studentName: e.target.value })
                  }
                  required
                />
                <p className="helper">Changing the name will link to another student profile.</p>
              </div>
              <div className="space-y-2">
                <label htmlFor="studentEmail" className="label">
                  Email (Optional)
                </label>
                <input
                  id="studentEmail"
                  type="email"
                  className="input"
                  placeholder="name@example.com"
                  value={form.studentEmail}
                  onChange={(e) =>
                    setForm({ ...form, studentEmail: e.target.value })
                  }
                />
              </div>
              <div className="space-y-2">
                <label htmlFor="studentProfileImage" className="label">
                  Profile Image URL (Optional)
                </label>
                <input
                  id="studentProfileImage"
                  className="input"
                  placeholder="https://..."
                  value={form.studentProfileImage}
                  onChange={(e) =>
                    setForm({ ...form, studentProfileImage: e.target.value })
                  }
                />
              </div>
              <div className="space-y-2">
                <label htmlFor="courseName" className="label">
                  Course Name
                </label>
                <input
                  id="courseName"
                  className="input"
                  placeholder="Course Name"
                  value={form.courseName}
                  onChange={(e) =>
                    setForm({ ...form, courseName: e.target.value })
                  }
                  required
                />
              </div>
              <div className="space-y-2">
                <label htmlFor="skillsLearned" className="label">
                  Skills Learned
                </label>
                <input
                  id="skillsLearned"
                  className="input"
                  placeholder="Comma separated skills"
                  value={form.skillsLearned}
                  onChange={(e) =>
                    setForm({ ...form, skillsLearned: e.target.value })
                  }
                  required
                />
                <p className="helper">Example: MS Office, Tally, Typing</p>
              </div>
              <div className="space-y-2">
                <label htmlFor="comments" className="label">
                  Comments
                </label>
                <textarea
                  id="comments"
                  className="input"
                  placeholder="Comments"
                  value={form.comments}
                  onChange={(e) =>
                    setForm({ ...form, comments: e.target.value })
                  }
                  rows={3}
                />
              </div>
              <div className="grid gap-4 md:grid-cols-2">
                <div className="space-y-2">
                  <label htmlFor="issueDate" className="label">
                    Issue Date
                  </label>
                  <input
                    id="issueDate"
                    className="input"
                    type="date"
                    value={form.issueDate}
                    onChange={(e) =>
                      setForm({ ...form, issueDate: e.target.value })
                    }
                  />
                </div>
                <div className="space-y-2">
                  <label htmlFor="status" className="label">
                    Status
                  </label>
                  <select
                    id="status"
                    className="input"
                    value={form.status}
                    onChange={(e) =>
                      setForm({ ...form, status: e.target.value })
                    }
                  >
                    <option value="active">Active</option>
                    <option value="revoked">Revoked</option>
                  </select>
                </div>
              </div>
            </div>
            <div className="frame rounded-2xl p-3">
              <p className="label">Upload New Certificate</p>
              <input
                type="file"
                onChange={(e) => handleUpload(e, "certificateUrl")}
              />
              {uploading ? (
                <p className="text-sm text-slate">Uploading...</p>
              ) : null}
              {form.certificateUrl ? (
                <img
                  src={form.certificateUrl}
                  alt="Certificate preview"
                  className="w-full rounded-xl border border-goldSoft shadow-md"
                  loading="lazy"
                  onError={handleImageError}
                />
              ) : (
                <p className="text-xs text-slate">
                  Upload to preview the certificate image.
                </p>
              )}
              <div className="mt-4 border-t border-goldSoft pt-4">
                <p className="label">Handover Image (Optional)</p>
                <input
                  type="file"
                  onChange={(e) => handleUpload(e, "handoverUrl")}
                />
                <input
                  className="input mt-2"
                  placeholder="Or paste handover image URL"
                  value={form.handoverUrl}
                  onChange={(e) =>
                    setForm({ ...form, handoverUrl: e.target.value })
                  }
                />
              </div>
            </div>
          </div>
          <button
            type="submit"
            className="btn btn-primary w-full"
          >
            Update Certificate
          </button>
        </form>
      </div>
    </div>
  );
}
