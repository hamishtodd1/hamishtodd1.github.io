var coarse_protein_triangle_indices = new Uint16Array([
	0,2,1,
	9,0,7,
	2,0,9,
	10,2,9,
	4,2,5,
	4,1,2,
	11,5,2,
	10,11,2,
	3,4,5,
	5,13,3,
	14,13,5,
	11,14,5,
	6,9,7,
	8,9,6,
	17,8,15,
	9,8,17,
	10,9,17,
	19,11,10,
	17,19,10,
	21,14,11,
	19,21,11,
	12,13,14,
	14,20,12,
	14,21,20,
	16,17,15,
	16,19,17,
	16,18,19,
	24,18,22,
	19,18,24,
	21,19,24,
	21,26,20,
	28,26,21,
	24,28,21,
	23,24,22,
	23,28,24,
	23,27,28,
	25,26,28,
	27,25,28,
	30,1,31,
	30,0,1,
	0,30,7,
	30,37,7,
	1,4,32,
	31,1,32,
	34,3,35,
	4,3,34,
	32,4,34,
	35,3,13,
	36,7,37,
	36,6,7,
	38,6,36,
	38,8,6,
	8,38,15,
	38,40,15,
	12,35,13,
	33,35,12,
	39,33,12,
	39,12,20,
	41,39,20,
	15,44,16,
	42,44,15,
	40,42,15,
	18,16,46,
	16,44,46,
	22,18,46,
	26,29,20,
	20,29,47,
	20,47,41,
	45,22,46,
	23,22,45,
	48,23,45,
	27,47,29,
	48,47,27,
	23,48,27,
	29,26,25,
	29,25,27,
	33,34,35,
	43,44,42,
	43,46,44,
	43,45,46,
	31,55,30,
	54,55,31,
	56,54,31,
	37,30,55,
	52,49,32,
	32,49,56,
	32,56,31,
	50,52,58,
	58,52,32,
	58,32,34,
	33,58,34,
	33,57,58,
	57,33,39,
	60,57,39,
	53,37,55,
	36,37,53,
	59,36,53,
	36,63,38,
	61,63,36,
	59,61,36,
	40,38,63,
	60,39,41,
	64,60,41,
	63,62,40,
	40,62,65,
	40,65,42,
	64,41,47,
	68,64,47,
	66,42,65,
	66,43,42,
	67,45,43,
	67,43,66,
	69,48,45,
	69,45,67,
	48,68,47,
	48,69,68,
	49,52,51,
	50,51,52,
	53,55,54,
	62,63,61,
	51,76,49,
	75,76,51,
	77,75,51,
	56,49,76,
	79,50,80,
	51,50,79,
	77,51,79,
	80,50,58,
	53,54,83,
	83,54,74,
	83,74,72,
	83,82,53,
	53,82,87,
	53,87,59,
	54,56,74,
	56,76,74,
	85,57,86,
	85,58,57,
	78,58,85,
	80,58,78,
	89,86,60,
	86,57,60,
	61,59,87,
	61,87,90,
	93,89,64,
	89,60,64,
	61,96,62,
	94,96,61,
	90,94,61,
	65,62,96,
	92,93,100,
	100,93,64,
	100,64,68,
	95,65,96,
	66,65,95,
	98,66,95,
	99,67,66,
	99,66,98,
	101,69,67,
	101,67,99,
	69,100,68,
	69,101,100,
	70,72,71,
	70,83,72,
	70,81,83,
	73,72,74,
	73,71,72,
	75,74,76,
	75,73,74,
	78,79,80,
	82,83,81,
	84,85,86,
	86,88,84,
	86,89,88,
	89,91,88,
	89,93,91,
	92,91,93,
	95,96,94,
	115,71,116,
	115,70,71,
	119,121,115,
	115,121,81,
	115,81,70,
	107,106,73,
	73,106,116,
	73,116,71,
	73,75,107,
	75,109,107,
	75,77,109,
	77,111,109,
	77,79,111,
	79,114,111,
	78,114,79,
	112,114,78,
	117,112,78,
	117,78,123,
	78,85,123,
	125,126,120,
	126,82,120,
	120,82,121,
	121,82,81,
	87,82,126,
	84,123,85,
	84,122,123,
	122,84,88,
	127,122,88,
	90,87,131,
	87,126,131,
	127,88,91,
	133,127,91,
	90,131,94,
	94,131,132,
	132,131,130,
	132,97,94,
	92,133,91,
	92,134,133,
	134,92,140,
	92,100,140,
	95,94,97,
	136,97,135,
	95,97,136,
	98,95,136,
	97,132,135,
	138,99,98,
	138,98,136,
	141,101,99,
	141,99,138,
	101,140,100,
	101,141,140,
	102,105,104,
	102,107,105,
	102,106,107,
	103,104,105,
	105,108,103,
	109,108,105,
	107,109,105,
	110,109,111,
	110,108,109,
	113,111,114,
	113,110,111,
	112,113,114,
	118,121,119,
	120,121,118,
	125,131,126,
	125,129,131,
	130,131,129,
	143,104,144,
	143,102,104,
	149,150,143,
	143,150,106,
	143,106,102,
	146,103,147,
	104,103,146,
	144,104,146,
	147,103,108,
	116,106,150,
	145,147,151,
	151,147,108,
	151,108,110,
	110,113,153,
	151,110,153,
	112,153,113,
	112,152,153,
	160,158,117,
	117,158,152,
	117,152,112,
	156,148,155,
	156,150,148,
	115,150,156,
	116,150,115,
	119,115,156,
	123,124,117,
	117,124,163,
	159,160,117,
	163,159,117,
	154,119,156,
	118,119,154,
	162,118,154,
	118,165,120,
	164,165,118,
	162,164,118,
	125,120,165,
	157,160,159,
	124,123,122,
	128,122,127,
	128,124,122,
	124,128,163,
	128,166,163,
	129,125,172,
	125,165,172,
	127,181,128,
	180,181,127,
	133,180,127,
	166,128,181,
	171,129,172,
	130,129,171,
	173,130,171,
	174,132,130,
	174,130,173,
	137,135,175,
	175,135,132,
	175,132,174,
	134,180,133,
	134,182,180,
	140,142,134,
	134,142,178,
	134,178,182,
	136,135,137,
	137,138,136,
	137,139,138,
	139,137,176,
	137,175,176,
	139,141,138,
	139,142,141,
	142,139,178,
	139,176,178,
	142,140,141,
	145,146,147,
	148,150,149,
	154,156,155,
	157,158,160,
	170,164,168,
	165,164,170,
	172,165,170,
	167,170,168,
	169,170,167,
	169,172,170,
	169,171,172,
	144,186,143,
	185,186,144,
	188,185,144,
	149,143,186,
	144,146,191,
	188,144,191,
	145,191,146,
	145,190,191,
	190,145,194,
	145,151,194,
	184,149,186,
	148,149,184,
	192,148,184,
	148,192,155,
	192,198,155,
	151,153,196,
	194,151,196,
	152,196,153,
	152,195,196,
	158,161,152,
	152,161,199,
	152,199,195,
	197,155,198,
	197,154,155,
	202,203,197,
	197,203,162,
	197,162,154,
	161,158,157,
	161,157,159,
	161,159,199,
	199,159,163,
	199,163,205,
	164,162,208,
	162,203,208,
	205,163,166,
	211,205,166,
	168,164,208,
	179,181,183,
	211,181,179,
	166,181,211,
	179,212,211,
	207,168,208,
	167,168,207,
	214,167,207,
	215,167,214,
	215,169,167,
	221,223,215,
	215,223,171,
	215,171,169,
	173,171,226,
	171,223,226,
	226,224,173,
	173,224,217,
	173,217,174,
	219,175,174,
	219,174,217,
	176,218,177,
	219,218,176,
	175,219,176,
	177,178,176,
	177,179,178,
	179,177,212,
	177,210,212,
	210,177,218,
	179,182,178,
	179,183,182,
	183,181,180,
	183,180,182,
	184,186,185,
	201,203,202,
	201,208,203,
	201,207,208,
	222,223,221,
	222,226,223,
	222,225,226,
	225,224,226,
	184,185,187,
	192,187,193,
	192,184,187,
	189,185,188,
	189,187,185,
	233,232,189,
	189,232,193,
	189,193,187,
	188,228,189,
	230,228,188,
	191,230,188,
	189,228,233,
	190,230,191,
	190,229,230,
	229,190,236,
	190,194,236,
	192,193,198,
	198,193,245,
	198,245,243,
	193,232,245,
	194,196,239,
	236,194,239,
	195,239,196,
	195,238,239,
	238,200,240,
	199,200,238,
	195,199,238,
	242,198,243,
	242,197,198,
	204,202,248,
	248,202,197,
	248,197,242,
	206,199,205,
	206,200,199,
	200,206,246,
	206,250,246,
	240,200,246,
	201,202,204,
	207,204,209,
	207,201,204,
	248,252,204,
	252,209,204,
	213,205,211,
	213,206,205,
	206,213,250,
	213,254,250,
	214,209,216,
	214,207,209,
	252,257,209,
	257,216,209,
	218,220,210,
	210,220,253,
	210,253,255,
	212,254,213,
	255,254,212,
	210,255,212,
	213,211,212,
	215,214,216,
	215,216,221,
	221,216,257,
	221,257,264,
	224,227,217,
	217,227,259,
	217,259,262,
	219,261,220,
	262,261,219,
	217,262,219,
	220,218,219,
	253,220,261,
	266,221,264,
	266,222,221,
	225,265,227,
	266,265,225,
	222,266,225,
	227,224,225,
	259,227,265,
	228,230,231,
	231,233,228,
	234,233,231,
	235,234,231,
	231,230,229,
	237,229,236,
	231,229,237,
	235,231,237,
	232,233,234,
	232,234,245,
	245,234,271,
	245,271,269,
	234,235,271,
	235,274,271,
	273,274,247,
	247,274,235,
	247,235,237,
	241,236,239,
	241,237,236,
	247,240,246,
	241,240,247,
	237,241,247,
	241,239,238,
	241,238,240,
	242,243,244,
	248,244,249,
	248,242,244,
	243,268,244,
	269,268,243,
	245,269,243,
	268,276,244,
	276,249,244,
	251,246,250,
	251,247,246,
	247,251,273,
	251,279,273,
	281,249,282,
	248,249,281,
	252,248,281,
	249,276,282,
	256,250,254,
	256,251,250,
	251,256,279,
	256,289,279,
	257,283,258,
	281,283,257,
	252,281,257,
	261,263,253,
	253,263,287,
	253,287,290,
	255,289,256,
	290,289,255,
	253,290,255,
	256,254,255,
	264,258,267,
	264,257,258,
	267,259,265,
	260,259,267,
	258,260,267,
	260,258,285,
	258,283,285,
	260,262,259,
	260,263,262,
	263,260,287,
	260,285,287,
	263,261,262,
	266,264,267,
	267,265,266,
	268,269,270,
	276,270,277,
	276,268,270,
	272,269,271,
	272,270,269,
	270,272,278,
	270,278,277,
	275,271,274,
	275,272,271,
	272,275,280,
	272,280,278,
	275,274,273,
	280,273,279,
	280,275,273,
	277,282,276,
	284,282,277,
	286,284,277,
	277,278,288,
	277,288,286,
	278,280,291,
	278,291,288,
	291,279,289,
	291,280,279,
	281,282,284,
	283,281,284,
	284,285,283,
	284,286,285,
	286,287,285,
	286,288,287,
	288,290,287,
	288,291,290,
	291,289,290,
	
	//all the below are stand-ins, which need to have the length added to them
	0,2,1,
	9,0,7,
	2,0,9,
	10,2,9,
	4,2,5,
	4,1,2,
	11,5,2,
	10,11,2,
	3,4,5,
	5,13,3,
	14,13,5,
	11,14,5,
	6,9,7,
	8,9,6,
	17,8,15,
	9,8,17,
	10,9,17,
	19,11,10,
	17,19,10,
	21,14,11,
	19,21,11,
	12,13,14,
	14,20,12,
	14,21,20,
	16,17,15,
	16,19,17,
	16,18,19,
	24,18,22,
	19,18,24,
	21,19,24,
	21,26,20,
	28,26,21,
	24,28,21,
	23,24,22,
	23,28,24,
	23,27,28,
	25,26,28,
	27,25,28,
	30,1,31,
	30,0,1,
	0,30,7,
	30,37,7,
	1,4,32,
	31,1,32,
	34,3,35,
	4,3,34,
	32,4,34,
	35,3,13,
	36,7,37,
	36,6,7,
	38,6,36,
	38,8,6,
	8,38,15,
	38,40,15,
	12,35,13,
	33,35,12,
	39,33,12,
	39,12,20,
	41,39,20,
	15,44,16,
	42,44,15,
	40,42,15,
	18,16,46,
	16,44,46,
	22,18,46,
	26,29,20,
	20,29,47,
	20,47,41,
	45,22,46,
	23,22,45,
	48,23,45,
	27,47,29,
	48,47,27,
	23,48,27,
	29,26,25,
	29,25,27,
	33,34,35,
	43,44,42,
	43,46,44,
	43,45,46,
	31,55,30,
	54,55,31,
	56,54,31,
	37,30,55,
	52,49,32,
	32,49,56,
	32,56,31,
	50,52,58,
	58,52,32,
	58,32,34,
	33,58,34,
	33,57,58,
	57,33,39,
	60,57,39,
	53,37,55,
	36,37,53,
	59,36,53,
	36,63,38,
	61,63,36,
	59,61,36,
	40,38,63,
	60,39,41,
	64,60,41,
	63,62,40,
	40,62,65,
	40,65,42,
	64,41,47,
	68,64,47,
	66,42,65,
	66,43,42,
	67,45,43,
	67,43,66,
	69,48,45,
	69,45,67,
	48,68,47,
	48,69,68,
	49,52,51,
	50,51,52,
	53,55,54,
	62,63,61,
	51,76,49,
	75,76,51,
	77,75,51,
	56,49,76,
	79,50,80,
	51,50,79,
	77,51,79,
	80,50,58,
	53,54,83,
	83,54,74,
	83,74,72,
	83,82,53,
	53,82,87,
	53,87,59,
	54,56,74,
	56,76,74,
	85,57,86,
	85,58,57,
	78,58,85,
	80,58,78,
	89,86,60,
	86,57,60,
	61,59,87,
	61,87,90,
	93,89,64,
	89,60,64,
	61,96,62,
	94,96,61,
	90,94,61,
	65,62,96,
	92,93,100,
	100,93,64,
	100,64,68,
	95,65,96,
	66,65,95,
	98,66,95,
	99,67,66,
	99,66,98,
	101,69,67,
	101,67,99,
	69,100,68,
	69,101,100,
	70,72,71,
	70,83,72,
	70,81,83,
	73,72,74,
	73,71,72,
	75,74,76,
	75,73,74,
	78,79,80,
	82,83,81,
	84,85,86,
	86,88,84,
	86,89,88,
	89,91,88,
	89,93,91,
	92,91,93,
	95,96,94,
	115,71,116,
	115,70,71,
	119,121,115,
	115,121,81,
	115,81,70,
	107,106,73,
	73,106,116,
	73,116,71,
	73,75,107,
	75,109,107,
	75,77,109,
	77,111,109,
	77,79,111,
	79,114,111,
	78,114,79,
	112,114,78,
	117,112,78,
	117,78,123,
	78,85,123,
	125,126,120,
	126,82,120,
	120,82,121,
	121,82,81,
	87,82,126,
	84,123,85,
	84,122,123,
	122,84,88,
	127,122,88,
	90,87,131,
	87,126,131,
	127,88,91,
	133,127,91,
	90,131,94,
	94,131,132,
	132,131,130,
	132,97,94,
	92,133,91,
	92,134,133,
	134,92,140,
	92,100,140,
	95,94,97,
	136,97,135,
	95,97,136,
	98,95,136,
	97,132,135,
	138,99,98,
	138,98,136,
	141,101,99,
	141,99,138,
	101,140,100,
	101,141,140,
	102,105,104,
	102,107,105,
	102,106,107,
	103,104,105,
	105,108,103,
	109,108,105,
	107,109,105,
	110,109,111,
	110,108,109,
	113,111,114,
	113,110,111,
	112,113,114,
	118,121,119,
	120,121,118,
	125,131,126,
	125,129,131,
	130,131,129,
	143,104,144,
	143,102,104,
	149,150,143,
	143,150,106,
	143,106,102,
	146,103,147,
	104,103,146,
	144,104,146,
	147,103,108,
	116,106,150,
	145,147,151,
	151,147,108,
	151,108,110,
	110,113,153,
	151,110,153,
	112,153,113,
	112,152,153,
	160,158,117,
	117,158,152,
	117,152,112,
	156,148,155,
	156,150,148,
	115,150,156,
	116,150,115,
	119,115,156,
	123,124,117,
	117,124,163,
	159,160,117,
	163,159,117,
	154,119,156,
	118,119,154,
	162,118,154,
	118,165,120,
	164,165,118,
	162,164,118,
	125,120,165,
	157,160,159,
	124,123,122,
	128,122,127,
	128,124,122,
	124,128,163,
	128,166,163,
	129,125,172,
	125,165,172,
	127,181,128,
	180,181,127,
	133,180,127,
	166,128,181,
	171,129,172,
	130,129,171,
	173,130,171,
	174,132,130,
	174,130,173,
	137,135,175,
	175,135,132,
	175,132,174,
	134,180,133,
	134,182,180,
	140,142,134,
	134,142,178,
	134,178,182,
	136,135,137,
	137,138,136,
	137,139,138,
	139,137,176,
	137,175,176,
	139,141,138,
	139,142,141,
	142,139,178,
	139,176,178,
	142,140,141,
	145,146,147,
	148,150,149,
	154,156,155,
	157,158,160,
	170,164,168,
	165,164,170,
	172,165,170,
	167,170,168,
	169,170,167,
	169,172,170,
	169,171,172,
	144,186,143,
	185,186,144,
	188,185,144,
	149,143,186,
	144,146,191,
	188,144,191,
	145,191,146,
	145,190,191,
	190,145,194,
	145,151,194,
	184,149,186,
	148,149,184,
	192,148,184,
	148,192,155,
	192,198,155,
	151,153,196,
	194,151,196,
	152,196,153,
	152,195,196,
	158,161,152,
	152,161,199,
	152,199,195,
	197,155,198,
	197,154,155,
	202,203,197,
	197,203,162,
	197,162,154,
	161,158,157,
	161,157,159,
	161,159,199,
	199,159,163,
	199,163,205,
	164,162,208,
	162,203,208,
	205,163,166,
	211,205,166,
	168,164,208,
	179,181,183,
	211,181,179,
	166,181,211,
	179,212,211,
	207,168,208,
	167,168,207,
	214,167,207,
	215,167,214,
	215,169,167,
	221,223,215,
	215,223,171,
	215,171,169,
	173,171,226,
	171,223,226,
	226,224,173,
	173,224,217,
	173,217,174,
	219,175,174,
	219,174,217,
	176,218,177,
	219,218,176,
	175,219,176,
	177,178,176,
	177,179,178,
	179,177,212,
	177,210,212,
	210,177,218,
	179,182,178,
	179,183,182,
	183,181,180,
	183,180,182,
	184,186,185,
	201,203,202,
	201,208,203,
	201,207,208,
	222,223,221,
	222,226,223,
	222,225,226,
	225,224,226,
	184,185,187,
	192,187,193,
	192,184,187,
	189,185,188,
	189,187,185,
	233,232,189,
	189,232,193,
	189,193,187,
	188,228,189,
	230,228,188,
	191,230,188,
	189,228,233,
	190,230,191,
	190,229,230,
	229,190,236,
	190,194,236,
	192,193,198,
	198,193,245,
	198,245,243,
	193,232,245,
	194,196,239,
	236,194,239,
	195,239,196,
	195,238,239,
	238,200,240,
	199,200,238,
	195,199,238,
	242,198,243,
	242,197,198,
	204,202,248,
	248,202,197,
	248,197,242,
	206,199,205,
	206,200,199,
	200,206,246,
	206,250,246,
	240,200,246,
	201,202,204,
	207,204,209,
	207,201,204,
	248,252,204,
	252,209,204,
	213,205,211,
	213,206,205,
	206,213,250,
	213,254,250,
	214,209,216,
	214,207,209,
	252,257,209,
	257,216,209,
	218,220,210,
	210,220,253,
	210,253,255,
	212,254,213,
	255,254,212,
	210,255,212,
	213,211,212,
	215,214,216,
	215,216,221,
	221,216,257,
	221,257,264,
	224,227,217,
	217,227,259,
	217,259,262,
	219,261,220,
	262,261,219,
	217,262,219,
	220,218,219,
	253,220,261,
	266,221,264,
	266,222,221,
	225,265,227,
	266,265,225,
	222,266,225,
	227,224,225,
	259,227,265,
	228,230,231,
	231,233,228,
	234,233,231,
	235,234,231,
	231,230,229,
	237,229,236,
	231,229,237,
	235,231,237,
	232,233,234,
	232,234,245,
	245,234,271,
	245,271,269,
	234,235,271,
	235,274,271,
	273,274,247,
	247,274,235,
	247,235,237,
	241,236,239,
	241,237,236,
	247,240,246,
	241,240,247,
	237,241,247,
	241,239,238,
	241,238,240,
	242,243,244,
	248,244,249,
	248,242,244,
	243,268,244,
	269,268,243,
	245,269,243,
	268,276,244,
	276,249,244,
	251,246,250,
	251,247,246,
	247,251,273,
	251,279,273,
	281,249,282,
	248,249,281,
	252,248,281,
	249,276,282,
	256,250,254,
	256,251,250,
	251,256,279,
	256,289,279,
	257,283,258,
	281,283,257,
	252,281,257,
	261,263,253,
	253,263,287,
	253,287,290,
	255,289,256,
	290,289,255,
	253,290,255,
	256,254,255,
	264,258,267,
	264,257,258,
	267,259,265,
	260,259,267,
	258,260,267,
	260,258,285,
	258,283,285,
	260,262,259,
	260,263,262,
	263,260,287,
	260,285,287,
	263,261,262,
	266,264,267,
	267,265,266,
	268,269,270,
	276,270,277,
	276,268,270,
	272,269,271,
	272,270,269,
	270,272,278,
	270,278,277,
	275,271,274,
	275,272,271,
	272,275,280,
	272,280,278,
	275,274,273,
	280,273,279,
	280,275,273,
	277,282,276,
	284,282,277,
	286,284,277,
	277,278,288,
	277,288,286,
	278,280,291,
	278,291,288,
	291,279,289,
	291,280,279,
	281,282,284,
	283,281,284,
	284,285,283,
	284,286,285,
	286,287,285,
	286,288,287,
	288,290,287,
	288,291,290,
	291,289,290,
	
	0,2,1,
	9,0,7,
	2,0,9,
	10,2,9,
	4,2,5,
	4,1,2,
	11,5,2,
	10,11,2,
	3,4,5,
	5,13,3,
	14,13,5,
	11,14,5,
	6,9,7,
	8,9,6,
	17,8,15,
	9,8,17,
	10,9,17,
	19,11,10,
	17,19,10,
	21,14,11,
	19,21,11,
	12,13,14,
	14,20,12,
	14,21,20,
	16,17,15,
	16,19,17,
	16,18,19,
	24,18,22,
	19,18,24,
	21,19,24,
	21,26,20,
	28,26,21,
	24,28,21,
	23,24,22,
	23,28,24,
	23,27,28,
	25,26,28,
	27,25,28,
	30,1,31,
	30,0,1,
	0,30,7,
	30,37,7,
	1,4,32,
	31,1,32,
	34,3,35,
	4,3,34,
	32,4,34,
	35,3,13,
	36,7,37,
	36,6,7,
	38,6,36,
	38,8,6,
	8,38,15,
	38,40,15,
	12,35,13,
	33,35,12,
	39,33,12,
	39,12,20,
	41,39,20,
	15,44,16,
	42,44,15,
	40,42,15,
	18,16,46,
	16,44,46,
	22,18,46,
	26,29,20,
	20,29,47,
	20,47,41,
	45,22,46,
	23,22,45,
	48,23,45,
	27,47,29,
	48,47,27,
	23,48,27,
	29,26,25,
	29,25,27,
	33,34,35,
	43,44,42,
	43,46,44,
	43,45,46,
	31,55,30,
	54,55,31,
	56,54,31,
	37,30,55,
	52,49,32,
	32,49,56,
	32,56,31,
	50,52,58,
	58,52,32,
	58,32,34,
	33,58,34,
	33,57,58,
	57,33,39,
	60,57,39,
	53,37,55,
	36,37,53,
	59,36,53,
	36,63,38,
	61,63,36,
	59,61,36,
	40,38,63,
	60,39,41,
	64,60,41,
	63,62,40,
	40,62,65,
	40,65,42,
	64,41,47,
	68,64,47,
	66,42,65,
	66,43,42,
	67,45,43,
	67,43,66,
	69,48,45,
	69,45,67,
	48,68,47,
	48,69,68,
	49,52,51,
	50,51,52,
	53,55,54,
	62,63,61,
	51,76,49,
	75,76,51,
	77,75,51,
	56,49,76,
	79,50,80,
	51,50,79,
	77,51,79,
	80,50,58,
	53,54,83,
	83,54,74,
	83,74,72,
	83,82,53,
	53,82,87,
	53,87,59,
	54,56,74,
	56,76,74,
	85,57,86,
	85,58,57,
	78,58,85,
	80,58,78,
	89,86,60,
	86,57,60,
	61,59,87,
	61,87,90,
	93,89,64,
	89,60,64,
	61,96,62,
	94,96,61,
	90,94,61,
	65,62,96,
	92,93,100,
	100,93,64,
	100,64,68,
	95,65,96,
	66,65,95,
	98,66,95,
	99,67,66,
	99,66,98,
	101,69,67,
	101,67,99,
	69,100,68,
	69,101,100,
	70,72,71,
	70,83,72,
	70,81,83,
	73,72,74,
	73,71,72,
	75,74,76,
	75,73,74,
	78,79,80,
	82,83,81,
	84,85,86,
	86,88,84,
	86,89,88,
	89,91,88,
	89,93,91,
	92,91,93,
	95,96,94,
	115,71,116,
	115,70,71,
	119,121,115,
	115,121,81,
	115,81,70,
	107,106,73,
	73,106,116,
	73,116,71,
	73,75,107,
	75,109,107,
	75,77,109,
	77,111,109,
	77,79,111,
	79,114,111,
	78,114,79,
	112,114,78,
	117,112,78,
	117,78,123,
	78,85,123,
	125,126,120,
	126,82,120,
	120,82,121,
	121,82,81,
	87,82,126,
	84,123,85,
	84,122,123,
	122,84,88,
	127,122,88,
	90,87,131,
	87,126,131,
	127,88,91,
	133,127,91,
	90,131,94,
	94,131,132,
	132,131,130,
	132,97,94,
	92,133,91,
	92,134,133,
	134,92,140,
	92,100,140,
	95,94,97,
	136,97,135,
	95,97,136,
	98,95,136,
	97,132,135,
	138,99,98,
	138,98,136,
	141,101,99,
	141,99,138,
	101,140,100,
	101,141,140,
	102,105,104,
	102,107,105,
	102,106,107,
	103,104,105,
	105,108,103,
	109,108,105,
	107,109,105,
	110,109,111,
	110,108,109,
	113,111,114,
	113,110,111,
	112,113,114,
	118,121,119,
	120,121,118,
	125,131,126,
	125,129,131,
	130,131,129,
	143,104,144,
	143,102,104,
	149,150,143,
	143,150,106,
	143,106,102,
	146,103,147,
	104,103,146,
	144,104,146,
	147,103,108,
	116,106,150,
	145,147,151,
	151,147,108,
	151,108,110,
	110,113,153,
	151,110,153,
	112,153,113,
	112,152,153,
	160,158,117,
	117,158,152,
	117,152,112,
	156,148,155,
	156,150,148,
	115,150,156,
	116,150,115,
	119,115,156,
	123,124,117,
	117,124,163,
	159,160,117,
	163,159,117,
	154,119,156,
	118,119,154,
	162,118,154,
	118,165,120,
	164,165,118,
	162,164,118,
	125,120,165,
	157,160,159,
	124,123,122,
	128,122,127,
	128,124,122,
	124,128,163,
	128,166,163,
	129,125,172,
	125,165,172,
	127,181,128,
	180,181,127,
	133,180,127,
	166,128,181,
	171,129,172,
	130,129,171,
	173,130,171,
	174,132,130,
	174,130,173,
	137,135,175,
	175,135,132,
	175,132,174,
	134,180,133,
	134,182,180,
	140,142,134,
	134,142,178,
	134,178,182,
	136,135,137,
	137,138,136,
	137,139,138,
	139,137,176,
	137,175,176,
	139,141,138,
	139,142,141,
	142,139,178,
	139,176,178,
	142,140,141,
	145,146,147,
	148,150,149,
	154,156,155,
	157,158,160,
	170,164,168,
	165,164,170,
	172,165,170,
	167,170,168,
	169,170,167,
	169,172,170,
	169,171,172,
	144,186,143,
	185,186,144,
	188,185,144,
	149,143,186,
	144,146,191,
	188,144,191,
	145,191,146,
	145,190,191,
	190,145,194,
	145,151,194,
	184,149,186,
	148,149,184,
	192,148,184,
	148,192,155,
	192,198,155,
	151,153,196,
	194,151,196,
	152,196,153,
	152,195,196,
	158,161,152,
	152,161,199,
	152,199,195,
	197,155,198,
	197,154,155,
	202,203,197,
	197,203,162,
	197,162,154,
	161,158,157,
	161,157,159,
	161,159,199,
	199,159,163,
	199,163,205,
	164,162,208,
	162,203,208,
	205,163,166,
	211,205,166,
	168,164,208,
	179,181,183,
	211,181,179,
	166,181,211,
	179,212,211,
	207,168,208,
	167,168,207,
	214,167,207,
	215,167,214,
	215,169,167,
	221,223,215,
	215,223,171,
	215,171,169,
	173,171,226,
	171,223,226,
	226,224,173,
	173,224,217,
	173,217,174,
	219,175,174,
	219,174,217,
	176,218,177,
	219,218,176,
	175,219,176,
	177,178,176,
	177,179,178,
	179,177,212,
	177,210,212,
	210,177,218,
	179,182,178,
	179,183,182,
	183,181,180,
	183,180,182,
	184,186,185,
	201,203,202,
	201,208,203,
	201,207,208,
	222,223,221,
	222,226,223,
	222,225,226,
	225,224,226,
	184,185,187,
	192,187,193,
	192,184,187,
	189,185,188,
	189,187,185,
	233,232,189,
	189,232,193,
	189,193,187,
	188,228,189,
	230,228,188,
	191,230,188,
	189,228,233,
	190,230,191,
	190,229,230,
	229,190,236,
	190,194,236,
	192,193,198,
	198,193,245,
	198,245,243,
	193,232,245,
	194,196,239,
	236,194,239,
	195,239,196,
	195,238,239,
	238,200,240,
	199,200,238,
	195,199,238,
	242,198,243,
	242,197,198,
	204,202,248,
	248,202,197,
	248,197,242,
	206,199,205,
	206,200,199,
	200,206,246,
	206,250,246,
	240,200,246,
	201,202,204,
	207,204,209,
	207,201,204,
	248,252,204,
	252,209,204,
	213,205,211,
	213,206,205,
	206,213,250,
	213,254,250,
	214,209,216,
	214,207,209,
	252,257,209,
	257,216,209,
	218,220,210,
	210,220,253,
	210,253,255,
	212,254,213,
	255,254,212,
	210,255,212,
	213,211,212,
	215,214,216,
	215,216,221,
	221,216,257,
	221,257,264,
	224,227,217,
	217,227,259,
	217,259,262,
	219,261,220,
	262,261,219,
	217,262,219,
	220,218,219,
	253,220,261,
	266,221,264,
	266,222,221,
	225,265,227,
	266,265,225,
	222,266,225,
	227,224,225,
	259,227,265,
	228,230,231,
	231,233,228,
	234,233,231,
	235,234,231,
	231,230,229,
	237,229,236,
	231,229,237,
	235,231,237,
	232,233,234,
	232,234,245,
	245,234,271,
	245,271,269,
	234,235,271,
	235,274,271,
	273,274,247,
	247,274,235,
	247,235,237,
	241,236,239,
	241,237,236,
	247,240,246,
	241,240,247,
	237,241,247,
	241,239,238,
	241,238,240,
	242,243,244,
	248,244,249,
	248,242,244,
	243,268,244,
	269,268,243,
	245,269,243,
	268,276,244,
	276,249,244,
	251,246,250,
	251,247,246,
	247,251,273,
	251,279,273,
	281,249,282,
	248,249,281,
	252,248,281,
	249,276,282,
	256,250,254,
	256,251,250,
	251,256,279,
	256,289,279,
	257,283,258,
	281,283,257,
	252,281,257,
	261,263,253,
	253,263,287,
	253,287,290,
	255,289,256,
	290,289,255,
	253,290,255,
	256,254,255,
	264,258,267,
	264,257,258,
	267,259,265,
	260,259,267,
	258,260,267,
	260,258,285,
	258,283,285,
	260,262,259,
	260,263,262,
	263,260,287,
	260,285,287,
	263,261,262,
	266,264,267,
	267,265,266,
	268,269,270,
	276,270,277,
	276,268,270,
	272,269,271,
	272,270,269,
	270,272,278,
	270,278,277,
	275,271,274,
	275,272,271,
	272,275,280,
	272,280,278,
	275,274,273,
	280,273,279,
	280,275,273,
	277,282,276,
	284,282,277,
	286,284,277,
	277,278,288,
	277,288,286,
	278,280,291,
	278,291,288,
	291,279,289,
	291,280,279,
	281,282,284,
	283,281,284,
	284,285,283,
	284,286,285,
	286,287,285,
	286,288,287,
	288,290,287,
	288,291,290,
	291,289,290
	
	]);