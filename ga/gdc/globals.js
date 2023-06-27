function initGlobals() {
    TAU = Math.PI * 2.

    scene = new THREE.Scene()
    renderer = new THREE.WebGLRenderer({ antialias: true })
    camera = new THREE.PerspectiveCamera(50, window.innerWidth / window.innerHeight, 0.1, 10)
    
    log = console.log

    controllers = []

    zUnit = new THREE.Vector3(0, 0, 1)
    yUnit = new THREE.Vector3(0, 1, 0)
    xUnit = new THREE.Vector3(1, 0, 0)

    zeroVector = new THREE.Vector3(0., 0., 0.)
    zeroMatrix = new THREE.Matrix4().set(0., 0., 0., 0., 0., 0., 0., 0., 0., 0., 0., 0., 0., 0., 0., 0.)

    clock = new THREE.Clock(true)

    v1 = new THREE.Vector3()
    v2 = new THREE.Vector3()
    v3 = new THREE.Vector3()
    v4 = new THREE.Vector3()
    m1 = new THREE.Matrix4()
    m2 = new THREE.Matrix4()
    q1 = new THREE.Quaternion()
    q2 = new THREE.Quaternion()
    pl = new THREE.Plane()

    unchangingUnitSquareGeometry = new THREE.PlaneGeometry(1., 1.)

    mouseRay = e12.clone()
}