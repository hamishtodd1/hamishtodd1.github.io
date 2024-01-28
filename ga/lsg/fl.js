let flVerbose = 
`mulDq(b, target) {

    if (target === undefined)
        target = new Fl()

    target[0] = + b[0] * this[0] - b[1] * this[1] - b[2] * this[2] - b[3] * this[3] + b[4] * this[4] + b[5] * this[5] + b[6] * this[6] + b[7] * this[7];
    target[1] = + b[0] * this[1] - b[4] * this[2] + b[5] * this[3] - b[6] * this[7];
    target[2] = + b[4] * this[1] + b[0] * this[2] - b[6] * this[3] - b[5] * this[7];
    target[3] = - b[5] * this[1] + b[6] * this[2] + b[0] * this[3] - b[4] * this[7];

    target[4] = - b[4] * this[0] + b[2] * this[1] - b[1] * this[2] + b[7] * this[3] + b[0] * this[4] + b[6] * this[5] - b[5] * this[6] + b[3] * this[7];
    target[5] = - b[5] * this[0] - b[3] * this[1] + b[7] * this[2] + b[1] * this[3] - b[6] * this[4] + b[0] * this[5] + b[4] * this[6] + b[2] * this[7];
    target[6] = - b[6] * this[0] + b[7] * this[1] + b[3] * this[2] - b[2] * this[3] + b[5] * this[4] - b[4] * this[5] + b[0] * this[6] + b[1] * this[7];
    target[7] = + b[6] * this[1] + b[5] * this[2] + b[4] * this[3] + b[0] * this[7];

    return target;
}

meetDq(b, target) {

    if (target === undefined)
        target = new Fl()

    target[0] = + b[0] * this[0];
    target[1] = + b[0] * this[1];
    target[2] = + b[0] * this[2];
    target[3] = + b[0] * this[3];

    target[4] = - b[4] * this[0] + b[2] * this[1] - b[1] * this[2] + b[0] * this[4];
    target[5] = - b[5] * this[0] - b[3] * this[1] + b[1] * this[3] + b[0] * this[5];
    target[6] = - b[6] * this[0] + b[3] * this[2] - b[2] * this[3] + b[0] * this[6];
    target[7] = + b[6] * this[1] + b[5] * this[2] + b[4] * this[3] + b[0] * this[7];

    return target;
}

innerDq(b, target) {

    if (target === undefined)
        target = new Fl()

    target[0] = + b[0] * this[0] - b[1] * this[1] - b[2] * this[2] - b[3] * this[3] + b[4] * this[4] + b[5] * this[5] + b[6] * this[6] + b[7] * this[7];
    target[1] = + b[0] * this[1] - b[4] * this[2] + b[5] * this[3] - b[6] * this[7];
    target[2] = + b[4] * this[1] + b[0] * this[2] - b[6] * this[3] - b[5] * this[7];
    target[3] = - b[5] * this[1] + b[6] * this[2] + b[0] * this[3] - b[4] * this[7];

    target[4] = + b[7] * this[3] + b[0] * this[4];
    target[5] = + b[7] * this[2] + b[0] * this[5];
    target[6] = + b[7] * this[1] + b[0] * this[6];
    target[7] = + b[0] * this[7];

    return target;
}

mulFl(b, target) {

    if (target === undefined)
        target = new Dq()

    target[0] = + b[1] * this[1] + b[2] * this[2] + b[3] * this[3] - b[7] * this[7];

    target[1] = + b[1] * this[0] - b[0] * this[1] - b[4] * this[2] + b[5] * this[3] - b[2] * this[4] + b[3] * this[5] + b[7] * this[6] - b[6] * this[7];
    target[2] = + b[2] * this[0] + b[4] * this[1] - b[0] * this[2] - b[6] * this[3] + b[1] * this[4] + b[7] * this[5] - b[3] * this[6] - b[5] * this[7];
    target[3] = + b[3] * this[0] - b[5] * this[1] + b[6] * this[2] - b[0] * this[3] + b[7] * this[4] - b[1] * this[5] + b[2] * this[6] - b[4] * this[7];
    target[4] = + b[2] * this[1] - b[1] * this[2] + b[7] * this[3] + b[3] * this[7];
    target[5] = - b[3] * this[1] + b[7] * this[2] + b[1] * this[3] + b[2] * this[7];
    target[6] = + b[7] * this[1] + b[3] * this[2] - b[2] * this[3] + b[1] * this[7];

    target[7] = + b[7] * this[0] + b[6] * this[1] + b[5] * this[2] + b[4] * this[3] - b[3] * this[4] - b[2] * this[5] - b[1] * this[6] - b[0] * this[7];

    return target;
}

meetFl(b, target) {

    if (target === undefined)
        target = new Dq()

    target[0] = 0.;

    target[1] = + b[1] * this[0] - b[0] * this[1];
    target[2] = + b[2] * this[0] - b[0] * this[2];
    target[3] = + b[3] * this[0] - b[0] * this[3];
    target[4] = + b[2] * this[1] - b[1] * this[2];
    target[5] = - b[3] * this[1] + b[1] * this[3];
    target[6] = + b[3] * this[2] - b[2] * this[3];

    target[7] = + b[7] * this[0] + b[6] * this[1] + b[5] * this[2] + b[4] * this[3] - b[3] * this[4] - b[2] * this[5] - b[1] * this[6] - b[0] * this[7];

    return target;
}

innerFl(b, target) {

    if (target === undefined)
        target = new Dq()

    target[0] = + b[1] * this[1] + b[2] * this[2] + b[3] * this[3] - b[7] * this[7];

    target[1] = - b[4] * this[2] + b[5] * this[3] - b[2] * this[4] + b[3] * this[5];
    target[2] = + b[4] * this[1] - b[6] * this[3] + b[1] * this[4] - b[3] * this[6];
    target[3] = - b[5] * this[1] + b[6] * this[2] - b[1] * this[5] + b[2] * this[6];
    target[4] = + b[7] * this[3] + b[3] * this[7];
    target[5] = + b[7] * this[2] + b[2] * this[7];
    target[6] = + b[7] * this[1] + b[1] * this[7];

    target[7] = 0.;

    return target
}

getReverse(target) {
    if (target === undefined)
        target = new Fl()

    target[0] = this[0];
    target[1] = this[1];
    target[2] = this[2];
    target[3] = this[3];

    target[4] = -this[4];
    target[5] = -this[5];
    target[6] = -this[6];
    target[7] = -this[7];

    return target
}

getDual(target) {
    if (target === undefined)
        target = new Fl()

    target[0] = this[7];
    target[1] = this[6];
    target[2] = this[5];
    target[3] = this[4];

    target[4] = -this[3];
    target[5] = -this[2];
    target[6] = -this[1];
    target[7] = -this[0];

    return target
}

joinPt(b, target) {

    if (target === undefined)
        target = new Dq()

	target[7] = 0.;
    
    target[6] = + this[6] * b[7] - this[7] * b[6];
    target[5] = + this[5] * b[7] - this[7] * b[5];
    target[4] = + this[4] * b[7] - this[7] * b[4];
    target[3] = + this[5] * b[6] - this[6] * b[5];
    target[2] = - this[4] * b[6] + this[6] * b[4];
    target[1] = + this[4] * b[5] - this[5] * b[4];
    
    target[0] = + this[0] * b[7] + this[1] * b[6] + this[2] * b[5] - this[3] * b[4];

    return target;
}
`
