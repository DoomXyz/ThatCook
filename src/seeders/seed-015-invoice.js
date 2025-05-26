const { Sequelize } = require('sequelize');

module.exports = {
    up: async (queryInterface) => {
        const createdAt = new Date();

        // Lấy danh sách khách hàng từ bảng Account
        const accounts = await queryInterface.sequelize.query(
            'SELECT AccountID FROM Account WHERE AccountType = :type LIMIT 10',
            {
                replacements: { type: 'C' },
                type: Sequelize.QueryTypes.SELECT,
            }
        );

        if (!accounts || accounts.length < 10) {
            throw new Error('Cần ít nhất 10 tài khoản khách hàng trong bảng Account!');
        }

        // Lấy danh sách sản phẩm và chi tiết sản phẩm từ bảng Product và ProductDetail
        const products = await queryInterface.sequelize.query(
            'SELECT p.ProductID, p.ProductPrice, pd.ProductDetailID, pd.DetailName, pd.Stock, pd.ExtraPrice, pd.Promotion ' +
            'FROM Product p JOIN ProductDetail pd ON p.ProductID = pd.ProductID WHERE pd.Stock > 0 AND pd.DetailStatus = :status',
            {
                replacements: { status: 'AVAIL' },
                type: Sequelize.QueryTypes.SELECT,
            }
        );

        if (!products || products.length < 5) {
            throw new Error('Cần ít nhất 5 sản phẩm có sẵn trong bảng Product và ProductDetail!');
        }

        // Tạo 10 hóa đơn 
        const invoices = [];
        const invoiceDetails = [];

        for (let i = 0; i < 10; i++) {
            const numItems = Math.floor(Math.random() * 16) + 5; // 5-20 sản phẩm
            const selectedItems = products.sort(() => 0.5 - Math.random()).slice(0, numItems);
            let totalQuantity = 0;
            let totalPrice = 0;

            // Tạo chi tiết hóa đơn
            selectedItems.forEach((item, index) => {
                const quantity = Math.floor(Math.random() * 5) + 1; // Số lượng ngẫu nhiên 1-5
                const itemPrice = (parseFloat(item.ProductPrice) + parseFloat(item.ExtraPrice)) * (1 - parseFloat(item.Promotion) / 100);
                totalQuantity += quantity;
                totalPrice += itemPrice * quantity;

                invoiceDetails.push({
                    InvoiceID: `DH00000${i + 1}`,
                    ProductID: item.ProductID,
                    ProductDetailID: item.ProductDetailID,
                    ItemPrice: itemPrice.toFixed(2),
                    ItemQuantity: quantity,
                });
            });

            // Tạo hóa đơn
            invoices.push({
                InvoiceID: `DH00000${i + 1}`,
                AccountID: accounts[i].AccountID,
                ReceiverName: `Khách hàng ${i + 1}`,
                ReceiverPhone: `09010000${String(i + 1).padStart(2, '0')}`,
                ReceiverAddress: `Địa chỉ ${i + 1}, TP.HCM`,
                TotalQuantity: totalQuantity,
                TotalPrice: totalPrice.toFixed(2),
                DiscountAmount: '0.00',
                TotalPayment: totalPrice.toFixed(2),
                CreatedAt: createdAt,
                CanceledAt: null,
                CancelReason: null,
                PaymentStatus: 'PAID',
                ShippingStatus: 'DELI',
                PaymentType: 'CASH',
                ShippingMethod: 'ECO',
                CouponID: null,
            });
        }

        await queryInterface.bulkInsert('Invoice', invoices, {});
        await queryInterface.bulkInsert('InvoiceDetail', invoiceDetails, {});
    },

    down: async (queryInterface) => {
        await queryInterface.bulkDelete('InvoiceDetail', { InvoiceID: Array.from({ length: 10 }, (_, i) => `DH00000${i + 1}`) }, {});
        await queryInterface.bulkDelete('Invoice', { InvoiceID: Array.from({ length: 10 }, (_, i) => `DH00000${i + 1}`) }, {});
    },
};