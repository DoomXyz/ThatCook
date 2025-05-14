import { where } from 'sequelize';
import db from '../models/index';

let addToCart = (accountid, cartInfo) => {
  return new Promise(async (resolve, reject) => {
    try {
      if (!accountid || !cartInfo) {
        resolve({
          errCode: -1,
          errMessage: 'Thiếu tham số!',
          data: null,
        });
        return;
      }
      for (let i = 0; i < cartInfo.length; i++) {
        const productID = cartInfo[i].ProductID;
        const productDetailID = cartInfo[i].ProductDetailID;
        const itemPrice = cartInfo[i].ItemPrice;
        const quantity = cartInfo[i].ItemQuantity;

        let isExistAccount = await db.CartItem.findOne({
          attributes: ['AccountID'],
          where: { AccountID: accountid },
          raw: true,
        });
        if (isExistAccount) {
          let isExistProduct = await db.CartItem.findOne({
            where: {
              AccountID: accountid,
              ProductID: productID,
              ProductDetailID: productDetailID,
            },
            raw: false,
          });
          if (isExistProduct) {
            isExistProduct.ItemQuantity += quantity;
            isExistProduct.ItemPrice = itemPrice;
            await isExistProduct.save();
          } else {
            await db.CartItem.create({
              AccountID: accountid,
              ProductID: productID,
              ProductDetailID: productDetailID,
              ItemPrice: itemPrice,
              ItemQuantity: quantity,
            });
          }
        } else {
          await db.CartItem.create({
            AccountID: accountid,
            ProductID: productID,
            ProductDetailID: productDetailID,
            ItemPrice: itemPrice,
            ItemQuantity: quantity,
          });
        }
      }
      resolve({
        errCode: 0,
        errMessage: 'Thêm vào giỏ hàng thành công!',
      });
    } catch (e) {
      console.log(e);
      resolve({
        errCode: 3,
        errMessage: 'Lỗi khi lấy thông tin: ' + e.message,
        data: null,
      });
    }
  });
};

let getCart = (accountid) => {
  return new Promise(async (resolve, reject) => {
    try {
      if (!accountid) {
        resolve({
          errCode: -1,
          errMessage: 'Thiếu tham số!',
          data: null,
        });
        return;
      }
      const cartItem = await db.CartItem.findAll({
        where: { AccountID: accountid },
      });
      if (!cartItem) {
        resolve({
          errCode: 2,
          errMessage: 'Giỏ hàng trống!',
          data: null,
        });
        return;
      }
      resolve({
        errCode: 0,
        errMessage: 'Tải giỏ hàng thành công!',
        data: cartItem.map((item) => ({
          CartItemID: item.CartItemID,
          ProductID: item.ProductID,
          ProductDetailID: item.ProductDetailID,
          ItemPrice: item.ItemPrice,
          ItemQuantity: item.ItemQuantity,
        })),
      });
    } catch (e) {
      console.log(e);
      resolve({
        errCode: 3,
        errMessage: 'Lỗi khi lấy thông tin: ' + e.message,
        data: null,
      });
    }
  });
};

let getCartDetail = (cartInfo) => {
  return new Promise(async (resolve, reject) => {
    try {
      if (!cartInfo) {
        resolve({
          errCode: -1,
          errMessage: 'Thiếu tham số!',
          data: null,
        });
        return;
      }
      const cartDetailInfo = await Promise.all(
        cartInfo.map(async (item) => {
          const { ProductID, ProductDetailID } = item;
          // Lấy thông tin sản phẩm
          const product = await db.Product.findOne({
            where: { ProductID },
            attributes: ['ProductID', 'ProductName', 'ProductPrice', 'ProductImage', 'ProductType', 'ProductDescription'],
            raw: true,
          });
          // Lấy chi tiết sản phẩm
          const productDetail = await db.ProductDetail.findOne({
            where: {
              ProductID,
              ProductDetailID,
              DetailStatus: 'AVAIL',
            },
            attributes: ['ProductDetailID', 'DetailName', 'Stock', 'SoldCount', 'ExtraPrice', 'Promotion'],
            raw: true,
          });
          if (!productDetail) {
            return {
              CartItemID: item.CartItemID,
              errCode: 2,
              errMessage: 'Chi tiết sản phẩm không tồn tại!',
              data: null,
            };
          }
          const finalProductPrice = parseFloat(product.ProductPrice) + parseFloat(productDetail.ExtraPrice);
          const finalPrice = (parseFloat(product.ProductPrice) + parseFloat(productDetail.ExtraPrice)) * (1 - parseFloat(productDetail.Promotion) / 100);
          return {
            CartItemID: item.CartItemID,
            ProductID: product.ProductID,
            ProductName: product.ProductName,
            ProductImage: product.ProductImage,
            ProductDescription: product.ProductDescription,
            ProductDetailID: productDetail.ProductDetailID,
            DetailName: productDetail.DetailName,
            Stock: productDetail.Stock,
            Promotion: parseFloat(productDetail.Promotion),
            ProductPrice: finalProductPrice,
            ItemPrice: finalPrice,
            ItemQuantity: item.ItemQuantity < productDetail.Stock ? item.ItemQuantity : productDetail.Stock,
            TotalPrice: finalPrice * item.ItemQuantity,
          };
        })
      );
      resolve({
        errCode: 0,
        errMessage: 'Lấy thông tin giỏ hàng thành công!',
        data: cartDetailInfo,
      });
    } catch (e) {
      console.log(e);
      resolve({
        errCode: 3,
        errMessage: 'Lỗi khi lấy thông tin: ' + e.message,
        data: null,
      });
    }
  });
};

let getDetailList = (cartInfo) => {
  return new Promise(async (resolve, reject) => {
    try {
      if (!cartInfo) {
        resolve({
          errCode: -1,
          errMessage: 'Thiếu tham số!',
          data: null,
        });
        return;
      }
      const cartDetailList = await Promise.all(
        cartInfo.map(async (item) => {
          const { ProductID } = item;
          const productDetails = await db.ProductDetail.findAll({
            where: {
              ProductID,
              DetailStatus: 'AVAIL',
            },
            attributes: ['ProductDetailID', 'DetailName', 'Stock'],
            raw: true,
          });
          if (!productDetails || productDetails.length === 0) {
            return [];
          }
          return {
            ProductID,
            DetailList: productDetails,
          };
        })
      );
      resolve({
        errCode: 0,
        errMessage: 'Lấy danh sách chi tiết giỏ hàng thành công!',
        data: cartDetailList,
      });
    } catch (e) {
      console.log(e);
      resolve({
        errCode: 3,
        errMessage: 'Lỗi khi lấy thông tin: ' + e.message,
        data: null,
      });
    }
  });
};

let updateQuantity = (accountid, productid, productdetailid, quantity) => {
  return new Promise(async (resolve, reject) => {
    try {
      if (!accountid || !productid || !productdetailid || !quantity) {
        resolve({
          errCode: -1,
          errMessage: 'Thiếu tham số!',
          data: null,
        });
        return;
      }
      let isExistProduct = await db.CartItem.findOne({
        where: {
          AccountID: accountid,
          ProductID: productid,
          ProductDetailID: productdetailid,
        },
        raw: false,
      });
      if (isExistProduct) {
        isExistProduct.ItemQuantity = quantity;
        await isExistProduct.save();
      } else {
        resolve({
          errCode: 2,
          errMessage: 'Cập nhật số lượng thất bại!',
          data: null,
        });
      }
      resolve({
        errCode: 0,
        errMessage: 'Cập nhật số lượng thành công!',
        data: null,
      });
    } catch (e) {
      console.log(e);
      resolve({
        errCode: 3,
        errMessage: 'Lỗi khi lấy thông tin: ' + e.message,
        data: null,
      });
    }
  });
};

let removeFromCart = (accountid, productid, productdetailid) => {
  return new Promise(async (resolve, reject) => {
    try {
      if (!accountid || !productid || !productdetailid) {
        resolve({
          errCode: -1,
          errMessage: 'Thiếu tham số!',
          data: null,
        });
        return;
      }
      let isExistProduct = await db.CartItem.findOne({
        where: {
          AccountID: accountid,
          ProductID: productid,
          ProductDetailID: productdetailid,
        },
        raw: false,
      });
      if (isExistProduct) {
        await db.CartItem.destroy({
          where: {
            AccountID: accountid,
            ProductID: productid,
            ProductDetailID: productdetailid,
          },
        });
        resolve({
          errCode: 0,
          errMessage: 'Xóa sản phẩm thành công!',
          data: null,
        });
      } else {
        resolve({
          errCode: 2,
          errMessage: 'Xóa sản phẩm thất bại!',
          data: null,
        });
      }
    } catch (e) {
      console.log(e);
      resolve({
        errCode: 3,
        errMessage: 'Lỗi khi lấy thông tin: ' + e.message,
        data: null,
      });
    }
  });
};

let updateCartDetail = (accountid, productid, productdetailid1, productdetailid2) => {
  return new Promise(async (resolve, reject) => {
    try {
      if (!accountid || !productid || !productdetailid1 || !productdetailid2) {
        resolve({
          errCode: -1,
          errMessage: 'Thiếu tham số!',
          data: null,
        });
        return;
      }
      let isExistProduct = await db.CartItem.findOne({
        where: {
          AccountID: accountid,
          ProductID: productid,
          ProductDetailID: productdetailid1,
        },
        raw: false,
      });
      if (isExistProduct) {
        const newProductData = await db.Product.findOne({
          where: {
            ProductID: productid,
          },
          attributes: ['ProductID', 'ProductName', 'ProductPrice'],
        });
        const newDetailData = await db.ProductDetail.findOne({
          where: {
            ProductID: productid,
            ProductDetailID: productdetailid2,
          },
          attributes: ['ProductID', 'ProductDetailID', 'DetailName', 'Stock', 'Promotion', 'ExtraPrice'],
        });
        if (newProductData && newDetailData) {
          const newItemPrice = (parseFloat(newProductData.ProductPrice) + parseFloat(newDetailData.ExtraPrice)) * (1 - parseFloat(newDetailData.Promotion) / 100);
          const newItemQuantity = isExistProduct.ItemQuantity > newDetailData.Stock ? newDetailData.Stock : isExistProduct.ItemQuantity;
          isExistProduct.ProductDetailID = productdetailid2;
          isExistProduct.ItemPrice = newItemPrice;
          isExistProduct.ItemQuantity = newItemQuantity;
          await isExistProduct.save();
          resolve({
            errCode: 0,
            errMessage: 'Cập nhật giỏ hàng thành công!',
            data: null,
          });
          return;
        }
        resolve({
          errCode: 2,
          errMessage: 'Cập nhật giỏ hàng thất bại!',
          data: null,
        });
      }
    } catch (e) {
      console.log(e);
      resolve({
        errCode: 3,
        errMessage: 'Lỗi khi lấy thông tin: ' + e.message,
        data: null,
      });
    }
  });
};

let mergeCartDetail = (accountid, productid, productdetailid1, productdetailid2, quantity) => {
  return new Promise(async (resolve, reject) => {
    try {
      if (!accountid || !productid || !productdetailid1 || !productdetailid2 || !quantity) {
        resolve({
          errCode: -1,
          errMessage: 'Thiếu tham số!',
          data: null,
        });
        return;
      }
      let isExistDetail1 = await db.CartItem.findOne({
        where: {
          AccountID: accountid,
          ProductID: productid,
          ProductDetailID: productdetailid1,
        },
        raw: false,
      });
      let isExistDetail2 = await db.CartItem.findOne({
        where: {
          AccountID: accountid,
          ProductID: productid,
          ProductDetailID: productdetailid2,
        },
        raw: false,
      });
      if (isExistDetail1 && isExistDetail2) {
        isExistDetail2.ItemQuantity = quantity;
        await isExistDetail2.save();
        await db.CartItem.destroy({
          where: {
            AccountID: accountid,
            ProductID: productid,
            ProductDetailID: productdetailid1,
          },
        });
        resolve({
          errCode: 0,
          errMessage: 'Gộp chi tiết sản phẩm thành công!',
          data: null,
        });
        return;
      }
      resolve({
        errCode: 2,
        errMessage: 'Chi tiết sản phẩm không hợp lệ',
        data: null,
      });
    } catch (e) {
      console.log(e);
      resolve({
        errCode: 3,
        errMessage: 'Lỗi khi lấy thông tin: ' + e.message,
        data: null,
      });
    }
  });
};

module.exports = {
  addToCart,
  getCart,
  getCartDetail,
  getDetailList,
  updateQuantity,
  removeFromCart,
  updateCartDetail,
  mergeCartDetail,
};
