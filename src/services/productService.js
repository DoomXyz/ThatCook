import db from '../models/index';
import { Op, literal } from 'sequelize';
import { checkValidAllCode, generateID } from './utilitiesService';

let validateProductInput = async (productInfo) => {
  if (!productInfo || Object.keys(productInfo).length === 0) {
    return {
      errCode: -1,
      errMessage: 'Thiếu thông tin sản phẩm!',
      data: null,
    };
  }
  const { ProductName, ProductType, ProductPrice, ProductDescription, PetType, ProductDetail, Image } = productInfo;
  if (!ProductName) {
    return {
      errCode: -1,
      errMessage: 'Tên sản phẩm không được để trống!',
      data: null,
    };
  } else {
    const productName = ProductName.trim();
    const productNameRegex = /^[A-Za-zÀ-ỹ0-9\s]{2,100}$/;
    if (!productNameRegex.test(productName)) {
      return {
        errCode: 1,
        errMessage: 'Tên sản phẩm không hợp lệ!',
        data: null,
      };
    }
  }
  if (!ProductType) {
    return {
      errCode: -1,
      errMessage: 'Loại sản phẩm không được để trống!',
      data: null,
    };
  } else {
    const validProductType = await checkValidAllCode('ProductType', ProductType);
    if (!validProductType) {
      return {
        errCode: 1,
        errMessage: 'Loại sản phẩm không hợp lệ!',
        data: null,
      };
    }
  }
  if (!ProductPrice) {
    return {
      errCode: -1,
      errMessage: 'Giá sản phẩm không được để trống!',
      data: null,
    };
  } else {
    const price = parseFloat(ProductPrice);
    if (isNaN(price) || price <= 0) {
      return {
        errCode: 1,
        errMessage: 'Giá sản phẩm phải lớn hơn 0!',
        data: null,
      };
    }
  }
  if (ProductDescription) {
    const description = ProductDescription.trim();
    if (!description || description.length > 65535) {
      return {
        errCode: 1,
        errMessage: 'Mô tả sản phẩm không hợp lệ hoặc vượt quá giới hạn ký tự!',
        data: null,
      };
    }
  }
  if (!PetType || !Array.isArray(PetType) || PetType.length === 0) {
    return {
      errCode: -1,
      errMessage: 'Vui lòng chọn ít nhất một loại thú cưng!',
      data: null,
    };
  } else {
    for (const petType of PetType) {
      const validPetType = await checkValidAllCode('PetType', petType);
      if (!validPetType) {
        return {
          errCode: 1,
          errMessage: `Loại thú cưng ${petType} không hợp lệ!`,
          data: null,
        };
      }
    }
  }
  if (!ProductDetail || !Array.isArray(ProductDetail) || ProductDetail.length === 0) {
    return {
      errCode: -1,
      errMessage: 'Vui lòng thêm ít nhất một chi tiết sản phẩm!',
      data: null,
    };
  } else {
    for (let i = 0; i < ProductDetail.length; i++) {
      const detail = ProductDetail[i];
      if (!detail.DetailName) {
        return {
          errCode: -1,
          errMessage: `Tên chi tiết tại dòng ${i + 1} không được để trống!`,
          data: null,
        };
      } else {
        const detailNameRegex = /^[A-Za-zÀ-ỹ0-9\s]{2,50}$/;
        if (!detailNameRegex.test(detail.DetailName.trim())) {
          return {
            errCode: 1,
            errMessage: `Tên chi tiết tại dòng ${i + 1} không hợp lệ!`,
            data: null,
          };
        }
      }
      if (detail.Stock === undefined || detail.Stock === '') {
        return {
          errCode: -1,
          errMessage: `Số lượng tồn tại dòng ${i + 1} không được để trống!`,
          data: null,
        };
      } else if (isNaN(detail.Stock) || parseInt(detail.Stock) < 0) {
        return {
          errCode: 1,
          errMessage: `Số lượng tồn tại dòng ${i + 1} phải lớn hơn hoặc bằng 0!`,
          data: null,
        };
      }
      if (detail.ExtraPrice === undefined || detail.ExtraPrice === '') {
        return {
          errCode: -1,
          errMessage: `Giá thêm tại dòng ${i + 1} không được để trống!`,
          data: null,
        };
      } else if (isNaN(detail.ExtraPrice) || parseFloat(detail.ExtraPrice) < 0) {
        return {
          errCode: 1,
          errMessage: `Giá thêm tại dòng ${i + 1} phải lớn hơn hoặc bằng 0!`,
          data: null,
        };
      }
      if (detail.Promotion === undefined || detail.Promotion === '') {
        return {
          errCode: -1,
          errMessage: `Khuyến mãi tại dòng ${i + 1} không được để trống!`,
          data: null,
        };
      } else if (isNaN(detail.Promotion) || parseFloat(detail.Promotion) < 0 || parseFloat(detail.Promotion) > 100) {
        return {
          errCode: 1,
          errMessage: `Khuyến mãi tại dòng ${i + 1} phải từ 0 đến 100%!`,
          data: null,
        };
      }
      if (!detail.DetailStatus) {
        return {
          errCode: -1,
          errMessage: `Trạng thái chi tiết tại dòng ${i + 1} không được để trống!`,
          data: null,
        };
      } else {
        const validDetailStatus = await checkValidAllCode('DetailStatus', detail.DetailStatus);
        if (!validDetailStatus) {
          return {
            errCode: 1,
            errMessage: `Trạng thái chi tiết tại dòng ${i + 1} không hợp lệ!`,
            data: null,
          };
        }
      }

      if (parseInt(detail.Stock) === 0 && detail.DetailStatus === 'AVAIL') {
        return {
          errCode: 1,
          errMessage: `Số lượng tồn tại dòng ${i + 1} bằng 0, không thể chọn trạng thái Còn hàng!`,
          data: null,
        };
      }
    }
  }
  if (Image && Array.isArray(Image)) {
    if (Image.some(img => !img.Image || !img.Image.trim() || img.Image.trim().length > 2048)) {
      return {
        errCode: 1,
        errMessage: 'Danh sách ảnh phụ không hợp lệ hoặc vượt quá 2048 ký tự!',
        data: null,
      };
    }
  }
  return null;
};

let checkProductNameExist = (productName, excludeProductId) => {
  return new Promise(async (resolve, reject) => {
    try {
      if (!productName) {
        resolve({
          errCode: -1,
          errMessage: 'Thiếu tên sản phẩm để kiểm tra!',
          data: null,
        });
        return;
      }
      const where = { ProductName: productName.trim() };
      if (excludeProductId) {
        where.ProductID = { [Op.ne]: excludeProductId };
      }
      const exist = await db.Product.findOne({ where });
      resolve(exist ? true : false);
    } catch (e) {
      console.log('Error in checkProductNameExist: ', e);
      resolve({
        errCode: 3,
        errMessage: 'Lỗi khi kiểm tra tên sản phẩm: ' + e.message,
        data: null,
      });
    }
  });
};

let updateOutOfStock = (productid) => {
  return new Promise(async (resolve, reject) => {
    const transaction = await db.sequelize.transaction();
    try {
      let where = { Stock: 0 };
      if (productid) {
        where.ProductID = productid;
      }

      // Cập nhật DetailStatus thành 'OUT' cho các ProductDetail có Stock = 0
      const updated = await db.ProductDetail.update(
        { DetailStatus: 'OUT' },
        { where, transaction }
      )
      await transaction.commit();
      resolve({
        errCode: 0,
        errMessage: 'Cập nhật trạng thái chi tiết sản phẩm thành công!',
        data: { updatedCount: updated[0] },
      });
    } catch (e) {
      await transaction.rollback();
      console.log('Error in updateOutOfStock: ', e);
      resolve({
        errCode: 3,
        errMessage: `Lỗi khi cập nhật trạng thái chi tiết sản phẩm: ${e.message}`,
        data: null,
      });
    }
  });
};

let getSaleProductInfo = (productid) => {
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

      await updateOutOfStock();

      let data = null;
      if (productid === 'ALL') {
        const products = await db.Product.findAll({
          attributes: ['ProductID', 'ProductName', 'ProductDescription', 'ProductPrice', 'ProductImage', 'ProductType'],
          raw: true,
        });

        if (!products || products.length === 0) {
          resolve({
            errCode: 0,
            errMessage: 'Không tìm thấy sản phẩm nào!',
            data: [],
          });
          return;
        }

        data = await Promise.all(
          products.map(async (product) => {
            const petType = await db.ProductPetType.findAll({
              where: { ProductID: product.ProductID },
              attributes: ['PetType'],
              raw: true,
            });
            const detail = await db.ProductDetail.findAll({
              where: { ProductID: product.ProductID, DetailStatus: 'AVAIL' },
              attributes: ['ProductDetailID', 'DetailName', 'Stock', 'SoldCount', 'ExtraPrice', 'Promotion'],
              raw: true,
            });
            const image = await db.Image.findAll({
              where: { ReferenceType: 'Product', ReferenceID: product.ProductID },
              attributes: ['ImageID', 'Image'],
              raw: true,
            });
            return {
              ProductID: product.ProductID,
              ProductName: product.ProductName,
              ProductDescription: product.ProductDescription,
              ProductPrice: product.ProductPrice,
              ProductImage: product.ProductImage,
              ProductType: product.ProductType,
              PetType: petType.map(pt => pt.PetType),
              ProductDetail: detail,
              Image: image,
            };
          })
        );
      } else {
        const product = await db.Product.findOne({
          where: { ProductID: productid },
          attributes: ['ProductID', 'ProductName', 'ProductDescription', 'ProductPrice', 'ProductImage', 'ProductType'],
          raw: true,
        });

        if (!product) {
          resolve({
            errCode: 2,
            errMessage: 'Sản phẩm không tồn tại!',
            data: null,
          });
          return;
        }

        const petType = await db.ProductPetType.findAll({
          where: { ProductID: product.ProductID },
          attributes: ['PetType'],
          raw: true,
        });
        const detail = await db.ProductDetail.findAll({
          where: { ProductID: product.ProductID, DetailStatus: 'AVAIL' },
          attributes: ['ProductDetailID', 'DetailName', 'Stock', 'SoldCount', 'ExtraPrice', 'Promotion'],
          raw: true,
        });
        const image = await db.Image.findAll({
          where: { ReferenceType: 'Product', ReferenceID: product.ProductID },
          attributes: ['ImageID', 'Image'],
          raw: true,
        });

        data = {
          ProductID: product.ProductID,
          ProductName: product.ProductName,
          ProductDescription: product.ProductDescription,
          ProductPrice: product.ProductPrice,
          ProductImage: product.ProductImage,
          ProductType: product.ProductType,
          PetType: petType.map(pt => pt.PetType),
          ProductDetail: detail,
          Image: image,
        };
      }

      resolve({
        errCode: 0,
        errMessage: 'Lấy thông tin sản phẩm thành công!',
        data,
      });
    } catch (e) {
      console.log('Error in getSaleProductInfo: ', e);
      resolve({
        errCode: 3,
        errMessage: `Lỗi khi lấy thông tin sản phẩm: ${e.message}`,
        data: null,
      });
    }
  });
};

let loadSaleProductInfo = (page, limit, search, filter, sort) => {
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
      if (filter !== 'ALL' && filter !== 'PROMOTION' && !filter.includes('-')) {
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

      await updateOutOfStock();

      const offset = (page - 1) * limit;
      let where = {};
      let order = [];

      if (search?.trim()) {
        const searchTerm = search.trim().substring(0, 100);
        where[Op.or] = [{ ProductName: { [Op.like]: `%${searchTerm}%` } }];
      }

      if (filter !== 'ALL') {
        if (filter === 'PROMOTION') {
          const detail = await db.ProductDetail.findAll({
            where: {
              Promotion: { [Op.gt]: 0 },
              Stock: { [Op.gt]: 0 },
              DetailStatus: 'AVAIL',
            },
            attributes: ['ProductID'],
            raw: true,
          });
          const productIds = [...new Set(detail.map(d => d.ProductID))];
          if (productIds.length === 0) {
            resolve({
              errCode: 0,
              errMessage: 'Không tìm thấy sản phẩm khuyến mãi!',
              data: [],
              totalItems: 0,
            });
            return;
          }
          where.ProductID = { [Op.in]: productIds };
        } else {
          const [field, value] = filter.split('-');
          if (field === 'producttype') {
            const validProductType = await checkValidAllCode('ProductType', value);
            if (!validProductType) {
              resolve({
                errCode: 1,
                errMessage: 'Loại sản phẩm không hợp lệ!',
                data: null,
              });
              return;
            }
            where.ProductType = value;
          } else if (field === 'pettype') {
            const validPetType = await checkValidAllCode('PetType', value);
            if (!validPetType) {
              resolve({
                errCode: 1,
                errMessage: 'Loại thú cưng không hợp lệ!',
                data: null,
              });
              return;
            }
            const products = await db.ProductPetType.findAll({
              where: { PetType: value },
              attributes: ['ProductID'],
              raw: true,
            });
            const productIds = products.map(p => p.ProductID);
            if (productIds.length === 0) {
              resolve({
                errCode: 0,
                errMessage: 'Không tìm thấy sản phẩm nào!',
                data: [],
                totalItems: 0,
              });
              return;
            }
            where.ProductID = { [Op.in]: productIds };
          } else {
            resolve({
              errCode: 1,
              errMessage: 'Tham số filter không hợp lệ!',
              data: null,
            });
            return;
          }
        }
      }

      switch (sort) {
        case '1':
          order.push([literal(`(SELECT SUM(SoldCount) FROM ProductDetail WHERE ProductDetail.ProductID = Product.ProductID)`), 'DESC']);
          break;
        case '2':
          order.push([literal(`(SELECT MIN((ProductPrice + ExtraPrice) * (1 - Promotion / 100)) FROM ProductDetail WHERE ProductDetail.ProductID = Product.ProductID AND ProductDetail.Stock > 0 AND ProductDetail.DetailStatus = 'AVAIL')`), 'ASC']);
          break;
        case '3':
          order.push([literal(`(SELECT MIN((ProductPrice + ExtraPrice) * (1 - Promotion / 100)) FROM ProductDetail WHERE ProductDetail.ProductID = Product.ProductID AND ProductDetail.Stock > 0 AND ProductDetail.DetailStatus = 'AVAIL')`), 'DESC']);
          break;
        case '4':
          order.push([literal(`(SELECT MAX(CreatedAt) FROM ProductDetail WHERE ProductDetail.ProductID = Product.ProductID)`), 'DESC']);
          break;
        default:
          order.push([literal(`(SELECT MAX(CreatedAt) FROM ProductDetail WHERE ProductDetail.ProductID = Product.ProductID)`), 'DESC']);
          break;
      }

      const { count, rows } = await db.Product.findAndCountAll({
        where,
        attributes: ['ProductID', 'ProductName', 'ProductPrice', 'ProductImage'],
        raw: true,
        limit: parseInt(limit),
        offset,
        order,
        distinct: true,
      });

      if (!rows || rows.length === 0) {
        resolve({
          errCode: 0,
          errMessage: 'Không tìm thấy sản phẩm nào!',
          data: [],
          totalItems: 0,
        });
        return;
      }

      const productIds = rows.map(p => p.ProductID);
      const detail = await db.ProductDetail.findAll({
        where: {
          ProductID: { [Op.in]: productIds },
          DetailStatus: 'AVAIL',
          Stock: { [Op.gt]: 0 },
        },
        attributes: ['ProductID', 'ProductDetailID', 'DetailName', 'Stock', 'ExtraPrice', 'Promotion'],
        order: [['ProductDetailID', 'ASC']],
        raw: true,
      });

      const detailMap = detail.reduce((map, detail) => {
        if (!map[detail.ProductID]) {
          map[detail.ProductID] = { defaultDetail: null };
        }
        if (!map[detail.ProductID].defaultDetail) {
          map[detail.ProductID].defaultDetail = detail;
        }
        return map;
      }, {});

      const data = rows
        .map(item => {
          const detail = detailMap[item.ProductID]?.defaultDetail;
          if (!detail) {
            return null;
          }
          const price = (parseFloat(item.ProductPrice) + parseFloat(detail.ExtraPrice)) * (1 - parseFloat(detail.Promotion) / 100);
          return {
            ProductID: item.ProductID,
            ProductName: item.ProductName,
            ItemPrice: price.toFixed(2),
            ProductImage: item.ProductImage,
            ProductDetailID: detail.ProductDetailID,
            DetailName: detail.DetailName,
            Promotion: detail.Promotion,
          };
        })
        .filter(item => item !== null);

      resolve({
        errCode: 0,
        errMessage: 'Lấy danh sách sản phẩm thành công!',
        data,
        totalItems: count,
      });
    } catch (e) {
      console.log('Error in loadSaleProductInfo: ', e);
      resolve({
        errCode: 3,
        errMessage: `Lỗi khi lấy danh sách sản phẩm: ${e.message}`,
        data: null,
      });
    }
  });
};

let getProductInfo = (productid) => {
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
      await updateOutOfStock();
      let data = null;
      if (productid === 'ALL') {
        const products = await db.Product.findAll({
          attributes: ['ProductID', 'ProductName', 'ProductDescription', 'ProductPrice', 'ProductImage', 'ProductType'],
          raw: true,
        });

        if (!products || products.length === 0) {
          resolve({
            errCode: 0,
            errMessage: 'Không tìm thấy sản phẩm nào!',
            data: [],
          });
          return;
        }
        data = await Promise.all(
          products.map(async (product) => {
            const petType = await db.ProductPetType.findAll({
              where: { ProductID: product.ProductID },
              attributes: ['PetType'],
              raw: true,
            });
            const detail = await db.ProductDetail.findAll({
              where: { ProductID: product.ProductID },
              attributes: ['ProductDetailID', 'DetailName', 'Stock', 'SoldCount', 'ExtraPrice', 'Promotion', 'DetailStatus'],
              raw: true,
            });
            const image = await db.Image.findAll({
              where: { ReferenceType: 'Product', ReferenceID: product.ProductID },
              attributes: ['ImageID', 'Image'],
              raw: true,
            });
            return {
              ProductID: product.ProductID,
              ProductName: product.ProductName,
              ProductDescription: product.ProductDescription,
              ProductPrice: product.ProductPrice,
              ProductImage: product.ProductImage,
              ProductType: product.ProductType,
              PetType: petType.map(pt => pt.PetType),
              ProductDetail: detail,
              Image: image,
            };
          })
        );
      } else {
        const product = await db.Product.findOne({
          where: { ProductID: productid },
          attributes: ['ProductID', 'ProductName', 'ProductDescription', 'ProductPrice', 'ProductImage', 'ProductType'],
          raw: true,
        });

        if (!product) {
          resolve({
            errCode: 2,
            errMessage: 'Sản phẩm không tồn tại!',
            data: null,
          });
          return;
        }
        const petType = await db.ProductPetType.findAll({
          where: { ProductID: product.ProductID },
          attributes: ['PetType'],
          raw: true,
        });
        const detail = await db.ProductDetail.findAll({
          where: { ProductID: product.ProductID },
          attributes: ['ProductDetailID', 'DetailName', 'Stock', 'SoldCount', 'ExtraPrice', 'Promotion', 'DetailStatus'],
          raw: true,
        });
        const image = await db.Image.findAll({
          where: { ReferenceType: 'Product', ReferenceID: product.ProductID },
          attributes: ['ImageID', 'Image'],
          raw: true,
        });
        data = {
          ProductID: product.ProductID,
          ProductName: product.ProductName,
          ProductDescription: product.ProductDescription,
          ProductPrice: product.ProductPrice,
          ProductImage: product.ProductImage,
          ProductType: product.ProductType,
          PetType: petType.map(pt => pt.PetType),
          ProductDetail: detail,
          Image: image,
        };
      }
      resolve({
        errCode: 0,
        errMessage: 'Lấy thông tin sản phẩm thành công!',
        data,
      });
    } catch (e) {
      console.log('Error in getProductInfo: ', e);
      resolve({
        errCode: 3,
        errMessage: `Lỗi khi lấy thông tin sản phẩm: ${e.message}`,
        data: null,
      });
    }
  });
};

let loadProductInfo = (page, limit, search, filter, sort) => {
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
      if (filter !== 'ALL' && filter !== 'PROMOTION' && !filter.includes('-')) {
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

      await updateOutOfStock();

      const offset = (page - 1) * limit;
      let where = {};
      let order = [];

      if (search?.trim()) {
        const searchTerm = search.trim().substring(0, 100);
        where[Op.or] = [{ ProductName: { [Op.like]: `%${searchTerm}%` } }];
      }

      if (filter !== 'ALL' && filter !== 'PROMOTION') {
        const [field, value] = filter.split('-');
        if (field === 'producttype') {
          const validProductType = await checkValidAllCode('ProductType', value);
          if (!validProductType) {
            resolve({
              errCode: 1,
              errMessage: 'Loại sản phẩm không hợp lệ!',
              data: null,
            });
            return;
          }
          where.ProductType = value;
        } else if (field === 'pettype') {
          const validPetType = await checkValidAllCode('PetType', value);
          if (!validPetType) {
            resolve({
              errCode: 1,
              errMessage: 'Loại thú cưng không hợp lệ!',
              data: null,
            });
            return;
          }
          const products = await db.ProductPetType.findAll({
            where: { PetType: value },
            attributes: ['ProductID'],
            raw: true,
          });
          const productIds = products.map(p => p.ProductID);
          if (productIds.length === 0) {
            resolve({
              errCode: 0,
              errMessage: 'Không tìm thấy sản phẩm nào!',
              data: [],
              totalItems: 0,
            });
            return;
          }
          where.ProductID = { [Op.in]: productIds };
        } else {
          resolve({
            errCode: 1,
            errMessage: 'Tham số filter không hợp lệ!',
            data: null,
          });
          return;
        }
      }

      if (filter === 'PROMOTION') {
        const detail = await db.ProductDetail.findAll({
          where: { Promotion: { [Op.gt]: 0 } },
          attributes: ['ProductID'],
          raw: true,
        });
        const productIds = [...new Set(detail.map(d => d.ProductID))];
        if (productIds.length === 0) {
          resolve({
            errCode: 0,
            errMessage: 'Không tìm thấy sản phẩm khuyến mãi!',
            data: [],
            totalItems: 0,
          });
          return;
        }
        where.ProductID = { [Op.in]: productIds };
      }

      switch (sort) {
        case '1':
          order.push([literal(`(SELECT SUM(SoldCount) FROM ProductDetail WHERE ProductDetail.ProductID = Product.ProductID)`), 'DESC']);
          break;
        case '2':
          order.push(['ProductPrice', 'ASC']);
          break;
        case '3':
          order.push(['ProductPrice', 'DESC']);
          break;
        case '4':
          order.push([literal(`(SELECT MAX(CreatedAt) FROM ProductDetail WHERE ProductDetail.ProductID = Product.ProductID)`), 'DESC']);
          break;
        default:
          order.push([literal(`(SELECT MAX(CreatedAt) FROM ProductDetail WHERE ProductDetail.ProductID = Product.ProductID)`), 'DESC']);
          break;
      }

      const { count, rows } = await db.Product.findAndCountAll({
        where,
        attributes: ['ProductID', 'ProductName', 'ProductType', 'ProductPrice', 'ProductImage'],
        limit: parseInt(limit),
        offset,
        order,
        raw: true,
        distinct: true,
      });

      if (!rows || rows.length === 0) {
        resolve({
          errCode: 0,
          errMessage: 'Không tìm thấy sản phẩm nào!',
          data: [],
          totalItems: 0,
        });
        return;
      }

      const productIds = rows.map(p => p.ProductID);
      const stockData = await db.ProductDetail.findAll({
        where: { ProductID: { [Op.in]: productIds } },
        attributes: ['ProductID', [db.sequelize.fn('SUM', db.sequelize.col('Stock')), 'TotalStock']],
        group: ['ProductID'],
        raw: true,
      });
      const stockMap = stockData.reduce((map, item) => {
        map[item.ProductID] = { TotalStock: parseInt(item.TotalStock) || 0 };
        return map;
      }, {});

      const soldData = await db.ProductDetail.findAll({
        where: { ProductID: { [Op.in]: productIds } },
        attributes: ['ProductID', [db.sequelize.fn('SUM', db.sequelize.col('SoldCount')), 'TotalSold']],
        group: ['ProductID'],
        raw: true,
      });
      const soldMap = soldData.reduce((map, item) => {
        map[item.ProductID] = { TotalSold: parseInt(item.TotalSold) || 0 };
        return map;
      }, {});

      const data = rows.map(item => ({
        ProductID: item.ProductID,
        ProductName: item.ProductName,
        ProductType: item.ProductType,
        ProductPrice: parseFloat(item.ProductPrice),
        ProductImage: item.ProductImage,
        TotalStock: stockMap[item.ProductID]?.TotalStock || 0,
        TotalSold: soldMap[item.ProductID]?.TotalSold || 0,
      }));

      resolve({
        errCode: 0,
        errMessage: 'Lấy danh sách sản phẩm thành công!',
        data,
        totalItems: count,
      });
    } catch (e) {
      console.log('Error in loadProductInfo: ', e);
      resolve({
        errCode: 3,
        errMessage: `Lỗi khi lấy danh sách sản phẩm: ${e.message}`,
        data: null,
      });
    }
  });
};

let getProductDetailInfo = (productid, productdetailid) => {
  return new Promise(async (resolve, reject) => {
    try {
      if (!productid || !productdetailid) {
        resolve({
          errCode: -1,
          errMessage: 'Thiếu tham số!',
          data: null,
        });
        return;
      }

      await updateOutOfStock();

      const product = await db.Product.findOne({
        where: { ProductID: productid },
        attributes: ['ProductID', 'ProductName', 'ProductType', 'ProductPrice', 'ProductImage'],
        raw: true,
      });

      const detail = await db.ProductDetail.findOne({
        where: { ProductID: productid, ProductDetailID: productdetailid },
        attributes: ['ProductDetailID', 'DetailName', 'Stock', 'SoldCount', 'ExtraPrice', 'Promotion', 'CreatedAt', 'DetailStatus'],
        raw: true,
      });

      if (!product || !detail) {
        resolve({
          errCode: 2,
          errMessage: 'Sản phẩm hoặc chi tiết sản phẩm không tồn tại!',
          data: null,
        });
        return;
      }

      const data = {
        ProductID: product.ProductID,
        ProductName: product.ProductName,
        ProductType: product.ProductType,
        ProductPrice: product.ProductPrice,
        ProductImage: product.ProductImage,
        ProductDetailID: detail.ProductDetailID,
        DetailName: detail.DetailName,
        Stock: detail.Stock,
        SoldCount: detail.SoldCount,
        ExtraPrice: detail.ExtraPrice,
        Promotion: detail.Promotion,
        CreatedAt: detail.CreatedAt,
        DetailStatus: detail.DetailStatus,
      };

      resolve({
        errCode: 0,
        errMessage: 'Lấy thông tin chi tiết sản phẩm thành công!',
        data,
      });
    } catch (e) {
      console.log('Error in getProductDetailInfo: ', e);
      resolve({
        errCode: 3,
        errMessage: `Lỗi khi lấy thông tin chi tiết sản phẩm: ${e.message}`,
        data: null,
      });
    }
  });
};

let createProduct = (productInfo) => {
  return new Promise(async (resolve, reject) => {
    const transaction = await db.sequelize.transaction();
    try {
      if (!productInfo) {
        await transaction.rollback();
        resolve({
          errCode: -1,
          errMessage: 'Thiếu thông tin sản phẩm!',
          data: null,
        });
        return;
      }

      const isValidateInput = await validateProductInput(productInfo);
      if (isValidateInput) {
        await transaction.rollback();
        resolve(isValidateInput);
        return;
      }

      const isProductNameExist = await checkProductNameExist(productInfo.ProductName);
      if (isProductNameExist) {
        await transaction.rollback();
        resolve({
          errCode: 1,
          errMessage: 'Tên sản phẩm đã tồn tại trong hệ thống!',
          data: null,
        });
        return;
      }
      const productIdResult = await generateID('P', 9, 'Product', 'ProductID');
      if (productIdResult.errCode !== 0) {
        await transaction.rollback();
        resolve(productIdResult);
        return;
      }
      const productId = productIdResult.data;

      const createdAt = new Date();
      await db.Product.create({
        ProductID: productId,
        ProductType: productInfo.ProductType,
        ProductName: productInfo.ProductName.trim(),
        ProductPrice: productInfo.ProductPrice,
        ProductImage: productInfo.ProductImage || null,
        ProductDescription: productInfo.ProductDescription ? productInfo.ProductDescription.trim().substring(0, 65535) : null,
      }, { transaction });

      for (const detail of productInfo.ProductDetail) {
        await db.ProductDetail.create({
          DetailName: detail.DetailName.trim(),
          Stock: parseInt(detail.Stock),
          SoldCount: parseInt(detail.SoldCount) || 0,
          ExtraPrice: detail.ExtraPrice,
          Promotion: detail.Promotion,
          CreatedAt: createdAt,
          DetailStatus: detail.DetailStatus,
          ProductID: productId,
        }, { transaction });
      }
      for (const petType of productInfo.PetType) {
        await db.ProductPetType.create({
          ProductID: productId,
          PetType: petType,
        }, { transaction });
      }
      if (productInfo.Image && Array.isArray(productInfo.Image) && productInfo.Image.length > 0) {
        for (const image of productInfo.Image) {
          await db.Image.create({
            Image: image.Image.trim().substring(0, 2048),
            ReferenceType: 'Product',
            ReferenceID: productId,
          }, { transaction });
        }
      }
      await transaction.commit();
      resolve({
        errCode: 0,
        errMessage: 'Tạo sản phẩm thành công!',
        data: { ProductID: productId },
      });
    } catch (e) {
      await transaction.rollback();
      console.log('Error in createProduct: ', e);
      resolve({
        errCode: 3,
        errMessage: `Lỗi khi tạo sản phẩm: ${e.message}`,
        data: null,
      });
    }
  });
};

let changeProductInfo = (productInfo) => {
  return new Promise(async (resolve, reject) => {
    const transaction = await db.sequelize.transaction();
    try {
      if (!productInfo || !productInfo.ProductID) {
        await transaction.rollback();
        resolve({
          errCode: -1,
          errMessage: 'Thiếu tham số ProductID!',
          data: null,
        });
        return;
      }
      const isValidateInput = await validateProductInput(productInfo);
      if (isValidateInput) {
        await transaction.rollback();
        resolve(isValidateInput);
        return;
      }
      const product = await db.Product.findOne({
        where: { ProductID: productInfo.ProductID },
        transaction,
      });
      if (!product) {
        await transaction.rollback();
        resolve({
          errCode: 2,
          errMessage: 'Sản phẩm không tồn tại!',
          data: null,
        });
        return;
      }
      if (productInfo.ProductName && productInfo.ProductName !== product.ProductName) {
        const isProductNameExist = await checkProductNameExist(productInfo.ProductName, productInfo.ProductID);
        if (isProductNameExist) {
          await transaction.rollback();
          resolve({
            errCode: 1,
            errMessage: 'Tên sản phẩm đã tồn tại trong hệ thống!',
            data: null,
          });
          return;
        }
      }
      let isUpdated = false;
      if (productInfo.ProductName) {
        product.ProductName = productInfo.ProductName.trim();
        isUpdated = true;
      }
      if (productInfo.ProductType) {
        product.ProductType = productInfo.ProductType;
        isUpdated = true;
      }
      if (productInfo.ProductPrice) {
        product.ProductPrice = productInfo.ProductPrice;
        isUpdated = true;
      }
      if (productInfo.ProductImage !== undefined) {
        product.ProductImage = productInfo.ProductImage || null;
        isUpdated = true;
      }
      if (productInfo.ProductDescription !== undefined) {
        product.ProductDescription = productInfo.ProductDescription ? productInfo.ProductDescription.trim().substring(0, 65535) : null;
        isUpdated = true;
      }

      if (productInfo.PetType) {
        await db.ProductPetType.destroy({
          where: { ProductID: productInfo.ProductID },
          transaction,
        });
        for (const petType of productInfo.PetType) {
          await db.ProductPetType.create({
            ProductID: productInfo.ProductID,
            PetType: petType,
          }, { transaction });
        }
        isUpdated = true;
      }
      if (productInfo.ProductDetail) {
        const createdAt = new Date();
        for (const detail of productInfo.ProductDetail) {
          if (detail.ProductDetailID) {
            const existingDetail = await db.ProductDetail.findOne({
              where: { ProductDetailID: detail.ProductDetailID, ProductID: productInfo.ProductID },
              transaction,
            });
            if (existingDetail) {
              await db.ProductDetail.update(
                {
                  DetailName: detail.DetailName.trim(),
                  Stock: parseInt(detail.Stock) || 0,
                  SoldCount: parseInt(detail.SoldCount) || existingDetail.SoldCount,
                  ExtraPrice: detail.ExtraPrice,
                  Promotion: detail.Promotion,
                  DetailStatus: detail.DetailStatus,
                },
                { where: { ProductDetailID: detail.ProductDetailID }, transaction }
              );
              isUpdated = true;
            } else {
              await db.ProductDetail.create({
                DetailName: detail.DetailName.trim(),
                Stock: parseInt(detail.Stock) || 0,
                SoldCount: parseInt(detail.SoldCount) || 0,
                ExtraPrice: detail.ExtraPrice,
                Promotion: detail.Promotion,
                CreatedAt: createdAt,
                DetailStatus: detail.DetailStatus,
                ProductID: productInfo.ProductID,
              }, { transaction });
              isUpdated = true;
            }
          }
        }
      }
      if (productInfo.Image !== undefined) {
        await db.Image.destroy({
          where: { ReferenceType: 'Product', ReferenceID: productInfo.ProductID },
          transaction,
        });
        if (productInfo.Image && Array.isArray(productInfo.Image) && productInfo.Image.length > 0) {
          for (const image of productInfo.Image) {
            await db.Image.create({
              Image: image.Image.trim().substring(0, 2048),
              ReferenceType: 'Product',
              ReferenceID: productInfo.ProductID,
            }, { transaction });
          }
        }
        isUpdated = true;
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
      await db.Product.update(
        {
          ProductName: product.ProductName,
          ProductType: product.ProductType,
          ProductPrice: product.ProductPrice,
          ProductImage: product.ProductImage,
          ProductDescription: product.ProductDescription,
        },
        { where: { ProductID: productInfo.ProductID }, transaction }
      );
      await transaction.commit();
      resolve({
        errCode: 0,
        errMessage: 'Cập nhật thông tin sản phẩm thành công!',
        data: null,
      });
    } catch (e) {
      await transaction.rollback();
      console.log('Error in changeProductInfo: ', e);
      resolve({
        errCode: 3,
        errMessage: `Lỗi khi cập nhật thông tin sản phẩm: ${e.message}`,
        data: null,
      });
    }
  });
};

let loadFilteredProductInfo = (filterProductType, filterPetType) => {
  return new Promise(async (resolve, reject) => {
    try {
      let parsedPetType = [];
      if (filterPetType) {
        if (Array.isArray(filterPetType)) {
          parsedPetType = filterPetType;
        } else {
          try {
            parsedPetType = JSON.parse(filterPetType);
            if (!Array.isArray(parsedPetType)) {
              parsedPetType = [parsedPetType];
            }
          } catch (e) {
            resolve({
              errCode: 1,
              errMessage: 'Tham số filterPetType không hợp lệ!',
              data: null,
            });
            return;
          }
        }
      }

      if (filterProductType && filterProductType !== 'ALL') {
        const validProductType = await checkValidAllCode('ProductType', filterProductType);
        if (!validProductType) {
          resolve({
            errCode: 1,
            errMessage: `Loại sản phẩm ${filterProductType} không hợp lệ!`,
            data: null,
          });
          return;
        }
      }

      if (parsedPetType.length > 0 && parsedPetType[0] !== 'ALL') {
        for (const petType of parsedPetType) {
          const validPetType = await checkValidAllCode('PetType', petType);
          if (!validPetType) {
            resolve({
              errCode: 1,
              errMessage: `Loại thú cưng ${petType} không hợp lệ!`,
              data: null,
            });
            return;
          }
        }
      }

      await updateOutOfStock();

      let where = {};
      if (filterProductType && filterProductType !== 'ALL') {
        where.ProductType = filterProductType;
      }

      if (parsedPetType.length > 0 && parsedPetType[0] !== 'ALL') {
        const products = await db.ProductPetType.findAll({
          where: { PetType: { [Op.in]: parsedPetType } },
          attributes: ['ProductID'],
          raw: true,
        });
        const productIds = [...new Set(products.map(p => p.ProductID))];
        if (productIds.length === 0) {
          resolve({
            errCode: 0,
            errMessage: 'Không tìm thấy sản phẩm nào!',
            data: [],
          });
          return;
        }
        where.ProductID = { [Op.in]: productIds };
      }

      const products = await db.Product.findAll({
        where,
        attributes: ['ProductID', 'ProductName', 'ProductType', 'ProductPrice', 'ProductImage'],
        raw: true,
      });

      resolve({
        errCode: 0,
        errMessage: 'Lấy danh sách sản phẩm thành công!',
        data: products,
      });
    } catch (e) {
      console.log('Error in loadFilteredProductInfo: ', e);
      resolve({
        errCode: 3,
        errMessage: `Lỗi khi lấy danh sách sản phẩm: ${e.message}`,
        data: null,
      });
    }
  });
};

module.exports = {
  getSaleProductInfo,
  loadSaleProductInfo,
  getProductInfo,
  loadProductInfo,
  getProductDetailInfo,
  createProduct,
  changeProductInfo,
  loadFilteredProductInfo,
};