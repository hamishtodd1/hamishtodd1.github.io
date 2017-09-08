import png
import math

#-----------Loading in valueStrings
'''scalarFieldLarge.txt
sizeX = 19
sizeY = 19
sizeZ = 17'''
sizeX = 53
sizeY = 53
sizeZ = 53
sizeXY = sizeX*sizeY

import numpy as np

valueIndex = 0
values = np.zeros(sizeX*sizeY*sizeZ)
with open('scalarFieldLarge.txt') as f:
	for line in f:
		lineValues = line.split()
		for value in lineValues:
			values[valueIndex] = value
			valueIndex += 1
if valueIndex != sizeX * sizeY * sizeZ:
	print( "sizes may be off" )

#---------Getting min and max densities
#for the whole thing, all four values are always the same
maxDensity = -1000.0
minDensity = 1000.0

for value in values:
	if value > maxDensity:
		maxDensity = value
	if value < minDensity:
		minDensity = value
		
print("min and max densities", minDensity,maxDensity)
densityRange = maxDensity-minDensity

#-----------writing arrays
zRepetitions = int(256/sizeZ)
	
maxValue = 255
index = 0
listOfLists = [[0 for x in range(sizeX*16*4)] for y in range(sizeY*16)]
for rawValue in values:
	zV = int( index / sizeXY )
	xV = int( (index % sizeXY) / sizeY )
	yV = index - zV * sizeXY - xV * sizeY
	
	value = int( round( maxValue * ((rawValue-minDensity)/densityRange) ) )
	if value < 0:
		value = 0
	if value > maxValue:
		value = maxValue
	
	for i in range(zRepetitions):
		imageIndexIfItWasOneLine = (zV * zRepetitions) + i
		
		rowOfImages = int( imageIndexIfItWasOneLine / 16 )
		columnOfImages = imageIndexIfItWasOneLine % 16
		
		rowOfPixels = rowOfImages * sizeY + yV
		columnOfPixels = columnOfImages * sizeX + xV
		
		listOfLists[rowOfPixels][columnOfPixels*4+0] = value
		listOfLists[rowOfPixels][columnOfPixels*4+1] = value
		listOfLists[rowOfPixels][columnOfPixels*4+2] = value
		listOfLists[rowOfPixels][columnOfPixels*4+3] = value
		
	index += 1
		
#it's just 16. No idea what to do if you have more than 256 z layers!
#a full cube will always be 256 layers, no matter what x and y are. So yeah, we'll repeat. 

finalArray = []
for line in listOfLists:
	finalArray.append( tuple(line) )
	
	
#---------Exporting
#you have to make tuples and append them to the list
'''p = [(0,0,0,255,	0,0,0,128,	0,0,0,255),
     (0,0,0,255,	0,0,0,128,	0,0,0,255)]'''
f = open('output.png', 'wb')
w = png.Writer(sizeX*16, sizeY*16,alpha='RGBA')
w.write(f, finalArray) ; f.close()