import db from '../models/index';
import { Op } from 'sequelize';
import { checkValidAllCode } from './utilitiesService';

let validateBannerInput = async (bannerInfo) => {
  if (!bannerInfo || Object.keys(bannerInfo).length === 0) {
    return {
      errCode: -1,
      errMessage: 'Thiếu thông tin banner!',
      data: null,
    };
  }
  const { BannerImage, HiddenAt, BannerStatus, ProductID } = bannerInfo;
  if (!BannerImage?.trim() || BannerImage.trim().length > 2048) {
    return {
      errCode: 1,
      errMessage: 'Hình ảnh banner không hợp lệ hoặc vượt quá 2048 ký tự!',
      data: null,
    };
  }
  if (HiddenAt !== undefined && HiddenAt !== null) {
    const hiddenAtDate = new Date(HiddenAt);
    if (isNaN(hiddenAtDate.getTime()) || hiddenAtDate <= new Date()) {
      return {
        errCode: 1,
        errMessage: 'Ngày ẩn không hợp lệ hoặc phải lớn hơn thời gian hiện tại!',
        data: null,
      };
    }
  }
  if (!BannerStatus) {
    return {
      errCode: -1,
      errMessage: 'Trạng thái banner không được để trống!',
      data: null,
    };
  } else {
    const validBannerStatus = await checkValidAllCode('BannerStatus', BannerStatus);
    if (!validBannerStatus) {
      return {
        errCode: 1,
        errMessage: `Trạng thái banner ${BannerStatus} không hợp lệ!`,
        data: null,
      };
    }
  }
  if (ProductID) {
    const product = await db.Product.findOne({
      where: { ProductID },
    });
    if (!product) {
      return {
        errCode: 1,
        errMessage: `Sản phẩm ${ProductID} không tồn tại!`,
        data: null,
      };
    }
  }
  return null;
};

let updateHideBanner = () => {
  return new Promise(async (resolve, reject) => {
    const transaction = await db.sequelize.transaction();
    try {
      const updated = await db.Banner.update(
        { BannerStatus: 'HIDE' },
        {
          where: {
            BannerStatus: 'SHOW',
            HiddenAt: {
              [Op.not]: null,
              [Op.lte]: new Date(),
            },
          },
          transaction,
        }
      );
      await transaction.commit();
      resolve({
        errCode: 0,
        errMessage: 'Cập nhật trạng thái banner thành công!',
        data: { updatedCount: updated[0] },
      });
    } catch (e) {
      await transaction.rollback();
      console.log('Error in updateHideBanner: ', e);
      resolve({
        errCode: 3,
        errMessage: `Lỗi khi cập nhật trạng thái banner: ${e.message}`,
        data: null,
      });
    }
  });
};

let getBannerSaleInfo = (productid) => {
  return new Promise(async (resolve, reject) => {
    try {
      if (!productid) {
        resolve({
          errCode: -1,
          errMessage: 'Thiếu tham số!',
          data: null,
        });
        return;
      }

      await updateHideBanner();

      let data = null;
      if (productid === 'ALL') {
        data = await db.Banner.findAll({
          where: { BannerStatus: 'SHOW' },
          attributes: ['BannerID', 'BannerImage', 'ProductID'],
          include: [
            {
              model: db.Product,
              attributes: ['ProductName', 'ProductImage'],
              required: false,
            },
          ],
          raw: true,
        });
        if (!data || data.length === 0) {
          resolve({
            errCode: 1,
            errMessage: 'Không tìm thấy banner nào!',
            data: [],
          });
          return;
        }
        data = data.map(item => ({
          BannerID: item.BannerID,
          BannerImage: item.BannerImage,
          ProductID: item.ProductID,
          ProductName: item['Product.ProductName'] || null,
          ProductImage: item['Product.ProductImage'] || null,
        }));
      } else {
        data = await db.Banner.findOne({
          where: {
            ProductID: productid,
            BannerStatus: 'SHOW',
          },
          attributes: ['BannerID', 'BannerImage', 'ProductID'],
          include: [
            {
              model: db.Product,
              attributes: ['ProductName', 'ProductImage'],
              required: false,
            },
          ],
          raw: true,
        });
        if (!data) {
          resolve({
            errCode: 2,
            errMessage: 'Banner không tồn tại!',
            data: null,
          });
          return;
        }
        data = {
          BannerID: data.BannerID,
          BannerImage: data.BannerImage,
          ProductID: data.ProductID,
          ProductName: data['Product.ProductName'] || null,
          ProductImage: data['Product.ProductImage'] || null,
        };
      }

      resolve({
        errCode: 0,
        errMessage: 'Lấy thông tin banner thành công!',
        data,
      });
    } catch (e) {
      console.log('Error in getBannerSaleInfo: ', e);
      resolve({
        errCode: 3,
        errMessage: `Lỗi khi lấy thông tin banner: ${e.message}`,
        data: null,
      });
    }
  });
};

let getBannerInfo = (bannerid) => {
  return new Promise(async (resolve, reject) => {
    try {
      if (!bannerid) {
        resolve({
          errCode: -1,
          errMessage: 'Thiếu tham số!',
          data: null,
        });
        return;
      }
      const banner = await db.Banner.findOne({
        where: { BannerID: bannerid },
        attributes: ['BannerID', 'BannerImage', 'CreatedAt', 'HiddenAt', 'BannerStatus', 'ProductID'],
        include: [
          {
            model: db.Product,
            attributes: ['ProductName', 'ProductType'],
            required: false,
            include: [
              {
                model: db.ProductPetType,
                attributes: ['PetType'],
                required: false,
              },
            ],
          },
        ],
        raw: true,
      });
      if (!banner) {
        resolve({
          errCode: 2,
          errMessage: 'Banner không tồn tại!',
          data: null,
        });
        return;
      }
      const data = {
        BannerID: banner.BannerID,
        BannerImage: banner.BannerImage,
        CreatedAt: banner.CreatedAt,
        HiddenAt: banner.HiddenAt ? new Date(banner.HiddenAt).toISOString() : null,
        BannerStatus: banner.BannerStatus,
        ProductID: banner.ProductID,
        ProductName: banner['Product.ProductName'] || null,
        ProductType: banner['Product.ProductType'] || null,
        PetTypes: banner['Product.ProductPetTypes']?.map(pt => pt.PetType) || [],
      };

      resolve({
        errCode: 0,
        errMessage: 'Lấy thông tin banner thành công!',
        data,
      });
    } catch (e) {
      console.log('Error in getBannerInfo: ', e);
      resolve({
        errCode: 3,
        errMessage: `Lỗi khi lấy thông tin banner: ${e.message}`,
        data: null,
      });
    }
  });
};

let loadBannerInfo = (page, limit, search, filter, sort, date) => {
  return new Promise(async (resolve, reject) => {
    try {
      if (!page || !limit || page < 1 || limit < 1) {
        resolve({
          errCode: -1,
          errMessage: 'Tham số page hoặc limit không hợp lệ!',
          data: null,
        });
        return;
      }

      if (filter !== 'ALL' && !filter.includes('-')) {
        resolve({
          errCode: 1,
          errMessage: 'Tham số filter không hợp lệ!',
          data: null,
        });
        return;
      }

      if (sort && !['0', '1', '2', '3', '4'].includes(sort)) {
        resolve({
          errCode: 1,
          errMessage: 'Tham số sort không hợp lệ!',
          data: null,
        });
        return;
      }

      await updateHideBanner();

      const offset = (page - 1) * limit;
      let where = {};
      let order = [];

      if (search?.trim()) {
        const searchTerm = search.trim().substring(0, 100);
        const products = await db.Product.findAll({
          where: { ProductName: { [Op.like]: `%${searchTerm}%` } },
          attributes: ['ProductID'],
          raw: true,
        });
        const productIds = products.map((p) => p.ProductID);
        if (productIds.length === 0) {
          resolve({
            errCode: 0,
            errMessage: 'Không tìm thấy banner nào!',
            data: [],
            totalItems: 0,
          });
          return;
        }
        where.ProductID = { [Op.in]: productIds };
      }

      if (date) {
        const startOfDay = new Date(date);
        if (isNaN(startOfDay.getTime())) {
          resolve({
            errCode: 1,
            errMessage: 'Tham số date không hợp lệ!',
            data: null,
          });
          return;
        }
        startOfDay.setHours(0, 0, 0, 0);
        const endOfDay = new Date(startOfDay);
        endOfDay.setHours(23, 59, 59, 999);
        where.CreatedAt = { [Op.lte]: endOfDay };
        where[Op.or] = [
          { HiddenAt: { [Op.gte]: startOfDay } },
          { HiddenAt: null },
        ];
      }

      if (filter !== 'ALL') {
        const [field, value] = filter.split('-');
        const fieldMap = {
          bannerstatus: 'BannerStatus',
        };
        if (!fieldMap[field]) {
          resolve({
            errCode: 1,
            errMessage: 'Tham số filter không hợp lệ!',
            data: null,
          });
          return;
        }
        const validCode = await checkValidAllCode(fieldMap[field], value);
        if (!validCode) {
          resolve({
            errCode: 1,
            errMessage: `${fieldMap[field]} không hợp lệ!`,
            data: null,
          });
          return;
        }
        where[fieldMap[field]] = value;
      }

      switch (sort) {
        case '1':
          order.push(['CreatedAt', 'DESC']);
          break;
        case '2':
          order.push(['CreatedAt', 'ASC']);
          break;
        case '3':
          order.push([literal('HiddenAt IS NULL'), 'ASC'], ['HiddenAt', 'ASC']);
          break;
        case '4':
          order.push([literal('HiddenAt IS NULL'), 'DESC'], ['HiddenAt', 'DESC']);
          break;
        default:
          order.push(['CreatedAt', 'DESC']);
          break;
      }

      const { count, rows } = await db.Banner.findAndCountAll({
        where,
        attributes: ['BannerID', 'BannerImage', 'CreatedAt', 'HiddenAt', 'BannerStatus', 'ProductID'],
        limit: parseInt(limit),
        offset,
        order,
        include: [
          {
            model: db.Product,
            attributes: ['ProductName', 'ProductImage'],
            required: false,
          },
        ],
        raw: true,
      });

      if (!rows || rows.length === 0) {
        resolve({
          errCode: 0,
          errMessage: 'Không tìm thấy banner nào!',
          data: [],
          totalItems: 0,
        });
        return;
      }

      const data = rows.map(item => ({
        BannerID: item.BannerID,
        BannerImage: item.BannerImage,
        CreatedAt: item.CreatedAt,
        HiddenAt: item.HiddenAt ? new Date(item.HiddenAt).toISOString() : null,
        BannerStatus: item.BannerStatus,
        ProductID: item.ProductID,
        ProductName: item['Product.ProductName'] || 'N/A',
        ProductImage: item['Product.ProductImage'] || null,
      }));

      resolve({
        errCode: 0,
        errMessage: 'Lấy danh sách banner thành công!',
        data,
        totalItems: count,
      });
    } catch (e) {
      console.log('Error in loadBannerInfo: ', e);
      resolve({
        errCode: 3,
        errMessage: `Lỗi khi lấy danh sách banner: ${e.message}`,
        data: null,
      });
    }
  });
};

let createBanner = (bannerInfo) => {
  return new Promise(async (resolve, reject) => {
    const transaction = await db.sequelize.transaction();
    try {
      if (!bannerInfo) {
        await transaction.rollback();
        resolve({
          errCode: -1,
          errMessage: 'Thiếu thông tin banner!',
          data: null,
        });
        return;
      }
      const isValidateInput = await validateBannerInput(bannerInfo);
      if (isValidateInput) {
        await transaction.rollback();
        resolve(isValidateInput);
        return;
      }
      const banner = await db.Banner.create({
        BannerImage: bannerInfo.BannerImage.trim(),
        CreatedAt: new Date(),
        HiddenAt: bannerInfo.HiddenAt ? new Date(bannerInfo.HiddenAt).toISOString() : null,
        BannerStatus: bannerInfo.BannerStatus,
        ProductID: bannerInfo.ProductID || null,
      }, { transaction });
      await transaction.commit();
      resolve({
        errCode: 0,
        errMessage: 'Tạo banner thành công!',
        data: { BannerID: banner.BannerID },
      });
    } catch (e) {
      await transaction.rollback();
      console.log('Error in createBanner: ', e);
      resolve({
        errCode: 3,
        errMessage: `Lỗi khi tạo banner: ${e.message}`,
        data: null,
      });
    }
  });
};

let changeBannerInfo = (bannerInfo) => {
  return new Promise(async (resolve, reject) => {
    const transaction = await db.sequelize.transaction();
    try {
      if (!bannerInfo || !bannerInfo.BannerID) {
        await transaction.rollback();
        resolve({
          errCode: -1,
          errMessage: 'Thiếu tham số!',
          data: null,
        });
        return;
      }
      const isValidateInput = await validateBannerInput(bannerInfo);
      if (isValidateInput) {
        await transaction.rollback();
        resolve(isValidateInput);
        return;
      }
      const banner = await db.Banner.findOne({
        where: { BannerID: bannerInfo.BannerID },
        transaction,
      });
      if (!banner) {
        await transaction.rollback();
        resolve({
          errCode: 2,
          errMessage: 'Banner không tồn tại!',
          data: null,
        });
        return;
      }
      let isUpdated = false;
      if (bannerInfo.BannerImage && bannerInfo.BannerImage !== banner.BannerImage) {
        banner.BannerImage = bannerInfo.BannerImage.trim();
        isUpdated = true;
      }
      if (bannerInfo.BannerStatus && bannerInfo.BannerStatus !== banner.BannerStatus) {
        banner.BannerStatus = bannerInfo.BannerStatus;
        isUpdated = true;
      }
      if (bannerInfo.ProductID !== undefined && bannerInfo.ProductID !== banner.ProductID) {
        banner.ProductID = bannerInfo.ProductID || null;
        isUpdated = true;
      }
      if (bannerInfo.HiddenAt !== undefined) {
        const newHiddenAt = bannerInfo.HiddenAt ? new Date(bannerInfo.HiddenAt).toISOString() : null;
        if (newHiddenAt !== banner.HiddenAt) {
          banner.HiddenAt = newHiddenAt;
          isUpdated = true;
        }
      }
      if (!isUpdated) {
        await transaction.rollback();
        resolve({
          errCode: 1,
          errMessage: 'Không có thông tin nào để cập nhật!',
          data: null,
        });
        return;
      }
      await db.Banner.update(
        {
          BannerImage: banner.BannerImage,
          BannerStatus: banner.BannerStatus,
          ProductID: banner.ProductID,
          HiddenAt: banner.HiddenAt,
        },
        { where: { BannerID: bannerInfo.BannerID }, transaction }
      );
      await transaction.commit();
      resolve({
        errCode: 0,
        errMessage: 'Cập nhật thông tin banner thành công!',
        data: null,
      });
    } catch (e) {
      await transaction.rollback();
      console.log('Error in changeBannerInfo: ', e);
      resolve({
        errCode: 3,
        errMessage: `Lỗi khi cập nhật banner: ${e.message}`,
        data: null,
      });
    }
  });
};

module.exports = {
  getBannerSaleInfo,
  getBannerInfo,
  loadBannerInfo,
  createBanner,
  changeBannerInfo,
};