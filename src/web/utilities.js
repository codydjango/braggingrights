function getOrdinal(nonce) {
    let i = parseInt(nonce)
    let j = i % 10
    let k = i % 100

    if (j == 1 && k != 11) {
        return "st"
    }

    if (j == 2 && k != 12) {
        return "nd"
    }

    if (j == 3 && k != 13) {
        return "rd"
    }

    return "th"
}

export {
    getOrdinal
}
