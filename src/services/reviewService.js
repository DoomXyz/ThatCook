import db from '../models/index';
import { Op, fn, col, literal } from 'sequelize';

let checkUserCanReview = (AccountID, ProductID) => {
  return new Promise(async (resolve, reject) => {
    try {
      if (!AccountID || !ProductID) {
        resolve({
          errCode: -1,
          errMessage: 'Thiếu tham số!',
          data: null,
        });
        return;
      }

      // Check if user has bought and received this product
      let invoiceCheck = await db.Invoice.findOne({
        where: { AccountID, ShippingStatus: 'DELI' },
        include: [
          {
            model: db.InvoiceDetail,
            where: { ProductID },
          },
        ],
      });

      if (!invoiceCheck) {
        resolve({
          errCode: 1,
          errMessage: 'Bạn chưa mua hoặc chưa nhận sản phẩm này!',
          data: null,
        });
        return;
      }

      // Check if user has already reviewed this product
      let reviewCheck = await db.Review.findOne({
        where: { AccountID, ProductID },
      });

      if (reviewCheck) {
        resolve({
          errCode: 1,
          errMessage: 'Bạn đã đánh giá sản phẩm này rồi!',
          data: null,
        });
        return;
      }

      resolve({
        errCode: 0,
        errMessage: 'Có thể đánh giá!',
        data: null,
      });
    } catch (e) {
      console.log('Error in checkUserCanReview: ', e);
      resolve({
        errCode: 3,
        errMessage: `Lỗi server: ${e.message}`,
        data: null,
      });
    }
  });
};

let createReview = (data) => {
  return new Promise(async (resolve, reject) => {
    try {
      const { AccountID, ProductID, Rating, Comment, ReviewImages } = data;

      if (!AccountID || !ProductID || !Rating) {
        resolve({
          errCode: -1,
          errMessage: 'Thiếu tham số (AccountID, ProductID, Rating)!',
          data: null,
        });
        return;
      }

      if (!Number.isInteger(Rating) || Rating < 1 || Rating > 5) {
        resolve({
          errCode: 1,
          errMessage: 'Đánh giá phải từ 1 đến 5 sao!',
          data: null,
        });
        return;
      }

      const checkResponse = await checkUserCanReview(AccountID, ProductID);
      if (checkResponse.errCode !== 0) {
        resolve(checkResponse);
        return;
      }

      let newReview = await db.Review.create({
        AccountID,
        ProductID,
        Rating,
        Comment: Comment || null,
        ReviewImages: ReviewImages && Array.isArray(ReviewImages) ? JSON.stringify(ReviewImages) : null,
        CreatedAt: new Date(),
      });

      resolve({
        errCode: 0,
        errMessage: 'Đánh giá sản phẩm thành công!',
        data: newReview,
      });
    } catch (e) {
      console.log('Error in createReview: ', e);
      resolve({
        errCode: 3,
        errMessage: `Lỗi server: ${e.message}`,
        data: null,
      });
    }
  });
};

let getReviewsByProduct = (ProductID, page, limit) => {
  return new Promise(async (resolve, reject) => {
    try {
      if (!ProductID) {
        resolve({
          errCode: -1,
          errMessage: 'Thiếu tham số ProductID!',
          data: null,
        });
        return;
      }

      const parsedPage = parseInt(page, 10);
      const parsedLimit = parseInt(limit, 10);
      const currentPage = !isNaN(parsedPage) && parsedPage > 0 ? parsedPage : 1;
      const currentLimit = !isNaN(parsedLimit) && parsedLimit > 0 ? parsedLimit : 10;
      const offset = (currentPage - 1) * currentLimit;

      const { count, rows } = await db.Review.findAndCountAll({
        where: { ProductID },
        include: [
          {
            model: db.Account,
            attributes: ['UserName', 'UserImage'],
          },
        ],
        attributes: ['ReviewID', 'Rating', 'Comment', 'ReviewImages', 'CreatedAt'],
        order: [['CreatedAt', 'DESC']],
        limit: currentLimit,
        offset,
        distinct: true,
      });

      const aggregation = await db.Review.findOne({
        where: { ProductID },
        attributes: [
          [fn('AVG', col('Rating')), 'avgRating'],
          [fn('COUNT', col('ReviewID')), 'totalReviews'],
        ],
        raw: true,
      });

      const avgRating = aggregation && aggregation.avgRating ? parseFloat(parseFloat(aggregation.avgRating).toFixed(1)) : 0;
      const totalReviews = aggregation && aggregation.totalReviews ? parseInt(aggregation.totalReviews, 10) || 0 : 0;

      const reviews = rows.map((review) => {
        const plainReview = review.get({ plain: true });
        let parsedImages = [];

        if (plainReview.ReviewImages) {
          try {
            parsedImages = JSON.parse(plainReview.ReviewImages);
          } catch (error) {
            parsedImages = [];
          }
        }

        return {
          ...plainReview,
          ReviewImages: parsedImages,
        };
      });

      resolve({
        errCode: 0,
        errMessage: 'Lấy danh sách đánh giá thành công!',
        data: {
          reviews,
          avgRating,
          totalReviews,
          totalPages: Math.ceil(count / currentLimit),
          currentPage,
        },
      });
    } catch (e) {
      console.log('Error in getReviewsByProduct: ', e);
      resolve({
        errCode: 3,
        errMessage: `Lỗi khi lấy danh sách đánh giá: ${e.message}`,
        data: null,
      });
    }
  });
};

module.exports = {
  checkUserCanReview,
  createReview,
  getReviewsByProduct,
};
