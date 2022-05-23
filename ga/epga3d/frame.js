function orthoFrames2Versor(B, A, delta: float = 1e-3, det=None) {
    
    let delta = .001
    /*
    Determines versor for two frames related by an orthogonal transform
    Based on :cite:`ctz-frames,fontijne-reconstructing`.
    This works in Euclidean spaces and, under special
    circumstances in other signatures. See :cite:`ctz-frames` for
    limitations/details.
    Parameters
    -----------
    B : list of vectors, or clifford.Frame
        the set of  vectors after the transform, and homogenzation.
        ie ``B = (B/B|einf)``
    A : list of vectors, or clifford.Frame
        the set of  vectors before the transform. If `None` we assume A is
        the basis given by ``B.layout.basis_vectors_lst``.
    delta : float
        Tolerance for reflection/rotation determination. If the normalized
        distance between A[i] and B[i] is larger than delta, we use
        reflection, otherwise use rotation.
    eps: float
        Tolerance on spinor determination. if pseudoscalar of A differs
        in magnitude from pseudoscalar of B by eps, then we have spinor.
        If `None`, use the `clifford.eps()` global eps.
    det : [+1,-1,None]
        The sign of the determinant of the versor, if known. If it is
        known a-priori that the versor is a rotation vs a reflection, this
        fact might be needed to correctly append an additional reflection
        which leaves transformed points invariant. See 4.6.3 of
        :cite:`fontijne-reconstructing`.
    remove_scaling : bool
        Remove the effects of homogenzation from frame B. This is needed
        if you are working in CGA, but the input data is given in the
        original space. See :func:`~clifford.tools.omoh` for more. See 4.6.2 of
        :cite:`fontijne-reconstructing`.
    Returns
    ---------
    R : clifford.MultiVector
        the Versor.
    rs : list of clifford.MultiVector
        ordered list of found reflectors/rotors.
    */

    // Checking and Setup
    if (A is None)
        // assume we have orthonormal initial frame
        A = B[0].layout.basis_vectors_lst

    // make copy of original frames, so we can rotate A
    A = A[:]
    B = B[:]

    if( A.length != B.length )
        console.error("bad lengths")
    let N = A.length

    let eps = .0001

    // Determine if we have a spinor
    let spinor = False
    // store pseudoscalar of frame B, in case known det (see end)
    try:
        B = Frame(B)
        B_En = B.En

    // Determine and remove scaling factors caused by homogenization
    let remove_scaling = false
    // if remove_scaling:
    //     lam = omoh(A, B)
    //     B = Frame([B[k] * lam[k] for k in range(N)])

    try:
        // compute ratio of volumes for each frame. take Nth root
        A = Frame(A[:])
        B = Frame(B[:])
        alpha = abs(B.En / A.En) ** (1. / N)

        if abs(alpha - 1) > eps:
            spinor = True
            // we have a spinor, remove the scaling (add it back in at the end)
            B = [b / alpha for b in B]
    except Exception:
        // probably  A and B are not pure vector correspondence
        // whatever,  it might still work
        pass

    // Find the Versor

    // store each reflector/rotor in a list, make full versor at the
    // end of the loop
    r_list = []

    for(let k = 0; k < N; ++k) {
        a, b = A[0], B[0]
        r = a - b  // determine reflector
        if abs(b ** 2) > eps:
            d = abs(r ** 2) / abs(b ** 2)  // conditional rotation tolerance
        else:
            // probably b is a null vector, make our best guess for tol!
            d = abs(r ** 2)
        if d >= delta:
            // reflection  part
            r_list.append(r)
            A = A[1:]  // remove current vector pair
            B = B[1:]
            for j in range(len(A)):
                A[j] = -r * A[j] * r.inv()
        else:
            //  rotation part
            // if k==N:                // see paper for explanation
            //     break

            R = b * (a + b)
            if abs(R) > eps:  // abs(R) can be <eps in null space
                r_list.append(R)  // append to our list
            A = A[1:]  // remove current vector pair
            B = B[1:]
            for j in range(len(A)):
                A[j] = R * A[j] * R.inv()
    }

    R = reduce(gp, r_list[::-1])

    // if det is known a priori check to see if it's correct, if not add
    // an extra reflection which leaves all points in B invariant
    if det is not None:
        I = R.pseudoScalar
        our_det = (R * I * ~R * I.inv())(0)
        if sign(float(our_det)) != det:
            R = B_En.dual() * R

    if abs(R) < eps:
        warn('abs(R)<eps. likely to be inaccurate')
    R = R / abs(R)

    if spinor:
        R = R * sqrt(alpha)

    return R, r_list