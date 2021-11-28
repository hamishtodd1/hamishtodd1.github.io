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
            freeMvValues: [],
            mainCameraTopAtZZero: mainCamera.topAtZZero
        }
        let potentiallyUnusedMvNames = getMvNames()
        fullJson.freeMvNames = []
        potentiallyUnusedMvNames.forEach((name) => {
            let usedSomewhereInFile = false
            forEachToken( (tokenIndex, tokenStart, tokenEnd, token, lexeme) => {
                if(lexeme === name) {
                    usedSomewhereInFile = true
                    return true
                }
                else
                    return false
            })
            if (usedSomewhereInFile) {
                fullJson.freeMvNames.push(name)
                fullJson.freeMvValues.push(getNameDrawerProperties(name).value)
            }
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
    xhr.open("GET", "C:/Users/Hamish.todd/Downloads/glc.txt");
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