/* ************************************ */
/* Define helper functions */
/* ************************************ */

//FUNCTIONS FOR GETTING FMRI SEQUENCES
function getdesignITIs(design_num) {
	x = fetch(pathDesignSource+'design_'+design_num+'/ITIs_clean.txt').then(res => res.text()).then(res => res).then(text => text.split(/\r?\n/));
	return x
} 
function getdesignEvents(design_num) {
	x = fetch(pathDesignSource+'design_'+design_num+'/events_clean.txt').then(res => res.text()).then(res => res).then(text => text.split(/\r?\n/));
	return x
}

function insertBufferITIs(design_ITIs) {
	var buffer_ITIs = genITIs()
	var out_ITIs = []
	while(design_ITIs.length > 0) {
		out_ITIs = out_ITIs.concat(buffer_ITIs.slice(0,2)) //get 2 buffer ITIs to start each block
		buffer_ITIs = buffer_ITIs.slice(2,) //remove the just used buffer ITIs from the buffer ITI array
		
		curr_block_ITIs = design_ITIs.slice(0,numTrialsPerBlock) //get this current block's ITIs
		design_ITIs = design_ITIs.slice(numTrialsPerBlock,) //remove this current block's ITIs from des_ITIs

		out_ITIs = out_ITIs.concat(curr_block_ITIs) //add this current block's ITI's to the out array
	}
	return out_ITIs
}

//Functions added for in-person sessions
function genITIs() { 
	mean_iti = 0.5 //mean and standard deviation of 0.5 secs
	min_thresh = 0
	max_thresh = 4

	lambda = 1/mean_iti
	iti_array = []
	for (i=0; i < exp_len +numTestBlocks ; i++) { //add 3 ITIs per test block to make sure there are enough
		curr_iti = - Math.log(Math.random()) / lambda;
		while (curr_iti > max_thresh || curr_iti < min_thresh) {
			curr_iti = - Math.log(Math.random()) / lambda;
		}
		iti_array.push(curr_iti*1000) //convert ITIs from seconds to milliseconds

	}
	return(iti_array)
}

function getITI_stim() { //added for fMRI compatibility
	var currITI = ITIs_stim.shift()
	if (currITI == 0.0) { //THIS IS JUST FOR CONVENIENCE BEFORE NEW DESIGNS ARE REGENERATED
		currITI = 0.1
	}
	return currITI
}

function getITI_resp() { //added for fMRI compatibility
	var currITI = ITIs_resp.shift()
	if (currITI == 0.0) { //THIS IS JUST FOR CONVENIENCE BEFORE NEW DESIGNS ARE REGENERATED
		currITI = 0.1
	}
	return currITI
}

function getDisplayElement() {
    $('<div class = display_stage_background></div>').appendTo('body')
    return $('<div class = display_stage></div>').appendTo('body')
}

function addID() {
  jsPsych.data.addDataToLastTrial({exp_id: 'shape_matching_with_spatial_task_switching__fmri'})
}

function assessPerformance() {
	var experiment_data = jsPsych.data.getTrialsOfType('poldrack-single-stim')
	var missed_count = 0
	var trial_count = 0
	var rt_array = []
	var rt = 0
	var correct = 0

		//record choices participants made
	var choice_counts = {}
	choice_counts[-1] = 0
	choice_counts[77] = 0
	choice_counts[90] = 0
	possible_responses = getPossibleResponses()
	for (var k = 0; k < possible_responses.length; k++) {
		choice_counts[possible_responses[k][1]] = 0
	}
	for (var i = 0; i < experiment_data.length; i++) {
		if (experiment_data[i].trial_id == 'test_trial') {
			trial_count += 1
			rt = experiment_data[i].rt
			key = experiment_data[i].key_press
			choice_counts[key] += 1
			if (rt == -1) {
				missed_count += 1
			} else {
				rt_array.push(rt)
			}
			
			if (key == experiment_data[i].correct_response){
				correct += 1
			}
		}	
	}

	
	//calculate average rt
	var avg_rt = -1
	if (rt_array.length !== 0) {
		avg_rt = math.median(rt_array)
	} 
	//calculate whether response distribution is okay
	var responses_ok = true
	Object.keys(choice_counts).forEach(function(key, index) {
		if (choice_counts[key] > trial_count * 0.85) {
			responses_ok = false
		}
	})
	var missed_percent = missed_count/trial_count
	var accuracy = correct / trial_count
	credit_var = (missed_percent < 0.25 && avg_rt > 200 && responses_ok && accuracy > 0.60)
	jsPsych.data.addDataToLastTrial({final_credit_var: credit_var,
									 final_missed_percent: missed_percent,
									 final_avg_rt: avg_rt,
									 final_responses_ok: responses_ok,
									 final_accuracy: accuracy})
}

var getInstructFeedback = function() {
	return '<div class = centerbox><p class = center-block-text>' + feedback_instruct_text +
		'</p></div>'
}

var getFeedback = function() {
	return '<div class = bigbox><div class = picture_box><p class = block-text><font color="white">' + feedback_text + '</font></p></div></div>'
}


var randomDraw = function(lst) {
  var index = Math.floor(Math.random() * (lst.length))
  return lst[index]
}

function getRandomInt(max) {
	return Math.floor(Math.random() * Math.floor(max));
}
//added for motor counterbalancing
function getMotorPerm() {
	return motor_perm
}

function getPossibleResponses(){
	mperm = getMotorPerm()
	if (mperm == 0) {
		stim1 = ['index finger', 89]
		stim2 = ['middle finger', 71]
	} else {
		stim1 = ['middle finger', 71]
		stim2 = ['index finger', 89]
	}
	return [stim1, stim2]
}


function getChoices() {
	return [getPossibleResponses()[0][1],getPossibleResponses()[1][1]]
}

//added for spatial task
var makeTaskSwitches = function(numTrials) {
	task_switch_arr = ['td_same_tstay_cswitch', 'td_same_tstay_cstay', 'td_same_tswitch_cswitch',
	'td_diff_tstay_cswitch', 'td_diff_tstay_cstay', 'td_diff_tswitch_cswitch',
	'td_na_tstay_cswitch', 'td_na_tstay_cstay', 'td_na_tswitch_cswitch']

	out = jsPsych.randomization.repeat(task_switch_arr, numTrials)
	return out
}

//added for spatial task
var getQuad = function(oldQuad, curr_switch) {
	var out;
	
	if (curr_switch.includes("tstay_cstay")) {
		out = oldQuad;
	}
	
	if (curr_switch.includes("tstay_cswitch")) {
		if (oldQuad % 2 == 0) { // if even (2,4), subtract 1
			out = oldQuad - 1;
		} else {
			out = oldQuad + 1; //if odd (1,3), add 1
		}
	}
	
	if (curr_switch.includes("tswitch_cswitch")) {
		if (oldQuad < 3) { //if in top quadrants (1,2)
			out = Math.ceil(Math.random() * 2) + 2; // should return 3 or 4
		} else  { //if in bottom quadrants (3,4) 
			out = Math.ceil(Math.random() * 2);  // should return 1 or 2
		}
	}
	
	return out;
};


var getCorrectResponse = function(shape_matching_condition, whichQuad) {
	var out;
	if (whichQuad < 3){
		if (shape_matching_condition[0] == 'S') {
			out = getPossibleResponses()[0][1]
		} else {
			out = getPossibleResponses()[1][1]
		}
	}
	else {
		if (shape_matching_condition[0] == 'S') {
			out = getPossibleResponses()[1][1]
		} else {
			out = getPossibleResponses()[0][1]
		}
	}
	return out;
}

function makeShapeMatchingDesignTrialTypes(design_events) {
		//['SSS', 'SDD', 'SNN', 'DSD', 'DDD', 'DDS', 'DNN']
		//neurodesign's events refer to the middle letter
		var trial_type_arr = []
		for (var i = 0; i < design_events.length; i++) {
		console.log('shapematching i', i)
		var idx;
		var possible_events;
		console.log('design_events[i]', design_events[i])
	
		if (design_events[i].includes('td_same')) {
			possible_events = ['SSS', 'DSD']
			idx = getRandomInt(2)
			trial_type_arr.push(possible_events[idx])
		  }
	
		if (design_events[i].includes('td_diff')) {
			possible_events = ['SDD', 'DDD', 'DDS']
			idx = getRandomInt(3)
			trial_type_arr.push(possible_events[idx])
		  }
	
		if (design_events[i].includes('td_na')) {
			possible_events = ['SNN', 'DNN']
			idx = getRandomInt(2)
			trial_type_arr.push(possible_events[idx])
		  }
		}
		return trial_type_arr
	}
	

var createTrialTypes = function(task_conditions){
	var whichQuadStart = jsPsych.randomization.repeat([1,2,3,4],1).pop()
	var shape_matching_trial_type_list = []
	shape_matching_trial_type_list = makeShapeMatchingDesignTrialTypes(task_conditions)
	console.log('shape_matching_trial_type_list', shape_matching_trial_type_list)
	
	var probe_i = randomDraw([1,2,3,4,5,6,7,8,9,10])
	var target_i = 0
	var distractor_i = 0

	// for first stim
	shape_matching_condition = shape_matching_trial_type_list[0]
	if (shape_matching_condition[0] == 'S') {
		target_i = probe_i
		correct_response = getCorrectResponse(shape_matching_condition, whichQuadStart)
	} else {
		target_i = randomDraw([1,2,3,4,5,6,7,8,9,10].filter(function(y) {return y != probe_i}))				
		correct_response = getCorrectResponse(shape_matching_condition, whichQuadStart)
	
	}
	
	if (shape_matching_condition[1] == 'S') {
		distractor_i = target_i
	} else if (shape_matching_condition[2] == 'S') {
		distractor_i = probe_i
	} else if (shape_matching_condition[2] == 'D') {
		distractor_i = randomDraw([1,2,3,4,5,6,7,8,9,10].filter(function(y) {return $.inArray(y, [target_i, probe_i]) == -1}))
	} else if (shape_matching_condition[2] == 'N'){
		distractor_i = 'none'
	}
	
		
	var stims = []
	
	var first_stim = {
		whichQuad: whichQuadStart,
		predictable_condition: 'N/A',
		shape_matching_condition: shape_matching_condition,
		probe: probe_i,
		target: target_i,
		distractor: distractor_i,
		correct_response: correct_response
		}
	stims.push(first_stim)
	
	oldQuad = whichQuadStart
	for (var i = 0; i < task_conditions.length; i++){
		console.log('i: ', i)
		shape_matching_condition = shape_matching_trial_type_list[i]
		quadIndex = getQuad(oldQuad, task_conditions[i])
		probe_i = randomDraw([1,2,3,4,5,6,7,8,9,10])
		target_i = 0
		distractor_i = 0
		console.log('shape_matching_condition: ', shape_matching_condition)
		if (shape_matching_condition[0] == 'S') {
			target_i = probe_i
			correct_response = getCorrectResponse(shape_matching_condition, quadIndex)
		} else {
			target_i = randomDraw([1,2,3,4,5,6,7,8,9,10].filter(function(y) {return y != probe_i}))				
			correct_response = getCorrectResponse(shape_matching_condition, quadIndex)
		
		}
		
		if (shape_matching_condition[1] == 'S') {
			distractor_i = target_i
		} else if (shape_matching_condition[2] == 'S') {
			distractor_i = probe_i
		} else if (shape_matching_condition[2] == 'D') {
			distractor_i = randomDraw([1,2,3,4,5,6,7,8,9,10].filter(function(y) {return $.inArray(y, [target_i, probe_i]) == -1}))
		} else if (shape_matching_condition[2] == 'N'){
			distractor_i = 'none'
		}
		stim = {
			whichQuad: quadIndex,
			predictable_condition: task_conditions[i],
			shape_matching_condition: shape_matching_condition,
			probe: probe_i,
			target: target_i,
			distractor: distractor_i,
			correct_response: correct_response
			}
		
		stims.push(stim)
		
		oldQuad = quadIndex
	}

	return stims	
}	

var getResponse = function() {
	return correct_response
}

var getStim = function(){
	if ((shape_matching_condition == "SNN") || (shape_matching_condition == "DNN")){
		return task_boards[whichQuadrant - 1][0]+ preFileType + target + '_green' + fileTypePNG + 
			   task_boards[whichQuadrant - 1][1]+
			   task_boards[whichQuadrant - 1][2]+ preFileType + probe + '_white' + fileTypePNG + 
			   task_boards[whichQuadrant - 1][3]		   
			
	} else {
	
		return task_boards[whichQuadrant - 1][0]+ preFileType + target + '_green' + fileTypePNG + 
			   task_boards[whichQuadrant - 1][1]+ preFileType + distractor + '_red' + fileTypePNG + 
			   task_boards[whichQuadrant - 1][2]+ preFileType + probe + '_white' + fileTypePNG + 
			   task_boards[whichQuadrant - 1][3]		   
	}
}
		
var getMask = function(){
	stim = stims.shift() //stims = [] at initial stage
	predictable_condition = stim.predictable_condition
	shape_matching_condition = stim.shape_matching_condition
	probe = stim.probe
	target = stim.target
	distractor = stim.distractor
	correct_response = stim.correct_response
	whichQuadrant = stim.whichQuad
	
	return mask_boards[whichQuadrant - 1][0]+ preFileType + 'mask' + fileTypePNG + 
		   '<div class = centerbox><div class = fixation>+</div></div>' +
		   mask_boards[whichQuadrant - 1][1]+ preFileType + 'mask' + fileTypePNG + 
		   '<div class = centerbox><div class = fixation>+</div></div>' +
		   mask_boards[whichQuadrant - 1][2]
}


var getFixation = function(){
	stim = stims.shift() //stims = [] at initial stage
	console.log('fixation stim :', stim)
	predictable_condition = stim.predictable_condition
	shape_matching_condition = stim.shape_matching_condition
	probe = stim.probe
	target = stim.target
	distractor = stim.distractor
	correct_response = stim.correct_response
	whichQuadrant = stim.whichQuad
		
	return '<div class = centerbox><div class = fixation>+</div></div>' //changed for spatial
}


var appendData = function(){
	curr_trial = jsPsych.progress().current_trial_global
	trial_id = jsPsych.data.getDataByTrialIndex(curr_trial).trial_id
	current_trial+=1

	task_switch = 'na'
	if (current_trial > 1) {
		task_switch = task_conditions[current_trial - 2] //this might be off
	}
	
	
	if (trial_id == 'refresh_trial'){
		current_block = refreshCount
	} else if (trial_id == 'test_trial'){
		current_block = testCount
	}
	
	jsPsych.data.addDataToLastTrial({
		predictable_condition: predictable_condition,
		task_switch: task_switch,
		shape_matching_condition: shape_matching_condition,
		probe: probe,
		target: target,
		distractor: distractor,
		correct_response: correct_response,
		whichQuadrant: whichQuadrant,
		current_trial: current_trial
		
	})
	
	if (jsPsych.data.getDataByTrialIndex(curr_trial).key_press == correct_response){
		jsPsych.data.addDataToLastTrial({
			correct_trial: 1,
		})

	} else if (jsPsych.data.getDataByTrialIndex(curr_trial).key_press != correct_response){
		jsPsych.data.addDataToLastTrial({
			correct_trial: 0,
		})
	}
}

function getRefreshTrialID() {
	return refresh_trial_id
}

function getRefreshFeedbackTiming() {
	return refresh_feedback_timing
}

function getRefreshResponseEnds() {
	return refresh_response_ends
}

function getRefreshFeedback(){
	if (getRefreshTrialID()=='instructions'){
		return 		'<div class = centerbox>'+
		'<p class = block-text>In this experiment, across trials you will see shapes on the screen in one of 4 quadrants. '+
		'On every trial, one quadrant will have a white shape on the right and a green shape on the left.</p> '+
	
		'<p class = block-text>You will be asked if the green shape is the same as or different from the white shape, depending on which quadrant '+
		'the shapes are in.</p>'+
		'<p class = block-text>When in the top two quadrants, please judge whether the two shapes are <i>the same</i>. Press the <i>'+getPossibleResponses()[0][0]+
		'  </i>if they are <i>the same</i>, and the <i>'+getPossibleResponses()[1][0]+'  </i>if they are <i>different</i>.</p>'+

		'<p class = block-text>When in the bottom two quadrants, please judge whether the two shapes are <i>different.</i>'+
		' Press the <i>'+getPossibleResponses()[0][0]+' </i> if they are <i> different</i>, and the <i>'+getPossibleResponses()[1][0]+
		' </i> if they are <i>the same</i>.</p>'+
	
		'<p class = block-text>On some trials a red shape will also be presented on the left. '+
		'You should ignore the red shape — your task is to respond based on whether the white and green shapes match or mismatch.</p>'+
	
		'<p class = block-text>During practice, you will receive a reminder of the rules. <i>This reminder will be taken out for test</i>.</p>'
	} else {
		return '<div class = bigbox><div class = picture_box><p class = instruct-text><font color="white">' +refresh_feedback_text+ '</font></p></div></div>'
	}
}
function getTimeoutMessage() {
	return '<div class = fb_box><div class = center-text>Respond Faster!</div></div>' +
	getPromptText()
}

/* ************************************ */
/* Define experimental variables */
/* ************************************ */
// generic task variables
var run_attention_checks = false
var sumInstructTime = 0 //ms
var instructTimeThresh = 0 ///in seconds
var credit_var = 0

// task specific variables
// Set up variables for stimuli
var refresh_len = 8
var exp_len = 288 
var numTrialsPerBlock = 72; 
var numTestBlocks = exp_len / numTrialsPerBlock

var accuracy_thresh = 0.75
var rt_thresh = 1000
var missed_thresh = 0.10
var practice_thresh =  3 //blocks of 28 trials
 

var shape_matching_conditions = ['DDD','SDD','DSD','DDS','SSS','SNN','DNN']


var fileTypePNG = ".png'></img>"
var preFileType = "<img class = center src='/static/experiments/shape_matching_with_spatial_task_switching__fmri/images/"
var pathSource = '/static/experiments/shape_matching_with_spatial_task_switching__fmri/images/'
var pathDesignSource = '/static/experiments/shape_matching_with_spatial_task_switching__fmri/designs/' 
var colors = ['white','red','green']

var exp_stage = 'practice'
var current_trial = 0

var shape_stim = []
for (var i = 1; i<11; i++) {
	for (var c = 0; c<3; c++) {
		shape_stim.push(pathSource + i + '_' + colors[c] + '.png')
	}
}
jsPsych.pluginAPI.preloadImages(shape_stim.concat(pathSource+'mask.png'))

// Trial types denoted by three letters for the relationship between:
// probe-target, target-distractor, distractor-probe of the form
// SDS where "S" = match and "D" = non-match, N = "Neutral"
//['SSS', 'SDD', 'SNN', 'DSD', 'DDD', 'DDS', 'DNN']



var task_boards = [[['<div class = bigbox><div class = quad_box><div class = decision-top-left><div class = leftbox>'],['</div><div class = distractorbox>'],['</div><div class = rightbox>'],['</div></div><div class = decision-top-right></div><div class = decision-bottom-right></div><div class = decision-bottom-left></div></div></div>']],
				   [['<div class = bigbox><div class = quad_box><div class = decision-top-left></div><div class = decision-top-right><div class = leftbox>'],['</div><div class = distractorbox>'],['</div><div class = rightbox>'],['</div></div><div class = decision-bottom-right></div><div class = decision-bottom-left></div></div></div>']],
				   [['<div class = bigbox><div class = quad_box><div class = decision-top-left></div><div class = decision-top-right></div><div class = decision-bottom-right><div class = leftbox>'],['</div><div class = distractorbox>'],['</div><div class = rightbox>'],['</div></div><div class = decision-bottom-left></div></div></div>']],
				   [['<div class = bigbox><div class = quad_box><div class = decision-top-left></div><div class = decision-top-right></div><div class = decision-bottom-right></div><div class = decision-bottom-left><div class = leftbox>'],['</div><div class = distractorbox>'],['</div><div class = rightbox>'],['</div></div></div></div>']]]

var mask_boards = [
					[
						['<div class = bigbox><div class = quad_box><div class = decision-top-left><div class = leftbox>'],
						['</div><div class = rightbox>'],
						['</div></div><div class = decision-top-right></div><div class = decision-bottom-right></div><div class = decision-bottom-left></div></div></div>']
					],
					[
						['<div class = bigbox><div class = quad_box><div class = decision-top-left></div><div class = decision-top-right><div class = leftbox>'],
						['</div><div class = rightbox>'],
						['</div></div><div class = decision-bottom-right></div><div class = decision-bottom-left></div></div></div>']
					],
					[
						['<div class = bigbox><div class = quad_box><div class = decision-top-left></div><div class = decision-top-right></div><div class = decision-bottom-right><div class = leftbox>'],
						['</div><div class = rightbox>'],
						['</div></div><div class = decision-bottom-left></div></div></div>']
					],
					[
						['<div class = bigbox><div class = quad_box><div class = decision-top-left></div><div class = decision-top-right></div><div class = decision-bottom-right></div><div class = decision-bottom-left><div class = leftbox>'],
						['</div><div class = rightbox>'],
						['</div></div></div></div>']
					]
				  ]


var fixation_boards = [['<div class = bigbox><div class = quad_box><div class = decision-top-left><div class = fixation>+</div></div></div></div>'],
					   ['<div class = bigbox><div class = quad_box><div class = decision-top-right><div class = fixation>+</div></div></div></div>'],
					   ['<div class = bigbox><div class = quad_box><div class = decision-bottom-right><div class = fixation>+</div></div></div></div>'],
					   ['<div class = bigbox><div class = quad_box><div class = decision-bottom-left><div class = fixation>+</div></div></div></div>']]


//ADDED FOR SCANNING
//fmri variables
var ITIs_stim = []
var ITIs_resp = []


var refresh_trial_id = "instructions"
var refresh_feedback_timing = -1
var refresh_response_ends = true

var motor_perm = 0

var getPromptTextList = function(){ 
	return'<ul style="text-align:left; font-size: 32px; line-height:1.2;">'+
					  '<li>Top 2 quadrants: Answer if the green and white shapes are the same</li>' +
					  '<li>Same: ' + getPossibleResponses()[0][0] + '</li>' +
					  '<li>Different: ' + getPossibleResponses()[1][0] + '</li>' +
					  '<li>Bottom 2 quadrants: Answer if the green and white shapes are different</li>' +
					  '<li>Different: ' + getPossibleResponses()[0][0] + '</li>' +
					  '<li>Same: ' + getPossibleResponses()[1][0] + '</li>' +
					'</ul>'
}

var getPromptText = function(){
return '<div class = prompt_box>'+
				'<p class = center-block-text style = "font-size:26px; line-height:80%%;">Top 2 quadrants: Answer if the green and white shapes are the same </p>' +
				  '<p class = center-block-text style = "font-size:26px; line-height:80%%;">Same: ' + getPossibleResponses()[0][0]+ ' | Different: ' + getPossibleResponses()[1][0] + '</p>' +
				  '<p>&nbsp</p>' +
		'<p>&nbsp</p>' +
				  '<p class = center-block-text style = "font-size:26px; line-height:80%%;">Bottom 2 quadrants: Answer if the green and white shapes are different </p>' +
				  '<p class = center-block-text style = "font-size:26px; line-height:80%%;">Different: ' + getPossibleResponses()[0][0] + ' | Same: ' + getPossibleResponses()[1][0] + '</p>' +
		  '</div>'
}
/* ************************************ */
/* Set up jsPsych blocks */
/* ************************************ */
var des_ITIs = []
var des_events = []

var design_setup_block = {
	type: 'survey-text',
	data: {
		trial_id: "design_setup"
	},
	questions: [
		[
			"<p class = center-block-text>Design permutation (0-1):</p>"
		]
	], on_finish: async function(data) {
		design_perm =parseInt(data.responses.slice(7, 10))
		des_ITIs = await getdesignITIs(design_perm)
		des_ITIs = des_ITIs.map(Number)
		des_ITIs = insertBufferITIs(des_ITIs)
		ITIs_stim = des_ITIs.slice(0)
		ITIs_resp = des_ITIs.slice(0)
		des_events = await getdesignEvents(design_perm)
	}
}

var motor_setup_block = {
	type: 'survey-text',
	data: {
		trial_id: "motor_setup"
	},
	questions: [
		[
			"<p class = center-block-text>motor permutation (0-1):</p>"
		]
	], on_finish: function(data) {
		motor_perm=parseInt(data.responses.slice(7, 10))
		task_conditions = makeTaskSwitches(refresh_len)
		stims = createTrialTypes(task_conditions)
		
	}
}

var end_block = {
	type: 'poldrack-text',
	data: {
		trial_id: "end",
	},
	timing_response: 180000,
	text: '<div class = centerbox><p class = center-block-text>Thanks for completing this task!</p><p class = center-block-text>Press <i>enter</i> to continue.</p></div>',
	cont_key: [13],
	timing_post_trial: 0,
	on_finish: function(){
		assessPerformance()
    }
};

var fixation_block = {
	type: 'poldrack-single-stim',
	stimulus: '<div class = centerbox><div class = fixation>+</div></div>',
	is_html: true,
	choices: 'none',
	data: {
		trial_id: "fixation"
	},
	timing_stim: getITI_stim, //500
    timing_response: getITI_resp, //500
	timing_post_trial: 0,
	on_finish: function() {
		jsPsych.data.addDataToLastTrial({'exp_stage': exp_stage})
	}
};

var practice_fixation_block = {
	type: 'poldrack-single-stim',
	stimulus: '<div class = centerbox><div class = fixation>+</div></div>',
	is_html: true,
	choices: 'none',
	data: {
		trial_id: "practice_fixation"
	},
    timing_response: 500,
	timing_post_trial: 0,
	on_finish: function() {
		jsPsych.data.addDataToLastTrial({'exp_stage': exp_stage})
	}
};

var refresh_feedback_block = {
	type: 'poldrack-single-stim',
	stimulus: getRefreshFeedback,
	data: {
		trial_id: getRefreshTrialID
	},
	choices: [32],
	timing_post_trial: 0,
	is_html: true,
	timing_response: getRefreshFeedbackTiming,
	timing_stim: getRefreshFeedbackTiming,
	response_ends_trial: getRefreshResponseEnds,
	on_finish: function() {
		refresh_trial_id = 'practice-no-stop-feedback',
		refresh_feedback_timing = 10000,
		refresh_response_ends = false
	}
};

var feedback_block = {
	type: 'poldrack-single-stim',
	data: {
		trial_id:"feedback_block"
	},
	choices: "none",
	stimulus: getFeedback,
	timing_post_trial: 0,
	is_html: true,
	timing_response: 10000,
	response_ends_trial: false,
};

/* ************************************ */
/*        Set up timeline blocks        */
/* ************************************ */

var practiceTrials = []
practiceTrials.push(refresh_feedback_block)

for (i = 0; i < refresh_len + 1; i++) { 
	var practice_fixation_block = {
		type: 'poldrack-single-stim',
		stimulus: getFixation,
		is_html: true,
		data: {
			"trial_id": "refresh_fixation",
		},
		choices: 'none',
		timing_response: 500, //500
		timing_stim: 500, //500
		timing_post_trial: 0,
		response_ends_trial: false,
		prompt: getPromptText
	}
	
	var practice_block = {
		type: 'poldrack-categorize',
		stimulus: getStim,
		is_html: true,
		choices: getChoices(),
		key_answer: getResponse,
		data: {
			"trial_id": "refresh_trial"
			},
		correct_text: '<div class = fb_box><div class = center-text><font size = 20>Correct!</font></div></div>',
		incorrect_text: '<div class = fb_box><div class = center-text><font size = 20>Incorrect</font></div></div>',
		timeout_message: getTimeoutMessage,
		timing_stim: 1000, //1000
		timing_response:  2000, //2000
		timing_feedback_duration: 500,
		show_stim_with_feedback: false,
		timing_post_trial: 0,
		on_finish: appendData,
		prompt: getPromptText
	}
	practiceTrials.push(practice_fixation_block)
	practiceTrials.push(practice_block)
}


var refreshCount = 0
var practiceNode = {
	timeline: practiceTrials,
	loop_function: function(data){
		refreshCount += 1
		task_conditions = makeTaskSwitches(refresh_len)
		stims = createTrialTypes(task_conditions)
		current_trial = 0
	
		var sum_rt = 0
		var sum_responses = 0
		var correct = 0
		var total_trials = 0
	
		for (var i = 0; i < data.length; i++){
			if (data[i].trial_id == "refresh_trial"){
				total_trials+=1
				if (data[i].rt != -1){
					sum_rt += data[i].rt
					sum_responses += 1
					if (data[i].key_press == data[i].correct_response){
						correct += 1
		
					}
				}
		
			}
	
		}
	
		var accuracy = correct / total_trials
		var missed_responses = (total_trials - sum_responses) / total_trials
		var ave_rt = sum_rt / sum_responses
	
		refresh_feedback_text = '</p><p class = block-text style = "font-size:32px; line-height:1.2;">Please take this time to read your feedback and to take a short break!'

		if (accuracy < accuracy_thresh){
			refresh_feedback_text +=
					'</p><p class = block-text style = "font-size:32px; line-height:1.2;"> Remember: <br>' + getPromptTextList()
		}
			
		if (missed_responses > missed_thresh){
			refresh_feedback_text +=
				'</p><p class = block-text style = "font-size:32px; line-height:1.2;">You have not been responding to some trials.  Please respond on every trial that requires a response.'
		}

		if (ave_rt > rt_thresh){
			refresh_feedback_text += 
				'</p><p class = block-text style = "font-size:32px; line-height:1.2;">You have been responding too slowly.'
		}
	
		refresh_feedback_text +=
			'</p><p class = block-text style = "font-size:32px; line-height:1.2;">Done with this practice. The test session will begin shortly.'
		
		task_conditions = des_events.slice(0,numTrialsPerBlock) //GRAB NEWEST BLOCKS WORTH OF TRIALS
		des_events = des_events.slice(numTrialsPerBlock,) //SHAVE OFF THIS BLOCK FROM des_events
		stims = createTrialTypes(task_conditions)
		exp_stage = 'test'
		return false
		
	}

}

var testTrial0 = []
for (i = 0; i < numTrialsPerBlock + 1; i++) {
	var fixation_block = {
		type: 'poldrack-single-stim',
		stimulus: getFixation,
		is_html: true,
		data: {
			"trial_id": "fixation",
		},
		choices: 'none',
		timing_post_trial: 0,
		timing_stim: getITI_stim,
		timing_response: getITI_resp
	}
	
	var test_block = {
		type: 'poldrack-single-stim',
		stimulus: getStim,
		is_html: true,
		data: {
			"trial_id": "test_trial",
		},
		choices: getChoices(),
		fixation_default: true,
		timing_stim: 1000, //1000
		timing_response: 2000, //2000
		timing_post_trial: 0,
		response_ends_trial: false,
		on_finish: appendData
	}
	testTrial0.push(fixation_block)
	testTrial0.push(test_block)
}

var testCount=0

var testNode0 = {
	timeline: testTrial0,
	loop_function: function(data) {
		testCount += 1
    	task_conditions = des_events.slice(0,numTrialsPerBlock) //GRAB NEWEST BLOCKS WORTH OF TRIALS
    	des_events = des_events.slice(numTrialsPerBlock,) //SHAVE OFF THIS BLOCK FROM des_events
    	stims = createTrialTypes(task_conditions)
		console.log('stims.length: ', stims.length)
		current_trial = 0
		
		var sum_rt = 0
		var sum_responses = 0
		var correct = 0
		var total_trials = 0
	
		for (var i = 0; i < data.length; i++){
			if (data[i].trial_id == "test_trial"){
				total_trials+=1
				if (data[i].rt != -1){
					sum_rt += data[i].rt
					sum_responses += 1
					if (data[i].key_press == data[i].correct_response){
						correct += 1
		
					}
				}
		
			}
	
		}
	
		var accuracy = correct / total_trials
		var missed_responses = (total_trials - sum_responses) / total_trials
		var ave_rt = sum_rt / sum_responses
	
		feedback_text = '</p><p class = block-text style = "font-size:32px; line-height:1.2;">Please take this time to read your feedback and to take a short break!'
		feedback_text += '</p><p class = block-text style = "font-size:32px; line-height:1.2;"> You have completed: '+testCount+' out of '+numTestBlocks+' blocks of trials.'
	
		if (accuracy < accuracy_thresh){
			feedback_text +=
				'</p><p class = block-text style = "font-size:32px; line-height:1.2;"> Your accuracy is too low.  Remember: <br>' + getPromptTextList() 
		}

		if (missed_responses > missed_thresh){
			feedback_text +=
				'</p><p class = block-text style = "font-size:32px; line-height:1.2;"> You have not been responding to some trials.  Please respond on every trial that requires a response.'
		}

		if (ave_rt > rt_thresh) {
			feedback_text += 
				'</p><p class = block-text style = "font-size:32px; line-height:1.2;"> You have been responding too slowly.'
		}	

			return false
		}
	
	}


var testTrials = []
testTrials.push(feedback_block)
for (i = 0; i < numTrialsPerBlock + 1; i++) {
	var fixation_block = {
		type: 'poldrack-single-stim',
		stimulus: getFixation,
		is_html: true,
		data: {
			"trial_id": "fixation",
		},
		choices: 'none',
		timing_post_trial: 0,
		timing_stim: getITI_stim,
		timing_response: getITI_resp
	}
	
	var test_block = {
		type: 'poldrack-single-stim',
		stimulus: getStim,
		is_html: true,
		data: {
			"trial_id": "test_trial",
		},
		choices: getChoices(),
		fixation_default: true,
		timing_stim: 1000, //1000
		timing_response: 2000, //2000
		timing_post_trial: 0,
		response_ends_trial: false,
		on_finish: appendData
	}
	testTrials.push(fixation_block)
	testTrials.push(test_block)
}

var testNode = {
	timeline: testTrials,
	loop_function: function(data) {
		testCount += 1
		current_trial = 0
		
		var sum_rt = 0
		var sum_responses = 0
		var correct = 0
		var total_trials = 0
	
		for (var i = 0; i < data.length; i++){
			if (data[i].trial_id == "test_trial"){
				total_trials+=1
				if (data[i].rt != -1){
					sum_rt += data[i].rt
					sum_responses += 1
					if (data[i].key_press == data[i].correct_response){
						correct += 1
		
					}
				}
		
			}
	
		}
	
		var accuracy = correct / total_trials
		var missed_responses = (total_trials - sum_responses) / total_trials
		var ave_rt = sum_rt / sum_responses
	
		feedback_text = '</p><p class = block-text style = "font-size:32px; line-height:1.2;">Please take this time to read your feedback and to take a short break!'
		feedback_text += '</p><p class = block-text style = "font-size:32px; line-height:1.2;"> You have completed: '+testCount+' out of '+numTestBlocks+' blocks of trials.'
		console.log('testCount, numtestblocks:', testCount, numTestBlocks)
		if (accuracy < accuracy_thresh){
			feedback_text +=
				'</p><p class = block-text style = "font-size:32px; line-height:1.2;"> Your accuracy is too low.  Remember: <br>' + getPromptTextList() 
		}

		if (missed_responses > missed_thresh){
			feedback_text +=
				'</p><p class = block-text style = "font-size:32px; line-height:1.2;"> You have not been responding to some trials.  Please respond on every trial that requires a response.'
		}

		if (ave_rt > rt_thresh) {
			feedback_text += 
				'</p><p class = block-text style = "font-size:32px; line-height:1.2;"> You have been responding too slowly.'
		}	

		if (testCount == numTestBlocks){
			feedback_text +=
					'</p><p class = block-text>Done with this test.'
			return false
		} else {

			task_conditions = des_events.slice(0,numTrialsPerBlock) //GRAB NEWEST BLOCKS WORTH OF TRIALS
			des_events = des_events.slice(numTrialsPerBlock,) //SHAVE OFF THIS BLOCK FROM des_events
			stims = createTrialTypes(task_conditions)	

			return true
		}
	
	}
}



/* create experiment definition array */
shape_matching_with_spatial_task_switching__fmri_experiment = []
shape_matching_with_spatial_task_switching__fmri_experiment.push(design_setup_block)
shape_matching_with_spatial_task_switching__fmri_experiment.push(motor_setup_block)

test_keys(shape_matching_with_spatial_task_switching__fmri_experiment, [89, 71])

shape_matching_with_spatial_task_switching__fmri_experiment.push(practiceNode)
shape_matching_with_spatial_task_switching__fmri_experiment.push(refresh_feedback_block)

cni_bore_setup(shape_matching_with_spatial_task_switching__fmri_experiment)
shape_matching_with_spatial_task_switching__fmri_experiment.push(testNode0)
shape_matching_with_spatial_task_switching__fmri_experiment.push(testNode)
shape_matching_with_spatial_task_switching__fmri_experiment.push(feedback_block)

shape_matching_with_spatial_task_switching__fmri_experiment.push(end_block)