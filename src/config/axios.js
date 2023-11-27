import axios from 'axios';

const instance = axios.create({
  baseURL: 'https://us-central1-omo-v1.cloudfunctions.net/omoAPI/',
});

export default instance;