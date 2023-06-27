'''
Write a python script. As input, it should take 5 matrices that are 4x4 and have complex entries, call those matrices p, q, r, s, t. It should then multiply them together in every combination of up to 5 of them, and name them like this: the matrix gotten from multiplying p by q should be called pq; the matrix gotten from multiplying q by s should be called qs; the matrix gotten from multiplying p by s and then by t should be called pst; the matrix gotten from multiplying q by r then s then t should be called qrst. As output, the script should give a table. Along the top and down the side of the table should be "p, q, r, s, t, pq, pr, ps, pt, qr, qs, qt, rs, rt, st, pqr, pqs, pqt, prs, prt, pst, qrs, qrt, qst, rst, pqrs, pqrt, pqst, prst, qrst, pqrst". The table should be filled in with the names of the matrices gotten by multiplying the matrices on the top and the side together, preceded with a minus sign if it is the negative of one of those matrices. If two matrices multiply together to the identity matrix, it should just say Id

Possibly it'd be better to tensor the paulis with the 2x2 identity
'''


import numpy as np
import sys

gamma1 = np.array([
              [  0,  0,  0,  1, ],
              [  0,  0, -1,  0, ],
              [  0, -1,  0,  0, ],
              [ -1,  0,  0,  0, ]])
gamma2 = np.array([
              [  0,  0,  0,-1j, ],
              [  0,  0, 1j,  0, ],
              [  0, 1j,  0,  0, ],
              [-1j,  0,  0,  0, ]] )
gamma3 = np.array([
              [  0,  0,  1,  0, ],
              [  0,  0,  0, -1, ],
              [ -1,  0,  0,  0, ],
              [  0,  1,  0,  0, ]] )
gamma5 = np.array([
              [  0,  0,  1,  0, ],
              [  0,  0,  0,  1, ],
              [  1,  0,  0,  0, ],
              [  0,  1,  0,  0, ]] )
pauliXTensorId = np.array([
              [  0,  1,  0,  0, ],
              [  1,  0,  0,  0, ],
              [  0,  0,  0,  1, ],
              [  0,  0,  1,  0, ]])
pauliYTensorId = np.array([
              [  0,-1j,  0,  0, ],
              [ 1j,  0,  0,  0, ],
              [  0,  0,  0,-1j, ],
              [  0,  0, 1j,  0, ]])
pauliZTensorId = np.array([
              [  1,  0,  0,  0, ],
              [  0,  1,  0,  0, ],
              [  0,  0, -1,  0, ],
              [  0,  0,  0, -1, ]])
gamma0 = pauliZTensorId
#squares to -1
iAntiDiagonal = np.array([
              [  0,  0,  0, 1j, ],
              [  0,  0, 1j,  0, ],
              [  0, 1j,  0,  0, ],
              [ 1j,  0,  0,  0, ]] )


xSelig = np.array([
              [  0,  1,  0,  0, ],
              [  1,  0,  0,  0, ],
              [  0,  0,  0, -1, ],
              [  0,  0, -1,  0, ]] )
ySelig = np.array([
              [  0,-1j,  0,  0, ],
              [ 1j,  0,  0,  0, ],
              [  0,  0,  0, 1j, ],
              [  0,  0,-1j,  0, ]] )
zSelig = np.array([
              [  1,  0,  0,  0, ],
              [  0, -1,  0,  0, ],
              [  0,  0, -1,  0, ],
              [  0,  0,  0,  1, ]] )
pSelig = np.array([
              [  0,  0,  1,  0, ],
              [  0,  0,  0,  1, ],
              [  1,  0,  0,  0, ],
              [  0,  1,  0,  0, ]] )
mSelig = np.array([
              [  0,  0, -1,  0, ],
              [  0,  0,  0, -1, ],
              [  1,  0,  0,  0, ],
              [  0,  1,  0,  0, ]] )

basisMatrices = [xSelig,ySelig,zSelig,pSelig,mSelig]

basisSize = len(basisMatrices)
fullSize = 1 << basisSize
names = [None] * fullSize
matrices = [None] * fullSize

lowestUnused = 0
def generate( current, lastPlace, stillToBeAppended ):
    global lowestUnused

    if(stillToBeAppended == 0):

        newMat = np.eye(4)
        newName = "e"

        for j in current:
            newMat = np.matmul(newMat, basisMatrices[j])
            newName = newName + str(j+1)
            # print(j)
        if newName == "e":
            newName = "I"

        # print(newName)

        names[lowestUnused] = newName
        matrices[lowestUnused] = newMat
        lowestUnused = lowestUnused + 1

    else:
        for nextPlace in range(lastPlace+1, basisSize):
            generate(current+[nextPlace], nextPlace, stillToBeAppended-1)

for k in range(fullSize):
    # wanna go through each of the ones above your current one
    generate([],-1,k)
    # print(" ")

for i in range(fullSize) :
    mat = matrices[i]
    isSU3 = True
    # if mat[3][3] != 0:
    #     isSU3 = False
    # for i in range(3):
    #     if mat[i][3] != 0:
    #         isSU3 = False
    #     if mat[3][i] != 0:
    #         isSU3 = False
    if isSU3:
        print(names[i] + ":")
        print(mat)

sys.exit()

result_table = [[0]*fullSize for i in range(fullSize)]

# # Generate table entries for matrix products
for i in range(fullSize):
    for j in range(fullSize):
        matrix_product = np.matmul(matrices[i], matrices[j])

        found = False
        for resultIndex, mat in enumerate(matrices):
            if np.allclose(matrix_product, mat):
                result_table[i][j] = names[resultIndex]
                found = True
            elif np.allclose(matrix_product, -mat):
                result_table[i][j] = "-" + names[resultIndex]
                found = True

        if(found == False):
            result_table[i][j] = "??"

        # print(i,j, result_table[i][j])

# # Print the table
for row in result_table:
    output = ""
    for entry in row:
        output = output + entry + " " * (8-len(entry))
    print(output)

# print(np.matmul(matrices[2], matrices[4]))
# print(np.matmul(matrices[4], matrices[2]))
