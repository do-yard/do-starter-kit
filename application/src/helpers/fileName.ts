/**
 * Extrae el nombre del archivo desde una URL.
 *
 * @param url - URL completa del archivo.
 * @returns El nombre del archivo o el valor original si no hay URL.
 */
export const getFileNameFromUrl = (url?: string | null) => {
  if (!url) return url;

  const parsedUrl = new URL(url);
  const segments = parsedUrl.pathname.split('/');
  return segments[segments.length - 1];
};
