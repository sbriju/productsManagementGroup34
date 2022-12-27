const mongoose = require('mongoose')

//isValidBody
const isValidBody = (data) => {
    if (Object.keys(data).length > 0)
        return true
    return false
};

//name
const isValidName = (name) => {
    if ((typeof name == 'string' && name.trim().length != 0 && name.match(/^[A-Z a-z]{2,}$/)))
        return true
    return false
};

//isValidEmail
const isValidEmail = (email) => {
    const regex = /^([a-zA-Z0-9_.]+@[a-z]+\.[a-z]{2,3})?$/.test(email)
    return regex
};

//isValidFile
const isValidFile = (img) => {
    const regex = /(\/*\.(?:png|gif|webp|jpeg|jpg))/.test(img)
    return regex
}
//isValidPwd
const isValidPass = (pass) => {
    const regex = /^(?=.*?[A-Z])(?=.*?[a-z])(?=.*?[0-9])(?=.*?[#?!@$%^&*-]).{8,15}$/.test(pass)
    return regex
};

//isValidNumber
const isValidNumber = (ph) => {
    let regex = /^(\+91[\-\s]?)?[0]?(91)?[6789]\d{9}$/.test(ph)
    return regex
};

//isValidAddress
const isValidAddress = (txt) => {
    const regex = /^(?=.*[A-Za-z,.-?%!&]+)[A-Za-z,.-?%!&\s0-9]{2,}$/.test(txt)
    return regex
}

//isValidNumber
const isValidPin = (pin) => {
    let regex = /^[1-9]{1}[0-9]{5}$/.test(pin)
    return regex
};

//objectId
const isValidObjectId = (objId) => {
    return mongoose.Types.ObjectId.isValid(objId)
};

//plainText
const isValidPlainText = (plainText) => {
    if ((typeof plainText == "string" && plainText.trim().length != 0 && plainText.match(/^[A-Z a-z 0-9,.-]{2,}$/)))
        return true
    return false
};

//isValidDescription
const isValidDescription = (des) => {
    if ((typeof des == "string" && des.trim().length != 0 && des.match(/^[A-Z a-z 0-9,.-?%!&]{2,}$/)))
        return true
    return false
};

//price
const isValidPrice = (value) => {
    if (!value) return false
    return /^[1-9]\d{0,7}(?:\.\d{1,4})?$/.test(value)
};

//boolean
const isBoolean = (value) => {
    if (value == "true" || value == "false") { return true }
    return false
};

//isValidIncludes
const isValidIncludes = (value, requestBody) => {
    return Object.keys(requestBody).includes(value)
};

//isValid
const isValid = (value) => {
    if (!value) return false
    if (typeof value === "undefined" || typeof value === "null" || typeof value === "number") return false
    if (typeof value === "string" && value.trim().length === 0) return false
    return true
};

//isValidString
const isValidString = (value) => {
    if (typeof value === "undefined" || typeof value === "null" || typeof value === "number") return false
    if (typeof value === "string" && value.trim().length === 0) return false
    return true
};


module.exports = { isValidBody, isValidName, isValidEmail, isValidFile, isValidPass, isValidNumber, isValidPlainText, isValidDescription, isValidAddress, isValidPin, isValidObjectId, isValid, isValidPrice, isBoolean, isValidString, isValidIncludes };
