import db from '../models/index';

let getCart = (AccountID) => {
  return new Promise(async (resolve, reject) => {
    try {
      if (!AccountID) {
        resolve({
          errCode: -1,
          errMessage: 'Thiếu tham số!',
          data: null,
        });
        return;
      }
      const cartItems = await db.CartItem.findAll({
        where: { AccountID },
        attributes: ['CartItemID', 'ProductID', 'ProductDetailID', 'ItemPrice', 'ItemQuantity'],
        raw: true,
      });
      if (!cartItems || cartItems.length === 0) {
        resolve({
          errCode: 0,
          errMessage: 'Giỏ hàng trống!',
          data: [],
        });
        return;
      }
      resolve({
        errCode: 0,
        errMessage: 'Tải giỏ hàng thành công!',
        data: cartItems,
      });
    } catch (e) {
      console.log('Error in getCart: ', e);
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
      if (!cartInfo || !Array.isArray(cartInfo) || cartInfo.length === 0) {
        resolve({
          errCode: -1,
          errMessage: 'Thiếu hoặc sai định dạng tham số!',
          data: null,
        });
        return;
      }

      const cartDetailInfo = await Promise.all(
        cartInfo.map(async (item) => {
          const { ProductID, ProductDetailID, ItemQuantity } = item;
          if (!ProductID || !ProductDetailID || ItemQuantity === undefined) {
            return {
              CartItemID: item.CartItemID,
              errCode: 1,
              errMessage: 'Thông tin sản phẩm không hợp lệ!',
              data: null,
            };
          }

          const product = await db.Product.findOne({
            where: { ProductID },
            attributes: ['ProductID', 'ProductName', 'ProductPrice', 'ProductImage', 'ProductType', 'ProductDescription'],
            raw: true,
          });
          if (!product) {
            return {
              CartItemID: item.CartItemID,
              errCode: 2,
              errMessage: 'Sản phẩm không tồn tại!',
              data: null,
            };
          }

          const productDetail = await db.ProductDetail.findOne({
            where: { ProductID, ProductDetailID, DetailStatus: 'AVAIL' },
            attributes: ['ProductDetailID', 'DetailName', 'Stock', 'SoldCount', 'ExtraPrice', 'Promotion'],
            raw: true,
          });
          if (!productDetail) {
            return {
              CartItemID: item.CartItemID,
              errCode: 2,
              errMessage: 'Chi tiết sản phẩm không tồn tại hoặc hết hàng!',
              data: null,
            };
          }

          const finalItemQuantity = Math.min(ItemQuantity, productDetail.Stock);
          if (ItemQuantity > productDetail.Stock) {
            await db.CartItem.update(
              { ItemQuantity: productDetail.Stock },
              { where: { CartItemID: item.CartItemID } }
            );
          }

          const finalProductPrice = parseFloat(product.ProductPrice) + parseFloat(productDetail.ExtraPrice);
          const finalPrice = finalProductPrice * (1 - parseFloat(productDetail.Promotion) / 100);

          return {
            CartItemID: item.CartItemID,
            ProductID: product.ProductID,
            ProductName: product.ProductName,
            ProductImage: product.ProductImage,
            ProductDescription: product.ProductDescription,
            ProductDetailID: productDetail.ProductDetailID,
            DetailName: productDetail.DetailName,
            Stock: productDetail.Stock,
            Promotion: productDetail.Promotion,
            ProductPrice: finalProductPrice,
            ItemPrice: finalPrice,
            ItemQuantity: finalItemQuantity,
            TotalPrice: finalPrice * finalItemQuantity,
          };
        })
      );

      const hasError = cartDetailInfo.some(item => item.errCode);
      if (hasError) {
        resolve({
          errCode: 1,
          errMessage: 'Một số sản phẩm trong giỏ hàng không hợp lệ!',
          data: cartDetailInfo,
        });
        return;
      }

      resolve({
        errCode: 0,
        errMessage: 'Lấy thông tin chi tiết giỏ hàng thành công!',
        data: cartDetailInfo,
      });
    } catch (e) {
      console.log('Error in getCartDetail: ', e);
      resolve({
        errCode: 3,
        errMessage: `Lỗi khi lấy thông tin chi tiết giỏ hàng: ${e.message}`,
        data: null,
      });
    }
  });
};

let getDetailList = (cartInfo) => {
  return new Promise(async (resolve, reject) => {
    try {
      if (!cartInfo || !Array.isArray(cartInfo) || cartInfo.length === 0) {
        resolve({
          errCode: -1,
          errMessage: 'Thiếu hoặc sai định dạng tham số!',
          data: null,
        });
        return;
      }
      const cartDetailList = await Promise.all(
        cartInfo.map(async (item) => {
          const { ProductID } = item;
          if (!ProductID) {
            return {
              ProductID,
              errCode: 1,
              errMessage: 'Mã sản phẩm không hợp lệ!',
              data: null,
            };
          }
          const productDetails = await db.ProductDetail.findAll({
            where: {
              ProductID,
              DetailStatus: 'AVAIL',
            },
            attributes: ['ProductDetailID', 'DetailName', 'Stock'],
            raw: true,
          });
          return {
            ProductID,
            DetailList: productDetails || [],
          };
        })
      );
      resolve({
        errCode: 0,
        errMessage: 'Lấy danh sách chi tiết sản phẩm thành công!',
        data: cartDetailList,
      });
    } catch (e) {
      console.log('Error in getDetailList: ', e);
      resolve({
        errCode: 3,
        errMessage: 'Lỗi khi lấy thông tin: ' + e.message,
        data: null,
      });
    }
  });
};

let addToCart = (AccountID, cartInfo) => {
  return new Promise(async (resolve, reject) => {
    const transaction = await db.sequelize.transaction();
    try {
      if (!AccountID || !cartInfo || !Array.isArray(cartInfo) || cartInfo.length === 0) {
        await transaction.rollback();
        resolve({
          errCode: -1,
          errMessage: 'Thiếu hoặc sai định dạng tham số!',
          data: null,
        });
        return;
      }
      const account = await db.Account.findOne({
        where: { AccountID },
        transaction,
      });
      if (!account) {
        await transaction.rollback();
        resolve({
          errCode: 1,
          errMessage: 'Tài khoản không tồn tại!',
          data: null,
        });
        return;
      }
      for (const item of cartInfo) {
        const { ProductID, ProductDetailID, ItemPrice, ItemQuantity } = item;
        if (!ProductID || !ProductDetailID || ItemPrice === undefined || ItemQuantity === undefined || ItemQuantity <= 0 || ItemPrice < 0) {
          await transaction.rollback();
          resolve({
            errCode: 1,
            errMessage: 'Thông tin sản phẩm không hợp lệ!',
            data: null,
          });
          return;
        }
        const productDetail = await db.ProductDetail.findOne({
          where: { ProductID, ProductDetailID, DetailStatus: 'AVAIL' },
          attributes: ['Stock'],
          transaction,
        });
        if (!productDetail) {
          await transaction.rollback();
          resolve({
            errCode: 1,
            errMessage: `Chi tiết sản phẩm ${ProductID}-${ProductDetailID} không tồn tại hoặc hết hàng!`,
            data: null,
          });
          return;
        }
        if (ItemQuantity > productDetail.Stock) {
          await transaction.rollback();
          resolve({
            errCode: 1,
            errMessage: `Số lượng yêu cầu vượt quá tồn kho cho sản phẩm ${ProductID}!`,
            data: null,
          });
          return;
        }
        let cartItem = await db.CartItem.findOne({
          where: { AccountID, ProductID, ProductDetailID },
          raw: false,
          transaction,
        });
        if (cartItem) {
          cartItem.ItemQuantity += ItemQuantity;
          cartItem.ItemPrice = ItemPrice;
          await cartItem.save({ transaction });
        } else {
          await db.CartItem.create({
            AccountID,
            ProductID,
            ProductDetailID,
            ItemPrice,
            ItemQuantity,
          }, { transaction });
        }
      }
      await transaction.commit();
      resolve({
        errCode: 0,
        errMessage: 'Thêm vào giỏ hàng thành công!',
        data: null,
      });
    } catch (e) {
      await transaction.rollback();
      console.log('Error in addToCart: ', e);
      resolve({
        errCode: 3,
        errMessage: `Lỗi khi thêm vào giỏ hàng: ${e.message}`,
        data: null,
      });
    }
  });
};

let updateQuantity = (AccountID, ProductID, ProductDetailID, Quantity) => {
  return new Promise(async (resolve, reject) => {
    const transaction = await db.sequelize.transaction();
    try {
      if (!AccountID || !ProductID || !ProductDetailID || Quantity === undefined) {
        await transaction.rollback();
        resolve({
          errCode: -1,
          errMessage: 'Thiếu tham số!',
          data: null,
        });
        return;
      }
      if (isNaN(Quantity) || Quantity < 0) {
        await transaction.rollback();
        resolve({
          errCode: 1,
          errMessage: 'Số lượng không hợp lệ!',
          data: null,
        });
        return;
      }
      const cartItem = await db.CartItem.findOne({
        where: {
          AccountID,
          ProductID,
          ProductDetailID,
        },
        raw: false,
        transaction,
      });

      if (!cartItem) {
        await transaction.rollback();
        resolve({
          errCode: 2,
          errMessage: 'Sản phẩm không tồn tại trong giỏ hàng!',
          data: null,
        });
        return;
      }
      const productDetail = await db.ProductDetail.findOne({
        where: { ProductID, ProductDetailID, DetailStatus: 'AVAIL' },
        attributes: ['Stock'],
        transaction,
      });

      if (!productDetail) {
        await transaction.rollback();
        resolve({
          errCode: 2,
          errMessage: 'Chi tiết sản phẩm không tồn tại hoặc hết hàng!',
          data: null,
        });
        return;
      }

      if (Quantity > productDetail.Stock) {
        await transaction.rollback();
        resolve({
          errCode: 1,
          errMessage: 'Số lượng yêu cầu vượt quá tồn kho!',
          data: null,
        });
        return;
      }

      if (Quantity === 0) {
        await db.CartItem.destroy({
          where: {
            AccountID,
            ProductID,
            ProductDetailID,
          },
          transaction,
        });
      } else {
        cartItem.ItemQuantity = Quantity;
        await cartItem.save({ transaction });
      }

      await transaction.commit();
      resolve({
        errCode: 0,
        errMessage: Quantity === 0 ? 'Xóa sản phẩm khỏi giỏ hàng thành công!' : 'Cập nhật số lượng thành công!',
        data: null,
      });
    } catch (e) {
      await transaction.rollback();
      console.log('Error in updateQuantity: ', e);
      resolve({
        errCode: 3,
        errMessage: 'Lỗi khi lấy thông tin: ' + e.message,
        data: null,
      });
    }
  });
};

let updateCartDetail = (AccountID, ProductID, ProductDetailID1, ProductDetailID2) => {
  return new Promise(async (resolve, reject) => {
    const transaction = await db.sequelize.transaction();
    try {
      if (!AccountID || !ProductID || !ProductDetailID1 || !ProductDetailID2) {
        await transaction.rollback();
        resolve({
          errCode: -1,
          errMessage: 'Thiếu tham số!',
          data: null,
        });
        return;
      }
      const cartItem = await db.CartItem.findOne({
        where: {
          AccountID,
          ProductID,
          ProductDetailID: ProductDetailID1,
        },
        raw: false,
        transaction,
      });

      if (!cartItem) {
        await transaction.rollback();
        resolve({
          errCode: 2,
          errMessage: 'Sản phẩm không tồn tại trong giỏ hàng!',
          data: null,
        });
        return;
      }
      const newDetail = await db.ProductDetail.findOne({
        where: { ProductID, ProductDetailID: ProductDetailID2, DetailStatus: 'AVAIL' },
        attributes: ['Stock', 'ExtraPrice', 'Promotion'],
        transaction,
      });

      if (!newDetail) {
        await transaction.rollback();
        resolve({
          errCode: 2,
          errMessage: 'Chi tiết sản phẩm mới không tồn tại hoặc hết hàng!',
          data: null,
        });
        return;
      }

      const product = await db.Product.findOne({
        where: { ProductID },
        attributes: ['ProductPrice'],
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

      const newItemQuantity = Math.min(cartItem.ItemQuantity, newDetail.Stock);
      if (cartItem.ItemQuantity > newDetail.Stock) {
        cartItem.ItemQuantity = newDetail.Stock;
      }

      const newItemPrice = (parseFloat(product.ProductPrice) + parseFloat(newDetail.ExtraPrice)) * (1 - parseFloat(newDetail.Promotion) / 100);
      cartItem.ProductDetailID = ProductDetailID2;
      cartItem.ItemPrice = newItemPrice;
      await cartItem.save({ transaction });

      await transaction.commit();
      resolve({
        errCode: 0,
        errMessage: 'Cập nhật chi tiết giỏ hàng thành công!',
        data: null,
      });
    } catch (e) {
      await transaction.rollback();
      console.log('Error in updateCartDetail: ', e);
      resolve({
        errCode: 3,
        errMessage: 'Lỗi khi lấy thông tin: ' + e.message,
        data: null,
      });
    }
  });
};

let mergeCartDetail = (AccountID, ProductID, ProductDetailID1, ProductDetailID2, Quantity) => {
  return new Promise(async (resolve, reject) => {
    const transaction = await db.sequelize.transaction();
    try {
      if (!AccountID || !ProductID || !ProductDetailID1 || !ProductDetailID2 || Quantity === undefined) {
        await transaction.rollback();
        resolve({
          errCode: -1,
          errMessage: 'Thiếu tham số!',
          data: null,
        });
        return;
      }
      if (isNaN(Quantity) || Quantity < 0) {
        await transaction.rollback();
        resolve({
          errCode: 1,
          errMessage: 'Số lượng không hợp lệ!',
          data: null,
        });
        return;
      }

      const detail1 = await db.CartItem.findOne({
        where: { AccountID, ProductID, ProductDetailID: ProductDetailID1 },
        attributes: ['CartItemID', 'ItemQuantity', 'ItemPrice'],
        raw: false,
        transaction,
      });

      const detail2 = await db.CartItem.findOne({
        where: { AccountID, ProductID, ProductDetailID: ProductDetailID2 },
        attributes: ['CartItemID', 'ItemQuantity', 'ItemPrice'],
        raw: false,
        transaction,
      });

      const productDetail = await db.ProductDetail.findOne({
        where: { ProductID, ProductDetailID: ProductDetailID2, DetailStatus: 'AVAIL' },
        attributes: ['ProductDetailID', 'Stock', 'ExtraPrice', 'Promotion'],
        transaction,
      });

      if (!productDetail) {
        await transaction.rollback();
        resolve({
          errCode: 2,
          errMessage: 'Chi tiết sản phẩm không tồn tại hoặc hết hàng!',
          data: null,
        });
        return;
      }

      const product = await db.Product.findOne({
        where: { ProductID },
        attributes: ['ProductPrice'],
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

      const newItemPrice = (parseFloat(product.ProductPrice) + parseFloat(productDetail.ExtraPrice)) * (1 - parseFloat(productDetail.Promotion) / 100);
      const TotalQuantity = Math.min(Quantity, productDetail.Stock);

      if (!detail1 && !detail2) {
        await transaction.rollback();
        resolve({
          errCode: 2,
          errMessage: 'Không tìm thấy sản phẩm trong giỏ hàng!',
          data: null,
        });
        return;
      }

      if (detail2) {
        detail2.ItemQuantity = TotalQuantity;
        detail2.ItemPrice = newItemPrice;
        await detail2.save({ transaction });
      } else {
        await db.CartItem.create(
          {
            AccountID,
            ProductID,
            ProductDetailID: ProductDetailID2,
            ItemPrice: newItemPrice,
            ItemQuantity: TotalQuantity,
          },
          { transaction }
        );
      }

      if (detail1) {
        await db.CartItem.destroy({
          where: { AccountID, ProductID, ProductDetailID: ProductDetailID1 },
          transaction,
        });
      }

      await transaction.commit();
      resolve({
        errCode: 0,
        errMessage: 'Gộp chi tiết sản phẩm thành công!',
        data: null,
      });
    } catch (e) {
      await transaction.rollback();
      console.log('Error in mergeCartDetail: ', e);
      resolve({
        errCode: 3,
        errMessage: `Lỗi khi gộp chi tiết sản phẩm: ${e.message}`,
        data: null,
      });
    }
  });
};

let removeFromCart = (AccountID, ProductID, ProductDetailID) => {
  return new Promise(async (resolve, reject) => {
    const transaction = await db.sequelize.transaction();
    try {
      if (!AccountID || !ProductID || !ProductDetailID) {
        await transaction.rollback();
        resolve({
          errCode: -1,
          errMessage: 'Thiếu tham số!',
          data: null,
        });
        return;
      }
      const cartItem = await db.CartItem.findOne({
        where: {
          AccountID,
          ProductID,
          ProductDetailID,
        },
        transaction,
      });
      if (!cartItem) {
        await transaction.rollback();
        resolve({
          errCode: 2,
          errMessage: 'Sản phẩm không tồn tại trong giỏ hàng!',
          data: null,
        });
        return;
      }

      await db.CartItem.destroy({
        where: {
          AccountID,
          ProductID,
          ProductDetailID,
        },
        transaction,
      });

      await transaction.commit();
      resolve({
        errCode: 0,
        errMessage: 'Xóa sản phẩm khỏi giỏ hàng thành công!',
        data: null,
      });
    } catch (e) {
      await transaction.rollback();
      console.log('Error in removeFromCart: ', e);
      resolve({
        errCode: 3,
        errMessage: 'Lỗi khi lấy thông tin: ' + e.message,
        data: null,
      });
    }
  });
};

module.exports = {
  getCart,
  getCartDetail,
  getDetailList,
  addToCart,
  updateQuantity,
  updateCartDetail,
  mergeCartDetail,
  removeFromCart,
};
