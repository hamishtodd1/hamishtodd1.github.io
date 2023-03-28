function addToPageNumber(amt){
    let currentLocation = window.location.href
    let characterNumber = currentLocation.indexOf(`.html`)
    let currentNumber = currentLocation.slice(characterNumber - 2, characterNumber)
    let newNumber = parseInt(currentNumber) + amt
    
    if (newNumber > 0 ) {
        let newNumberString = newNumber >= 10 ? newNumber.toString() : `0` + newNumber.toString()
        window.location.href = 
            currentLocation.slice(0, characterNumber - 2) +
            newNumberString +
            currentLocation.slice(characterNumber)
    }
}
document.addEventListener('keydown', (event) => {
    if (event.key === "PageDown" )
        addToPageNumber(1)
    if (event.key === "PageUp")
        addToPageNumber(-1)
})