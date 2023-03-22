const isValidMail = (/^([0-9a-z]([-_\\.]*[0-9a-z]+)*)@([a-z]([-_\\.]*[a-z]+)*)[\\.]([a-z]{2,9})+$/);

const isValidName = (/^[a-zA-Z ]*$/)

const isValidPassword = (/^.*(?=.{6,})(?=.*[a-zA-Z])(?=.*\d)(?=.*[!&$%&? "]).*$/)

const isValid = (value) => {
    if (typeof value === "undefined" || value === null) return false
    if (typeof value === "string" && value.trim().length === 0) return false
    return true
}

const isValidRequestBody = (value) => {
    return Object.keys(value).length > 0
}


//exported all functions & variables at once using destructuring
module.exports = { isValidMail, isValid, isValidName, isValidRequestBody, isValidPassword }