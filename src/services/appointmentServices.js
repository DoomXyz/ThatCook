import axios from "../axios";

const handleCreateAppointmentApi = (appointmentData) => {
  return axios.post("/api/create-appointment", appointmentData);
};

export { handleCreateAppointmentApi };
