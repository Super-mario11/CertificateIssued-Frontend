import { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import api from "../services/api.js";
import CertificateViewer from "../components/CertificateViewer.jsx";
import { handleImageError } from "../utils/imageFallback.js";

export default function CertificatePublic() {
  const { certificateId } = useParams();
  const [certificate, setCertificate] = useState(null);
  const [error, setError] = useState("");
  const [verification, setVerification] = useState(null);

  useEffect(() => {
    async function load() {
      try {
        const res = await api.get(
          `/api/certificates/${certificateId}`
        );
        setCertificate(res.data);
        const verifyRes = await api.get(`/api/verify/${certificateId}`);
        setVerification(verifyRes.data);
      } catch (err) {
        setError("Certificate not found.");
      }
    }
    load();
  }, [certificateId]);

  if (error) return <p className="text-red-600">{error}</p>;

  const skills =
    certificate?.skillsLearned
      ?.split(",")
      .map((item) => item.trim())
      .filter(Boolean) || [];
  const isVerified = (verification?.status || certificate?.status) === "active";

  return (
    <div className="space-y-8">
      {certificate ? (
        <>
          <div className="certificate-public-shell rounded-3xl p-5 md:p-8">
            <div className="mb-4 flex items-center gap-3">
              <img
                src="/logo.svg"
                alt="Excellence Computer Center logo"
                className="h-10 w-10 rounded-lg border border-goldSoft/60 bg-white p-1"
                loading="lazy"
              />
              <p className="text-sm text-slate">Excellence Computer Center</p>
            </div>
            <div className="flex flex-wrap items-center justify-between gap-4">
              <div className="space-y-2">
                <Link to="/certificates" className="text-sm underline">
                  Back to search
                </Link>
                <p className="label">Certificate ID</p>
                <h1 className="display-title text-3xl md:text-4xl">
                  {certificate.certificateId}
                </h1>
                <p className="text-sm text-slate">
                  Issued on {new Date(certificate.issueDate).toLocaleDateString()}
                </p>
              </div>
              <span
                className={`rounded-full px-4 py-2 text-xs uppercase tracking-wide ${
                  isVerified
                    ? "badge text-goldDark"
                    : "bg-slate/15 text-slate"
                }`}
                aria-live="polite"
              >
                {isVerified ? "Verified" : "Revoked"}
              </span>
            </div>
            {verification ? (
              <p className="mt-3 text-xs text-slate">
                Verification status: {verification.valid ? "valid" : "invalid"}
              </p>
            ) : null}

            <div className="mt-7 grid gap-6 lg:grid-cols-[1fr_1.1fr]">
              <section className="glass-panel rounded-3xl p-5 md:p-6" aria-label="Student details">
                <div className="flex items-start gap-4">
                  <div className="student-avatar h-16 w-16 rounded-2xl">
                    {certificate.student?.profileImage ? (
                      <img
                        src={certificate.student.profileImage}
                        alt="Student profile"
                        className="h-full w-full rounded-2xl object-cover"
                        loading="lazy"
                        onError={handleImageError}
                      />
                    ) : (
                      <span>
                        {(certificate.student?.fullName || certificate.student?.name || "U")
                          .slice(0, 1)
                          .toUpperCase()}
                      </span>
                    )}
                  </div>
                  <div>
                    <p className="label">Student</p>
                    <p className="text-2xl">
                      {certificate.student?.fullName || certificate.student?.name || "Unknown"}
                    </p>
                    {certificate.student?.email ? (
                      <p className="text-sm text-slate">{certificate.student.email}</p>
                    ) : null}
                  </div>
                </div>

                <div className="mt-6 space-y-5">
                  <div>
                    <p className="label">Course</p>
                    <p className="text-lg">{certificate.courseName}</p>
                  </div>
                  <div>
                    <p className="label">Skills Learned</p>
                    <div className="mt-2 flex flex-wrap gap-2">
                      {skills.length ? (
                        skills.map((skill) => (
                          <span key={skill} className="chip">
                            {skill}
                          </span>
                        ))
                      ) : (
                        <span className="text-sm text-slate">No skills listed</span>
                      )}
                    </div>
                  </div>
                  <div>
                    <p className="label">Comments</p>
                    <p className="text-sm text-slate">
                      {certificate.comments || "No comments"}
                    </p>
                  </div>
                  <a
                    href={certificate.certificateUrl}
                    target="_blank"
                    rel="noreferrer"
                    className="btn btn-primary"
                  >
                    Download Certificate
                  </a>
                </div>
              </section>

              <section className="certificate-preview rounded-3xl p-3" aria-label="Handover image">
                {certificate.handoverUrl ? (
                  <img
                    src={certificate.handoverUrl}
                    alt="Handover"
                    className="w-full rounded-2xl border border-goldSoft shadow-lg"
                    loading="lazy"
                    onError={handleImageError}
                  />
                ) : (
                  <p className="p-4 text-sm text-slate">
                    Handover image is not available.
                  </p>
                )}
              </section>
            </div>

            <section className="mt-6 border-t border-goldSoft pt-4" aria-label="Handover photo">
              <p className="text-xs text-slate">
                Handover photos are not available on this certificate.
              </p>
            </section>
          </div>
          <CertificateViewer certificate={certificate} />
        </>
      ) : (
        <p className="text-sm text-slate">Loading...</p>
      )}
    </div>
  );
}
