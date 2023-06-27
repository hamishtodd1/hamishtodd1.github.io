id4x4 = np.eye(4)
zr4x4 = np.array([
              [  0,  0,  0,  0, ],
              [  0,  0,  0,  0, ],
              [  0,  0,  0,  0, ],
              [  0,  0,  0,  0, ]])


experiment = [None] * 8
experiment[0] = np.array([
              [  0,  1,  0,  0, ],
              [  1,  0,  0,  0, ],
              [  0,  0,  0,  1, ],
              [  0,  0,  1,  0, ]])
experiment[1] = np.array([
              [  1,  0,  0,  0, ],
              [  0,  0,  0,  1, ],
              [  0,  0,  1,  0, ],
              [  0,  1,  0,  0, ]])
experiment[2] = np.array([
              [  0,  0,  0,  1, ],
              [  0,  0,  1,  0, ],
              [  0,  1,  0,  0, ],
              [  1,  0,  0,  0, ]] )
experiment[3] = np.array([
              [  0,  0,  1,  0, ],
              [  0,  1,  0,  0, ],
              [  1,  0,  0,  0, ],
              [  0,  0,  0,  1, ]])

experiment[4] = np.array([
              [  0,  0,  1,  0, ],
              [  0,  0,  0,  1, ],
              [  1,  0,  0,  0, ],
              [  0,  1,  0,  0, ]] )
experiment[5] = np.array([
              [  0,  0,  0,  1, ],
              [  1,  0,  0,  0, ],
              [  0,  1,  0,  0, ],
              [  0,  0,  1,  0, ]])
experiment[6] = np.array([
              [  1,  0,  0,  0, ],
              [  0,  1,  0,  0, ],
              [  0,  0,  1,  0, ],
              [  0,  0,  0,  1, ]])
experiment[7] = np.array([
              [  0,  1,  0,  0, ],
              [  0,  0,  1,  0, ],
              [  0,  0,  0,  1, ],
              [  1,  0,  0,  0, ]])

for i in range(len(experiment)):
    result = "matrix " + str(i) + ": "
    mat = experiment[i]
    
    for differ in range(1 << 4):
        modifiedMat = np.eye(4)
        for row in range(4):
            for col in range(4):
                modifiedMat[row][col] = mat[row][col] * (-1 if differ & row else 1)
        modifiedMatSq = np.matmul(modifiedMat, modifiedMat)
        if (np.allclose(modifiedMatSq, id4x4) ):
            result = result + " 1 "
        elif (np.allclose(modifiedMatSq, -id4x4)):
            result = result + "-1 "
        else:
            result = result + "   "

    print(result)

print(np.zeros(4,4))
# print(np.matmul(knightMove, knightMove))
sys.exit()