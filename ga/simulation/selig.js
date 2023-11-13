function initSeligMatrices() {

    IdMat = math.matrix([
        [math.complex( 1., 0.), math.complex( 0., 0.), math.complex( 0., 0.), math.complex( 0., 0.),],
        [math.complex( 0., 0.), math.complex( 1., 0.), math.complex( 0., 0.), math.complex( 0., 0.),],
        [math.complex( 0., 0.), math.complex( 0., 0.), math.complex( 1., 0.), math.complex( 0., 0.),],
        [math.complex( 0., 0.), math.complex( 0., 0.), math.complex( 0., 0.), math.complex( 1., 0.),]])

    cm0 = IdMat.clone()
    cm1 = IdMat.clone()
    cm2 = IdMat.clone()
        

    e1Mat = math.matrix([
        [math.complex( 0., 0.), math.complex( 1., 0.), math.complex( 0., 0.), math.complex( 0., 0.),],
        [math.complex( 1., 0.), math.complex( 0., 0.), math.complex( 0., 0.), math.complex( 0., 0.),],
        [math.complex( 0., 0.), math.complex( 0., 0.), math.complex( 0., 0.), math.complex(-1., 0.),],
        [math.complex( 0., 0.), math.complex( 0., 0.), math.complex(-1., 0.), math.complex( 0., 0.),]])
    e2Mat = math.matrix([
        [math.complex( 0., 0.), math.complex( 0.,-1.), math.complex( 0., 0.), math.complex( 0., 0.),],
        [math.complex( 0., 1.), math.complex( 0., 0.), math.complex( 0., 0.), math.complex( 0., 0.),],
        [math.complex( 0., 0.), math.complex( 0., 0.), math.complex( 0., 0.), math.complex( 0., 1.),],
        [math.complex( 0., 0.), math.complex( 0., 0.), math.complex( 0.,-1.), math.complex( 0., 0.),]])
    e3Mat = math.matrix([
        [math.complex( 1., 0.), math.complex( 0., 0.), math.complex( 0., 0.), math.complex( 0., 0.),],
        [math.complex( 0., 0.), math.complex(-1., 0.), math.complex( 0., 0.), math.complex( 0., 0.),],
        [math.complex( 0., 0.), math.complex( 0., 0.), math.complex(-1., 0.), math.complex( 0., 0.),],
        [math.complex( 0., 0.), math.complex( 0., 0.), math.complex( 0., 0.), math.complex( 1., 0.),]])
    e4Mat = math.matrix([
        [math.complex( 0., 0.), math.complex( 0., 0.), math.complex( 1., 0.), math.complex( 0., 0.),],
        [math.complex( 0., 0.), math.complex( 0., 0.), math.complex( 0., 0.), math.complex( 1., 0.),],
        [math.complex( 1., 0.), math.complex( 0., 0.), math.complex( 0., 0.), math.complex( 0., 0.),],
        [math.complex( 0., 0.), math.complex( 1., 0.), math.complex( 0., 0.), math.complex( 0., 0.),]])
    e5Mat = math.matrix([
        [math.complex( 0., 0.), math.complex( 0., 0.), math.complex(-1., 0.), math.complex( 0., 0.),],
        [math.complex( 0., 0.), math.complex( 0., 0.), math.complex( 0., 0.), math.complex(-1., 0.),],
        [math.complex( 1., 0.), math.complex( 0., 0.), math.complex( 0., 0.), math.complex( 0., 0.),],
        [math.complex( 0., 0.), math.complex( 1., 0.), math.complex( 0., 0.), math.complex( 0., 0.),]])


    e12Mat = math.matrix([
        [math.complex( 0., 1.), math.complex( 0., 0.), math.complex( 0., 0.), math.complex( 0., 0.),],
        [math.complex( 0., 0.), math.complex( 0.,-1.), math.complex( 0., 0.), math.complex( 0., 0.),],
        [math.complex( 0., 0.), math.complex( 0., 0.), math.complex( 0., 1.), math.complex( 0., 0.),],
        [math.complex( 0., 0.), math.complex( 0., 0.), math.complex( 0., 0.), math.complex( 0.,-1.),]])
    e13Mat = math.matrix([
        [math.complex( 0., 0.), math.complex(-1., 0.), math.complex( 0., 0.), math.complex( 0., 0.),],
        [math.complex( 1., 0.), math.complex( 0., 0.), math.complex( 0., 0.), math.complex( 0., 0.),],
        [math.complex( 0., 0.), math.complex( 0., 0.), math.complex( 0., 0.), math.complex(-1., 0.),],
        [math.complex( 0., 0.), math.complex( 0., 0.), math.complex( 1., 0.), math.complex( 0., 0.),]])
    e14Mat = math.matrix([
        [math.complex( 0., 0.), math.complex( 0., 0.), math.complex( 0., 0.), math.complex( 1., 0.),],
        [math.complex( 0., 0.), math.complex( 0., 0.), math.complex( 1., 0.), math.complex( 0., 0.),],
        [math.complex( 0., 0.), math.complex(-1., 0.), math.complex( 0., 0.), math.complex( 0., 0.),],
        [math.complex(-1., 0.), math.complex( 0., 0.), math.complex( 0., 0.), math.complex( 0., 0.),]])
    e15Mat = math.matrix([
        [math.complex( 0., 0.), math.complex( 0., 0.), math.complex( 0., 0.), math.complex(-1., 0.),],
        [math.complex( 0., 0.), math.complex( 0., 0.), math.complex(-1., 0.), math.complex( 0., 0.),],
        [math.complex( 0., 0.), math.complex(-1., 0.), math.complex( 0., 0.), math.complex( 0., 0.),],
        [math.complex(-1., 0.), math.complex( 0., 0.), math.complex( 0., 0.), math.complex( 0., 0.),]])
    e23Mat = math.matrix([
        [math.complex( 0., 0.), math.complex( 0., 1.), math.complex( 0., 0.), math.complex( 0., 0.),],
        [math.complex( 0., 1.), math.complex( 0., 0.), math.complex( 0., 0.), math.complex( 0., 0.),],
        [math.complex( 0., 0.), math.complex( 0., 0.), math.complex( 0., 0.), math.complex( 0., 1.),],
        [math.complex( 0., 0.), math.complex( 0., 0.), math.complex( 0., 1.), math.complex( 0., 0.),]])
    e24Mat = math.matrix([
        [math.complex( 0., 0.), math.complex( 0., 0.), math.complex( 0., 0.), math.complex( 0.,-1.),],
        [math.complex( 0., 0.), math.complex( 0., 0.), math.complex( 0., 1.), math.complex( 0., 0.),],
        [math.complex( 0., 0.), math.complex( 0., 1.), math.complex( 0., 0.), math.complex( 0., 0.),],
        [math.complex( 0.,-1.), math.complex( 0., 0.), math.complex( 0., 0.), math.complex( 0., 0.),]])
    e25Mat = math.matrix([
        [math.complex( 0., 0.), math.complex( 0., 0.), math.complex( 0., 0.), math.complex( 0., 1.),],
        [math.complex( 0., 0.), math.complex( 0., 0.), math.complex( 0.,-1.), math.complex( 0., 0.),],
        [math.complex( 0., 0.), math.complex( 0., 1.), math.complex( 0., 0.), math.complex( 0., 0.),],
        [math.complex( 0.,-1.), math.complex( 0., 0.), math.complex( 0., 0.), math.complex( 0., 0.),]])
    e34Mat = math.matrix([
        [math.complex( 0., 0.), math.complex( 0., 0.), math.complex( 1., 0.), math.complex( 0., 0.),],
        [math.complex( 0., 0.), math.complex( 0., 0.), math.complex( 0., 0.), math.complex(-1., 0.),],
        [math.complex(-1., 0.), math.complex( 0., 0.), math.complex( 0., 0.), math.complex( 0., 0.),],
        [math.complex( 0., 0.), math.complex( 1., 0.), math.complex( 0., 0.), math.complex( 0., 0.),]])
    e35Mat = math.matrix([
        [math.complex( 0., 0.), math.complex( 0., 0.), math.complex(-1., 0.), math.complex( 0., 0.),],
        [math.complex( 0., 0.), math.complex( 0., 0.), math.complex( 0., 0.), math.complex( 1., 0.),],
        [math.complex(-1., 0.), math.complex( 0., 0.), math.complex( 0., 0.), math.complex( 0., 0.),],
        [math.complex( 0., 0.), math.complex( 1., 0.), math.complex( 0., 0.), math.complex( 0., 0.),]])
    e45Mat = math.matrix([
        [math.complex( 1., 0.), math.complex( 0., 0.), math.complex( 0., 0.), math.complex( 0., 0.),],
        [math.complex( 0., 0.), math.complex( 1., 0.), math.complex( 0., 0.), math.complex( 0., 0.),],
        [math.complex( 0., 0.), math.complex( 0., 0.), math.complex(-1., 0.), math.complex( 0., 0.),],
        [math.complex( 0., 0.), math.complex( 0., 0.), math.complex( 0., 0.), math.complex(-1., 0.),]])


    e123Mat = math.matrix([
        [math.complex( 0., 1.), math.complex( 0., 0.), math.complex( 0., 0.), math.complex( 0., 0.),],
        [math.complex( 0., 0.), math.complex( 0., 1.), math.complex( 0., 0.), math.complex( 0., 0.),],
        [math.complex( 0., 0.), math.complex( 0., 0.), math.complex( 0.,-1.), math.complex( 0., 0.),],
        [math.complex( 0., 0.), math.complex( 0., 0.), math.complex( 0., 0.), math.complex( 0.,-1.),]])
    e124Mat = math.matrix([
        [math.complex( 0., 0.), math.complex( 0., 0.), math.complex( 0., 1.), math.complex( 0., 0.),],
        [math.complex( 0., 0.), math.complex( 0., 0.), math.complex( 0., 0.), math.complex( 0.,-1.),],
        [math.complex( 0., 1.), math.complex( 0., 0.), math.complex( 0., 0.), math.complex( 0., 0.),],
        [math.complex( 0., 0.), math.complex( 0.,-1.), math.complex( 0., 0.), math.complex( 0., 0.),]])
    e125Mat = math.matrix([
        [math.complex( 0., 0.), math.complex( 0., 0.), math.complex( 0.,-1.), math.complex( 0., 0.),],
        [math.complex( 0., 0.), math.complex( 0., 0.), math.complex( 0., 0.), math.complex( 0., 1.),],
        [math.complex( 0., 1.), math.complex( 0., 0.), math.complex( 0., 0.), math.complex( 0., 0.),],
        [math.complex( 0., 0.), math.complex( 0.,-1.), math.complex( 0., 0.), math.complex( 0., 0.),]])
    e134Mat = math.matrix([
        [math.complex( 0., 0.), math.complex( 0., 0.), math.complex( 0., 0.), math.complex(-1., 0.),],
        [math.complex( 0., 0.), math.complex( 0., 0.), math.complex( 1., 0.), math.complex( 0., 0.),],
        [math.complex( 0., 0.), math.complex(-1., 0.), math.complex( 0., 0.), math.complex( 0., 0.),],
        [math.complex( 1., 0.), math.complex( 0., 0.), math.complex( 0., 0.), math.complex( 0., 0.),]])
    e135Mat = math.matrix([
        [math.complex( 0., 0.), math.complex( 0., 0.), math.complex( 0., 0.), math.complex( 1., 0.),],
        [math.complex( 0., 0.), math.complex( 0., 0.), math.complex(-1., 0.), math.complex( 0., 0.),],
        [math.complex( 0., 0.), math.complex(-1., 0.), math.complex( 0., 0.), math.complex( 0., 0.),],
        [math.complex( 1., 0.), math.complex( 0., 0.), math.complex( 0., 0.), math.complex( 0., 0.),]])
    e145Mat = math.matrix([
        [math.complex( 0., 0.), math.complex( 1., 0.), math.complex( 0., 0.), math.complex( 0., 0.),],
        [math.complex( 1., 0.), math.complex( 0., 0.), math.complex( 0., 0.), math.complex( 0., 0.),],
        [math.complex( 0., 0.), math.complex( 0., 0.), math.complex( 0., 0.), math.complex( 1., 0.),],
        [math.complex( 0., 0.), math.complex( 0., 0.), math.complex( 1., 0.), math.complex( 0., 0.),]])
    e234Mat = math.matrix([
        [math.complex( 0., 0.), math.complex( 0., 0.), math.complex( 0., 0.), math.complex( 0., 1.),],
        [math.complex( 0., 0.), math.complex( 0., 0.), math.complex( 0., 1.), math.complex( 0., 0.),],
        [math.complex( 0., 0.), math.complex( 0., 1.), math.complex( 0., 0.), math.complex( 0., 0.),],
        [math.complex( 0., 1.), math.complex( 0., 0.), math.complex( 0., 0.), math.complex( 0., 0.),]])
    e235Mat = math.matrix([
        [math.complex( 0., 0.), math.complex( 0., 0.), math.complex( 0., 0.), math.complex( 0.,-1.),],
        [math.complex( 0., 0.), math.complex( 0., 0.), math.complex( 0.,-1.), math.complex( 0., 0.),],
        [math.complex( 0., 0.), math.complex( 0., 1.), math.complex( 0., 0.), math.complex( 0., 0.),],
        [math.complex( 0., 1.), math.complex( 0., 0.), math.complex( 0., 0.), math.complex( 0., 0.),]])
    e245Mat = math.matrix([
        [math.complex( 0., 0.), math.complex( 0.,-1.), math.complex( 0., 0.), math.complex( 0., 0.),],
        [math.complex( 0., 1.), math.complex( 0., 0.), math.complex( 0., 0.), math.complex( 0., 0.),],
        [math.complex( 0., 0.), math.complex( 0., 0.), math.complex( 0., 0.), math.complex( 0.,-1.),],
        [math.complex( 0., 0.), math.complex( 0., 0.), math.complex( 0., 1.), math.complex( 0., 0.),]])
    e345Mat = math.matrix([
        [math.complex( 1., 0.), math.complex( 0., 0.), math.complex( 0., 0.), math.complex( 0., 0.),],
        [math.complex( 0., 0.), math.complex(-1., 0.), math.complex( 0., 0.), math.complex( 0., 0.),],
        [math.complex( 0., 0.), math.complex( 0., 0.), math.complex( 1., 0.), math.complex( 0., 0.),],
        [math.complex( 0., 0.), math.complex( 0., 0.), math.complex( 0., 0.), math.complex(-1., 0.),]])


    e1234Mat = math.matrix([
        [math.complex( 0., 0.), math.complex( 0., 0.), math.complex( 0., 1.), math.complex( 0., 0.),],
        [math.complex( 0., 0.), math.complex( 0., 0.), math.complex( 0., 0.), math.complex( 0., 1.),],
        [math.complex( 0.,-1.), math.complex( 0., 0.), math.complex( 0., 0.), math.complex( 0., 0.),],
        [math.complex( 0., 0.), math.complex( 0.,-1.), math.complex( 0., 0.), math.complex( 0., 0.),]])
    e1235Mat = math.matrix([
        [math.complex( 0., 0.), math.complex( 0., 0.), math.complex( 0.,-1.), math.complex( 0., 0.),],
        [math.complex( 0., 0.), math.complex( 0., 0.), math.complex( 0., 0.), math.complex( 0.,-1.),],
        [math.complex( 0.,-1.), math.complex( 0., 0.), math.complex( 0., 0.), math.complex( 0., 0.),],
        [math.complex( 0., 0.), math.complex( 0.,-1.), math.complex( 0., 0.), math.complex( 0., 0.),]])
    e1245Mat = math.matrix([
        [math.complex( 0., 1.), math.complex( 0., 0.), math.complex( 0., 0.), math.complex( 0., 0.),],
        [math.complex( 0., 0.), math.complex( 0.,-1.), math.complex( 0., 0.), math.complex( 0., 0.),],
        [math.complex( 0., 0.), math.complex( 0., 0.), math.complex( 0.,-1.), math.complex( 0., 0.),],
        [math.complex( 0., 0.), math.complex( 0., 0.), math.complex( 0., 0.), math.complex( 0., 1.),]])
    e1345Mat = math.matrix([
        [math.complex( 0., 0.), math.complex(-1., 0.), math.complex( 0., 0.), math.complex( 0., 0.),],
        [math.complex( 1., 0.), math.complex( 0., 0.), math.complex( 0., 0.), math.complex( 0., 0.),],
        [math.complex( 0., 0.), math.complex( 0., 0.), math.complex( 0., 0.), math.complex( 1., 0.),],
        [math.complex( 0., 0.), math.complex( 0., 0.), math.complex(-1., 0.), math.complex( 0., 0.),]])
    e2345Mat = math.matrix([
        [math.complex( 0., 0.), math.complex( 0., 1.), math.complex( 0., 0.), math.complex( 0., 0.),],
        [math.complex( 0., 1.), math.complex( 0., 0.), math.complex( 0., 0.), math.complex( 0., 0.),],
        [math.complex( 0., 0.), math.complex( 0., 0.), math.complex( 0., 0.), math.complex( 0.,-1.),],
        [math.complex( 0., 0.), math.complex( 0., 0.), math.complex( 0.,-1.), math.complex( 0., 0.),]])


    e12345Mat = math.matrix([
        [math.complex( 0., 1.), math.complex( 0., 0.), math.complex( 0., 0.), math.complex( 0., 0.),],
        [math.complex( 0., 0.), math.complex( 0., 1.), math.complex( 0., 0.), math.complex( 0., 0.),],
        [math.complex( 0., 0.), math.complex( 0., 0.), math.complex( 0., 1.), math.complex( 0., 0.),],
        [math.complex( 0., 0.), math.complex( 0., 0.), math.complex( 0., 0.), math.complex( 0., 1.),]])


    seligMatrices = [ IdMat, e1Mat, e2Mat, e3Mat, e4Mat, e5Mat, e12Mat, e13Mat, e14Mat, e15Mat, e23Mat, e24Mat, e25Mat, e34Mat, e35Mat, e45Mat, e123Mat, e124Mat, e125Mat, e134Mat, e135Mat, e145Mat, e234Mat, e235Mat, e245Mat, e345Mat, e1234Mat, e1235Mat, e1245Mat, e1345Mat, e2345Mat, e12345Mat ]
}