async function loadBackgroundStringAndInitSave() {
    let xhr = new XMLHttpRequest();
    xhr.open("GET", "../../../Users/hamis/Downloads/glc.txt");
    xhr.send();
    await (new Promise(resolve => {
        xhr.onload = function () {
            backgroundString = xhr.responseText
            resolve()
        }
    }))

    let saveButton = new ClickableTextBox("save", () => {
        presentJsonFile(backgroundString, "glc")
    })
    saveButton.position.y = mainCamera.topAtZZero - .5
    saveButton.position.x = -mainCamera.rightAtZZero + saveButton.width / 2.
}