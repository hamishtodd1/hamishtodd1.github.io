//wanna see reflection
//can show them that reflection*reflection=translation
//important question to answer right now is about 

function initColumn0d() {
    let ambient = new Dw(0, 0, true, true)

    let pss = e45

    let line2dGeo = new THREE.PlaneGeometry(.05, 999.)
    let cylGeo = new THREE.CylinderBufferGeometry(tubeRadius, tubeRadius, 999., 8, 1, true)

    ambient.updateCamera = () => {
        ambient.camera.position.z = 2. * Math.pow(1.-ambient.cameraUnusualness, .6)
        ambient.camera.rotation.x = TAU / 4. * ambient.cameraUnusualness
        ambient.camera.rotation.z = TAU / 4. * ambient.cameraUnusualness
    }

    function mvToMatrixOfLine(mv,matrix) {
        v1.set(mv[5], mv[4], 0.)
        matrix.makeBasis(xUnit, v1, zUnit)
    }

    // {
    //     var ourMv = new Mv().copy(eMinus)
    //     ourMv.multiplyScalar(.1)
    //     ePlus.add(ourMv, ourMv)

    //     let viz = new THREE.Mesh(cylGeo, new THREE.MeshBasicMaterial({ color: 0xFF0000 }))
    //     viz.matrixAutoUpdate = false
    //     updateFunctions.push(() => {
    //         mvToMatrixOfLine(ourMv,viz.matrix)
    //     })
    //     viz.rotation.z += .3
    //     ambient.scene.add(viz)
    // }

    const gridCount = 8
    {
        var gridLines = new THREE.InstancedMesh(cylGeo,new THREE.MeshBasicMaterial({color:0x0000FF, transparent:true, opacity: 1.}),gridCount)
        ambient.scene.add(gridLines)
        var initialGridMvs = Array(gridCount)

        let slightRotation = new Mv()
        slightRotation.copy(pss).multiplyScalar(.2)
        slightRotation[0] = 1.
        slightRotation.normalize()
        for(let i = 0; i < gridCount; ++i) {
            mv0.copy(oneMv)
            for(let j = 0; j < i; ++j) {
                mul(mv0, slightRotation, mv1)
                mv0.copy(mv1)
            }

            initialGridMvs[i] = new Mv()
            mv0.sandwich(ePlus,initialGridMvs[i])
        }
        var gridRotor = oneMv.clone()
    }

    {
        let rotorLeft = new Mv()
        let rotorRight = new Mv()
        rotorLeft.copy(pss).multiplyScalar( .01)
        rotorRight.copy(pss).multiplyScalar(-.01)
        rotorLeft[0] = 1.
        rotorRight[0] = 1.
        rotorLeft.normalize()
        rotorRight.normalize()
        
        bindButton("q", () => {}, ``, () => {
            mul(gridRotor, rotorLeft, mv1)
            gridRotor.copy(mv1)
        })
        bindButton("w", () => {}, ``, () => {
            mul(gridRotor, rotorRight, mv1)
            gridRotor.copy(mv1)
        })
    }

    {
        let line2dMat = new THREE.MeshBasicMaterial({ color: 0x000000, transparent: true, opacity: 1. })
        let e1Line = new THREE.Mesh(cylGeo, line2dMat)
        ambient.scene.add(e1Line)
        let e2Line = new THREE.Mesh(cylGeo, line2dMat)
        e2Line.rotation.z = TAU / 4.
        ambient.scene.add(e2Line)
    }

    let hyperbolic = new Dw(0, 1)

    {
        function hyperbolaFunc(x) {
            return Math.sqrt(4. + sq(x))
        }
        class HyperbolaCurve extends THREE.Curve {
            constructor() {
                super()
            }
            getPoint(t, optionalTarget = new THREE.Vector3()) {

                //x*x-y*y = 1
                optionalTarget.x = -8. + 16. * t
                optionalTarget.y = hyperbolaFunc(optionalTarget.x)

                return optionalTarget
            }
        }
        const path = new HyperbolaCurve()

        hyperbolic.camera.position.set(0.,0.,0.)
        hyperbolic.camera.lookAt(0.,1.,0.)
        hyperbolic.camera.rotation.z += TAU / 4.

        let hyperbolaGeo = new THREE.TubeGeometry(path, 127, tubeRadius, 7, false)
        let hyperbolaMat = new THREE.MeshBasicMaterial({ color: 0xFFFF00 })
        let hyperbolaMesh = new THREE.Mesh(hyperbolaGeo, hyperbolaMat)
        hyperbolic.scene.add(hyperbolaMesh)

        let gridPointsGeo = new THREE.SphereGeometry(tubeRadius * 3.)
        let gridPointsMat = new THREE.MeshBasicMaterial({ color: 0x00FFFF })
        var gridPoints = new THREE.InstancedMesh(gridPointsGeo, gridPointsMat, gridCount)
        hyperbolic.scene.add(gridPoints)

        // hyperbolaFunc
        // let segmentGeo = new THREE.PlaneGeometry(.05, 999.)
        // let worldItself = new THREE.Mesh()

        //so you need to do a vertex shader
        //alright you get a grid of vertices
        //maybe it is ok to fake it with the threejs camera for the middle row?
        //alright consider the second column, last row
        // let thingyMat = new THREE.ShaderMaterial({
        //     uniforms: {
        //         cameraFov
        //     },
        //     vertexShader: `            
        //     void main() {
        //         //position is the vertex position. x and y should range from 0 to 1
        //         float corePositionX = -2. + 4. * position.x;
        //         float corePositionY = hyperbolaFunc(optionalTarget.x)

        //         float angle = position.y * 2. * 3.1415926535898;
        //         vec3 aroundOrigin = vec3(0.,sin(angle),cos(angle)); //should really be around the axis of the thing
        //         gl_Position = vec4(aroundOrigin.x + corePosition.x, aroundOrigin.y + corePosition.y, 0., 1.);
        //         //and then the idea is that you do something with the camera transform
        //     }
        //     `,
        //     fragmentShader: `
        //     void main() {
        //         gl_FragColor = vec4(1.,0.,0.,0.);
        //     }
        //     `
        // })
    }

    updateFunctions.push(() => {
        for (let i = 0; i < gridCount; ++i) {
            gridRotor.sandwich(initialGridMvs[i], mv0)
            mvToMatrixOfLine(mv0, m1)
            gridLines.setMatrixAt(i, m1)
            gridLines.instanceMatrix.needsUpdate = true

            let currentHyperbolaVal = sq(mv0[5]) - sq(mv0[4])
            v1.set(mv0[5], mv0[4], 0.).multiplyScalar(-2. / currentHyperbolaVal)
            m1.identity()
            m1.setPosition(v1)
            gridPoints.setMatrixAt(i, m1)
        }
        gridPoints.instanceMatrix.needsUpdate = true
    })
}

//jeremy england: Imagine a crater with a high wall around it. Just outside it there is a rock.
//That rock's state is "more irreversible" if it's at the bottom of the crater