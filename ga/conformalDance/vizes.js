function getMinorRadius(position) {
    let ret = Math.max(.09,.12 * Math.pow(position.distanceTo(camera.position), .05))
    return ret
}

class SphereViz extends THREE.Group {
    constructor(color) {
        super()

        let frontMat = new THREE.MeshPhongMaterial({
            color,
            clippingPlanes,
            clipShadows: true,
            side: THREE.FrontSide,
            transparent: true,
            opacity: .75,
        })
        let backMat = new THREE.MeshPhongMaterial({
            color: color * .8,
            clippingPlanes,
            clipShadows: true,
            side: THREE.BackSide,
            transparent: true,
            opacity: .75,
        })

        this.sphereGroup = new THREE.Group()
        this.sphereGroup.add(new THREE.Mesh(sGeo, frontMat), new THREE.Mesh(sGeo, backMat))
        // this.sphereGroup.castShadow = true
        this.add(this.sphereGroup)

        this.planeGroup = new THREE.Group()
        this.planeGroup.add(new THREE.Mesh(pGeo, frontMat), new THREE.Mesh(pGeo, backMat))
        // this.planeGroup.castShadow = true
        this.planeGroup.scale.setScalar(999.)
        this.add(this.planeGroup)

        this.setFromSphere(_e5)
    }

    setFromSphere(sphere) {

        let isHyperIdeal = sphere.inner(sphere, even0) < 0.
        let isPlane = sphere.meet(_e1230, odd0)[15] === 0.

        if (isHyperIdeal) {
            this.sphereGroup.visible = false
            this.planeGroup.visible = false
        }
        else if (isPlane) {
            this.sphereGroup.visible = false
            this.planeGroup.visible = true

            _e123.projectOn(sphere, odd0).flatPointToVec3(this.planeGroup.position)
            sphere.mulReverse(_e3, even0).toQuaternion(this.planeGroup.quaternion)
            getSqrtQuaternion(this.planeGroup.quaternion, this.planeGroup.quaternion)
        }
        else {
            this.sphereGroup.visible = true
            this.planeGroup.visible = false
            let radius = sphere.getSpherePositionVec3AndRadius(this.sphereGroup.position)
            this.sphereGroup.scale.setScalar(radius)
        }
    }
}

class SimpleBivViz extends THREE.Group {
    
    constructor() {
        
        super()

        let torMat = new THREE.MeshPhongMaterial({ color: 0x71355B })

        this.spheres = Array(2)
        for (let i = 0; i < 2; ++i) {
            this.spheres[i] = new THREE.Mesh(new THREE.SphereGeometry(1.), new THREE.MeshPhongMaterial({ color: i ? 0xFFFFFF : 0x000000 }))
            this.spheres[i].castShadow = true
            this.add(this.spheres[i])
        }
        this.spherePositions = [this.spheres[0].position, this.spheres[1].position]
        this.vectorPair = [v1, v2]

        this.radialSegments = 16
        this.tubularSegments = 40
        this.torGeo = new THREE.TorusGeometry(1.,1., this.radialSegments, this.tubularSegments)
        this.tor = new THREE.Mesh(this.torGeo, torMat)
        this.cylGeo = new THREE.CylinderGeometry(1., 1., 1., this.radialSegments, 1)
        this.cyl = new THREE.Mesh(this.cylGeo, torMat)
        this.tor.castShadow = true
        this.cyl.castShadow = true
        this.add(this.tor, this.cyl)

        //this was the direction the things were facing in
        // let dir = new THREE.Vector3().set(1., 0.26, -0.07).normalize()
    }

    update(bivector) {

        let self = this
        function makePointPair(ppBivector) {
            ppBivector.pointPairToVec3s(self.spherePositions)

            self.spheres[0].visible = !self.spheres[0].position.equals(outOfSightVec3)
            self.spheres[1].visible = !self.spheres[1].position.equals(outOfSightVec3)

            for (let i = 0; i < 2; ++i)
                self.spheres[i].scale.setScalar(1.4*getMinorRadius(self.spheres[i].position))
        }
        
        function makeTorus(circleBivector) {
            //carrier, ya big hipocrite!
            let circlePlane = circleBivector.inner(_e0, odd0)

            circlePlane.mulReverse(_e3, even0).toQuaternion(self.tor.quaternion)
            getSqrtQuaternion(self.tor.quaternion, self.tor.quaternion)

            let favouriteSphere = circleBivector.inner(circlePlane, odd2)
            self.majorRadius = favouriteSphere.getSpherePositionVec3AndRadius(self.tor.position)
            self.minorRadius = getMinorRadius(self.tor.position)

            const vertices = self.torGeo.attributes.position.array
            let index = 0
            for (let j = 0; j <= self.radialSegments; j++) {
                for (let i = 0; i <= self.tubularSegments; i++) {

                    const u = i / self.tubularSegments * (Math.PI * 2.);
                    const v = j / self.radialSegments * Math.PI * 2.;

                    v1.x = (self.majorRadius + self.minorRadius * Math.cos(v)) * Math.cos(u);
                    v1.y = (self.majorRadius + self.minorRadius * Math.cos(v)) * Math.sin(u);
                    v1.z = self.minorRadius * Math.sin(v);

                    v1.toArray(vertices, index * 3)

                    ++index
                }
            }

            self.torGeo.attributes.position.needsUpdate = true
            self.torGeo.attributes.normal.needsUpdate = true
        }

        let square = bivector.mul(bivector, even0)[0]
        if (square !== 0.)
            bivector.multiplyScalar(1. / Math.sqrt(Math.abs(square)), bivector)

        let incidentWithPointAtInf = bivector.mul(_e1230, even0).selectGrade(4, even1).isZero()

        if (square > 0.) {
            // hyperbolic or scaling
            this.cyl.visible = false
            this.tor.visible = false

            makePointPair(bivector)
        }
        else if (incidentWithPointAtInf && square <= 0.) {

            if (square === 0.) {
                bivector.toDq(dq0)
                dq0.joinPt(camera.mvs.pos, fl0).meet(camera.frustum.far, dq1)
                bivector.fromDq(dq1)
            }

            // rotation
            this.cyl.visible = true
            this.tor.visible = false
            this.spheres[0].visible = false
            this.spheres[1].visible = false

            //TODO this.minorRadius needs to depend on distance from origin
            let radius = getMinorRadius(this.cyl.position)
            this.cyl.scale.set(radius, 99999., radius)

            _e123.projectOn(bivector, odd0).flatPointToVec3(this.cyl.position)

            // debugger
            bivector.projectOn(_e123, even0).mulReverse(_e13, even1)
            even1.toQuaternion(this.cyl.quaternion)
            getSqrtQuaternion(this.cyl.quaternion, this.cyl.quaternion)
        }
        else if (!incidentWithPointAtInf && square === 0.) {

            // parabolic
            this.cyl.visible = false
            this.tor.visible = true
            this.spheres[0].visible = true
            this.spheres[1].visible = true

            // suppose it was e3o
            // you want to split it into e5ish parts and e4ish parts
            //yeah this only works at the origin

            even4.copy(bivector)
            even4[3] *= 1.1
            even4[6] *= 1.1
            even4[8] *= 1.1
            makeTorus(even4)

            even4.copy(bivector)
            even4[4] *= 1.1
            even4[7] *= 1.1
            even4[9] *= 1.1
            makePointPair(even4)
            
        }
        else if (!incidentWithPointAtInf && square < 0.) {
            // toroidal vortex
            this.cyl.visible = false
            this.tor.visible = true
            this.spheres[0].visible = false
            this.spheres[1].visible = false

            makeTorus(bivector)
        }
    }
}

function initInvariants() {

    // let mrh = new THREE.Points()

    let bVizes = [new SimpleBivViz(), new SimpleBivViz()]
    scene.add(bVizes[0], bVizes[1])

    let bivector = new Even()

    
    updateVizes = (pieces, transform) => {

        bVizes[0].visible = pieces.length >= 2
        bVizes[1].visible = pieces.length >= 4

        if(pieces.length >= 2) {
            pieces[0].mul(pieces[1], bivector)
            bivector[0] = 0.
            bVizes[0].update(bivector)
        }

        if(pieces.length >= 4) {
            pieces[2].mul(pieces[3], bivector)
            bivector[0] = 0.
            bVizes[1].update(bivector)
        }

        //yeah and there are odd elements coming!
    }
}

// function initInvariants() {

//     let bVizes = [new SimpleBivViz(), new SimpleBivViz()]
//     scene.add(bVizes[0], bVizes[1])

//     let B = new Even()
//     let b1 = new Even()
//     let b2 = new Even()
//     let bivectors = [b1, b2]

//     updateVizes = (pieces, transform) => {

//         bVizes[0].visible = pieces.length >= 2
//         bVizes[1].visible = pieces.length >= 4

//         if (pieces.length === 2) {
//             bVizes[0].update(transform)
//         }
//         else if (pieces.length === 4) {
//             transform.normalize().logarithm(B)
//             // debugger
//             B.decomposeBivector(bivectors)
//             bVizes[0].update(bivectors[0].normalize())
//             bVizes[1].update(bivectors[1].normalize())
//         }

//         //yeah and there are odd elements coming!
//     }
// }