import actionTypes from "../actions/actionTypes";

const initialState = {
    cartItems: [],
    checkOutCarts: [],
};

const cartReducer = (state = initialState, action) => {
    switch (action.type) {
        // Thêm sản phẩm vào giỏ hàng
        case actionTypes.ADD_TO_CART: {
            const newItems = action.data; // action.data là mảng
            let updatedCart = [...state.cartItems];
            newItems.forEach((newItem) => {
                const existingItemIndex = updatedCart.findIndex(
                    (item) => item.ProductID === newItem.ProductID && item.ProductDetailID === newItem.ProductDetailID
                );
                if (existingItemIndex !== -1) {
                    // Nếu sản phẩm đã tồn tại (trùng cả ProductID và ProductDetailID), cộng dồn số lượng
                    updatedCart[existingItemIndex] = {
                        ...updatedCart[existingItemIndex],
                        ItemQuantity: updatedCart[existingItemIndex].ItemQuantity + newItem.ItemQuantity,
                    };
                } else {
                    // Nếu chưa tồn tại, thêm mới vào giỏ
                    updatedCart.push(newItem);
                }
            });
            return {
                ...state,
                cartItems: updatedCart,
            };
        }
        // Xóa một sản phẩm khỏi giỏ hàng
        case actionTypes.REMOVE_FROM_CART:
            return {
                ...state,
                cartItems: state.cartItems.filter(
                    (item) => item.ProductID !== action.data.ProductID || item.ProductDetailID !== action.data.ProductDetailID
                ),
                //trả ra mảng mà ko còn phần tử data
            };
        // Cập nhật số lượng sản phẩm trong giỏ hàng
        case actionTypes.UPDATE_QUANTITY:
            return {
                ...state,
                cartItems: state.cartItems.map((item) =>
                    item.ProductID === action.data.ProductID && item.ProductDetailID === action.data.ProductDetailID
                        ? { ...item, ItemQuantity: action.data.ItemQuantity }
                        : item
                ),
            };
        //Cập nhật chi tiết sản phẩm trong giỏ hàng
        case actionTypes.UPDATE_DETAIL:
            return {
                ...state,
                cartItems: state.cartItems.map((item) =>
                    item.ProductID === action.data.ProductID && item.ProductDetailID === action.data.ProductDetailID1
                        ? { ...item, ProductDetailID: action.data.ProductDetailID2, ItemPrice: action.data.newItemPrice, ItemQuantity: action.data.newItemQuantity }
                        : item
                ),
            }
        //Gộp chi tiết sản phẩm (xóa masanpham có chitietsanpham 1 và cập nhật số lượng của masanpham có chitietsanpham 2 bằng soluong 1 + soluong 2)
        case actionTypes.MERGE_DETAIL: {
            let newCartItems = state.cartItems.filter((item) => item.ProductDetailID !== action.data.ProductDetailID1);
            const existingItemIndex = newCartItems.findIndex(
                (item) => item.ProductID === action.data.ProductID && item.ProductDetailID === action.data.ProductDetailID2
            );
            if (existingItemIndex !== -1) {
                // Cập nhật số lượng nếu mục với ProductDetailID2 tồn tại
                newCartItems[existingItemIndex] = {
                    ...newCartItems[existingItemIndex],
                    ItemQuantity: action.data.newItemQuantity,
                };
            } else {
                // Thêm mục mới với ProductDetailID2 nếu không tồn tại
                newCartItems.push({
                    ProductID: action.data.ProductID,
                    ProductDetailID: action.data.ProductDetailID2,
                    ItemQuantity: action.data.newItemQuantity,
                    ItemPrice: state.cartItems.find(
                        (item) => item.ProductID === action.data.ProductID && item.ProductDetailID === action.data.ProductDetailID1
                    )?.ItemPrice || 0,
                });
            }
            return {
                ...state,
                cartItems: newCartItems,
            };
        }
        // Xóa hết giỏ hàng
        case actionTypes.CLEAR_CART:
            return {
                ...state,
                cartItems: [],
            };
        // Lưu giỏ hàng để thanh toán
        case actionTypes.SAVE_CART_FOR_CHECKOUT:
            const expiresAt = action.data.expiresAt || new Date().getTime() + 60 * 60 * 1000; // Sử dụng expiresAt được truyền hoặc mặc định 1 giờ
            return {
                ...state,
                checkOutCarts: [
                    {
                        cartItems: action.data.checkOutCart,
                        AccountID: action.data.AccountID,
                        expiresAt,
                        isBuyNow: action.data.isBuyNow,
                    },
                ],
            };
        // Dọn giỏ hàng sau thanh toán
        case actionTypes.CLEAR_CHECKOUT_CART:
            return {
                ...state,
                checkOutCarts: [],
            };
        default:
            return state;
    }
};

export default cartReducer;