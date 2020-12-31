/**
 * Want:
 *      Export to
 *          WebGL
 *          OpenGL
 *          shadertoy / glsl
 *          Latex
 */

async function loadBackgroundStringAndInitSave() {
    function saveFunction() {
        let fullJson = {
            backgroundString,
            freeMvNames: getMvNames(),
            freeMvValues: [],
            mainCameraTopAtZZero: mainCamera.topAtZZero
        }
        fullJson.freeMvNames.forEach((name) => {
            fullJson.freeMvValues.push(getNameDrawerProperties(name).value)
        })

        presentJsonFile(JSON.stringify(fullJson), "glc")
    }
    bindButton("s", () => { saveFunction()}, undefined, ()=>{}, true)
    // let saveButton = new ClickableTextbox("save", saveFunction)
    // updateFunctions.push(()=>{
    //     saveButton.position.y = mainCamera.topAtZZero - .5
    //     saveButton.position.x = -mainCamera.rightAtZZero + saveButton.width / 2.
    // })

    let loadedJson = null

    let xhr = new XMLHttpRequest();
    xhr.open("GET", "../../../Users/hamis/Downloads/glc.txt");
    xhr.send();
    await (new Promise(resolve => {
        xhr.onerror = function() {
            loadedJson = {
                backgroundString: "//couldn't load saved code",
                freeMvValues: [],
                freeNvBanes: [],
                mainCameraTopAtZZero: 11.8
            }
            resolve()
        }
        xhr.onload = function () {
            loadedJson = JSON.parse(xhr.responseText)
            resolve()
        }
    }))

    backgroundString = loadedJson.backgroundString
    mainCamera.topAtZZero = loadedJson.mainCameraTopAtZZero

    return loadedJson
}