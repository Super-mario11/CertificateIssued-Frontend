import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
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

export default function AdminCreate() {
  const [studentName, setStudentName] = useState("");
  const [studentEmail, setStudentEmail] = useState("");
  const [studentProfileImage, setStudentProfileImage] = useState("");
  const [allowMultiple, setAllowMultiple] = useState(true);
  const [certificates, setCertificates] = useState([]);
  const [draft, setDraft] = useState({ ...emptyCertificate });
  const [editingIndex, setEditingIndex] = useState(null);
  const [uploading, setUploading] = useState({});
  const [notice, setNotice] = useState("");
  const navigate = useNavigate();

  function updateDraft(field, value) {
    setDraft((prev) => ({ ...prev, [field]: value }));
  }

  function resetDraft() {
    setDraft({ ...emptyCertificate });
    setEditingIndex(null);
  }

  useEffect(() => {
    if (!allowMultiple && certificates.length > 1) {
      setCertificates((prev) => prev.slice(0, 1));
    }
  }, [allowMultiple, certificates.length]);

  function validateDraft() {
    if (!draft.courseName.trim()) return "Course name is required.";
    if (!draft.skillsLearned.trim()) return "Skills learned are required.";
    if (!draft.certificateUrl.trim()) return "Please upload the certificate image.";
    return "";
  }

  function saveDraft() {
    if (!allowMultiple && certificates.length >= 1 && editingIndex === null) {
      setNotice("This student can only have one certificate.");
      return;
    }
    const error = validateDraft();
    if (error) {
      setNotice(error);
      return;
    }
    setNotice("");
    setCertificates((prev) => {
      if (editingIndex === null) return [...prev, draft];
      const next = [...prev];
      next[editingIndex] = draft;
      return next;
    });
    resetDraft();
  }

  function editCertificate(index) {
    setDraft(certificates[index]);
    setEditingIndex(index);
    setNotice("");
  }

  function removeCertificate(index) {
    setCertificates((prev) => prev.filter((_, i) => i !== index));
    setEditingIndex((prev) => {
      if (prev === null) return null;
      if (prev === index) return null;
      return prev > index ? prev - 1 : prev;
    });
    if (editingIndex === index) resetDraft();
  }

  async function handleUpload(event, field) {
    const file = event.target.files?.[0];
    if (!file) return;
    const key = `draft-${field}`;
    setUploading((prev) => ({ ...prev, [key]: true }));
    const data = new FormData();
    data.append("file", file);
    data.append("studentName", studentName.trim() || "student");
    data.append("courseName", draft.courseName || "");
    data.append("assetType", field);
    try {
      const res = await api.post("/api/uploads", data);
      updateDraft(field, res.data.url);
      setNotice("");
    } catch (err) {
      setNotice(
        err?.response?.data?.message ||
          "Upload failed. Check your login and Cloudinary settings."
      );
    } finally {
      setUploading((prev) => ({ ...prev, [key]: false }));
    }
  }

  async function handleSubmit(event) {
    event.preventDefault();
    const trimmed = studentName.trim();
    if (!trimmed) {
      setNotice("Student full name is required.");
      return;
    }
    if (certificates.length === 0) {
      setNotice("Add at least one certificate before saving.");
      return;
    }
    const missingUpload = certificates.find((entry) => !entry.certificateUrl);
    if (missingUpload) {
      setNotice("Every certificate needs an uploaded certificate image.");
      return;
    }
    setNotice("");
    try {
      for (const entry of certificates) {
        await api.post("/api/admin/certificates", {
          student: {
            fullName: trimmed,
            email: studentEmail.trim() || undefined,
            profileImage: studentProfileImage.trim() || undefined,
            allowMultipleCertificates: allowMultiple
          },
          certificate: {
            courseName: entry.courseName,
            skillsLearned: entry.skillsLearned,
            comments: entry.comments || undefined,
            issueDate: entry.issueDate || undefined,
            status: entry.status,
            certificateUrl: entry.certificateUrl,
            handoverUrl: entry.handoverUrl || undefined
          }
        });
      }
      navigate("/admin/dashboard");
    } catch (err) {
      setNotice(
        err?.response?.data?.message ||
          "Save failed. Please check your login and required fields."
      );
    }
  }

  return (
    <div className="mx-auto max-w-5xl space-y-8">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <h1 className="text-2xl">New Student</h1>
          <p className="text-sm text-slate">
            Add student details and certificates.
          </p>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-8">
        <div className="grid gap-6 lg:grid-cols-[1.15fr_0.85fr]">
          <div className="card rounded-2xl p-5">
            <p className="text-xs uppercase tracking-[0.2em] text-slate">
              Step 1
            </p>
            <h2 className="text-2xl mt-2">Student Details</h2>
            <p className="text-sm text-slate">
              This name will be used for every certificate added below.
            </p>
            <div className="mt-5 space-y-2">
              <label htmlFor="studentName" className="label">
                Full Name
              </label>
              <input
                id="studentName"
                className="input"
                placeholder="Student Full Name"
                value={studentName}
                onChange={(e) => setStudentName(e.target.value)}
                required
              />
              <p className="helper">Tip: use the exact name printed on certificates.</p>
            </div>
            <div className="mt-4 space-y-2">
              <label htmlFor="studentEmail" className="label">
                Email (Optional)
              </label>
              <input
                id="studentEmail"
                type="email"
                className="input"
                placeholder="name@example.com"
                value={studentEmail}
                onChange={(e) => setStudentEmail(e.target.value)}
              />
            </div>
          <div className="mt-4 space-y-2">
            <label htmlFor="studentProfileImage" className="label">
              Profile Image URL (Optional)
            </label>
            <input
              id="studentProfileImage"
              className="input"
              placeholder="https://..."
              value={studentProfileImage}
              onChange={(e) => setStudentProfileImage(e.target.value)}
            />
          </div>
          <div className="mt-4 space-y-2">
            <label className="label" htmlFor="allowMultiple">
              Certificate Mode
            </label>
            <select
              id="allowMultiple"
              className="input"
              value={allowMultiple ? "multiple" : "single"}
              onChange={(e) => setAllowMultiple(e.target.value === "multiple")}
            >
              <option value="multiple">Allow multiple certificates</option>
              <option value="single">Allow only one certificate</option>
            </select>
          </div>
          </div>

          <div className="card rounded-2xl p-5">
            <p className="text-xs uppercase tracking-[0.2em] text-slate">
              Step 3
            </p>
            <h2 className="text-2xl mt-2">Review & Save</h2>
            <p className="text-sm text-slate">
              Confirm the student and certificate count before submitting.
            </p>
            <div className="mt-5 space-y-3 text-sm">
              <div className="flex items-center justify-between">
                <span className="text-slate">Student</span>
                <span className="font-semibold">
                  {studentName.trim() ? studentName.trim() : "Not set"}
                </span>
              </div>
          <div className="flex items-center justify-between">
            <span className="text-slate">Certificates</span>
            <span className="font-semibold">{certificates.length}</span>
          </div>
              <div className="flex items-center justify-between">
                <span className="text-slate">Ready to submit</span>
                <span className="font-semibold">
                  {certificates.length > 0 ? "Yes" : "No"}
                </span>
              </div>
            </div>
            {notice ? (
              <div className="mt-4 rounded-xl border border-red-200 bg-red-50 p-3 text-sm text-red-700">
                {notice}
              </div>
            ) : null}
            <button type="submit" className="btn btn-primary mt-6 w-full">
              Save All Certificates
            </button>
          </div>
        </div>

        <div className="card rounded-2xl p-5">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div>
              <p className="text-xs uppercase tracking-[0.2em] text-slate">
                Step 2
              </p>
              <h2 className="text-2xl mt-2">Add Certificates</h2>
              <p className="text-sm text-slate">
                Build one certificate at a time and add it to the list.
              </p>
            </div>
            {editingIndex !== null ? (
              <span className="badge rounded-full px-3 py-1 text-xs uppercase tracking-wide text-goldDark">
                Editing Certificate {editingIndex + 1}
              </span>
            ) : null}
          </div>

          <div className="mt-6 grid gap-6 lg:grid-cols-[1.1fr_0.9fr]">
            <div className="space-y-4">
              <div className="space-y-2">
                <label className="label" htmlFor="course-name">
                  Course Name
                </label>
                <input
                  id="course-name"
                  className="input"
                  placeholder="Course Name"
                  value={draft.courseName}
                  onChange={(e) => updateDraft("courseName", e.target.value)}
                />
              </div>
              <div className="space-y-2">
                <label className="label" htmlFor="skills-learned">
                  Skills Learned
                </label>
                <input
                  id="skills-learned"
                  className="input"
                  placeholder="Comma separated skills"
                  value={draft.skillsLearned}
                  onChange={(e) => updateDraft("skillsLearned", e.target.value)}
                />
                <p className="helper">Example: MS Office, Tally, Typing</p>
              </div>
              <div className="space-y-2">
                <label className="label" htmlFor="comments">
                  Comments
                </label>
                <textarea
                  id="comments"
                  className="input"
                  placeholder="Comments"
                  value={draft.comments}
                  onChange={(e) => updateDraft("comments", e.target.value)}
                  rows={3}
                />
              </div>
              <div className="grid gap-4 md:grid-cols-2">
                <div className="space-y-2">
                  <label className="label" htmlFor="issue-date">
                    Issue Date
                  </label>
                  <input
                    id="issue-date"
                    className="input"
                    type="date"
                    value={draft.issueDate}
                    onChange={(e) => updateDraft("issueDate", e.target.value)}
                  />
                </div>
                <div className="space-y-2">
                  <label className="label" htmlFor="status">
                    Status
                  </label>
                  <select
                    id="status"
                    className="input"
                    value={draft.status}
                    onChange={(e) => updateDraft("status", e.target.value)}
                  >
                    <option value="active">Active</option>
                    <option value="revoked">Revoked</option>
                  </select>
                </div>
              </div>
              <div className="flex flex-wrap items-center gap-3">
                <button
                  type="button"
                  onClick={saveDraft}
                  className="btn btn-primary"
                  disabled={!allowMultiple && certificates.length >= 1 && editingIndex === null}
                >
                  {editingIndex === null ? "Add Certificate" : "Update Certificate"}
                </button>
                {editingIndex !== null ? (
                  <button type="button" onClick={resetDraft} className="btn btn-outline">
                    Cancel Edit
                  </button>
                ) : null}
              </div>
            </div>

            <div className="frame rounded-2xl p-3">
              <p className="label">Certificate Upload</p>
              <input type="file" onChange={(e) => handleUpload(e, "certificateUrl")} />
              {uploading["draft-certificateUrl"] ? (
                <p className="text-sm text-slate">Uploading...</p>
              ) : null}
              <div className="space-y-2">
                <label className="label" htmlFor="certificateUrlManual">
                  Or paste image URL
                </label>
                <input
                  id="certificateUrlManual"
                  className="input"
                  placeholder="https://..."
                  value={draft.certificateUrl}
                  onChange={(e) => updateDraft("certificateUrl", e.target.value)}
                />
              </div>
              {draft.certificateUrl ? (
                <img
                  src={draft.certificateUrl}
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

              <div className="mt-4 space-y-2 border-t border-goldSoft pt-4">
                <p className="label">Handover Image (Optional)</p>
                <input type="file" onChange={(e) => handleUpload(e, "handoverUrl")} />
                {uploading["draft-handoverUrl"] ? (
                  <p className="text-sm text-slate">Uploading...</p>
                ) : null}
                <input
                  className="input"
                  placeholder="Or paste handover image URL"
                  value={draft.handoverUrl}
                  onChange={(e) => updateDraft("handoverUrl", e.target.value)}
                />
              </div>
            </div>
          </div>
        </div>

        <div className="card rounded-2xl p-5">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <h2 className="text-2xl">Certificates Added</h2>
            <span className="text-sm text-slate">
              {certificates.length} total
            </span>
          </div>
          {certificates.length === 0 ? (
            <p className="mt-4 text-sm text-slate">
              No certificates added yet. Use the form above to add one.
            </p>
          ) : (
            <div className="mt-6 grid gap-4 lg:grid-cols-2">
              {certificates.map((item, index) => (
                <div key={`${item.courseName}-${index}`} className="rounded-3xl border border-goldSoft bg-white p-5">
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <p className="text-xs uppercase tracking-[0.2em] text-slate">
                        Certificate {index + 1}
                      </p>
                      <h3 className="text-lg">{item.courseName || "Untitled"}</h3>
                      <p className="text-sm text-slate">{item.skillsLearned}</p>
                    </div>
                    <span
                      className={`rounded-full px-3 py-1 text-xs uppercase tracking-wide ${
                        item.status === "active"
                          ? "badge text-goldDark"
                          : "bg-slate/15 text-slate"
                      }`}
                    >
                      {item.status}
                    </span>
                  </div>
                  <div className="mt-4 flex flex-wrap items-center gap-3 text-sm">
                    <button type="button" onClick={() => editCertificate(index)} className="underline">
                      Edit
                    </button>
                    <button
                      type="button"
                      onClick={() => removeCertificate(index)}
                      className="text-red-600 underline"
                    >
                      Remove
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </form>
    </div>
  );
}
