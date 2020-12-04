/*
    N

    more generic way to do it is probably render to a 1x1 pixel offscreen canvas that you read from
    unperformant but probably the same as this
*/
async function initTextureSampler() {

    document.addEventListener('paste', (event) => {
        if (!event.clipboardData || !event.clipboardData.items)
            return
        let items = event.clipboardData.items
        for (let i = 0; i < items.length; i++) {
            if (items[i].type.indexOf("image") === -1)
                continue
            event.preventDefault();

            log("yes, you can paste an image")

            const pastedImage = new Image();
            const url = window.URL || window.webkitURL;
            pastedImage.src = url.createObjectURL(items[i].getAsFile());

            pastedImage.onload = () => {
                const canvas = document.createElement('canvas')
                canvas.width = pastedImage.width;
                canvas.height = pastedImage.height;
                const ctx = canvas.getContext('2d')
                ctx.drawImage(pastedImage, 0, 0)

                //and then something else
            }

            return;
        }

        console.error("if you think you have an image in there it may be the wrong kind")
    }, false);

    let rgbRotator = new Float32Array(16)
    rgbRotator[0] = 0.8880738339771151
    rgbRotator[8] = 0.
    rgbRotator[9] = 0.32505758367186816
    rgbRotator[10] = -0.32505758367186816
    function rgbCubeToUnitBall(r, g, b, target) {
        zeroMv(target)
        pointX(target, r * 2. - 1.)
        pointY(target, g * 2. - 1.)
        pointZ(target, b * 2. - 1.)
        let largestCoordAbsoluteValue = Math.max(Math.abs(pointX(target)), Math.abs(pointY(target)), Math.abs(pointZ(target)))
        let ratioGettingCubeSurfaceToSphereSurface = largestCoordAbsoluteValue / pointIdealNorm(target)
        multiplyScalar(target, ratioGettingCubeSurfaceToSphereSurface)

        sandwichBab(target, rgbRotator, target) //y is now white
        pointW(target, 1.) //if largestCoordAbsoluteValue !== 1., yes it's an ideal point, but we're visualizing it in a ball

        return target
    }

    const $earthImage = new Image();
    await (new Promise(resolve => {
        $earthImage.src = "data/earthColor.png"
        $earthImage.onload = resolve
    }))
    let earthImageWidth = $earthImage.width;
    let earthImageHeight = $earthImage.height;

    let $earthCanvas = document.createElement('canvas');
    $earthCanvas.width = earthImageWidth;
    $earthCanvas.height = earthImageHeight;
    let ctx = $earthCanvas.getContext('2d')
    ctx.drawImage($earthImage, 0, 0, earthImageWidth, earthImageHeight)
    let earthPixels = ctx.getImageData(0, 0, earthImageWidth, earthImageHeight).data
    
    let samplerMv = new Float32Array(16)
    earth = function(u,v, targetMv) {
        if (u < 0. || 1. < u ||
            v < 0. || 1. < v )
        {
            zeroMv(targetMv)
            pointW(targetMv,1.)
        }
        else {
            let column = Math.floor(u * earthImageWidth)
            let row = Math.floor(v * earthImageHeight)
            let index = row * earthImageWidth + column

            let r = earthPixels[index * 4 + 0] / 255.
            let g = earthPixels[index * 4 + 1] / 255.
            let b = earthPixels[index * 4 + 2] / 255.

            rgbCubeToUnitBall(r, g, b, targetMv)
        }
        //aaaaand that point gets discness = 1 and color by default

        return targetMv
    }
}