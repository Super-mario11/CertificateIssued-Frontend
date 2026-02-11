export function handleImageError(event) {
  const target = event.currentTarget;
  if (!target || target.dataset.fallbackApplied) return;
  target.dataset.fallbackApplied = "true";
  target.src = "/certificates/placeholder.svg";
}
