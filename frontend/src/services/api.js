import axios from "axios";

const BASE_URL = "http://127.0.0.1:5000";

export const sendMessageToAgent = async (message) => {
  const response = await axios.post(`${BASE_URL}/gateway/message`, { message });
  return response.data;
};
