import axios from "axios";

const axiosInstance = axios.create({
    baseURL:"https://roadmaps-server-production.up.railway.app"
})

export default axiosInstance