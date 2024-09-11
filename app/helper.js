function formatNumberWithPrefix(number, prefix) {
    const totalLength = 7;
    let numberString = number.toString();
    const numberOfLeadingZeros = totalLength - numberString.length;
    const zeroPadding = '0'.repeat(numberOfLeadingZeros);
    const formattedNumber = prefix + zeroPadding + numberString;
    return formattedNumber;
}

function isPositiveNumber(number){
    if(number >0){
        return true
    }
    return false
}

module.exports = {
    formatNumberWithPrefix,
    isPositiveNumber
}