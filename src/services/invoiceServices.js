import axios from "../axios";

const handleCreateInvoiceApi = (invoiceData) => {
    return axios.post("/api/create-invoice", invoiceData);
};

export {
    handleCreateInvoiceApi,
};