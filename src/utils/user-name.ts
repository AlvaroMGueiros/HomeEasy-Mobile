export function resolveUserInitials(name: string) {
  const nameParts = name.trim().split(/\s+/).filter(Boolean);
  if (!nameParts.length) return 'HE';
  if (nameParts.length === 1) return nameParts[0].slice(0, 2).toUpperCase();
  return `${nameParts[0][0]}${nameParts[nameParts.length - 1][0]}`.toUpperCase();
}
