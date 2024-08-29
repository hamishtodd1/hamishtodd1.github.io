//to get the position/rotation/scale of a sphere
//reflect e1230 in the sphere


updateDisplay = () => {}

function initSpheres() {

    let spheres = [
        _e1,
        _e2,
        _e3,
        _e4,
        _e4.addScaled(_e2,1.,new Odd()),
    ]

    let sGeo = new THREE.SphereGeometry(1.,64,32)
    let pGeo = new THREE.PlaneGeometry(1.,1.)
    let h = 5.6 * 999.
    let w = 6.6 * 999.
    let clippingPlanes = [
        new THREE.Plane(new THREE.Vector3( 0, 0, 1), w*.5),
        new THREE.Plane(new THREE.Vector3( 0, 0,-1), w*.5),
        new THREE.Plane(new THREE.Vector3( 0, 1, 0), h*.5),
        new THREE.Plane(new THREE.Vector3( 0,-1, 0), h*.5),
        new THREE.Plane(new THREE.Vector3( 1, 0, 0), w*.5),
        new THREE.Plane(new THREE.Vector3(-1, 0, 0), w*.5),
    ]

    let mrh = new THREE.BufferGeometry().setFromPoints([
        new THREE.Vector3(  w/2.,  h/2.,  w/2.), new THREE.Vector3(  w/2., -h/2.,  w/2.),
        new THREE.Vector3(  w/2., -h/2.,  w/2.), new THREE.Vector3( -w/2., -h/2.,  w/2.),
        new THREE.Vector3( -w/2., -h/2.,  w/2.), new THREE.Vector3( -w/2.,  h/2.,  w/2.),
        new THREE.Vector3( -w/2.,  h/2.,  w/2.), new THREE.Vector3(  w/2.,  h/2.,  w/2.),

        new THREE.Vector3(  w/2.,  h/2., -w/2.), new THREE.Vector3(  w/2., -h/2., -w/2.),
        new THREE.Vector3(  w/2., -h/2., -w/2.), new THREE.Vector3( -w/2., -h/2., -w/2.),
        new THREE.Vector3( -w/2., -h/2., -w/2.), new THREE.Vector3( -w/2.,  h/2., -w/2.),
        new THREE.Vector3( -w/2.,  h/2., -w/2.), new THREE.Vector3(  w/2.,  h/2., -w/2.),

        new THREE.Vector3(  w/2.,  h/2.,  w/2.), new THREE.Vector3(  w/2.,  h/2., -w/2.),
        new THREE.Vector3(  w/2., -h/2.,  w/2.), new THREE.Vector3(  w/2., -h/2., -w/2.),
        new THREE.Vector3( -w/2.,  h/2.,  w/2.), new THREE.Vector3( -w/2.,  h/2., -w/2.),
        new THREE.Vector3( -w/2., -h/2.,  w/2.), new THREE.Vector3( -w/2., -h/2., -w/2.),
    ])
    a = new THREE.LineSegments(mrh, new THREE.LineBasicMaterial({color: 0xFFFFFF}))
    scene.add(a)
    
    class SphereViz extends THREE.Group{
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
    window.SphereViz = SphereViz

    let svs = [
        new SphereViz( 0x440154),
        new SphereViz( 0x3b528b),
        new SphereViz( 0x21918c),
        new SphereViz( 0x5ec962),
        new SphereViz( 0xfde725),
        //TODO viridis
    ]
    svs.forEach(sv=>scene.add(sv))

    updateSpheres = (spheres) => {
        for (let i = 0; i < spheres.length; ++i) {
            svs[i].visible = true
            svs[i].setFromSphere(spheres[i])
        }
        for(let i = spheres.length; i < svs.length; ++i) {
            svs[i].visible = false
        }
    }

    return updateSpheres
}