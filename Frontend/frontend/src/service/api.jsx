import axios from 'axios';

const api = axios.create({
  baseURL: 'http://localhost:3000',
  withCredentials: true, // to send/receive cookies
});

export default api;
//it centralises netwrok config so that all components acn use the same base