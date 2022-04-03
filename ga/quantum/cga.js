/*
    Reasons to take this super seriously
        It teaches projective space, psl2r
        It introduces special relativity 
        It's how you navigate pictures that you don't want to rotate
        Then 2d CGA is ones you do want to rotate
        Scales to graphing better
        You don't need to mark things like a ruler (?)
        Multiplication is growth
        2*3*3*3, what's that? Make a 2x3 rectangle, turn that into a line, make another rectangle, turn into line...
        Everyone agrees determinants are dumb
        Visualize it in the same domain as it came from
        Area is measured in different units!
        ADS/CFT
        Frickin division dude, lots of stuff is division and what's your visualization of that?
        Lots of things, eg temperature, are ad/subtract multiply/divide

    Gee, special relativity is a rabbithole, who'd have thought?

    What you've succeeded in creating here is a solution without a problem. That's fine, maybe you'll find a problem
    Good to have thought of it before you do the 

    Hello, this is a visual guide to ADS/CFT
    Timeglobey thing

    I'm actually not an expert on AdS/CFT

    Short: "the visual intuition behind AdS/CFT". Make webpage, with checkboxes, then make video

    Side-by-side

    Then do a 1-hr lecture on the various connections it has
    
    Script
        Desitter space IS this hyperboloid. And it can be seen in a certain way

    For sure, the 

    could have everything be mesh-y, made of lines
    or, planes with thickness but it comes apart
    definitely want the crossover/intersection line to be in the middle of the thing rather than tangent to the cone
    because, you want to be able to rotate and see the true origin, from whence all the true lines come

    //have a "zoom in to eye in the right place" button

    Video: intro to conformal geometric algebra (DON'T OVERTHINK)

    You're not doing arbitrary spinors
        Vector
            Line reflection passing through north pole = point pair with one at infinity = point / hyperplane reflection
                Arbitrary reflections = lines in disk plane = point pairs on horosphere = "circle" inversions
        Bivector
            Rotation at north pole = looks like nothing = translation = two concatenated reflections in hyperplanes
                Arbitrary rotation = point in disk plane = translation rotation?
        Trivector
            Transflection in plane? Eg dilation
            
        
*/

function initCga() {

    let tubeRadius = .014

    let unitCylinderGeo = new THREE.CylinderGeometry(tubeRadius, tubeRadius, 1.)
    unitCylinderGeo.translate(0., .5, 0.)
    
    let generalSphereGeometry = new THREE.SphereGeometry(tubeRadius * 3.)

    let nI = new THREE.Vector3(1., 1., 0.).normalize()
    let nO = new THREE.Vector3(-1., 1., 0.).normalize()
    //eg disk is at y = 1/sqrt2

    let wholeThing = new THREE.Object3D()
    thingsToRotate.push(wholeThing)
    scene.add(wholeThing)
    wholeThing.position.y -= 1.

    wholeThing.scale.setScalar(.6)
    var coneTopRadius = 1.8

    let homogeneousLinesMat = niceMat(.1)

    //------------KLEIN DISK STUFF
    {
        let diskPts = new THREE.Points(new THREE.Geometry(), new THREE.PointsMaterial({
            size:.015
        }))
        wholeThing.add(diskPts)
        let pts = diskPts.geometry.vertices
        let numPts = 200
        let mvPts = Array(numPts)
        for(let i = 0; i < numPts; ++i) {
            mvPts[i] = new Mv()

            let pt = new THREE.Vector3(9999.,0.,0.)
            while(pt.length() > 1. / Math.SQRT2 )
                pt.set(Math.random()-.5, 0., Math.random()-.5).multiplyScalar(Math.SQRT2)
            if(i===0)
                pt.set(0.,0.,0.)
            pt.y = nO.y
            pts.push(pt)

            mvPts[i].fromVector(pt)
        }

        let onHyperboloid = false
        bindButton("a",()=>{
            onHyperboloid = !onHyperboloid
        })
        updateFunctions.push(()=>{
            pts.forEach((pt,i) => {
                
                let dest = v1
                if (onHyperboloid) {
                    dest.copy(pt)
                    let normSquared = dest.y * dest.y - dest.x * dest.x - dest.z * dest.z
                    if(normSquared<0.)
                        console.error("hmm")
                    let norm = Math.sqrt( normSquared )
                    let desiredNorm = nO.y
                    dest.multiplyScalar(desiredNorm/norm)
                }
                else {
                    dest.copy(pt)
                    if(dest.y !== 0.)
                        dest.multiplyScalar(nO.y/dest.y)
                }

                pt.lerp(dest,.1)
            })
            diskPts.geometry.verticesNeedUpdate = true
        })
    }

    //-----------------transforming
    {
        let rotationAxisMesh = new THREE.Mesh(unitCylinderGeo,niceMat(.4))
        rotationAxisMesh.scale.y = tubeRadius * 8.
        wholeThing.add(rotationAxisMesh)
        let diskPlane = new THREE.Plane()
        updateFunctions.push(()=>{
            diskPlane.normal.copy(yUnit)
            diskPlane.constant = -nO.y
            diskPlane.applyMatrix4(wholeThing.matrix)

            let res = mouse.raycaster.ray.intersectPlane(diskPlane,v1)
            if(res === null){
                //hyperbolic translation
            }
            else {
                wholeThing.worldToLocal(v1)
                rotationAxisMesh.position.copy(v1)
            }
        })
    }

    //------------CONE
    {
        var coneDiagonalLength = coneTopRadius * Math.SQRT2
        var coneRadialSegments = 64
        let coneGeo = new THREE.ConeGeometry(coneTopRadius, coneTopRadius, coneRadialSegments, 1,true,TAU/4.)
        coneGeo.rotateX(Math.PI)
        coneGeo.translate(0., coneTopRadius / 2., 0.)
        let ourCone = new THREE.Mesh(coneGeo, niceMat(0.,{
            transparent:true,
            opacity:.8
        }))
        wholeThing.add(ourCone)
    }

    // let diskGeo = new THREE.CircleGeometry()

    //gee if only there were some system for applying transformations to planes
    // renderer.localClippingEnabled = true
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

    //-------------HOROSPHERE unclear if this is a good name
    {
        let horosphere = new THREE.Mesh(new THREE.CylinderGeometry(tubeRadius, tubeRadius, coneTopRadius * 20.), niceMat(.2))
        horosphere.geometry.rotateX(-TAU/4.)
        horosphere.position.copy(nO)
        wholeThing.add(horosphere)
    }

    //-------------DISK
    {
        let horosphere = new THREE.Mesh(new THREE.TorusGeometry(nO.y, tubeRadius, coneRadialSegments, 32), niceMat(.9))
        horosphere.geometry.rotateX(-TAU / 4.)
        horosphere.position.y = nO.y
        wholeThing.add(horosphere)
    }

    //-------------PARABOLA
    {
        class CustomCurve extends THREE.Curve {
            constructor() {
                super()
            }
            getPoint(t, optionalTarget = new THREE.Vector3()) {
                let posOnLine = (t-.5) * 2. //-1 to 1
                posOnLine *= Math.sqrt((coneDiagonalLength-1.)*2.)
                
                optionalTarget.set(0.,0.,0.)
                optionalTarget.add(nO)
                // let parabolaDistanceUpFront = optionalTarget.length()
                optionalTarget.addScaledVector(zUnit, posOnLine)
                optionalTarget.addScaledVector(nI, posOnLine * posOnLine / 2.)

                return optionalTarget
            }
        }

        let tubeMat = niceMat(.4)
        const path = new CustomCurve()
        const tubeGeo = new THREE.TubeGeometry(path, 127, tubeRadius, 7, false)
        const tubeMesh = new THREE.Mesh(tubeGeo, tubeMat)
        wholeThing.add(tubeMesh)
    }

    //------------------SPINE
    {
        let spineMat = niceMat(.5)
        var spine = new THREE.Mesh(unitCylinderGeo,spineMat)
        spine.scale.y = coneDiagonalLength
        spine.rotation.z = -TAU / 8.
        wholeThing.add(spine)

        var northPole = new THREE.Mesh(generalSphereGeometry,spineMat)
        northPole.position.copy(nI)
        wholeThing.add(northPole)
    }

    //----------------STUFF ON PLANES
    let intersectionsMat = niceMat(.8)
    function makePlaneAdornments(plane) {
        let horosphereIntersection = new THREE.Mesh(generalSphereGeometry, intersectionsMat)
        wholeThing.add(horosphereIntersection)

        let parabolaIntersection = new THREE.Mesh(generalSphereGeometry, intersectionsMat)
        wholeThing.add(parabolaIntersection)

        let boundaryIntersection = new THREE.Mesh(generalSphereGeometry, intersectionsMat)
        wholeThing.add(boundaryIntersection)

        let homogeneousLine = new THREE.Mesh(unitCylinderGeo, homogeneousLinesMat)
        homogeneousLine.scale.y = coneDiagonalLength
        wholeThing.add(homogeneousLine)

        let stereographicProjectionLine = new THREE.Mesh(unitCylinderGeo, homogeneousLinesMat)
        wholeThing.add(stereographicProjectionLine)

        let heightLine = new THREE.Mesh(unitCylinderGeo, homogeneousLinesMat)
        wholeThing.add(heightLine)

        plane.addToHorosphereIntersection = (diff) => {
            let horosphereIntersectionPlace = Math.tan(plane.rotation.x) * nO.length()
            horosphereIntersectionPlace -= diff

            plane.rotation.x = Math.atan(horosphereIntersectionPlace / nO.length())
        }

        updateFunctions.push(() => {
            let horosphereIntersectionPlace = Math.tan(plane.rotation.x) * nO.length()
            horosphereIntersection.position.copy(nO)
            horosphereIntersection.position.addScaledVector(zUnit, horosphereIntersectionPlace)

            parabolaIntersection.position.copy(horosphereIntersection.position)
            parabolaIntersection.position.addScaledVector(nI, horosphereIntersectionPlace * horosphereIntersectionPlace * .5)

            boundaryIntersection.position.copy(horosphereIntersection.position)
            boundaryIntersection.position.addScaledVector(nI, horosphereIntersectionPlace * horosphereIntersectionPlace * .5)
            boundaryIntersection.position.multiplyScalar(nO.y / boundaryIntersection.position.y)

            homogeneousLine.rotation.copy(spine.rotation)
            homogeneousLine.rotation.y = Math.atan2(-boundaryIntersection.position.z, boundaryIntersection.position.x) //yeah this could be wrong way around

            stereographicProjectionLine.position.copy(nI)
            stereographicProjectionLine.rotation.z = TAU / 4.
            stereographicProjectionLine.rotation.y = Math.atan2(horosphereIntersectionPlace, nO.y * 2.)
            stereographicProjectionLine.scale.y = nI.distanceTo(horosphereIntersection.position)

            heightLine.rotation.copy(spine.rotation)
            heightLine.position.copy(horosphereIntersection.position)
            heightLine.scale.y = parabolaIntersection.position.distanceTo(horosphereIntersection.position)
        })

        //make a bunch of 2D points in the disk. Aaaaand maybe make the disk able to become the hyperboloid
    }

    //----------------RECTS
    {
        let rectMat = niceMat(.6, {
            // clippingPlanes: [clippingPlane]
            transparent: true,
            opacity: .9
        })
        let rectHeight = 1.
        let rectWidth = coneDiagonalLength
        let rectGeo = new THREE.PlaneGeometry(rectWidth, rectHeight)
        rectGeo.translate(rectWidth * .5, rectHeight * .5, 0.)

        function cgaPlane() {
            let plane = new THREE.Mesh(rectGeo, rectMat)
            wholeThing.add(plane)

            plane.rotation.z = TAU / 8.
            plane.rotation.order = "ZYX"

            makePlaneAdornments(plane)

            return plane
        }

        let numRects = 1
        let rects = []
        for (let i = 0; i < numRects; ++i) {
            let plane = cgaPlane()
            plane.rotation.x = -TAU / 4.

            rects.push(plane)

            //we're cutting off the first and the last
            let angleSpacing = TAU / 2. / (numRects + 1)
            plane.rotation.x += angleSpacing * (1 + i)
            plane.scale.y = coneDiagonalLength / Math.cos(plane.rotation.x)
            //might be better if they were meeting the line in evenly-spaced places
        }

        // updateFunctions.push(() => {
        //     rects[0].rotation.x = 0.//TAU / 4. * Math.sin(.009*frameCount)
        // })

        bindButton("ArrowLeft",()=>{},"", ()=>{
            rects[0].rotation.x -= .01
        })
        bindButton("ArrowRight",()=>{},"", () => {
            rects[0].rotation.x += .01
        })

        bindButton(" ",()=>{},"control point on line",()=>{
            mouse.get2dDiff(v1)
            rects[0].addToHorosphereIntersection(v1.x)
        })

        //altering rotation.y will change it
    }
}

//backsolving is important
//an annoying thing is working out, on paper, in front of your text editor, "what is the value of this thing?"
//even though it's there on the screen!