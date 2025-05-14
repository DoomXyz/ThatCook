import actionTypes from './actionTypes';
// Thêm sản phẩm vào giỏ hàng
export const addToCart = (productInfo, ItemQuantity = 1) => ({
  type: actionTypes.ADD_TO_CART,
  data: [
    {
      ProductID: productInfo[0].ProductID,
      ProductDetailID: productInfo[0].ProductDetailID,
      ItemPrice: productInfo[0].ItemPrice,
      ItemQuantity: ItemQuantity,
    },
  ],
});

// Xóa một sản phẩm khỏi giỏ hàng
export const removeFromCart = (ProductID, ProductDetailID) => ({
  type: actionTypes.REMOVE_FROM_CART,
  data: { ProductID, ProductDetailID },
});

// Cập nhật số lượng sản phẩm trong giỏ hàng
export const updateItemQuantity = (ProductID, ProductDetailID, ItemQuantity) => ({
  type: actionTypes.UPDATE_QUANTITY,
  data: { ProductID, ProductDetailID, ItemQuantity },
});

// Cập nhật chi tiết sản phẩm trong giỏ hàng
export const updateCartDetail = (ProductID, ProductDetailID1, ProductDetailID2, newItemPrice, newItemQuantity) => ({
  type: actionTypes.UPDATE_DETAIL,
  data: { ProductID, ProductDetailID1, ProductDetailID2, newItemPrice, newItemQuantity },
});

export const mergeCartDetail = (ProductID, ProductDetailID1, ProductDetailID2, newItemQuantity) => ({
  type: actionTypes.MERGE_DETAIL,
  data: { ProductID, ProductDetailID1, ProductDetailID2, newItemQuantity },
});

// Xóa hết giỏ hàng
export const clearCart = () => ({
  type: actionTypes.CLEAR_CART,
});

// Lưu giỏ hàng để thanh toán
export const saveCartForCheckOut = (checkOutCart, AccountID = null, expiresAt, isBuyNow = false) => ({
  type: actionTypes.SAVE_CART_FOR_CHECKOUT,
  data: { checkOutCart, AccountID, expiresAt, isBuyNow },
});

// Dọn giỏ hàng sau thanh toán
export const clearCheckOutCart = () => ({
  type: actionTypes.CLEAR_CHECKOUT_CART,
});
