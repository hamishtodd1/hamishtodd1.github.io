function initCircuitsMeshes() {

    let radius = .05

    {
        let injections = [
            {
                type: `vertex`,
                precedes: ``,
                str: egaVerboseGlsl + egaGlsl + `
                float TAU = 6.283185307179586;
                uniform float[8] dq;
                uniform vec3 extraVec1; //left start
                uniform vec3 extraVec2; //right start
                out float numChevronsAlong;
                out float r;
                out float alongness;
            \n`
            },
            {
                type: `vertex`,
                precedes: `	#include <project_vertex>`,
                str: `

                r = transformed.x < 0. ? -1. : 1.;
                vec4 start = vec4( transformed.x < 0. ? extraVec1 : extraVec2,1.);
                
                alongness = transformed.z;

                float[8] alongLog; multiplyScalar( dq, alongness, alongLog );
                float[8] along; dqExp( alongLog, along );
                vec4 alonged = sandwichDqPoint( along, start );
                transformed = alonged.xyz / alonged.w;
            `,
                //` transformed.y += 0.; vNormal.x += 0.;\n`
            },
            {
                type: `fragment`,
                precedes: ``,
                str: `
                uniform vec3 extraVec3; //x is num chevrons long
                in float alongness;
                in float r;
            \n`
            },
            {
                type: `fragment`,
                precedes: `	#include <dithering_fragment>`,
                str: `
                float numChevronsAlong = (alongness) * extraVec3.x + abs(r);
                bool isYellow = mod( numChevronsAlong, 2. ) < 1.;
                gl_FragColor.rgb = isYellow ? vec3(1.,1.,0.) : vec3(0.,0.,0.);
            \n`
            },
        ]

        let geo = new THREE.PlaneGeometry(1., 1., 1, 100)
        geo.rotateX(Math.PI / 2.)
        geo.translate(0.,0.,.5)

        class FloorWire extends THREE.Mesh {

            constructor(circuit) {
                
                let mat = new THREE.MeshPhong2Material({
                    color: 0xFFFF00,
                    side: THREE.DoubleSide //not ideal but needed for now
                })
                mat.injections = injections
                super(geo, mat)

                this.start = e123.clone() //assumed to be normalized
                let start = this.start

                //note you are sending in a logarithm!!

                this.onBeforeRender = () => {

                    this.material.extraVec3.x = this.material.dq.exp(dq0).pointTrajectoryArcLength(start) / radius

                    if (this.material.dq.isZero()) {
                        this.visible = false
                        return
                    }

                    let ptAxisDirFromStart = this.material.dq.meet(e2, fl0).normalize().sub(this.start, fl1)

                    if (ptAxisDirFromStart.isZero()) {
                        this.visible = false
                        return
                    }

                    this.visible = true
                    ptAxisDirFromStart.normalize()

                    // ptAxisDirFromStart.log()
                    this.start.addScaled(ptAxisDirFromStart,  radius, fl0).pointToGibbsVec(this.material.extraVec1)
                    this.start.addScaled(ptAxisDirFromStart, -radius, fl0).pointToGibbsVec(this.material.extraVec2)

                    // circuit.getOpBgCorner(v1, 0, 0., 0., 0.)
                    // this.material.extraVec3.x = this.material.dq.exp(dq0).pointTrajectoryArcLength(fl0.pointFromGibbsVec(v1)) / radius

                    // circuit.getOpBgCorner(this.material.extraVec1, 0, 0., 0.,  radius)
                    // circuit.getOpBgCorner(this.material.extraVec2, 0, 0., 0., -radius)
                }
            }
        }
        window.FloorWire = FloorWire

        // let fw = new FloorWire()
        // blankFunction = () => {
        //     fw.start.point(Math.cos(-frameCount * .01), 0., -1.5, 1.)
        // }
    }

    // dashed lines going up
    {
        const dashedGeo = new THREE.BufferGeometry()
        const dashHeight = radius * 2.
        const dashWidthHalf = dashHeight * .25
        const numDots = 300
        const dashVerts = 6
        dashedGeo.setAttribute('position', new THREE.BufferAttribute(new Float32Array(dashVerts * 3 * numDots), 3))
        const dgp = dashedGeo.attributes.position.array
        for (let i = 0; i < numDots; ++i) {
            let y = i * dashHeight * 2.

            //tri 1
            dgp[(i * dashVerts + 0) * 3 + 0] = -dashWidthHalf
            dgp[(i * dashVerts + 0) * 3 + 1] = y + 0.
            dgp[(i * dashVerts + 1) * 3 + 0] = dashWidthHalf
            dgp[(i * dashVerts + 1) * 3 + 1] = y + dashHeight
            dgp[(i * dashVerts + 2) * 3 + 0] = -dashWidthHalf
            dgp[(i * dashVerts + 2) * 3 + 1] = y + dashHeight

            //tri 2
            dgp[(i * dashVerts + 3) * 3 + 0] = -dashWidthHalf
            dgp[(i * dashVerts + 3) * 3 + 1] = y + 0.
            dgp[(i * dashVerts + 4) * 3 + 0] = dashWidthHalf
            dgp[(i * dashVerts + 4) * 3 + 1] = y + 0.
            dgp[(i * dashVerts + 5) * 3 + 0] = dashWidthHalf
            dgp[(i * dashVerts + 5) * 3 + 1] = y + dashHeight
        }
        dashedGeo.attributes.position.needsUpdate = true
        
        renderer.localClippingEnabled = true

        let planeVec = new THREE.Vector3(0., -1., 0.)
        class DottedLine extends THREE.Group {
            constructor() {

                super()

                let clippingPlane = new THREE.Plane(planeVec, 1.)
                this.clippingPlane = clippingPlane

                let yellowMat = new THREE.MeshBasicMaterial({
                    color: 0xFFFF00,
                    clippingPlanes: [clippingPlane],
                    // side:THREE.DoubleSide
                })
                let yellow = new THREE.Mesh(dashedGeo, yellowMat)
                this.add(yellow)
                // let blackMat = new THREE.MeshBasicMaterial({
                //     color: 0x000000,
                //     clippingPlanes: [clippingPlane],
                //     // side:THREE.DoubleSide
                // })
                // let black = new THREE.Mesh(dashedGeo, blackMat)
                // black.position.y = -dashHeight
                // this.add(black)                
                
                obj3dsWithOnBeforeRenders.push(this)
                this.onBeforeRender = () => {
                    v1.copy(camera.position)
                    v1.y = 0.
                    this.lookAt(v1)
                }
            }

            setHeight(h) {
                this.clippingPlane.constant = h
            }
        }
        window.DottedLine = DottedLine

        // let dl = new DottedLine()
    }
}