async function initDws() {

    // let skyBgGeo = new THREE.SphereGeometry(50.)
    // let skyBgMat = new THREE.MeshBasicMaterial({color:0x88CEEC, side:THREE.BackSide })
    // const skyBg = new THREE.Mesh(skyBgGeo, skyBgMat)

    {
        const fov = 60.
        const aspect = generalDwAspect //defined in css I guess
        const near = 1.
        const far = 100.

        var perspectiveCamera = new THREE.PerspectiveCamera(fov, aspect, near, far)
        perspectiveCamera.position.set(.6, .7, 2.2)
        perspectiveCamera.position.multiplyScalar(1.4)
        perspectiveCamera.lookAt(0., 0., 0.)

        var orthographicCamera = new THREE.OrthographicCamera(-aspect,aspect,1.,-1.,near,far)
        orthographicCamera.position.z = 10.
    }


    function Dw(elem,isOrthographic) {
        const scene = new THREE.Scene()

        let dw = {
            scene,
            elem,
            render: () => {
                // get the viewport relative position of this element
                const { left, right, top, bottom, width, height } =
                    elem.getBoundingClientRect()

                const isOffscreen =
                    bottom < 0 ||
                    top > renderer.domElement.clientHeight ||
                    right < 0 ||
                    left > renderer.domElement.clientWidth;

                if (isOffscreen)
                    return

                const positiveYUpBottom = renderer.domElement.clientHeight - bottom
                renderer.setScissor(left, positiveYUpBottom, width, height)
                renderer.setViewport(left, positiveYUpBottom, width, height)

                if(isOrthographic)
                    renderer.render(scene, orthographicCamera)
                else
                    renderer.render(scene, perspectiveCamera)
            }
        }
        return dw
    }
    
    const inlineDw = Dw(inlineDwElem)
    {
        var inlineDwVisible = false

        inlineDw.scene.add(new THREE.Mesh(
            new THREE.SphereBufferGeometry(.8, 4, 2),
            new THREE.MeshBasicMaterial({ color: 0xFF0000 })))
    }

    let ptShaderMat = new THREE.ShaderMaterial()
    
    const standardDw = Dw(topRightDwElem)
    {
        let pt = new THREE.Mesh(
            new THREE.SphereBufferGeometry(.04, 32, 16),
            new THREE.MeshPhongMaterial({ color: 0xFF0000 }))
        pt.castShadow = true
        standardDw.scene.add(pt)

        let pedestalDimension = 4.
        const pedestal = new THREE.Mesh(
            new THREE.BoxGeometry(pedestalDimension, .01, pedestalDimension),
            new THREE.MeshPhongMaterial({ color: 0x999999, specular: 0x101010 })
        )
        pedestal.position.y = -1.
        pedestal.receiveShadow = true
        standardDw.scene.add(pedestal)

        const spotLight = new THREE.SpotLight()
        spotLight.penumbra = 0.5
        spotLight.castShadow = true
        spotLight.position.set(-.5, .5, .5)
        spotLight.lookAt(0.,0.,0.)
        standardDw.scene.add(spotLight)

        let grid = GridAndSpike(8, 8, 1./4.)
        // grid.position.y = -1. + .01
        grid.rotation.x = TAU / 4.
        standardDw.scene.add(grid)

        standardDw.scene.add(new THREE.AmbientLight(0x666666))

        let skyBgGeo = new THREE.SphereGeometry(50.)
        let skyBgMat = new THREE.MeshBasicMaterial({ color: new THREE.Color(.18431372, .18431372, .18431372), side:THREE.BackSide })
        const skyBg = new THREE.Mesh(skyBgGeo, skyBgMat)
        standardDw.scene.add(skyBg)

        // renderer.outputEncoding = THREE.sRGBEncoding
    }
    
    const finalShaderDw = Dw(document.getElementById('bottomRightDwElem'),true)
    {
        let planeMat = new THREE.PlaneGeometry(1., 1.)

        let currentMesh = null

        let declarationRegex = new RegExp("\s*vec4\s*[^\(]")
        let nameRegex = new RegExp("[a-zA-Z_$][a-zA-Z_$0-9]*")
        let findNewNameRegex = /\s*vec4\s*([a-zA-Z_$][a-zA-Z_$0-9]*)/
        
        compile = async () => {

            {
                /*
                    You're going to scan the thing for every single new variable
                    Well let's say every vec4

                    Currently we want:
                        To get the name
                        Make a subset of the shader which cuts off the shader on the line the user wants

                    Bultins:
                        Hand motor
                        Things that shadertoy has:
                            uniform vec3 iResolution;
                            uniform float iTime;
                            uniform float iTimeDelta;
                            uniform float iFrame;
                            uniform float iChannelTime[4];
                            uniform vec4 iMouse;
                            uniform vec4 iDate;
                            uniform float iSampleRate;
                            uniform vec3 iChannelResolution[4];
                            uniform samplerXX iChanneli;
                */

                let lines = textarea.value.match(/^.*(\r?\n|$)/mg)
                // log(lines)
                let bracesDeep = 0

                let strSoFar = ""
                lines.forEach((l,lineIndex)=>{
                    strSoFar += l

                    if(l.indexOf("{") !== -1)
                        ++bracesDeep
                    if (l.indexOf("}") !== -1)
                        --bracesDeep

                    let matchResult = l.match(findNewNameRegex)
                    if (matchResult !== null && matchResult[1] !== "fragColor") {
                        
                        //we're going to ASSUME this is a declaration line, no more, no less
                        //we can do WHATEVER WE LIKE with it when user lets go of mouse
                        
                        // let decName = matchResult[1]
                        // if( declarations[decName] === undefined ) {
                        //     declarations[decName] = {bracesDeep, lineIndex}
                        // }
                        // else {
                        //     declarations[decName].bracesDeep = bracesDeep
                        //     declarations[decName].lineIndex = lineIndex
                        // }

                        let vsString = strSoFar
                        for (let i = 0; i < bracesDeep; ++i)
                            vsString += "}"
                        
                        vsString += `
void main() 
{
    vec4 myVec4;
    mainImage(myVec4);

    gl_Position = projectionMatrix * modelViewMatrix * (vec4(position, 1.) + myVec4);
}`
                        log(vsString)

                        //nil is a bit like a series of 1D PGAs getting bigger and bigger
                    }
                })
            }

            if(currentMesh !== null) {
                finalShaderDw.scene.remove(currentMesh)

                let mat = currentMesh.material
                mat.dispose()
            }

            let mat = new THREE.ShaderMaterial({
                uniforms: {
                },
            })
            await assignShader("basicVertex", mat, "vertex")
            mat.fragmentShader = textarea.value + `
void main() {
    mainImage(gl_FragColor);
}`
            textarea.value

            currentMesh = new THREE.Mesh(planeMat, mat)
            finalShaderDw.scene.add(currentMesh)
        }
    }

    function render() {

        const width = canvas.clientWidth
        const height = canvas.clientHeight
        if (canvas.width !== width || canvas.height !== height)
            renderer.setSize(width, height, false)

        renderer.setScissorTest(false)
        renderer.clear(true, true)
        renderer.setScissorTest(true)

        finalShaderDw.render()
        standardDw.render()
        
        if(inlineDwVisible)
            inlineDw.render()

        requestAnimationFrame(render)
    }

    return render
}

function GridAndSpike(numWide, numTall, spacing) {
    if (THREE.Geometry !== undefined)
        console.error("this function has been changed since this deprecation")

    let verticalExtent = numTall / 2 * spacing
    let horizontalExtent = numWide / 2 * spacing
    let vertices = []
    vertices.push(new THREE.Vector3(0.,0.,-1.))
    vertices.push(new THREE.Vector3(0.,0.,1.))
    for (let i = 0; i < numWide + 1; i++) {
        let x = (i - numWide / 2) * spacing
        vertices.push(new THREE.Vector3(x, -verticalExtent, 0), new THREE.Vector3(x, verticalExtent, 0))
    }
    for (let i = 0; i < numTall + 1; i++) {
        let y = (i - numTall / 2) * spacing
        vertices.push(new THREE.Vector3(-horizontalExtent, y, 0), new THREE.Vector3(horizontalExtent, y, 0))
    }

    let grid = new THREE.LineSegments(new THREE.BufferGeometry().setFromPoints(vertices),
        new THREE.LineBasicMaterial({
            linewidth: 0.01,
            color: 0x000000,
        }))

    return grid
}