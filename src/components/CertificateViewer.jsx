import { handleImageError } from "../utils/imageFallback.js";

export default function CertificateViewer({ certificate }) {
  if (!certificate) return null;

  return (
    <div className="card overflow-hidden rounded-2xl">
      <div className="border-b border-goldSoft bg-white px-5 py-4">
        <p className="text-xs uppercase tracking-[0.2em] text-slate">
          Certificate
        </p>
        <h3 className="text-xl">
          {certificate.student?.fullName || certificate.student?.name || "Unknown"}
        </h3>
        <p className="text-sm text-slate">{certificate.courseName}</p>
      </div>
      <div className="p-5">
        <div className="frame rounded-2xl p-3">
          {certificate.certificateUrl ? (
            <img
              src={certificate.certificateUrl}
              alt="Certificate preview"
              className="w-full rounded-xl border border-goldSoft shadow-md"
              onError={handleImageError}
            />
          ) : (
            <p className="text-sm text-slate">Certificate preview is not available.</p>
          )}
        </div>
        <div className="mt-4 flex flex-wrap items-center gap-3 text-sm">
          <a
            href={certificate.certificateUrl}
            target="_blank"
            rel="noreferrer"
            className="btn btn-primary"
          >
            Download
          </a>
          <span
            className={`rounded-full px-4 py-2 text-xs uppercase tracking-wide ${
              certificate.status === "active"
                ? "badge text-goldDark"
                : "bg-slate/20 text-slate"
            }`}
          >
            {certificate.status === "active" ? "Verified" : "Revoked"}
          </span>
        </div>
      </div>
    </div>
  );
}
