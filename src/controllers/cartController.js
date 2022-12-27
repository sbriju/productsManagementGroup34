const cartModel = require('../models/cartModel.js');
const userModel = require('../models/userModel.js');
const { isValidBody, isValidObjectId } = require('../util/validator.js');
const productModel = require('../models/productModel.js');

//createCart
const createCart = async (req, res) => {
    try {
        const userId = req.params.userId;
        const reqBody = req.body;
        const { productId, cartId } = reqBody;

        if (!isValidBody(reqBody)) return res.status(400).send({ status: false, message: 'Please provide cart details.' });
        if (!userId) return res.status(400).send({ status: false, message: 'userId is required.' });
        if (!productId) return res.status(400).send({ status: false, message: 'Product Id is required' });

        if (!isValidObjectId(userId)) return res.status(400).send({ status: false, message: `'${userId}' this userId invalid.` });
        if (!isValidObjectId(productId)) return res.status(400).send({ status: false, message: `'${productId}' this productId invalid.` });

        const userExist = await userModel.findOne({ _id: userId });
        if (!userExist) return res.status(404).send({ status: false, message: `No user found by '${userId}' this userId.` });

        const existProduct = await productModel.findOne({ _id: productId });
        if (!existProduct) return res.status(404).send({ status: false, message: `No user found by '${productId}' this productId.` });
        if (existProduct.isDeleted === true) return res.status(400).send({ status: false, message: `'${existProduct.title}' this product already deleted.` });

        if (cartId) {
            if (!isValidObjectId(cartId)) return res.status(400).send({ status: false, message: `'${cartId}' this cartId invalid.` });
            var existCart = await cartModel.findOne({ _id: cartId })
            if (!existCart) return res.status(404).send({ status: false, message: `No cart found by '${cartId}' this cartId.` });
        }

        const checkCartForUser = await cartModel.findOne({ userId })
        if (checkCartForUser && !cartId) return res.status(400).send({ status: false, message: 'Cart for this user is present,please provide cart Id' });

        if (existCart) {
            if (existCart.userId.toString() !== userId) return res.status(400).send({ status: false, message: 'Cart does not belong to the user logged in user.' });

            let productArray = existCart.items;
            let totPrice = (existCart.totalPrice + existProduct.price);
            let pId = existProduct._id.toString();
            for (let i = 0; i < productArray.length; i++) {
                let produtInCart = productArray[i].productId.toString();

                if (pId === produtInCart) {
                    let newQuantity = productArray[i].quantity + 1;
                    productArray[i].quantity = newQuantity;
                    existCart.totalPrice = totPrice;
                    await existCart.save();
                    let response = await cartModel.findOne({ userId: userId }).populate('items.productId', { __v: 0, _id: 0, isDeleted: 0, createdAt: 0, deletedAt: 0, currencyId: 0, currencyFormat: 0, updatedAt: 0, availableSizes: 0 });
                    return res.status(200).send({ status: true, message: 'Success', data: response });
                }

            }
            existCart.items.push({ productId: productId, quantity: 1 });
            existCart.totalPrice = existCart.totalPrice + existProduct.price;
            existCart.totalItems = existCart.items.length;
            await existCart.save();
            let response = await cartModel.findOne({ userId: userId }).populate('items.productId', { __v: 0, _id: 0, isDeleted: 0, createdAt: 0, deletedAt: 0, currencyId: 0, currencyFormat: 0, updatedAt: 0, availableSizes: 0 });
            return res.status(200).send({ status: true, message: 'Success', data: response });
        }
        let obj = {
            userId: userId,
            items: [{ productId: productId, quantity: 1 }],
            totalPrice: existProduct.price
        }
        obj['totalItems'] = obj.items.length;

        let result = await cartModel.create(obj);
        return res.status(201).send({ status: true, message: 'Cart created successfully', data: result });
    } catch (err) {
        console.log(err);
        return res.status(500).json({ status: false, error: err.message });
    }
};

//updateCart
const updateCart = async (req, res) => {
    try {
        const userId = req.params.userId;
        const reqBody = req.body;
        const { productId, cartId, removeProduct } = reqBody;

        if (!isValidBody(reqBody)) return res.status(400).send({ status: false, message: 'Please provide details to update the documents' });

        if (!isValidObjectId(userId)) return res.status(400).send({ status: false, message: 'user id is not valid' });
        if (!isValidObjectId(cartId)) return res.status(400).send({ status: false, message: 'Please enter cart id' });
        if (!isValidObjectId(cartId)) return res.status(400).send({ status: false, message: 'cart id is not valid' });
        if (!isValidObjectId(productId)) return res.status(400).send({ status: false, message: 'Please enter product id' });
        if (!isValidObjectId(productId)) return res.status(400).send({ status: false, message: 'product id is not valid' });

        const validUser = await userModel.findById(userId);
        if (!validUser) return res.status(404).send({ status: false, message: 'User not present' });

        const findCart = await cartModel.findOne({ _id: cartId, userId: userId });
        if (!findCart) return res.status(404).send({ status: false, message: 'Cart not present' });

        const findProduct = await productModel.findById(productId);
        if (!findProduct) return res.status(404).send({ status: false, message: 'Product not present' });
        if (findProduct.isDeleted === true) return res.status(404).send({ status: false, message: ` '${findProduct.title}'  is already deleted.` });

        let items = findCart.items;
        let productArr = items.filter(x => x.productId.toString() == productId);
        if (productArr.length === 0) return res.status(404).send({ status: false, message: 'Product is not present in cart' });
        console.log(removeProduct);
        console.log(typeof removeProduct);
        let index = items.indexOf(productArr[0]);
        if (removeProduct === '') return res.status(400).send({ status: false, message: 'plz enter removeProduct' });

        if (removeProduct != 1 && removeProduct != 0) return res.status(400).send({ status: false, message: 'Value of Removed Product Must be 0 or 1.' });

        if (removeProduct == 0) {
            findCart.totalPrice = (findCart.totalPrice - (findProduct.price * findCart.items[index].quantity)).toFixed(2);
            findCart.items.splice(index, 1);
            findCart.totalItems = findCart.items.length;
            findCart.save();
        }

        if (removeProduct == 1) {
            findCart.items[index].quantity -= 1;
            findCart.totalPrice = (findCart.totalPrice - findProduct.price).toFixed(2);
            if (findCart.items[index].quantity == 0) {
                findCart.items.splice(index, 1);
            }
            findCart.totalItems = findCart.items.length;
            findCart.save();
        }
        return res.status(200).send({ status: true, message: 'Success', data: findCart });
    } catch (err) {
        console.log(err);
        return res.status(500).json({ status: false, error: err.message });
    }
};

//getCart
const getCart = async (req, res) => {
    try {
        const userId = req.params.userId;
        if (!userId) return res.status(400).send({ status: false, message: 'userId is required on the param.' });
        if (!isValidObjectId(userId)) return res.status(400).send({ status: false, message: `'${userId}' this userId invalid.` });

        const existUser = await userModel.findById(userId);
        if (!existUser) return res.status(404).send({ status: false, message: `No user found by '${userId}' this userId.` });

        const foundCart = await cartModel.findOne({ userId }).populate('items.productId', { title: 1, productImage: 1, price: 1 });
        if (!foundCart) return res.status(400).send({ status: false, message: `Cart not found by '${userId}' this userId.` });

        return res.status(200).send({ status: true, message: 'Success', data: foundCart });
    }
    catch (err) {
        console.log(err);
        return res.status(500).json({ status: false, error: err.message });
    }
};

//deleteCart
const deleteCart = async (req, res) => {
    try {
        const userId = req.params.userId;
        if (!userId) return res.status(400).send({ status: false, message: 'userId is required on the param.' });
        if (!isValidObjectId(userId)) return res.status(400).send({ status: false, message: `'${userId}' this userId invalid.` });

        const foundCart = await cartModel.findOne({userId});
        if (!foundCart) return res.status(404).send({ status: false, message: `No cart found by '${userId}' this cartId.` });

        if (foundCart.totalItems === 0) return res.status(404).send({ status: false, message: `Cart is empty.` });

        const deleteCart = await cartModel.findOneAndUpdate({ userId }, { items: [], totalPrice: 0, totalItems: 0 }, { new: true });
        return res.status(204).send({ status: true, message: `successfully deleted.`, data: deleteCart });
    }
    catch (err) {
        console.log(err);
        return res.status(500).json({ status: false, error: err.message });
    }
};

module.exports = { createCart, updateCart, getCart, deleteCart };
