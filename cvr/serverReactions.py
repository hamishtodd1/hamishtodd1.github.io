#TODO the syntax here looks awful. Fuck msg["blah"], just want to write blah. Can't use .blah. Ask someone
#The terrifying thing is desynchronizing coot's model and CVR's
#a "reset server" button would be nice
#But we reeeeeeally need Paul to get that test page working

from os import listdir
from coot import *
# import json

# pdbFileString = "/home/htodd/CVR/modelsAndMaps/drugIsInteresting.pdb";
# handle_read_draw_molecule_with_recentre(pdbFileString, 1)

# mtzFileString = "/home/htodd/CVR/data/tutorial.mtz"
mtzFileString = "/home/htodd/CVR/modelsAndMaps/jp.mtz"
make_and_draw_map( mtzFileString, "FWT", "PHWT", "", 0, 0)
# mapFileString = "/home/htodd/CVR/data/drugIsInteresting.map";
# handle_read_ccp4_map( mapFileString, 0 ) #second arg is whether it's a difference map

self = ""

import base64

def connect(selfValue):
	global self
	self = selfValue

	modelImol = 0
	modelMsg = {'command':"model"}
	modelMsg['modelDataString'] = str( get_bonds_representation(modelImol) ) #does it need to be in a string? environment distances didn't need to be
	self.write_message( modelMsg )

	# mapMsg = {'command':"mapFilename",'mapFilename':'drugIsInteresting.map'}
	# self.write_message( mapMsg )

	nameOfTemporaryFile = "export.map"
	export_map(imol_refinement_map(), nameOfTemporaryFile)
	mapFile = open( nameOfTemporaryFile )
	mapString = mapFile.read()
	mapFile.close()
	encoded = base64.b64encode(mapString)
	msg = {'command':"map", 'dataString':encoded}
	self.write_message( msg )

def command(msg):
	if msg["command"] == "deleteAtom":
		delete_atom(msg["imol"],msg["chainId"],msg["resNo"],msg["insertionCode"],msg["name"],msg["altloc"]);
		print("warning, this used to say self.write_message(msgContainer)")
		self.write_message(msg);

	if msg["command"] == "newResidue":
		add_residue_with_atoms(msg["imol"],msg["chainId"],msg["atoms"])

	elif msg["command"] == "getEnvironmentDistances":
		returnMsg = {"command":"environmentDistances"}
		returnMsg["data"] = get_environment_distances_representation_py( 
			msg["imol"], [ msg["chainId"], msg["resNo"], msg["insertionCode"] ] )
		returnMsg["imol"] = msg["imol"]
		self.write_message( returnMsg )

	elif msg["command"] == "moveAtom":
		set_atom_attribute(msg["imol"], msg["chainId"], msg["resNo"], msg["insertionCode"], msg["name"], msg["altloc"], "x", msg["x"]);
		set_atom_attribute(msg["imol"], msg["chainId"], msg["resNo"], msg["insertionCode"], msg["name"], msg["altloc"], "y", msg["y"]);
		set_atom_attribute(msg["imol"], msg["chainId"], msg["resNo"], msg["insertionCode"], msg["name"], msg["altloc"], "z", msg["z"]);

	elif msg["command"] == "autoFitBestRotamer":
		imolMap = imol_refinement_map();
		clashFlag = 1;
		lowestProbability = 0.01;

		auto_fit_best_rotamer(
			msg["resNo"], msg["altloc"], msg["insertionCode"],msg["chainId"],msg["imol"],
			imolMap, clashFlag, lowestProbability);

		returnMsg = {"command":"residueInfo"}
		returnMsg["atoms"] = residue_info_py( msg["imol"],msg["chainId"], msg["resNo"], msg["insertionCode"] );
		returnMsg["imol"] = msg["imol"]
		self.write_message(returnMsg)

	elif msg["command"] == "mutateAndAutoFit":
		imolMap = imol_refinement_map();

		mutate_and_auto_fit( msg["resNo"], msg["chainId"],msg["imol"], imolMap, msg["newResidue"])

		returnMsg = {"command":"residueCorrectionFromMutateAndAutofit"}
		returnMsg["atomList"] = residue_info_py(msg["imol"],msg["chainId"], msg["resNo"], msg["insertionCode"] );
		
		print(returnMsg)
		# self.write_message(returnMsg)

	elif msg["command"] == "save":
		#have them select an atom?
		write_pdb_file(msg["imol"],"VR_SESSION_MODEL.pdb")

	#--------------Spectation stuff
	elif msg["command"] == "requestingSpectatorData":
		# view-matrix
		spectatorDataMessage = {
			"command":"spectatorCameraUpdate",
			"position":[0,0,0],
			"quaternion":[0,0,0,1],
			"pointsOnMouseRay0":[0,0,0],
			"pointsOnMouseRay1":[0,0,0],
		}
		self.write_message(returnMsg)

	elif msg["command"] == "vrSpectatorData":
		msg["vrHeadPosition"]
		# set-view-matrix

	#-------------Refinement stuff
	elif msg["command"] == "commenceRefinement":
		print("commencing")
		startedStatus = refine_residues_py(msg["imol"], msg["residues"] )

		if startedStatus == False:
			print("disallowed refinement???")

	elif msg["command"] == "ceaseRefinement":
		sendIntermediateRepresentation()
		accept_regularizement()

	# elif msg["command"] == "forceRestraint":
	# 	atomSpec = [msg["imol"], msg["chainId"], msg["resNo"], msg["insertionCode"], msg["name"], msg["altloc"]]
	# 	#ohhh but probably want to clear other created restraints
	# 	drag_intermediate_atom_py(atomSpec,msg["newPosition"])

	#------------No more refinement stuff
	else:
		print('received unrecognized message:', msg, msg["command"])

def sendIntermediateRepresentation():
	print( "getting intermediate represenation" )
	intermediateRepresentation = get_intermediate_atoms_bonds_representation()
	if intermediateRepresentation != False:
		print("and sending it too")
		returnMsg = {
			"command":"intermediateAtoms",
			"imol":0, #TODO
			"intermediateAtoms":intermediateRepresentation
		}
		self.write_message(returnMsg)
	else:
		print("but not sending it")

def boog():
	print("OOOOOOOOOOOOOOOOOOOOOOOOOO")
set_python_draw_function( "boog()" )

# set_python_draw_function( "sendIntermediateRepresentation()" )

def getStats(imol):
	# cis_peptides()
	residueSpecs = all_residues(imol)
	residueCorrelations = map_to_model_correlation_per_residue_py(imol, residueSpecs, 1, imol_refinement_map())
	residueDistortions = residues_distortions_py(imol, residueSpecs)
	rotamerScores = all_molecule_rotamer_score_py()
	ramachandranScores = all_molecule_ramachandran_score_py()
	self.write_message(residueSpecs, residueCorrelations, residueDistortions, rotamerScores, ramachandranScores)