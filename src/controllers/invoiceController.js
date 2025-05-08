import { or } from "sequelize";
import invoiceService from "../services/invoiceService";

let handleCreateInvoice = async (req, res) => {
    try {
        const { accountid, receivername, receiverphone, receiveraddress, cartItems, totalquantity, totalprice,
            discountamount, totalpayment, paymentstatus, shippingstatus, paymenttype, shippingmethod, couponid } = req.body
        let response = await invoiceService.createInvoice(accountid, receivername, receiverphone, receiveraddress, cartItems,
            totalquantity, totalprice, discountamount, totalpayment, paymentstatus, shippingstatus, paymenttype, shippingmethod, couponid);
        return res.status(200).json(response);
    } catch (e) {
        console.log(e);
        return res.status(500).json({
            errCode: 3,
            errMessage: 'Lỗi từ server: ' + e.message,
            data: null
        });
    }
}

module.exports = {
    handleCreateInvoice,
};