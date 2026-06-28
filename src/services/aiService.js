import db from '../models/index';
import crypto from 'crypto';
import { Op } from 'sequelize';

// ============ SERVICE IMPORTS FOR AI AGENT ============
import { userRegister, changeAccountStatus, loadAccountInfo } from './accountService';
import { changeInvoiceStatus, loadInvoiceInfo } from './invoiceService';
import { changeCouponInfo, createCoupon } from './couponService';
import { changeAppointmentStatus } from './appointmentService';
import { changeBannerInfo } from './bannerService';
import { changeProductInfo, loadProductInfo } from './productService';

const ALGORITHM = 'aes-256-cbc';
const ENCRYPTION_KEY = (process.env.AI_ENCRYPTION_KEY || '').padEnd(32, '0').slice(0, 32);
const IV_LENGTH = 16;

// ============ ENCRYPTION HELPERS ============
const encrypt = (text) => {
  const iv = crypto.randomBytes(IV_LENGTH);
  const cipher = crypto.createCipheriv(ALGORITHM, Buffer.from(ENCRYPTION_KEY, 'utf-8'), iv);
  let encrypted = cipher.update(text, 'utf-8', 'hex');
  encrypted += cipher.final('hex');
  return iv.toString('hex') + ':' + encrypted;
};

const decrypt = (text) => {
  const parts = text.split(':');
  const iv = Buffer.from(parts.shift(), 'hex');
  const encryptedText = parts.join(':');
  const decipher = crypto.createDecipheriv(ALGORITHM, Buffer.from(ENCRYPTION_KEY, 'utf-8'), iv);
  let decrypted = decipher.update(encryptedText, 'hex', 'utf-8');
  decrypted += decipher.final('utf-8');
  return decrypted;
};

// ============ API KEY MANAGEMENT ============
const saveApiKey = async (accountId, apiKey) => {
  try {
    const encrypted = encrypt(apiKey);
    const existing = await db.AiSetting.findOne({ where: { AccountID: accountId } });
    if (existing) {
      await db.AiSetting.update(
        { GroqApiKey: encrypted, UpdatedAt: new Date() },
        { where: { AccountID: accountId } }
      );
    } else {
      await db.AiSetting.create({
        AccountID: accountId,
        GroqApiKey: encrypted,
        CreatedAt: new Date(),
        UpdatedAt: new Date(),
      });
    }
    return { errCode: 0, errMessage: 'API key saved successfully!' };
  } catch (e) {
    console.error('Error saving API key:', e);
    return { errCode: 1, errMessage: 'Failed to save API key.' };
  }
};

const getApiKeyExists = async (accountId) => {
  try {
    const setting = await db.AiSetting.findOne({ where: { AccountID: accountId } });
    return { errCode: 0, exists: !!setting };
  } catch (e) {
    console.error('Error checking API key:', e);
    return { errCode: 1, exists: false };
  }
};

const deleteApiKey = async (accountId) => {
  try {
    await db.AiSetting.destroy({ where: { AccountID: accountId } });
    return { errCode: 0, errMessage: 'API key deleted.' };
  } catch (e) {
    console.error('Error deleting API key:', e);
    return { errCode: 1, errMessage: 'Failed to delete API key.' };
  }
};

// ============ BUSINESS METRICS AGGREGATION ============
const aggregateBusinessMetrics = async () => {
  const now = new Date();
  const currentYear = now.getFullYear();
  const currentMonth = now.getMonth() + 1;
  const currentDay = now.getDate();
  const daysInMonth = new Date(currentYear, currentMonth, 0).getDate();

  const lastMonth = currentMonth === 1 ? 12 : currentMonth - 1;
  const lastMonthYear = currentMonth === 1 ? currentYear - 1 : currentYear;

  const thisMonthStart = `${currentYear}-${String(currentMonth).padStart(2, '0')}-01`;
  const thisMonthEnd = `${currentYear}-${String(currentMonth).padStart(2, '0')}-${String(daysInMonth).padStart(2, '0')}`;
  const lastMonthDays = new Date(lastMonthYear, lastMonth, 0).getDate();
  const lastMonthStart = `${lastMonthYear}-${String(lastMonth).padStart(2, '0')}-01`;
  const lastMonthEnd = `${lastMonthYear}-${String(lastMonth).padStart(2, '0')}-${String(lastMonthDays).padStart(2, '0')}`;

  const thisYearStart = `${currentYear}-01-01`;
  const thisYearEnd = `${currentYear}-12-31`;
  const lastYearStart = `${currentYear - 1}-01-01`;
  const lastYearEnd = `${currentYear - 1}-12-31`;

  const todayStart = `${currentYear}-${String(currentMonth).padStart(2, '0')}-${String(currentDay).padStart(2, '0')} 00:00:00`;
  const todayEnd = `${currentYear}-${String(currentMonth).padStart(2, '0')}-${String(currentDay).padStart(2, '0')} 23:59:59`;

  const sevenDaysAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0];

  try {
    // Revenue
    const [revenueThisMonth] = await db.sequelize.query(
      `SELECT COALESCE(SUM(TotalPayment), 0) as total FROM Invoice WHERE PaymentStatus = 'PAID' AND CreatedAt BETWEEN '${thisMonthStart}' AND '${thisMonthEnd} 23:59:59'`
    );
    const [revenueLastMonth] = await db.sequelize.query(
      `SELECT COALESCE(SUM(TotalPayment), 0) as total FROM Invoice WHERE PaymentStatus = 'PAID' AND CreatedAt BETWEEN '${lastMonthStart}' AND '${lastMonthEnd} 23:59:59'`
    );
    const [revenueThisYear] = await db.sequelize.query(
      `SELECT COALESCE(SUM(TotalPayment), 0) as total FROM Invoice WHERE PaymentStatus = 'PAID' AND CreatedAt BETWEEN '${thisYearStart}' AND '${thisYearEnd} 23:59:59'`
    );
    const [revenueLastYear] = await db.sequelize.query(
      `SELECT COALESCE(SUM(TotalPayment), 0) as total FROM Invoice WHERE PaymentStatus = 'PAID' AND CreatedAt BETWEEN '${lastYearStart}' AND '${lastYearEnd} 23:59:59'`
    );

    // Invoice counts this month
    const [invoiceCounts] = await db.sequelize.query(
      `SELECT 
        COUNT(*) as total,
        SUM(CASE WHEN PaymentStatus = 'PAID' THEN 1 ELSE 0 END) as paid,
        SUM(CASE WHEN PaymentStatus = 'PEND' THEN 1 ELSE 0 END) as pending,
        SUM(CASE WHEN ShippingStatus = 'CANCELED' THEN 1 ELSE 0 END) as canceled
      FROM Invoice WHERE CreatedAt BETWEEN '${thisMonthStart}' AND '${thisMonthEnd} 23:59:59'`
    );

    // Top 5 products this month
    const [topProducts] = await db.sequelize.query(
      `SELECT p.ProductName, SUM(id.ItemQuantity) as TotalSold, SUM(id.ItemPrice * id.ItemQuantity) as TotalRevenue
       FROM InvoiceDetail id
       JOIN Invoice i ON id.InvoiceID = i.InvoiceID
       JOIN Product p ON id.ProductID = p.ProductID
       WHERE i.PaymentStatus = 'PAID' AND i.CreatedAt BETWEEN '${thisMonthStart}' AND '${thisMonthEnd} 23:59:59'
       GROUP BY p.ProductID, p.ProductName
       ORDER BY TotalSold DESC
       LIMIT 5`
    );

    // Top 5 products today (for alert check)
    const [topProductsToday] = await db.sequelize.query(
      `SELECT p.ProductName, COALESCE(SUM(id.ItemQuantity), 0) as TotalSold
       FROM InvoiceDetail id
       JOIN Invoice i ON id.InvoiceID = i.InvoiceID
       JOIN Product p ON id.ProductID = p.ProductID
       WHERE i.PaymentStatus = 'PAID' AND i.CreatedAt BETWEEN '${todayStart}' AND '${todayEnd}'
       GROUP BY p.ProductID, p.ProductName
       ORDER BY TotalSold DESC
       LIMIT 5`
    );

    // Accounts
    const [totalAccounts] = await db.sequelize.query(
      `SELECT COUNT(*) as total FROM Account WHERE AccountStatus = 'ACT'`
    );
    const [newAccountsThisMonth] = await db.sequelize.query(
      `SELECT COUNT(*) as total FROM Account WHERE CreatedAt BETWEEN '${thisMonthStart}' AND '${thisMonthEnd} 23:59:59'`
    );
    const [newAccountsLast7Days] = await db.sequelize.query(
      `SELECT COUNT(*) as total FROM Account WHERE CreatedAt >= '${sevenDaysAgo}'`
    );

    // Appointments this month
    const [appointmentCounts] = await db.sequelize.query(
      `SELECT 
        COUNT(*) as total,
        SUM(CASE WHEN AppointmentStatus = 'COMP' THEN 1 ELSE 0 END) as completed,
        SUM(CASE WHEN AppointmentStatus = 'PEND' THEN 1 ELSE 0 END) as pending,
        SUM(CASE WHEN AppointmentStatus = 'CANCELED' THEN 1 ELSE 0 END) as canceled
      FROM Appointment WHERE CreatedAt BETWEEN '${thisMonthStart}' AND '${thisMonthEnd} 23:59:59'`
    );

    // Coupons
    const [activeCoupons] = await db.sequelize.query(
      `SELECT COUNT(*) as total FROM Coupon WHERE CouponStatus = 'ACTIVE'`
    );

    // Revenue today
    const [revenueToday] = await db.sequelize.query(
      `SELECT COALESCE(SUM(TotalPayment), 0) as total FROM Invoice WHERE PaymentStatus = 'PAID' AND CreatedAt BETWEEN '${todayStart}' AND '${todayEnd}'`
    );

    // Top 5 most clicked products this month
    let topClickedProducts = [];
    try {
      const [clickResults] = await db.sequelize.query(
        `SELECT p.ProductName, p.ProductID, COUNT(*) as clicks
         FROM ProductClick pc
         JOIN Product p ON pc.ProductID = p.ProductID
         WHERE pc.ClickedAt BETWEEN '${thisMonthStart}' AND '${thisMonthEnd} 23:59:59'
         GROUP BY p.ProductID, p.ProductName
         ORDER BY clicks DESC
         LIMIT 5`
      );
      topClickedProducts = clickResults || [];
    } catch (e) {
      console.log('Warning: ProductClick query failed:', e.message);
    }

    // Conversion rate: clicks vs purchases per product this month
    let conversionData = [];
    try {
      const [convResults] = await db.sequelize.query(
        `SELECT p.ProductName, p.ProductID,
          COALESCE(click_data.clicks, 0) as clicks,
          COALESCE(sale_data.purchases, 0) as purchases
         FROM Product p
         LEFT JOIN (
           SELECT ProductID, COUNT(*) as clicks FROM ProductClick
           WHERE ClickedAt BETWEEN '${thisMonthStart}' AND '${thisMonthEnd} 23:59:59'
           GROUP BY ProductID
         ) click_data ON p.ProductID = click_data.ProductID
         LEFT JOIN (
           SELECT id.ProductID, COUNT(DISTINCT i.InvoiceID) as purchases
           FROM InvoiceDetail id
           JOIN Invoice i ON id.InvoiceID = i.InvoiceID
           WHERE i.PaymentStatus = 'PAID' AND i.CreatedAt BETWEEN '${thisMonthStart}' AND '${thisMonthEnd} 23:59:59'
           GROUP BY id.ProductID
         ) sale_data ON p.ProductID = sale_data.ProductID
         WHERE COALESCE(click_data.clicks, 0) > 0
         ORDER BY clicks DESC
         LIMIT 10`
      );
      conversionData = convResults || [];
    } catch (e) {
      console.log('Warning: ConversionData query failed:', e.message);
    }

    const metrics = {
      revenue: {
        today: parseFloat(revenueToday[0]?.total || 0),
        thisMonth: parseFloat(revenueThisMonth[0]?.total || 0),
        lastMonth: parseFloat(revenueLastMonth[0]?.total || 0),
        thisYear: parseFloat(revenueThisYear[0]?.total || 0),
        lastYear: parseFloat(revenueLastYear[0]?.total || 0),
      },
      invoices: {
        total: parseInt(invoiceCounts[0]?.total || 0),
        paid: parseInt(invoiceCounts[0]?.paid || 0),
        pending: parseInt(invoiceCounts[0]?.pending || 0),
        canceled: parseInt(invoiceCounts[0]?.canceled || 0),
      },
      topProducts,
      topProductsToday,
      accounts: {
        total: parseInt(totalAccounts[0]?.total || 0),
        newThisMonth: parseInt(newAccountsThisMonth[0]?.total || 0),
        newLast7Days: parseInt(newAccountsLast7Days[0]?.total || 0),
      },
      appointments: {
        total: parseInt(appointmentCounts[0]?.total || 0),
        completed: parseInt(appointmentCounts[0]?.completed || 0),
        pending: parseInt(appointmentCounts[0]?.pending || 0),
        canceled: parseInt(appointmentCounts[0]?.canceled || 0),
      },
      coupons: {
        active: parseInt(activeCoupons[0]?.total || 0),
      },
      topClickedProducts,
      conversionData,
      dateInfo: {
        currentDay,
        currentMonth,
        currentYear,
        daysInMonth,
        daysElapsed: currentDay,
      },
    };

    return metrics;
  } catch (e) {
    console.error('Error aggregating metrics:', e);
    return null;
  }
};

// ============ PREDICTIVE ANALYTICS ============
const computePredictions = (metrics) => {
  if (!metrics) return {};
  const { revenue, dateInfo } = metrics;
  const { daysElapsed, daysInMonth } = dateInfo;

  const avgDailyRevenue = daysElapsed > 0 ? revenue.thisMonth / daysElapsed : 0;
  const projectedMonthlyRevenue = avgDailyRevenue * daysInMonth;
  const lastMonthRevenue = revenue.lastMonth;

  let growthRate = 0;
  if (lastMonthRevenue > 0) {
    growthRate = ((projectedMonthlyRevenue - lastMonthRevenue) / lastMonthRevenue) * 100;
  }

  let trend = 'ổn định';
  if (growthRate > 5) trend = 'tăng';
  else if (growthRate < -5) trend = 'giảm';

  return {
    avgDailyRevenue: Math.round(avgDailyRevenue),
    projectedMonthlyRevenue: Math.round(projectedMonthlyRevenue),
    growthRate: Math.round(growthRate * 100) / 100,
    trend,
  };
};

// ============ SMART ALERTS ============
const computeAlerts = (metrics) => {
  if (!metrics) return [];
  const alerts = [];
  const { revenue, invoices, topProductsToday, accounts } = metrics;

  // Revenue drop >20%
  if (revenue.lastMonth > 0) {
    const dropRate = ((revenue.lastMonth - revenue.thisMonth) / revenue.lastMonth) * 100;
    if (dropRate > 20) {
      alerts.push({
        severity: 'critical',
        icon: '🔴',
        message: `Doanh thu tháng này giảm ${Math.round(dropRate)}% so với tháng trước! (${revenue.thisMonth.toLocaleString('vi-VN')}đ vs ${revenue.lastMonth.toLocaleString('vi-VN')}đ)`,
      });
    }
  }

  // Cancel rate >15%
  if (invoices.total > 0) {
    const cancelRate = (invoices.canceled / invoices.total) * 100;
    if (cancelRate > 15) {
      alerts.push({
        severity: 'critical',
        icon: '🔴',
        message: `Tỉ lệ hủy đơn cao bất thường: ${Math.round(cancelRate)}% (${invoices.canceled}/${invoices.total} đơn)`,
      });
    }
  }

  // Top product 0 sales today
  if (topProductsToday && topProductsToday.length === 0 && metrics.topProducts && metrics.topProducts.length > 0) {
    alerts.push({
      severity: 'warning',
      icon: '🟡',
      message: `Chưa có đơn hàng nào được thanh toán hôm nay.`,
    });
  }

  // No new accounts in 7 days
  if (accounts.newLast7Days === 0) {
    alerts.push({
      severity: 'warning',
      icon: '🟡',
      message: `Không có khách hàng mới đăng ký trong 7 ngày qua.`,
    });
  }

  // Revenue grew >10%
  if (revenue.lastMonth > 0) {
    const growthRate = ((revenue.thisMonth - revenue.lastMonth) / revenue.lastMonth) * 100;
    if (growthRate > 10) {
      alerts.push({
        severity: 'positive',
        icon: '🟢',
        message: `Doanh thu tăng trưởng tốt: +${Math.round(growthRate)}% so với tháng trước!`,
      });
    }
  }

  return alerts;
};

// ============ BUILD SYSTEM PROMPT ============
const buildSystemPrompt = (metrics, predictions, alerts) => {
  if (!metrics) {
    return `Bạn là AI Manager trợ lý kinh doanh cho cửa hàng thú cưng PetShop. Hiện tại không thể tải dữ liệu từ hệ thống. Hãy thông báo lỗi cho chủ cửa hàng.`;
  }

  const alertsText =
    alerts.length > 0
      ? alerts.map((a) => `  ${a.icon} [${a.severity.toUpperCase()}] ${a.message}`).join('\n')
      : '  Không có cảnh báo nào.';

  const topProductsText =
    metrics.topProducts.length > 0
      ? metrics.topProducts.map((p, i) => `  ${i + 1}. ${p.ProductName}: ${p.TotalSold} sản phẩm (${parseFloat(p.TotalRevenue).toLocaleString('vi-VN')}đ)`).join('\n')
      : '  Chưa có dữ liệu sản phẩm.';

  return `Bạn là AI Manager của PetShop. Dưới đây là dữ liệu hệ thống thời gian thực:
- Ngày: ${metrics.dateInfo.currentDay}/${metrics.dateInfo.currentMonth}/${metrics.dateInfo.currentYear}
- Doanh thu: Hôm nay ${metrics.revenue.today}đ, Tháng này ${metrics.revenue.thisMonth}đ.
- Hóa đơn: ${metrics.invoices.total} tổng, ${metrics.invoices.pending} chờ xử lý.
- Tài khoản: ${metrics.accounts.total}.
- Lịch hẹn: ${metrics.appointments.pending} đang chờ.

Cảnh báo hệ thống:
${alertsText}

Dự báo:
${predictions.revenueGrowth > 0 ? `+ Doanh thu dự kiến tháng này: ${predictions.estimatedRevenue.toLocaleString()}đ` : '- Chưa đủ dữ liệu dự báo.'}

QUY TẮC:
1. Dùng dữ liệu trên để trả lời câu hỏi phân tích doanh thu/khách hàng.
2. CHỈ dùng tools khi người dùng yêu cầu hành động (tạo/cập nhật/xóa).
3. KHÔNG ảo tưởng ra tools không có sẵn. Trả lời ngắn gọn, lịch sự.`;
};

// ============ AI AGENT TOOLS DEFINITION ============
const AGENT_TOOLS = [
  {
    type: 'function',
    function: {
      name: 'create_account',
      description: 'Tạo tài khoản mới trong hệ thống. Trả về tên đăng nhập và mật khẩu.',
      parameters: {
        type: 'object',
        properties: {
          AccountName: { type: 'string', description: 'Tên đăng nhập (username), viết liền không dấu' },
          Email: { type: 'string', description: 'Email của tài khoản' },
          Password: { type: 'string', description: 'Mật khẩu (ít nhất 6 ký tự, có chữ hoa, chữ thường, số)' },
          UserName: { type: 'string', description: 'Tên hiển thị của người dùng' },
          Phone: { type: 'string', description: 'Số điện thoại (10 số, bắt đầu bằng 0)' },
          Address: { type: 'string', description: 'Địa chỉ' },
          Gender: { type: 'string', enum: ['M', 'F'], description: 'Giới tính: M=Nam, F=Nữ' },
          AccountType: { type: 'string', enum: ['A', 'O', 'V', 'C'], description: 'Loại tài khoản: A=Admin, O=Owner, V=Bác sĩ, C=Khách hàng' },
        },
        required: ['AccountName', 'Email', 'Password', 'UserName', 'Phone', 'Address', 'Gender', 'AccountType'],
      },
    },
  },
  {
    type: 'function',
    function: {
      name: 'update_payment_status',
      description: 'Cập nhật trạng thái thanh toán (PaymentStatus) của một hóa đơn cụ thể.',
      parameters: {
        type: 'object',
        properties: {
          InvoiceID: { type: 'string', description: 'Mã hóa đơn' },
          Status: { type: 'string', enum: ['PAID', 'PEND', 'REFUND'], description: 'Trạng thái mới: PAID=Đã thanh toán, PEND=Chờ thanh toán, REFUND=Hoàn tiền' },
        },
        required: ['InvoiceID', 'Status'],
      },
    },
  },
  {
    type: 'function',
    function: {
      name: 'update_shipping_status',
      description: 'Cập nhật trạng thái giao hàng (ShippingStatus) của một hóa đơn cụ thể.',
      parameters: {
        type: 'object',
        properties: {
          InvoiceID: { type: 'string', description: 'Mã hóa đơn' },
          Status: { type: 'string', enum: ['PEND', 'DELI', 'PEND_CANCEL', 'CANCELED'], description: 'Trạng thái mới: PEND=Chờ, DELI=Đã giao, PEND_CANCEL=Chờ hủy, CANCELED=Hủy' },
          CancelReason: { type: 'string', description: 'Lý do hủy (bắt buộc khi Status = PEND_CANCEL hoặc CANCELED)' },
        },
        required: ['InvoiceID', 'Status'],
      },
    },
  },
  {
    type: 'function',
    function: {
      name: 'batch_update_invoices',
      description: 'Cập nhật trạng thái hàng loạt cho nhiều hóa đơn theo điều kiện lọc (ví dụ: chuyển tất cả hóa đơn PEND hôm nay sang PAID).',
      parameters: {
        type: 'object',
        properties: {
          Type: { type: 'string', enum: ['PaymentStatus', 'ShippingStatus'], description: 'Loại trạng thái cần đổi' },
          FromStatus: { type: 'string', description: 'Trạng thái hiện tại cần lọc' },
          ToStatus: { type: 'string', description: 'Trạng thái mới muốn chuyển sang' },
          DateFilter: { type: 'string', description: 'Lọc theo ngày, định dạng YYYY-MM-DD. Nếu không cung cấp thì áp dụng cho tất cả.' },
        },
        required: ['Type', 'FromStatus', 'ToStatus'],
      },
    },
  },
  {
    type: 'function',
    function: {
      name: 'update_coupon_status',
      description: 'Cập nhật trạng thái của mã giảm giá (bật/tắt).',
      parameters: {
        type: 'object',
        properties: {
          CouponID: { type: 'string', description: 'Mã ID của coupon (ví dụ: CPN001)' },
          CouponStatus: { type: 'string', enum: ['ACTIVE', 'EXPIRED'], description: 'Trạng thái mới: ACTIVE=Hoạt động, EXPIRED=Hết hạn' },
        },
        required: ['CouponID', 'CouponStatus'],
      },
    },
  },
  {
    type: 'function',
    function: {
      name: 'create_coupon',
      description: 'Tạo mã giảm giá mới.',
      parameters: {
        type: 'object',
        properties: {
          CouponCode: { type: 'string', description: 'Mã code (ví dụ: GIAM20)' },
          CouponDescription: { type: 'string', description: 'Mô tả' },
          DiscountType: { type: 'string', enum: ['PERC', 'FIXED'], description: 'Loại giảm: PERC=%, FIXED=số tiền' },
          DiscountValue: { type: 'number', description: 'Giá trị giảm' },
          MinOrderValue: { type: 'number', description: 'Đơn hàng tối thiểu (mặc định 0, KHÔNG dùng null)' },
          MaxDiscount: { type: 'number', description: 'Giảm tối đa (mặc định 0, KHÔNG dùng null)' },
          StartDate: { type: 'string', description: 'Ngày bắt đầu (YYYY-MM-DD)' },
          EndDate: { type: 'string', description: 'Ngày kết thúc (YYYY-MM-DD), mặc định null' },
          CouponStatus: { type: 'string', enum: ['ACTIVE', 'EXPIRED'], description: 'Trạng thái: ACTIVE=Hoạt động' },
        },
        required: ['CouponCode', 'DiscountType', 'DiscountValue', 'StartDate', 'CouponStatus'],
      },
    },
  },
  {
    type: 'function',
    function: {
      name: 'update_appointment_status',
      description: 'Cập nhật trạng thái lịch hẹn khám thú cưng.',
      parameters: {
        type: 'object',
        properties: {
          AppointmentID: { type: 'string', description: 'Mã lịch hẹn' },
          AppointmentStatus: { type: 'string', enum: ['PEND', 'CONF', 'COMP', 'CANCELED'], description: 'Trạng thái mới' },
        },
        required: ['AppointmentID', 'AppointmentStatus'],
      },
    },
  },
  {
    type: 'function',
    function: {
      name: 'update_banner_status',
      description: 'Cập nhật trạng thái banner (bật/tắt).',
      parameters: {
        type: 'object',
        properties: {
          BannerID: { type: 'string', description: 'Mã banner (ví dụ: BAN001)' },
          BannerStatus: { type: 'string', enum: ['SHOW', 'HIDE'], description: 'Trạng thái: SHOW=Hiển thị, HIDE=Ẩn' },
        },
        required: ['BannerID', 'BannerStatus'],
      },
    },
  },
  {
    type: 'function',
    function: {
      name: 'update_product_stock',
      description: 'Cập nhật số lượng tồn kho (Stock) của sản phẩm. Nếu sản phẩm có nhiều chi tiết (size/color), có thể chỉ định tên chi tiết.',
      parameters: {
        type: 'object',
        properties: {
          ProductID: { type: 'string', description: 'Mã sản phẩm (ví dụ: P787522838)' },
          NewStock: { type: 'integer', description: 'Giá trị Stock mới' },
          DetailName: { type: 'string', description: 'Tên chi tiết sản phẩm cụ thể (nếu có nhiều). Bỏ trống để update tất cả chi tiết.' },
        },
        required: ['ProductID', 'NewStock'],
      },
    },
  },
  {
    type: 'function',
    function: {
      name: 'update_product_price',
      description: 'Cập nhật giá bán thêm (ExtraPrice) của sản phẩm. Nếu sản phẩm có nhiều chi tiết, có thể chỉ định tên chi tiết.',
      parameters: {
        type: 'object',
        properties: {
          ProductID: { type: 'string', description: 'Mã sản phẩm (ví dụ: P787522838)' },
          NewExtraPrice: { type: 'number', description: 'Giá ExtraPrice mới (VNĐ)' },
          DetailName: { type: 'string', description: 'Tên chi tiết sản phẩm cụ thể (nếu có nhiều). Bỏ trống để update tất cả chi tiết.' },
        },
        required: ['ProductID', 'NewExtraPrice'],
      },
    },
  },
  {
    type: 'function',
    function: {
      name: 'search_invoices',
      description: 'Tìm kiếm hóa đơn theo điều kiện. Trả về danh sách hóa đơn.',
      parameters: {
        type: 'object',
        properties: {
          search: { type: 'string', description: 'Từ khóa tìm kiếm (mã hóa đơn, tên khách hàng)' },
          filter: { type: 'string', description: 'Lọc theo trạng thái: PAID, PEND, REFUND, CONF, SHIP, DELI, CANCELED' },
          date: { type: 'string', description: 'Lọc theo ngày (YYYY-MM-DD)' },
        },
        required: [],
      },
    },
  },
  {
    type: 'function',
    function: {
      name: 'search_products',
      description: 'Tìm kiếm sản phẩm theo tên hoặc điều kiện.',
      parameters: {
        type: 'object',
        properties: {
          search: { type: 'string', description: 'Từ khóa tìm kiếm (tên sản phẩm)' },
          filter: { type: 'string', description: 'Lọc (ví dụ: loại sản phẩm)' },
        },
        required: [],
      },
    },
  },
  {
    type: 'function',
    function: {
      name: 'search_accounts',
      description: 'Tìm kiếm tài khoản theo tên hoặc email.',
      parameters: {
        type: 'object',
        properties: {
          search: { type: 'string', description: 'Từ khóa (tên tài khoản, email, số điện thoại)' },
          filter: { type: 'string', description: 'Lọc theo loại: C=Khách hàng, E=Nhân viên, V=Bác sĩ, O=Owner' },
        },
        required: [],
      },
    },
  },
  {
    type: 'function',
    function: {
      name: 'change_account_status',
      description: 'Khóa hoặc mở khóa tài khoản người dùng.',
      parameters: {
        type: 'object',
        properties: {
          AccountID: { type: 'string', description: 'ID tài khoản (địa chỉ Ethereum 0x...)' },
          AccountStatus: { type: 'string', enum: ['ACT', 'INA', 'BAN'], description: 'Trạng thái: ACT=Hoạt động, INA=Ngưng, BAN=Khóa' },
        },
        required: ['AccountID', 'AccountStatus'],
      },
    },
  },
];

// ============ AI AGENT ACTION EXECUTOR ============
const executeAgentAction = async (toolName, args) => {
  try {
    console.log(`[AI Agent] Executing: ${toolName}`, JSON.stringify(args));

    switch (toolName) {
      // --- ACCOUNT ---
      case 'create_account': {
        const result = await userRegister({
          AccountName: args.AccountName,
          Email: args.Email,
          Password: args.Password,
          UserName: args.UserName,
          Phone: args.Phone,
          Address: args.Address,
          Gender: args.Gender,
          AccountType: args.AccountType,
        });
        if (result.errCode === 0) {
          return {
            success: true,
            message: `Tạo tài khoản thành công!\n- Tên đăng nhập: ${args.AccountName}\n- Mật khẩu: ${args.Password}\n- Email: ${args.Email}\n- Role: ${args.AccountType === 'C' ? 'Khách hàng' : args.AccountType === 'E' ? 'Nhân viên' : 'Bác sĩ thú y'}`,
          };
        }
        return { success: false, message: result.errMessage };
      }

      case 'change_account_status': {
        const result = await changeAccountStatus(args.AccountID, args.AccountStatus);
        return {
          success: result.errCode === 0,
          message: result.errMessage,
        };
      }

      case 'search_accounts': {
        const result = await loadAccountInfo(1, 20, args.search || '', args.filter || '', '');
        if (result.errCode === 0 && result.data) {
          const accounts = result.data.accounts || [];
          return {
            success: true,
            message: `Tìm thấy ${result.data.totalRows || accounts.length} tài khoản.`,
            data: accounts.slice(0, 10).map((a) => ({
              AccountID: a.AccountID,
              AccountName: a.AccountName,
              UserName: a.UserName,
              Email: a.Email,
              Phone: a.Phone,
              AccountType: a.AccountType,
              AccountStatus: a.AccountStatus,
            })),
          };
        }
        return { success: false, message: result.errMessage || 'Không tìm thấy tài khoản.' };
      }

      // --- INVOICE ---
      case 'update_payment_status': {
        const result = await changeInvoiceStatus(args.InvoiceID, 'PaymentStatus', args.Status);
        return {
          success: result.errCode === 0,
          message: result.errMessage,
        };
      }

      case 'update_shipping_status': {
        const result = await changeInvoiceStatus(args.InvoiceID, 'ShippingStatus', args.Status, args.CancelReason);
        return {
          success: result.errCode === 0,
          message: result.errMessage,
        };
      }

      case 'batch_update_invoices': {
        const { Type, FromStatus, ToStatus, DateFilter } = args;
        // Find all invoices matching the condition
        const whereClause = {};
        whereClause[Type] = FromStatus;
        if (DateFilter) {
          whereClause.CreatedAt = {
            [Op.between]: [`${DateFilter} 00:00:00`, `${DateFilter} 23:59:59`],
          };
        }
        const invoices = await db.Invoice.findAll({
          where: whereClause,
          attributes: ['InvoiceID'],
          raw: true,
        });
        if (invoices.length === 0) {
          return { success: true, message: `Không tìm thấy hóa đơn nào có ${Type} = ${FromStatus}${DateFilter ? ` ngày ${DateFilter}` : ''}.` };
        }
        let successCount = 0;
        let failCount = 0;
        for (const inv of invoices) {
          const result = await changeInvoiceStatus(inv.InvoiceID, Type, ToStatus);
          if (result.errCode === 0) successCount++;
          else failCount++;
        }
        return {
          success: true,
          message: `Đã xử lý ${invoices.length} hóa đơn: ${successCount} thành công, ${failCount} thất bại.`,
        };
      }

      case 'search_invoices': {
        const result = await loadInvoiceInfo(1, 20, args.search || '', args.filter || '', '', args.date || '');
        if (result.errCode === 0 && result.data) {
          const invoices = result.data.invoices || [];
          return {
            success: true,
            message: `Tìm thấy ${result.data.totalRows || invoices.length} hóa đơn.`,
            data: invoices.slice(0, 10).map((inv) => ({
              InvoiceID: inv.InvoiceID,
              ReceiverName: inv.ReceiverName,
              TotalPayment: inv.TotalPayment,
              PaymentStatus: inv.PaymentStatus,
              ShippingStatus: inv.ShippingStatus,
              CreatedAt: inv.CreatedAt,
            })),
          };
        }
        return { success: false, message: result.errMessage || 'Không tìm thấy hóa đơn.' };
      }

      // --- COUPON ---
      case 'update_coupon_status': {
        const result = await changeCouponInfo({
          CouponID: args.CouponID,
          CouponStatus: args.CouponStatus,
        });
        return {
          success: result.errCode === 0,
          message: result.errMessage,
        };
      }

      case 'create_coupon': {
        const result = await createCoupon({
          CouponCode: args.CouponCode,
          CouponDescription: args.CouponDescription || '',
          DiscountType: args.DiscountType,
          DiscountValue: args.DiscountValue,
          MinOrderValue: args.MinOrderValue || 0,
          MaxDiscount: args.MaxDiscount || null,
          StartDate: args.StartDate,
          EndDate: args.EndDate || null,
          CouponStatus: args.CouponStatus || 'ACTIVE',
        });
        return {
          success: result.errCode === 0,
          message: result.errMessage,
        };
      }

      // --- APPOINTMENT ---
      case 'update_appointment_status': {
        // AI Agent acts as system/owner, using a placeholder VeterinarianID
        const owner = await db.Account.findOne({ where: { AccountType: 'O' }, attributes: ['AccountID'], raw: true });
        const vetId = owner?.AccountID || 'SYSTEM';
        const result = await changeAppointmentStatus(args.AppointmentID, args.AppointmentStatus, vetId);
        return {
          success: result.errCode === 0,
          message: result.errMessage,
        };
      }

      // --- BANNER ---
      case 'update_banner_status': {
        const result = await changeBannerInfo({
          BannerID: args.BannerID,
          BannerStatus: args.BannerStatus,
        });
        return {
          success: result.errCode === 0,
          message: result.errMessage,
        };
      }

      // --- PRODUCT ---
      case 'update_product_stock': {
        const whereClause = { ProductID: args.ProductID };
        if (args.DetailName) {
          whereClause.ProductDetailName = { [Op.like]: `%${args.DetailName}%` };
        }
        const details = await db.ProductDetail.findAll({ where: whereClause, raw: true });
        if (details.length === 0) {
          return { success: false, message: `Không tìm thấy chi tiết sản phẩm cho ${args.ProductID}${args.DetailName ? ` với tên '${args.DetailName}'` : ''}.` };
        }
        const detailIds = details.map((d) => d.ProductDetailID);
        await db.ProductDetail.update(
          { Stock: args.NewStock },
          { where: { ProductDetailID: detailIds } }
        );
        const names = details.map((d) => d.ProductDetailName || d.ProductDetailID).join(', ');
        return {
          success: true,
          message: `Đã cập nhật Stock thành ${args.NewStock} cho ${details.length} chi tiết: ${names}.`,
        };
      }

      case 'update_product_price': {
        const whereClause2 = { ProductID: args.ProductID };
        if (args.DetailName) {
          whereClause2.ProductDetailName = { [Op.like]: `%${args.DetailName}%` };
        }
        const details2 = await db.ProductDetail.findAll({ where: whereClause2, raw: true });
        if (details2.length === 0) {
          return { success: false, message: `Không tìm thấy chi tiết sản phẩm cho ${args.ProductID}${args.DetailName ? ` với tên '${args.DetailName}'` : ''}.` };
        }
        const detailIds2 = details2.map((d) => d.ProductDetailID);
        await db.ProductDetail.update(
          { ExtraPrice: args.NewExtraPrice },
          { where: { ProductDetailID: detailIds2 } }
        );
        const names2 = details2.map((d) => d.ProductDetailName || d.ProductDetailID).join(', ');
        return {
          success: true,
          message: `Đã cập nhật ExtraPrice thành ${args.NewExtraPrice}đ cho ${details2.length} chi tiết: ${names2}.`,
        };
      }

      case 'search_products': {
        const result = await loadProductInfo(1, 20, args.search || '', args.filter || '', '');
        if (result.errCode === 0 && result.data) {
          const products = result.data.products || [];
          return {
            success: true,
            message: `Tìm thấy ${result.data.totalRows || products.length} sản phẩm.`,
            data: products.slice(0, 10).map((p) => ({
              ProductID: p.ProductID,
              ProductName: p.ProductName,
              ProductPrice: p.ProductPrice,
              ProductStatus: p.ProductStatus,
            })),
          };
        }
        return { success: false, message: result.errMessage || 'Không tìm thấy sản phẩm.' };
      }

      default:
        return { success: false, message: `Tool không tồn tại: ${toolName}` };
    }
  } catch (e) {
    console.error(`[AI Agent] Error executing ${toolName}:`, e);
    return { success: false, message: `Lỗi khi thực hiện ${toolName}: ${e.message}` };
  }
};

// ============ MAIN CHAT HANDLER ============
const handleAiChat = async (accountId, message, chatHistory) => {
  try {
    // Get API key
    const setting = await db.AiSetting.findOne({ where: { AccountID: accountId } });
    if (!setting) {
      return {
        errCode: 2,
        errMessage: 'Chưa cấu hình API key. Vui lòng vào Settings để nhập Groq API key.',
      };
    }

    let apiKey;
    try {
      apiKey = decrypt(setting.GroqApiKey);
    } catch (e) {
      return { errCode: 3, errMessage: 'API key bị lỗi. Vui lòng nhập lại trong Settings.' };
    }

    // Aggregate metrics
    const metrics = await aggregateBusinessMetrics();
    const predictions = computePredictions(metrics);
    const alerts = computeAlerts(metrics);

    // Build messages
    const systemPrompt = buildSystemPrompt(metrics, predictions, alerts);
    const messages = [
      { role: 'system', content: systemPrompt },
      ...chatHistory.map((m) => ({ role: m.role, content: m.content })).slice(-6),
      { role: 'user', content: message },
    ];

    // ============ AGENT TOOL-CALLING LOOP ============
    const MAX_TOOL_ITERATIONS = 5;
    let executedActions = [];

    for (let iteration = 0; iteration < MAX_TOOL_ITERATIONS; iteration++) {
      let response;
      const MAX_RETRIES = 3;
      let assistantMsg = null;

      for (let retry = 0; retry < MAX_RETRIES; retry++) {
        response = await fetch('https://api.groq.com/openai/v1/chat/completions', {
          method: 'POST',
          headers: {
            Authorization: `Bearer ${apiKey}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            model: 'llama-3.1-8b-instant',
            messages,
            temperature: 0.7,
            max_tokens: 1024,
            tools: AGENT_TOOLS,
            tool_choice: 'auto',
          }),
        });

        const resData = await response.json().catch(() => ({}));

        if (response.status === 429 && retry < MAX_RETRIES - 1) {
          const waitMatch = resData?.error?.message?.match(/try again in ([\d.]+)s/);
          const waitTime = waitMatch ? Math.ceil(parseFloat(waitMatch[1]) * 1000) + 500 : 3000;
          console.log(`[AI Agent] Rate limited, retrying in ${waitTime}ms...`);
          await new Promise((r) => setTimeout(r, waitTime));
          continue;
        }

        // Resiliency parser
        if (response.status === 400 && resData.error?.code === 'tool_use_failed' && resData.error.failed_generation) {
          const failedGen = resData.error.failed_generation;
          const match = failedGen.match(/<function=(\w+)>([\s\S]*?)(?:<\/function>|<function>|$)/);
          if (match) {
            console.log(`[AI Agent] Resiliently recovered: ${match[1]}`);
            assistantMsg = {
              role: 'assistant',
              content: null,
              tool_calls: [{
                id: 'call_resilient_' + Math.random().toString(36).substr(2, 9),
                type: 'function',
                function: { name: match[1], arguments: match[2].trim() },
              }],
            };
            break;
          }
        }

        if (!response.ok) {
          return { errCode: 5, errMessage: `Groq error ${response.status}: ${resData?.error?.message || response.statusText}` };
        }

        assistantMsg = resData.choices?.[0]?.message;
        break;
      }

      if (!assistantMsg) break;

      if (!assistantMsg.tool_calls || assistantMsg.tool_calls.length === 0) {
        return {
          errCode: 0,
          data: {
            message: assistantMsg.content || 'Xong.',
            alerts,
            predictions,
            executedActions,
          },
        };
      }

      messages.push(assistantMsg);

      for (const toolCall of assistantMsg.tool_calls) {
        const toolName = toolCall.function.name;
        let toolArgs = {};
        try {
          toolArgs = JSON.parse(toolCall.function.arguments);
        } catch (e) {
          console.error('[AI Agent] Parse error:', toolCall.function.arguments);
        }

        console.log(`[AI Agent] Step ${iteration + 1}: ${toolName}`, toolArgs);
        const result = await executeAgentAction(toolName, toolArgs);
        executedActions.push({ tool: toolName, args: toolArgs, result: result });

        messages.push({
          role: 'tool',
          tool_call_id: toolCall.id,
          content: JSON.stringify(result),
        });
      }
    }

    return {
      errCode: 0,
      data: {
        message: `⚠️ Hoàn tất tác vụ. Kết quả: ${executedActions.map((a) => `${a.tool}: ${a.result.message}`).join('; ')}`,
        alerts,
        predictions,
        executedActions,
      },
    };
  } catch (e) {
    console.error('Error in AI chat:', e);
    return { errCode: 6, errMessage: `Lỗi: ${e.message}` };
  }
};

module.exports = {
  handleAiChat,
  saveApiKey,
  getApiKeyExists,
  deleteApiKey,
};
