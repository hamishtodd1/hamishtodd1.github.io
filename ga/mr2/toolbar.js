/**
 * Want:
 *      Export to
 *          WebGL
 *          OpenGL
 *          shadertoy / glsl
 *          Latex
 */

async function loadBackgroundStringAndInitSave() {
    let xhr = new XMLHttpRequest();
    xhr.open("GET", "../../../Users/hamis/Downloads/glc.txt");
    xhr.send();
    await (new Promise(resolve => {
        xhr.onerror = function() {
            backgroundString = "//couldn't load saved code"
            resolve()
        }
        xhr.onload = function () {
            // backgroundString = xhr.responseText
            let fullJson = JSON.parse(xhr.responseText)

            backgroundString = fullJson.backgroundString

            fullJson.freeMvNames.forEach((name, i) => {
                assignMv(name)
                for (let j = 0; j < 16; ++j)
                    getNameDrawerProperties(name).value[j] = fullJson.freeMvValues[i][j]
            })

            resolve()
        }
    }))

    function saveFunction() {
        log("yo")
        let fullJson = {
            backgroundString,
            freeMvNames: getMvNames(),
            freeMvValues: []
        }
        fullJson.freeMvNames.forEach((name) => {
            fullJson.freeMvValues.push(getNameDrawerProperties(name).value)
        })

        presentJsonFile(JSON.stringify(fullJson), "glc")
    }
    bindButton("s", () => { saveFunction()}, undefined, ()=>{}, true)
    // let saveButton = new ClickableTextBox("save", saveFunction)
    // updateFunctions.push(()=>{
    //     saveButton.position.y = mainCamera.topAtZZero - .5
    //     saveButton.position.x = -mainCamera.rightAtZZero + saveButton.width / 2.
    // })
}