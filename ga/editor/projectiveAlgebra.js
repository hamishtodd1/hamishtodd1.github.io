let zeroMultivector = new Float32Array(8)
MathematicalMultivector = () => new Float32Array([1., 0., 0., 0., 0., 0., 0., 0.,])

function projectiveConjugate (a) {
  PGA2D res;
  res[0]=a[0];
  res[1]=-a[1];
  res[2]=-a[2];
  res[3]=-a[3];
  res[4]=-a[4];
  res[5]=-a[5];
  res[6]=-a[6];
  res[7]=a[7]; //eh?
  return res;
};

function sum(a,b)
{
  PGA2D res;
    res[0] = a[0]+b[0];
    res[1] = a[1]+b[1];
    res[2] = a[2]+b[2];
    res[3] = a[3]+b[3];
    res[4] = a[4]+b[4];
    res[5] = a[5]+b[5];
    res[6] = a[6]+b[6];
    res[7] = a[7]+b[7];
  return res;
};

function regressiveProduct(a,b)
{
  res[7]=a[7]*b[7];
  res[6]=a[6]*b[7]+a[7]*b[6];
  res[5]=a[5]*b[7]+a[7]*b[5];
  res[4]=a[4]*b[7]+a[7]*b[4];
  res[3]=a[3]*b[7]+a[5]*b[6]-a[6]*b[5]+a[7]*b[3];
  res[2]=a[2]*b[7]-a[4]*b[6]+a[6]*b[4]+a[7]*b[2];
  res[1]=a[1]*b[7]+a[4]*b[5]-a[5]*b[4]+a[7]*b[1];
  res[0]=a[0]*b[7]+a[1]*b[6]+a[2]*b[5]+a[3]*b[4]+a[4]*b[3]+a[5]*b[2]+a[6]*b[1]+a[7]*b[0];
  return res;
}

//maybe this is in the bottom half of the ambient space?
function dualize(a) {
  PGA2D res;
  res[0]=a[7];
  res[1]=a[6];
  res[2]=a[5];
  res[3]=a[4];
  res[4]=a[3];
  res[5]=a[2];
  res[6]=a[1];
  res[7]=a[0];
  return res;
}

function projectiveGeometricProduct(a,b)
{
  PGA2D res;
  res[0]=b[0]*a[0]+b[2]*a[2]+b[3]*a[3]-b[6]*a[6];
  res[1]=b[1]*a[0]+b[0]*a[1]-b[4]*a[2]+b[5]*a[3]+b[2]*a[4]-b[3]*a[5]-b[7]*a[6]-b[6]*a[7];
  res[2]=b[2]*a[0]+b[0]*a[2]-b[6]*a[3]+b[3]*a[6];
  res[3]=b[3]*a[0]+b[6]*a[2]+b[0]*a[3]-b[2]*a[6];
  res[4]=b[4]*a[0]+b[2]*a[1]-b[1]*a[2]+b[7]*a[3]+b[0]*a[4]+b[6]*a[5]-b[5]*a[6]+b[3]*a[7];
  res[5]=b[5]*a[0]-b[3]*a[1]+b[7]*a[2]+b[1]*a[3]-b[6]*a[4]+b[0]*a[5]+b[4]*a[6]+b[2]*a[7];
  res[6]=b[6]*a[0]+b[3]*a[2]-b[2]*a[3]+b[0]*a[6];
  res[7]=b[7]*a[0]+b[6]*a[1]+b[5]*a[2]+b[4]*a[3]+b[3]*a[4]+b[2]*a[5]+b[1]*a[6]+b[0]*a[7];
  return res;
};

outer(const PGA2D &a, const PGA2D &b) {
  PGA2D res;
  res[0]=b[0]*a[0];
  res[1]=b[1]*a[0]+b[0]*a[1];
  res[2]=b[2]*a[0]+b[0]*a[2];
  res[3]=b[3]*a[0]+b[0]*a[3];
  res[4]=b[4]*a[0]+b[2]*a[1]-b[1]*a[2]+b[0]*a[4];
  res[5]=b[5]*a[0]-b[3]*a[1]+b[1]*a[3]+b[0]*a[5];
  res[6]=b[6]*a[0]+b[3]*a[2]-b[2]*a[3]+b[0]*a[6];
  res[7]=b[7]*a[0]+b[6]*a[1]+b[5]*a[2]+b[4]*a[3]+b[3]*a[4]+b[2]*a[5]+b[1]*a[6]+b[0]*a[7];
  return res;
};


inner(const PGA2D &a, const PGA2D &b) {
  PGA2D res;
  res[0]=b[0]*a[0]+b[2]*a[2]+b[3]*a[3]-b[6]*a[6];
  res[1]=b[1]*a[0]+b[0]*a[1]-b[4]*a[2]+b[5]*a[3]+b[2]*a[4]-b[3]*a[5]-b[7]*a[6]-b[6]*a[7];
  res[2]=b[2]*a[0]+b[0]*a[2]-b[6]*a[3]+b[3]*a[6];
  res[3]=b[3]*a[0]+b[6]*a[2]+b[0]*a[3]-b[2]*a[6];
  res[4]=b[4]*a[0]+b[7]*a[3]+b[0]*a[4]+b[3]*a[7];
  res[5]=b[5]*a[0]+b[7]*a[2]+b[0]*a[5]+b[2]*a[7];
  res[6]=b[6]*a[0]+b[0]*a[6];
  res[7]=b[7]*a[0]+b[0]*a[7];
  return res;
};

/*

//***********************
// PGA2D.Sub : res = a - b 
// Multivector subtraction
//***********************
inline PGA2D operator - (const PGA2D &a, const PGA2D &b) {
  PGA2D res;
      res[0] = a[0]-b[0];
    res[1] = a[1]-b[1];
    res[2] = a[2]-b[2];
    res[3] = a[3]-b[3];
    res[4] = a[4]-b[4];
    res[5] = a[5]-b[5];
    res[6] = a[6]-b[6];
    res[7] = a[7]-b[7];
  return res;
};

//***********************
// PGA2D.smul : res = a * b 
// scalar/multivector multiplication
//***********************
inline PGA2D operator * (const float &a, const PGA2D &b) {
  PGA2D res;
      res[0] = a*b[0];
    res[1] = a*b[1];
    res[2] = a*b[2];
    res[3] = a*b[3];
    res[4] = a*b[4];
    res[5] = a*b[5];
    res[6] = a*b[6];
    res[7] = a*b[7];
  return res;
};

//***********************
// PGA2D.muls : res = a * b 
// multivector/scalar multiplication
//***********************
inline PGA2D operator * (const PGA2D &a, const float &b) {
  PGA2D res;
      res[0] = a[0]*b;
    res[1] = a[1]*b;
    res[2] = a[2]*b;
    res[3] = a[3]*b;
    res[4] = a[4]*b;
    res[5] = a[5]*b;
    res[6] = a[6]*b;
    res[7] = a[7]*b;
  return res;
};

//***********************
// PGA2D.sadd : res = a + b 
// scalar/multivector addition
//***********************
inline PGA2D operator + (const float &a, const PGA2D &b) {
  PGA2D res;
    res[0] = a+b[0];
      res[1] = b[1];
    res[2] = b[2];
    res[3] = b[3];
    res[4] = b[4];
    res[5] = b[5];
    res[6] = b[6];
    res[7] = b[7];
  return res;
};

//***********************
// PGA2D.adds : res = a + b 
// multivector/scalar addition
//***********************
inline PGA2D operator + (const PGA2D &a, const float &b) {
  PGA2D res;
    res[0] = a[0]+b;
      res[1] = a[1];
    res[2] = a[2];
    res[3] = a[3];
    res[4] = a[4];
    res[5] = a[5];
    res[6] = a[6];
    res[7] = a[7];
  return res;
};



*/