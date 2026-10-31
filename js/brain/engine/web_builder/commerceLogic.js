// ==========================================
// CHAOS SYSTEM: Commerce Logic
// مسؤول عن منطق المتاجر الإلكترونية وعربة التسوق
// ==========================================

const CommerceLogic = {
    module: "E-Commerce Core",
    status: "ACTIVE",

    cart: [],

    addProductToCart: function(productName, price) {
        this.cart.push({ name: productName, price: price, addedAt: Date.now() });
        return {
            status: "SUCCESS",
            totalItems: this.cart.length,
            message: `تم إضافة المنتج (${productName}) إلى السلة بنجاح.`
        };
    }
};

if (typeof module !== 'undefined') {
    module.exports = CommerceLogic;
}
