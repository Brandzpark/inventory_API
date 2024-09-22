function formatNumberWithPrefix(number, prefix) {
    const totalLength = 7;
    let numberString = number.toString();
    const numberOfLeadingZeros = totalLength - numberString.length;
    const zeroPadding = '0'.repeat(numberOfLeadingZeros);
    const formattedNumber = prefix + zeroPadding + numberString;
    return formattedNumber;
}

function isPositiveNumber(number) {
    if (number > 0) {
        return true
    }
    return false
}

function formatMoney(
    amount,
    decimalCount = 2,
    decimal = ".",
    thousands = ","
) {
    try {
        decimalCount = Math.abs(decimalCount);
        decimalCount = isNaN(decimalCount) ? 2 : decimalCount;

        const numericAmount = Math.abs(Number(amount) || 0).toFixed(decimalCount);
        const negativeSign = Number(amount) < 0 ? "-" : "";

        let i = parseInt(numericAmount).toString();
        let j = i.length > 3 ? i.length % 3 : 0;

        return (
            negativeSign +
            (j ? i.substr(0, j) + thousands : "") +
            i.substr(j).replace(/(\d{3})(?=\d)/g, `$1${thousands}`) +
            (decimalCount
                ? decimal +
                Math.abs(Number(numericAmount) - parseInt(i))
                    .toFixed(decimalCount)
                    .slice(2)
                : "")
        );
    } catch (e) {
        console.error(e);
        return ""; // Return an empty string in case of an error
    }
}

module.exports = {
    formatNumberWithPrefix,
    isPositiveNumber,
    formatMoney
}