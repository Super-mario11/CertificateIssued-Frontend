import { Link } from "react-router-dom";
import { handleImageError } from "../utils/imageFallback.js";

export default function CertificateCard({ item, onDelete }) {
  const previewSrc = item.certificateUrl;

  return (
    <div className="card rounded-2xl p-4">
      <div className="grid gap-4 lg:grid-cols-[1.2fr_1fr]">
        <div className="frame rounded-2xl p-2">
          <img
            src={previewSrc}
            alt="Certificate thumbnail"
            className="h-full w-full rounded-2xl object-contain"
            loading="lazy"
            onError={handleImageError}
          />
        </div>
        <div>
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs uppercase tracking-[0.2em] text-slate">
                {item.certificateId}
              </p>
              <h3 className="text-xl">
                {item.student?.fullName || item.student?.name || "Unknown"}
              </h3>
              <p className="text-sm text-slate">{item.courseName}</p>
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
            <Link to={`/certificate/${item.certificateId}`} className="underline">
              Public Link
            </Link>
            {item.student?.id ? (
              <Link to={`/admin/student/${item.student.id}`} className="underline">
                Student Profile
              </Link>
            ) : null}
            <Link to={`/admin/edit/${item.id}`} className="underline">
              Edit
            </Link>
            <button
              type="button"
              onClick={() => onDelete(item.id)}
              className="text-red-600 underline"
            >
              Delete
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
