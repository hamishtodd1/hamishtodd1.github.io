def doit(filename, arrayDeclaration):
	finalArray = []
	print( arrayDeclaration )
	matrixLinesRead = 999
	matrixRows = [[0,0,0],[0,0,0],[0,0,0]]
	justHadBreak = 1
	chainID = ''
	num_chains = 0
	with open(filename, 'r') as data:
		for line in data:
			if len(line) < 15:
				continue
			if matrixLinesRead < 3:
				matrixNumberString = line[7:]
				matrixNumberArray = matrixNumberString.split()
				matrixRows[matrixLinesRead][0] = float(matrixNumberArray[0])
				matrixRows[matrixLinesRead][1] = float(matrixNumberArray[1])
				matrixRows[matrixLinesRead][2] = float(matrixNumberArray[2])
				matrixLinesRead += 1
				if matrixLinesRead == 3:
					print(matrixRows[0])
					print(matrixRows[1])
					print(matrixRows[2])
					print('')
			if line[:26] == 'REMARK Icosahedral Matrix ':
				matrixLinesRead = 0
				
			if line[13] == 'C' and line[14] == 'A':
				if line[21] != chainID:
					chainID = line[21]
					#don't want those last 3, they duplicate
					if(len(finalArray) > 0 ):
						finalArray.pop()
						finalArray.pop()
						finalArray.pop()
					justHadBreak = 1
					num_chains+=1
				
				X = line[30:38]
				Y = line[38:46]
				Z = line[46:54]
				#There are gaps. We might prefer to take the first bunch for the whole thing?
				#No come on, you're not doing the matrices right
				finalArray.append( float(X) * matrixRows[0][0] + float(Y) * matrixRows[0][1] + float(Z) * matrixRows[0][2] )
				finalArray.append( float(X) * matrixRows[1][0] + float(Y) * matrixRows[1][1] + float(Z) * matrixRows[1][2] )
				finalArray.append( float(X) * matrixRows[2][0] + float(Y) * matrixRows[2][1] + float(Z) * matrixRows[2][2] )
				
				if justHadBreak == 0: #that was just a link to the previous one
					finalArray.append( float(X) * matrixRows[0][0] + float(Y) * matrixRows[0][1] + float(Z) * matrixRows[0][2] )
					finalArray.append( float(X) * matrixRows[1][0] + float(Y) * matrixRows[1][1] + float(Z) * matrixRows[1][2] )
					finalArray.append( float(X) * matrixRows[2][0] + float(Y) * matrixRows[2][1] + float(Z) * matrixRows[2][2] )
				else:
					justHadBreak = 0
	coordsString = str(finalArray)
	sansSpaces = coordsString.replace(' ','')
	#print(sansSpaces)
	#print(num_chains)
	print(');')
	
doit('1cwp_full.vdb',		'var defaultCCMVCAPositions = new Float32Array(')
doit('ccmv_swln_2_full.vdb','var swollenCCMVCAPositions = new Float32Array(')