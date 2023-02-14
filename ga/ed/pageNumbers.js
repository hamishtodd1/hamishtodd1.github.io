function addToPageNumber(amt){
    let currentLocation = window.location.href
    let gCharacterNumber = currentLocation.indexOf(`G.html`)
    let currentNumber = currentLocation.slice(gCharacterNumber - 2, gCharacterNumber)
    let newNumber = parseInt(currentNumber) + amt
    let max = 2
    if (newNumber <= 0 || max < newNumber)
        return

    let newNumberString = newNumber >= 10 ? newNumber.toString() : `0` + newNumber.toString()
    window.location.href = 
        currentLocation.slice(0, gCharacterNumber - 2) +
        newNumberString +
        currentLocation.slice(gCharacterNumber)
}
document.addEventListener('keydown', (event) => {
    if (event.key === "PageDown" )
        addToPageNumber(1)
    if (event.key === "PageUp")
        addToPageNumber(-1)
})