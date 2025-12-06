// Jika di Railway (ada env variable), pakai link Railway.
// Jika di Laptop (tidak ada env), pakai localhost.
export const API_URL = process.env.REACT_APP_API_URL || 'http://127.0.0.1:8000';