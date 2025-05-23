export const getFileNameFromUrl = (url?: string | null) =>
  url ? url.split('/')[5].split('?')[0] : url;
