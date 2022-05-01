function getRandomPhrase(phrases) {
    if (typeof (phrases) != "object") return phrases
    let maximum = Object.keys(phrases).length
    let minimum = 1
    return new Promise((resolve, reject) => {
        const random = Math.floor(Math.random() * (maximum - minimum + 1)) + minimum;
        resolve(phrases[random])
    })
}

//export the function getRandomPhrase
module.exports = getRandomPhrase;