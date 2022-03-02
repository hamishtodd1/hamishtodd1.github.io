//could have everything be mesh-y, made of lines
//or, planes with thickness but it comes apart

function initCga() {

    let wholeThing = new THREE.Object3D()
    thingsToRotate.push(wholeThing)
    scene.add(wholeThing)
    wholeThing.position.y -= 1.
    wholeThing.scale.setScalar(.5)

    //elevation of the disk is 1, if you don't want that you scale whole thing down

    //------------CONE
    let coneTopRadius = 2.5
    let coneDiagonalLength = coneTopRadius * Math.SQRT2
    let coneRadialSegments = 64
    {
        let coneGeo = new THREE.ConeGeometry(coneTopRadius, coneTopRadius, coneRadialSegments, 1,true)
        coneGeo.rotateX(Math.PI)
        coneGeo.translate(0., coneTopRadius / 2., 0.)
        let ourCone = new THREE.Mesh(coneGeo, niceMat(0.))
        wholeThing.add(ourCone)
    }

    // let diskGeo = new THREE.CircleGeometry()

    //gee if only there were some system for applying transformations to planes
    // let clippingPlane = new THREE.Plane(new THREE.Vector3(), 1.)
    // bindButton("ArrowUp",()=>{},"",()=>{
    //     clippingPlane.constant += .04
    // })
    // bindButton("ArrowDown", () => { }, "", () => {
    //     clippingPlane.constant -= .04
    //     log(clippingPlane.constant)
    // })
    // updateFunctions.push(()=>{
    //     clippingPlane.normal.set(0.,-1.,0.)
    //     clippingPlane.normal.applyEuler

    //     wholeThing.localToWorld(clippingPlane.normal)
    //     clippingPlane.normal.sub(wholeThing.position)
    //     clippingPlane.normal.setLength(.46)
    // })

    
    {
        renderer.localClippingEnabled = true
        let rectMat = niceMat(.6, { 
            // clippingPlanes: [clippingPlane]
        })
        let rectHeight = 1.
        let rectWidth = coneDiagonalLength
        let rectGeo = new THREE.PlaneGeometry(rectWidth, rectHeight)
        rectGeo.translate(rectWidth * .5, rectHeight * .5, 0.)

        function extraRect() {
            let rect = new THREE.Mesh(rectGeo, rectMat)
            wholeThing.add(rect)

            rect.rotation.z = TAU / 8.
            rect.rotation.order = "ZYX"

            return rect
        }

        let numRects = 13
        for(let i = 0; i < numRects; ++i) {
            let newRect = extraRect()
            newRect.rotation.x = -TAU / 4.

            //we're cutting off the first and the last
            let angleSpacing = TAU / 2. / (numRects+1)
            let t = i/(numRects-1)

            newRect.rotation.x += angleSpacing * (1+i)

            newRect.scale.y = coneDiagonalLength / Math.cos(newRect.rotation.x)
        }
        //might be better if they were meeting the line in evenly-spaced places

        updateFunctions.push(()=>{
            // rect.rotation.x = TAU / 4. * Math.sin(.02*frameCount)
        })

        //altering rotation.y will change it
    }

    //-------------CURVES
    if(0)
    {
        class CustomCurve extends THREE.Curve {
            constructor(scale = 1) {
                super()
                this.scale = scale
            }
            getPoint(t, optionalTarget = new THREE.Vector3()) {
                const tx = t * 6. - 3.
                const ty = tx * tx
                const tz = 0
                return optionalTarget.set(tx, ty, tz).multiplyScalar(this.scale)
            }
        }

        let tubeMat = niceMat(.4)
        const path = new CustomCurve()
        const tubeGeo = new THREE.TubeGeometry(path, 127, .02, 7, false)
        const tubeMesh = new THREE.Mesh(tubeGeo, tubeMat)
        wholeThing.add(tubeMesh)
    }
}