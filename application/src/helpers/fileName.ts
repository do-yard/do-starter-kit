export const getFileNameFromUrl = (url?: string | null) => {
  if (!url) return url;

  const parsedUrl = new URL(url);
  const segments = parsedUrl.pathname.split('/');
  return segments[segments.length - 1];
};
