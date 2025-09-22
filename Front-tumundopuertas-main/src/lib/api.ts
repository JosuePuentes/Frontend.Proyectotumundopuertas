export const getApiUrl = () => {
  const apiUrl = import.meta.env.VITE_API_URL || 'https://crafteo.onrender.com';
  if (apiUrl.startsWith('http://')) {
    return apiUrl.replace('http://', 'https://');
  }
  return apiUrl;
};