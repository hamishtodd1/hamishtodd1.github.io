function initSpecRel() {

    {
        class Mv31 extends Float32Array {

            constructor() {
                super(16)
            }

            zero() {
                for (let i = 0; i < 16; ++i)
                    this[i] = 0.
            }

            sandwich(b,target) {
                this.mul(b,intermediate)
                this.reverse(thisReverse)
                intermediate.mul(thisReverse,target)
                return target
            }

            reverse(target) {
                target[0] = this[0]; target[1] = this[1]; target[2] = this[2]; target[3] = this[3]; target[4] = this[4]; target[5] = -this[5]; target[6] = -this[6]; target[7] = -this[7]; target[8] = -this[8]; target[9] = -this[9]; target[10] = -this[10]; target[11] = -this[11]; target[12] = -this[12]; target[13] = -this[13]; target[14] = -this[14]; target[15] = this[15];
            }

            mul(b,target) {
                target[0]=b[0]*this[0]+b[1]*this[1]+b[2]*this[2]+b[3]*this[3]-b[4]*this[4]-b[5]*this[5]-b[6]*this[6]+b[7]*this[7]-b[8]*this[8]+b[9]*this[9]+b[10]*this[10]-b[11]*this[11]+b[12]*this[12]+b[13]*this[13]+b[14]*this[14]-b[15]*this[15];
                target[1]=b[1]*this[0]+b[0]*this[1]-b[5]*this[2]-b[6]*this[3]+b[7]*this[4]+b[2]*this[5]+b[3]*this[6]-b[4]*this[7]-b[11]*this[8]+b[12]*this[9]+b[13]*this[10]-b[8]*this[11]+b[9]*this[12]+b[10]*this[13]-b[15]*this[14]+b[14]*this[15];
                target[2]=b[2]*this[0]+b[5]*this[1]+b[0]*this[2]-b[8]*this[3]+b[9]*this[4]-b[1]*this[5]+b[11]*this[6]-b[12]*this[7]+b[3]*this[8]-b[4]*this[9]+b[14]*this[10]+b[6]*this[11]-b[7]*this[12]+b[15]*this[13]+b[10]*this[14]-b[13]*this[15];
                target[3]=b[3]*this[0]+b[6]*this[1]+b[8]*this[2]+b[0]*this[3]+b[10]*this[4]-b[11]*this[5]-b[1]*this[6]-b[13]*this[7]-b[2]*this[8]-b[14]*this[9]-b[4]*this[10]-b[5]*this[11]-b[15]*this[12]-b[7]*this[13]-b[9]*this[14]+b[12]*this[15];
                target[4]=b[4]*this[0]+b[7]*this[1]+b[9]*this[2]+b[10]*this[3]+b[0]*this[4]-b[12]*this[5]-b[13]*this[6]-b[1]*this[7]-b[14]*this[8]-b[2]*this[9]-b[3]*this[10]-b[15]*this[11]-b[5]*this[12]-b[6]*this[13]-b[8]*this[14]+b[11]*this[15];
                target[5]=b[5]*this[0]+b[2]*this[1]-b[1]*this[2]+b[11]*this[3]-b[12]*this[4]+b[0]*this[5]-b[8]*this[6]+b[9]*this[7]+b[6]*this[8]-b[7]*this[9]+b[15]*this[10]+b[3]*this[11]-b[4]*this[12]+b[14]*this[13]-b[13]*this[14]+b[10]*this[15];
                target[6]=b[6]*this[0]+b[3]*this[1]-b[11]*this[2]-b[1]*this[3]-b[13]*this[4]+b[8]*this[5]+b[0]*this[6]+b[10]*this[7]-b[5]*this[8]-b[15]*this[9]-b[7]*this[10]-b[2]*this[11]-b[14]*this[12]-b[4]*this[13]+b[12]*this[14]-b[9]*this[15];
                target[7]=b[7]*this[0]+b[4]*this[1]-b[12]*this[2]-b[13]*this[3]-b[1]*this[4]+b[9]*this[5]+b[10]*this[6]+b[0]*this[7]-b[15]*this[8]-b[5]*this[9]-b[6]*this[10]-b[14]*this[11]-b[2]*this[12]-b[3]*this[13]+b[11]*this[14]-b[8]*this[15];
                target[8]=b[8]*this[0]+b[11]*this[1]+b[3]*this[2]-b[2]*this[3]-b[14]*this[4]-b[6]*this[5]+b[5]*this[6]+b[15]*this[7]+b[0]*this[8]+b[10]*this[9]-b[9]*this[10]+b[1]*this[11]+b[13]*this[12]-b[12]*this[13]-b[4]*this[14]+b[7]*this[15];
                target[9]=b[9]*this[0]+b[12]*this[1]+b[4]*this[2]-b[14]*this[3]-b[2]*this[4]-b[7]*this[5]+b[15]*this[6]+b[5]*this[7]+b[10]*this[8]+b[0]*this[9]-b[8]*this[10]+b[13]*this[11]+b[1]*this[12]-b[11]*this[13]-b[3]*this[14]+b[6]*this[15];
                target[10]=b[10]*this[0]+b[13]*this[1]+b[14]*this[2]+b[4]*this[3]-b[3]*this[4]-b[15]*this[5]-b[7]*this[6]+b[6]*this[7]-b[9]*this[8]+b[8]*this[9]+b[0]*this[10]-b[12]*this[11]+b[11]*this[12]+b[1]*this[13]+b[2]*this[14]-b[5]*this[15];
                target[11]=b[11]*this[0]+b[8]*this[1]-b[6]*this[2]+b[5]*this[3]+b[15]*this[4]+b[3]*this[5]-b[2]*this[6]-b[14]*this[7]+b[1]*this[8]+b[13]*this[9]-b[12]*this[10]+b[0]*this[11]+b[10]*this[12]-b[9]*this[13]+b[7]*this[14]-b[4]*this[15];
                target[12]=b[12]*this[0]+b[9]*this[1]-b[7]*this[2]+b[15]*this[3]+b[5]*this[4]+b[4]*this[5]-b[14]*this[6]-b[2]*this[7]+b[13]*this[8]+b[1]*this[9]-b[11]*this[10]+b[10]*this[11]+b[0]*this[12]-b[8]*this[13]+b[6]*this[14]-b[3]*this[15];
                target[13]=b[13]*this[0]+b[10]*this[1]-b[15]*this[2]-b[7]*this[3]+b[6]*this[4]+b[14]*this[5]+b[4]*this[6]-b[3]*this[7]-b[12]*this[8]+b[11]*this[9]+b[1]*this[10]-b[9]*this[11]+b[8]*this[12]+b[0]*this[13]-b[5]*this[14]+b[2]*this[15];
                target[14]=b[14]*this[0]+b[15]*this[1]+b[10]*this[2]-b[9]*this[3]+b[8]*this[4]-b[13]*this[5]+b[12]*this[6]-b[11]*this[7]+b[4]*this[8]-b[3]*this[9]+b[2]*this[10]+b[7]*this[11]-b[6]*this[12]+b[5]*this[13]+b[0]*this[14]-b[1]*this[15];
                target[15]=b[15]*this[0]+b[14]*this[1]-b[13]*this[2]+b[12]*this[3]-b[11]*this[4]+b[10]*this[5]-b[9]*this[6]+b[8]*this[7]+b[7]*this[8]-b[6]*this[9]+b[5]*this[10]+b[4]*this[11]-b[3]*this[12]+b[2]*this[13]-b[1]*this[14]+b[0]*this[15];
            }
        }
        window.Mv31 = Mv31
        let intermediate = new Mv31()
        let thisReverse = new Mv31()
            
        class Bivec31 extends Float32Array {

            constructor() {
                super(6)
            }

            exp(target) {
                // B*B = S + T*e1234
                let S = -this[0] * this[0] - this[1] * this[1] + this[2] * this[2] - this[3] * this[3] + this[4] * this[4] + this[5] * this[5]
                let T = 2 * (this[0] * this[5] - this[1] * this[4] + this[2] * this[3])
                // ||this*this||
                let norm = Math.sqrt(S * S + T * T)
                // P_+ = xB + y*e1234*this
                let [x, y] = [norm === 0. ? 0. : 0.5 * (1 + S / norm), norm === 0. ? 0. : -0.5 * T / norm];
                let [lp, lm] = [Math.sqrt(0.5 * S + 0.5 * norm), Math.sqrt(-0.5 * S + 0.5 * norm)]
                let [cp, sp] = [Math.cosh(lp), lp == 0 ? 1 : Math.sinh(lp) / lp]
                let [cm, sm] = [Math.cos(lm), lm == 0 ? 1 : Math.sin(lm) / lm]
                let [cmsp, cpsm] = [cm * sp, cp * sm]
                let [alpha, beta] = [(cmsp - cpsm) * x + cpsm, (cmsp - cpsm) * y]
                // Combine the two Euler's formulas together.
                
                target.zero()
                target[ 0] = cp * cm
                target[ 5] = (this[0] * alpha + this[5] * beta)
                target[ 6] = (this[1] * alpha - this[4] * beta)
                target[ 7] = (this[2] * alpha - this[3] * beta)
                target[ 8] = (this[3] * alpha + this[2] * beta)
                target[ 9] = (this[4] * alpha + this[1] * beta)
                target[10] = (this[5] * alpha - this[0] * beta)
                target[15] = sp * sm * T / 2.

                return target
            }
        }
        window.Bivec31 = Bivec31
    }

    let group = new THREE.Group()
    scene.add(group)
    group.position.set(0., 1.2, -.2)
    let coneMat = new THREE.MeshPhongMaterial({ 
        color: 0xFF0000,
        side: THREE.DoubleSide,
        transparent: true,
        opacity: .5
    })
    let coneP = new THREE.Mesh(new THREE.ConeGeometry(1., 1., 64, 1, true), coneMat)
    coneP.geometry.translate(0.,-.5,0.)
    group.add(coneP)
    coneP.scale.multiplyScalar(.7)
    let coneF = new THREE.Mesh(new THREE.ConeGeometry(1., 1., 64, 1, true), coneMat)
    coneF.geometry.translate(0., -.5, 0.)
    coneF.geometry.rotateX(Math.PI)
    group.add(coneF)
    coneF.scale.multiplyScalar(.7)

    let axis31 = new Bivec31()
    {
        let cylRadius = .02
        let axisGeo = new THREE.CylinderGeometry(cylRadius, cylRadius, camera.far * 10., 5, 1, true)
        let cyl = new DqMesh(axisGeo, new THREE.MeshPhongMaterial({ color: 0x00FFFF }))
        scene.add(cyl)

        let multiple = 0.
        function onMouseWheel(event) {
            multiple += event.deltaY * .0002
        }
        document.addEventListener('wheel', onMouseWheel)

        let egaBivector = new Dq()
        let snappedHandPosition = new THREE.Vector3()
        updateAxis = () => {

            handPosition.pointToVertex(snappedHandPosition)
            if (Math.abs(snappedHandPosition.y - group.position.y) < 0.05) {
                //pure boost
                snappedHandPosition.y = group.position.y
            }
            else {
                let distToAxisSq = sq(snappedHandPosition.x-group.position.x) + sq(snappedHandPosition.z-group.position.z)
                //pure rotation
                if(distToAxisSq < .07) {
                    snappedHandPosition.x = group.position.x
                    snappedHandPosition.z = group.position.z
                }
            }

            fl0.pointFromVertex(group.position)
            fl0.joinPt(fl1.pointFromVertex(snappedHandPosition), egaBivector)

            e31.dqTo(egaBivector, cyl.dq)

            axis31[0] = -multiple * egaBivector.inner(e31, dq0)[0]
            axis31[2] = multiple * egaBivector.inner(e23, dq0)[0]
            axis31[4] = multiple * egaBivector.inner(e12, dq0)[0]
        }
    }

    {
        let input = new Mv31()
        let rotor = new Mv31()
        rotor[0] = 1.
        let output = new Mv31()

        let num = 1000
        let originalCoords = new Float32Array(num * 6)
        for (let i = 0; i < num; i++) {
            let angle = Math.random() * TAU
            let radiusOut = Math.random() * .5
            originalCoords[i*6+0] = radiusOut * Math.cos(angle)
            originalCoords[i*6+1] = Math.random() - .5
            originalCoords[i*6+2] = radiusOut * Math.sin(angle)
            originalCoords[i*6+3] = 0.
            originalCoords[i*6+4] = 0.
            originalCoords[i*6+5] = 0.
        }
        const geo = new THREE.BufferGeometry();
        geo.setAttribute('position', new THREE.Float32BufferAttribute(originalCoords, 3));
        let pts = new THREE.LineSegments(geo, new THREE.PointsMaterial({
            color: 0x00FF00,
            size: .03
        }))
        group.add(pts)
        updatePts = ()=>{

            // let angle = frameCount * .04
            // rotor[0] = Math.cos(angle)
            // rotor[5] = Math.sin(angle)

            // log(axis31)
            axis31.exp(rotor)
            // log(rotor)

            for (let i = 0; i < num; i++) {
                //Confusing in the ordinary coordinate system, yes. Oh well.
                //we're saying e12 is the vertical
                input[5] = originalCoords[i*6+1]
                //respectively e14 and e24
                input[7] = originalCoords[i*6+0]
                input[9] = originalCoords[i*6+2]

                rotor.sandwich(input, output)
                geo.attributes.position.array[i * 6 + 1] = output[5]
                geo.attributes.position.array[i * 6 + 0] = output[7]
                geo.attributes.position.array[i * 6 + 2] = output[9]
                // if(i=== 0)
                //     log(output[7])
            }
            geo.attributes.position.needsUpdate = true
        }
    }

    blankFunction = () => {
        updateAxis()
        updatePts()
    }




    //COW


    // {
    //     let geo = null
    //     let mat = null
    //     function onManagerFinish() {
    //         let mesh = new THREE.Mesh(geo, mat)
    //         // mesh.position.set(0., 1.6, 0.)
    //         group.add(mesh)
    //     }
    //     const manager = new THREE.LoadingManager(onManagerFinish)
    //     const textureLoader = new THREE.TextureLoader(manager)
    //     const objLoader = new THREE.OBJLoader(manager)

    //     let injections = [
    //         {
    //             type: `vertex`,
    //             precedes: ``,
    //             str: egaVerboseGlsl + egaGlsl + `
    //             float TAU = 6.283185307179586;
    //             uniform float[8] dq;
    //             uniform vec3 extraVec1;
    //             uniform vec3 extraVec2;
    //             uniform vec3 extraVec3;
    //         \n`
    //         },
    //         {
    //             type: `vertex`,
    //             precedes: `	#include <project_vertex>`,
    //             str: `
    //                 // transformed.xyz += ;
    //                 // vNormal = ;
    //             `,
    //         },
    //     ]

    //     function onTextureLoad(tex) {
    //         mat = new THREE.MeshPhong2Material({ map: tex })
    //         mat.injections = injections
    //     }
    //     function onGeoLoad(object) {
    //         object.traverse(function (child) {
    //             if (child.isMesh) {
    //                 geo = child.geometry
    //                 geo.scale(0.4, 0.4, 0.4)
    //             }
    //         })
    //     }

    //     textureLoader.load('data/cow.png', onTextureLoad, () => { }, () => {
    //         textureLoader.load('https://hamishtodd1.github.io/ga/ed/data/cow.png', onTextureLoad)
    //     })
    //     objLoader.load('data/cow.obj', onGeoLoad, () => { }, () => {
    //         objLoader.load('https://hamishtodd1.github.io/ga/ed/data/cow.obj', onGeoLoad)
    //     })
    // }
}