/* ************************************ */
/*       Define Helper Functions        */
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
	jsPsych.data.addDataToLastTrial({exp_id: 'spatial_task_switching_with_cued_task_switching__fmri'})
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
			
			if (key == experiment_data[i].correct_response) {
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

var randomDraw = function(lst) {
  var index = Math.floor(Math.random() * (lst.length))
  return lst[index]
}

//added for motor counterbalancing
function getMotorPerm() {
	return motor_perm
}
function getCurrTask() {
	return curr_task
  }

function getPossibleResponses(){
	mperm = getMotorPerm()
	if (mperm%2==0) {
		stim1 = [['middle finger', 71],['index finger', 89]]
	} else {
		stim1 = [['index finger', 89], ['middle finger', 71]]
	}
	if (mperm<2){
		stim2 = [['middle finger', 71],['index finger', 89]]
	} else {
		stim2 = [['index finger', 89], ['middle finger', 71]]
	}
	return [stim1, stim2]
}

function getChoices() {
	return [getPossibleResponses()[0][0][1],getPossibleResponses()[0][1][1]]
}

function getAllIndexes(arr, val) {
    var indexes = [], i = -1;
    while ((i = arr.indexOf(val, i+1)) != -1){
        indexes.push(i);
    }
    return indexes;
}

function getAllIndexesList(arr,val){
	all_indexes = []
	for(var i = 0; i < arr.length; i++){
		indexes = getAllIndexes(arr[i],val)

		if (indexes.length !== 0){
			indexes.push(i)
			all_indexes.push(indexes)
		}
	}
	//this function will return an array, temp, containing indexes for the item, val, in the list of lists, arr.  
	//Temp, will have as many lists, as how many list in lists that we can find at least 1 match for the item, val.  The values in each list in temp, are the indexes for that val in that list from the list of lists
	//The LAST value in each of the lists in, temp, shows which of the lists in arr, the indexes were found from.  
	
	// this function searches a list of list containing strings, for a value.  Will itterively search each list in lists, for a str.
	return all_indexes
}

function getCuedCueCondition(text){
	cued = text.split("_")[0]

	if (cued.includes("cstay")){
		return "stay"
	}
	else if (cued.includes("cswitch")){
		return "switch"
	}
}

function getCuedTaskCondition(text){
	cued = text.split("_")[0]
	if (cued.includes("tstay")){
		return "stay"
	}
	else if (cued.includes("tswitch")){
		return "switch"
	}
}

var getResponse = function() {
	return correct_response
}

var getInstructFeedback = function() {
	return '<div class = centerbox><p class = center-block-text>' + feedback_instruct_text +
		'</p></div>'
}


var getFeedback = function() {
	return '<div class = bigbox><div class = picture_box><p class = block-text><font color="white">' + feedback_text + '</font></p></div></div>'
}

var getCue = function(){
	console.log(whichQuadrant)
	var cue_html = task_boards[whichQuadrant - 1][0] +
				   	'<div class = upperbox><div class = "center-text" >' + curr_cue + '</div></div>' +
				   task_boards[whichQuadrant - 1][1]
				   
  	return cue_html
}

var getFixation = function(){
	stim = stims.shift()
	left_number = stim.left_number
	left_magnitude = stim.left_magnitude
	left_parity = stim.left_parity
	right_number = stim.right_number
	right_magnitude = stim.right_magnitude
	right_parity = stim.right_parity
	correct_response = stim.correct_response
	whichQuadrant = stim.whichQuadrant
	
	cued_condition = stim.cued_condition
	cued_switch_condition = stim.cued_switch_condition
	curr_task = stim.curr_task
	curr_cue = stim.curr_cue
	predictable_condition = stim.predictable_condition
	predictable_dimension = stim.predictable_dimension

		   
	var fixation_html = '<div class = centerbox><div class = fixation>+</div></div>'
				   
  	return fixation_html
}

var getStim = function(){	
		
	return task_boards[whichQuadrant - 1][0] + 
		   	'<div class = upperbox><div class = "center-text" >' + curr_cue + '</div></div>' +
		   	'<div class = lowerbox>' +
				'<div class = left-text><div class = cue-text>' + preFileType + left_number + fileTypePNG + '</div></div>'+
				'<div class = right-text><div class = cue-text>'+ preFileType + right_number + fileTypePNG + '</div></div>'+
		    '</div>'+
		   task_boards[whichQuadrant - 1][1]
}

var getCorrectResponse = function(number, predictable_dimension){
	if (number > 5){
		magnitude = 'high'
	} else if (number < 5){
		magnitude = 'low'
	}

	if (number%2 === 0){
		parity = 'even'
	} else if (number%2 !== 0) {
		parity = 'odd'
	}
	
	par_ind = predictable_dimensions_list[0].values.indexOf(parity)
	if (par_ind == -1){
		par_ind = predictable_dimensions_list[1].values.indexOf(parity)
		mag_ind = predictable_dimensions_list[0].values.indexOf(magnitude)
	} else {
		mag_ind = predictable_dimensions_list[1].values.indexOf(magnitude)
	}
	
	if (predictable_dimension == 'magnitude'){
		correct_response = getPossibleResponses()[0][mag_ind][1]
	} else if (predictable_dimension == 'parity'){
		correct_response = getPossibleResponses()[1][par_ind][1]
	}
	
	return [correct_response,magnitude,parity]

}

//added for spatial task
var makeTaskSwitches = function(numTrials) {
	task_switch_arr = ["cuedtstaycstay_spatialtstaycstay", "cuedtstaycstay_spatialtstaycswitch", "cuedtstaycstay_spatialtswitchcswitch", "cuedtstaycswitch_spatialtstaycstay", 
	"cuedtstaycswitch_spatialtstaycswitch", "cuedtstaycswitch_spatialtswitchcswitch", "cuedtswitchcswitch_spatialtstaycstay", "cuedtswitchcswitch_spatialtstaycswitch", 
	"cuedtswitchcswitch_spatialtswitchcswitch"]

	out = jsPsych.randomization.repeat(task_switch_arr, numTrials / 4)
	return out
}

//added for spatial task
var getQuad = function(oldQuad, curr_switch) {
	var out;
	spatial = curr_switch.split("_")[1]
	if (spatial=="spatialtstaycstay"){
		out = oldQuad
	}
	else if (spatial=="spatialtswitchcswitch"){
		if (oldQuad < 3) { //if in top quadrants (1,2)
			out = Math.ceil(Math.random() * 2) + 2 // should return 3 or 4
		} else  { //if in bottom quadrants (3,4) 
			out = Math.ceil(Math.random() * 2)  // should return 1 or 2
		}
	}
	else if (spatial.includes("spatialtstaycswitch")){
		if (oldQuad%2==0) { // if even (2,4), subtract 1
			out = oldQuad - 1
		} else {
			out = oldQuad + 1 //if odd (1,3), add 1
		}
	}
	return out;
}

var createTrialTypes = function(task_switches, numTrialsPerBlock){
	var whichQuadStart = jsPsych.randomization.repeat([1,2,3,4],1).pop()
	var predictable_cond_array = predictable_conditions[whichQuadStart%2]
	var predictable_dimensions = [predictable_dimensions_list[0].dim,
								 predictable_dimensions_list[0].dim,
								 predictable_dimensions_list[1].dim,
								 predictable_dimensions_list[1].dim]
		
	numbers_list = [[6,8],[7,9],[2,4],[1,3]]
	numbers = [1,2,3,4,6,7,8,9]	
	
	/*
	var cued_condition_type_list = []
	var cued_switch_condition_type_list = []
	for(var i = 0; i < 4; i++){
		cued_condition_type_list.push(jsPsych.randomization.repeat(['switch','stay'], numTrialsPerBlock/8))
		cued_switch_condition_type_list.push(jsPsych.randomization.repeat(['switch','stay'], numTrialsPerBlock/8))
	}
	*/
	var all_two_by_two_conditions = []
	var numbers_list = [[6,8],[7,9],[2,4],[1,3]]	
	var task_conds = ['switch','stay']
	var cue_conds = ['switch','stay']
	
	for (var z = 0; z < numbers_list.length; z++){
		var task_cue_conditions = []
		for(var i = 0; i < numTrialsPerBlock / (numbers_list.length*task_conds.length*cue_conds.length); i++){
			for (var x = 0; x < task_conds.length; x++){
				for (var y = 0; y < cue_conds.length; y++){
			
					task_cue_cond = {
						task_cond: task_conds[x],
						cue_cond: cue_conds[y]
			
					}
				
					task_cue_conditions.push(task_cue_cond)
				}
			}
		}
		task_cue_conditions = jsPsych.randomization.repeat(task_cue_conditions, 1)
		all_two_by_two_conditions.push(task_cue_conditions)
	}
	
	predictable_dimension = predictable_dimensions[whichQuadStart - 1]
	curr_task = jsPsych.randomization.repeat(['left','right'],1).pop()
	curr_cue = tasks[curr_task].cues[Math.floor((Math.random() * 2))]
	
	if (curr_task == 'left'){
		left_number = numbers[Math.floor((Math.random() * 8))]
		right_number = randomDraw(numbers.filter(function(y) {return y != left_number}))	
		
		left_response_arr = getCorrectResponse(left_number,predictable_dimension)
		right_response_arr = getCorrectResponse(right_number,predictable_dimension)
		
		correct_response = left_response_arr[0]
		
		left_magnitude = left_response_arr[1]
		left_parity = left_response_arr[2]
		right_magnitude = right_response_arr[1]
		right_parity = right_response_arr[2]
	} else if (curr_task == 'right'){
		right_number = numbers[Math.floor((Math.random() * 8))]
		left_number = randomDraw(numbers.filter(function(y) {return y != right_number}))
		
		left_response_arr = getCorrectResponse(left_number,predictable_dimension)
		right_response_arr = getCorrectResponse(right_number,predictable_dimension)
		
		correct_response = right_response_arr[0]
		
		left_magnitude = left_response_arr[1]
		left_parity = left_response_arr[2]
		right_magnitude = right_response_arr[1]
		right_parity = right_response_arr[2]
	}
	
	
	
	var stims = []
	
	var first_stim = {
		whichQuadrant: whichQuadStart,
		predictable_condition: 'N/A',
		predictable_dimension: predictable_dimension,
		cued_condition: 'N/A',
		cued_switch_condition: 'N/A',
		curr_task: curr_task,
		curr_cue: curr_cue,
		left_number: left_number,
		left_magnitude: left_magnitude,
		left_parity: left_parity,
		right_number: right_number,
		right_magnitude: right_magnitude,
		right_parity: right_parity,
		correct_response: correct_response
		}
	stims.push(first_stim)
	
	oldQuad = whichQuadStart
	console.log('whichQuadStart: ' + whichQuadStart)
	for (var ii = 0; ii < task_switches.length; ii++){
		console.log('count'+ii)
		console.log('oldQuad' + oldQuad)
		quadIdx = getQuad(oldQuad, task_switches[ii]) //changed for spatial task
		console.log('quadIdx' + quadIdx)
		task_switch = task_switches[ii]
		cued_cue_condition = getCuedCueCondition(task_switch)
		cued_task_condition = getCuedTaskCondition(task_switch)
		predictable_dimension = predictable_dimensions[quadIdx - 1]
		predictable_condition = predictable_cond_array[ii%2]
		
		last_task = curr_task
		if (cued_cue_condition == "switch"){ // if switch tasks, pick a random cue and switch to other task
			cued_task_condition = 'switch'
			curr_task = randomDraw(['left','right'].filter(function(y) {return $.inArray(y, [last_task]) == -1}))
			curr_cue = tasks[curr_task].cues[Math.floor(Math.random() * 2)]
		} else if (cued_cue_condition == "stay"){ // if stay tasks, if cued_switch condition is switch, then switch to other cue, stay if not.
			if (cued_task_condition == 'switch'){
			last_cue = curr_cue
			curr_cue = randomDraw(tasks[curr_task].cues.filter(function(y) {return $.inArray(y, [last_cue]) == -1}))
			}
	
		}
	
		if (curr_task == 'left'){
			left_number = numbers[Math.floor((Math.random() * 8))]
			right_number = randomDraw(numbers.filter(function(y) {return y != left_number}))	
		
			left_response_arr = getCorrectResponse(left_number,predictable_dimension)
			right_response_arr = getCorrectResponse(right_number,predictable_dimension)
		
			correct_response = left_response_arr[0]
		
			left_magnitude = left_response_arr[1]
			left_parity = left_response_arr[2]
			
			right_magnitude = right_response_arr[1]
			right_parity = right_response_arr[2]
		} else if (curr_task == 'right'){
			right_number = numbers[Math.floor((Math.random() * 8))]
			left_number = randomDraw(numbers.filter(function(y) {return y != right_number}))
		
			left_response_arr = getCorrectResponse(left_number,predictable_dimension)
			right_response_arr = getCorrectResponse(right_number,predictable_dimension)
		
			correct_response = right_response_arr[0]
		
			left_magnitude = left_response_arr[1]
			left_parity = left_response_arr[2]
			right_magnitude = right_response_arr[1]
			right_parity = right_response_arr[2]
		}
		
		stim = {
			whichQuadrant: quadIdx,
			predictable_condition: predictable_condition,
			predictable_dimension: predictable_dimension,
			cued_condition: cued_cue_condition,
			cued_switch_condition: cued_task_condition,
			curr_task: curr_task,
			curr_cue: curr_cue,
			left_number: left_number,
			left_magnitude: left_magnitude,
			left_parity: left_parity,
			right_number: right_number,
			right_magnitude: right_magnitude,
			right_parity: right_parity,
			correct_response: correct_response
			}
		
		stims.push(stim)

		oldQuad = quadIdx //changed for sptial task		
	}
	return stims	
}

var getCTI = function(){
	return CTI
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

var appendData = function(){
	curr_trial = jsPsych.progress().current_trial_global
	trial_id = jsPsych.data.getDataByTrialIndex(curr_trial).trial_id
	current_trial+=1
	task_switch = 'na'
	if (current_trial > 1) {
		task_switch = task_switches[current_trial - 2] //this might be off
	}


	if (trial_id == 'refresh_trial'){
		current_block = refreshCount
	} else if (trial_id == 'test_trial'){
		current_block = testCount
	}
		
	jsPsych.data.addDataToLastTrial({
		whichQuadrant: whichQuadrant,
		predictable_condition: predictable_condition,
		predictable_dimension: predictable_dimension,
		task_switch: task_switch,
		task_condition: cued_condition,
		cue_condition: cued_switch_condition,
		curr_task: curr_task,
		curr_cue: curr_cue,
		left_number: left_number,
		left_magnitude: left_magnitude,
		left_parity: left_parity,
		right_number: right_number,
		right_magnitude: right_magnitude,
		right_parity: right_parity,
		correct_response: correct_response,
		current_trial: current_trial,
		current_block: current_block,
		CTI: CTI
		
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

function getRefreshFeedback(){
	if (getRefreshTrialID()=='instructions'){
		return 		'<div class = centerbox>'+
		'<p class = block-text>In this experiment, across trials you will see a cue, either <i>left</i>, <i>first</i>, <i>right</i>, or <i>second</i>, followed by 2 numbers in one of 4 quadrants.  '+
		'On any trial, one quadrant will have a cue, followed by 2 numbers.</p> '+
	
		'<p class = block-text>The cue will instruct you which of the following 2 numbers, you must make a judgement on.</p>'+
		
		'<p class = block-text>If you see the cue, <i>left</i> or <i>first</i>, please judge the upcoming left number.</p>'+
		
		'<p class = block-text>If you saw the cue, <i>right</i> or <i>second</i>, please judge the upcoming right number.</p>'+
	
		'<p class = block-text>You will be asked to judge the <i>cued number </i>on magnitude (higher or lower than 5) or parity (odd or even), depending on which quadrant '+
		'the cue and numbers are in.</p>'+
		
		'<p class = block-text>In the top two quadrants, please judge the cued number based on <i>'+predictable_dimensions_list[0].dim+'</i>. Press the <i>'+getPossibleResponses()[0][0][0]+
		'  if '+predictable_dimensions_list[0].values[0]+'</i>, and the <i>'+getPossibleResponses()[0][1][0]+'  if '+predictable_dimensions_list[0].values[1]+'</i>.</p>'+
		/*In the top two quadrants, please judge the cued number based on magnitude. Press the M Key if high, and the Z Key if low.*/

		'<p class = block-text>In the bottom two quadrants, please judge the cued number based on <i>'+predictable_dimensions_list[1].dim+'.</i>'+
		' Press the <i>'+getPossibleResponses()[1][0][0]+ ' if '+predictable_dimensions_list[1].values[0]+'</i>, and the <i>'+getPossibleResponses()[1][1][0]+
		' if '+predictable_dimensions_list[1].values[1]+'</i>.</p>'+
		/*In the bottom two quadrants, please judge the cued number based on parity. Press the M Key if even, and the Z Key if odd.*/
		
		'<p class = block-text>Please judge only the cued number for that trial!</p>'+
		'</div>'
	} else {
		return '<div class = bigbox><div class = picture_box><p class = instruct-text><font color="white">' + refresh_feedback_text + '</font></p></div></div>'
	}
}

function getTimeoutMessage() {
	return '<div class = fb_box><div class = center-text>Respond Faster!</div></div>' +
	getPromptText()
}

/* ************************************ */
/*    Define Experimental Variables     */
/* ************************************ */
// generic task variables
var sumInstructTime = 0 //ms
var instructTimeThresh = 0 ///in seconds
var credit_var = 0
var run_attention_checks = false


var practice_len = 16 // must be divisible by 16
var refresh_len = 8
var exp_len = 288 //320 must be divisible by 16
var numTrialsPerBlock = 48 // 64 must be divisible by 16
var numTestBlocks = exp_len / numTrialsPerBlock
var CTI = 150

var accuracy_thresh = 0.75
var rt_thresh = 1000
var missed_thresh = 0.10
var practice_thresh = 3  // 3 blocks of 16 trials

var pathSource = "/static/experiments/spatial_task_switching_with_cued_task_switching__fmri/images/"
var pathDesignSource = "/static/experiments/spatial_task_switching_with_cued_task_switching__fmri/designs/" //ADDED FOR fMRI SEQUENCES
var fileTypePNG = ".png'></img>"
var preFileType = "<img class = center src='/static/experiments/spatial_task_switching_with_cued_task_switching__fmri/images/"


var numbers_list = [[6,8],[7,9],[2,4],[1,3]]

var predictable_conditions = [['switch','stay'],
							 ['stay','switch']]
							 


var predictable_dimensions_list = [stim = {dim:'magnitude', values: ['high','low']},
								  stim = {dim:'parity', values: ['even','odd']}]

var cued_conditions = jsPsych.randomization.repeat(['stay','switch'],1)
var curr_tasks = jsPsych.randomization.repeat(['right','left'],1)

var tasks = {
  left: {
    task: 'Left',
    cues: ['left', 'first']
  },
  right: {
    task: 'Right',
    cues: ['right', 'second']
  }
}

var current_trial = 0

var getPromptTextList = function(){ 
      return'<ul style="text-align:left;">'+
						'<li>Top 2 quadrants: Judge cued number on '+predictable_dimensions_list[0].dim+'</li>' +
						'<li>'+predictable_dimensions_list[0].values[0]+': ' + getPossibleResponses()[0][0][0] + '</li>' +
						'<li>'+predictable_dimensions_list[0].values[1]+': ' + getPossibleResponses()[0][1][0] + '</li>' +
						'<li>Bottom 2 quadrants: Judge cued number on '+predictable_dimensions_list[1].dim+'</li>' +
						'<li>'+predictable_dimensions_list[1].values[0]+': ' + getPossibleResponses()[1][0][0] + '</li>' +
						'<li>'+predictable_dimensions_list[1].values[1]+': ' + getPossibleResponses()[1][1][0] + '</li>' +
						'<li>Cue was <i>left</i> or <i>first</i>, judge left number</li>' +
						'<li>Cue was <i>right</i> or <i>second</i>, judge right number</li>' +
					  '</ul>'
}

var getPromptText = function(){
  return '<div class = prompt_box>'+
				  '<p class = center-block-text style = "font-size:16px; line-height:80%%;">Top 2 quadrants: Judge cued number on '+predictable_dimensions_list[0].dim+'</p>' +
					'<p class = center-block-text style = "font-size:16px; line-height:80%%;">'+predictable_dimensions_list[0].values[0]+': ' + getPossibleResponses()[0][0][0] + ' | ' + predictable_dimensions_list[0].values[1]+': ' + getPossibleResponses()[0][1][0] + '</p>' +
					'<p>&nbsp</p>' +
          '<p>&nbsp</p>' +
					'<p class = center-block-text style = "font-size:16px; line-height:80%%;">Bottom 2 quadrants: Judge cued number on '+predictable_dimensions_list[1].dim+'</p>' +
					'<p class = center-block-text style = "font-size:16px; line-height:80%%;">'+predictable_dimensions_list[1].values[0]+': ' + getPossibleResponses()[1][0][0] + ' | ' + predictable_dimensions_list[1].values[1]+': ' + getPossibleResponses()[1][1][0] + '</p>' +
					'<p class = center-block-text style = "font-size:16px; line-height:80%%;">Cue was <i>left</i> or <i>first</i>, judge left number</p>' +
					'<p class = center-block-text style = "font-size:16px; line-height:80%%;">Cue was <i>right</i> or <i>second</i>, judge right number</p>' +
	        '</div>'
}

//PRE LOAD IMAGES HERE
var pathSource = "/static/experiments/spatial_task_switching_with_cued_task_switching__fmri/images/"
var numbersPreload = ['1','2','3','4','6','7','8','9']
var images = []

for(i=0;i<numbersPreload.length;i++){
	images.push(pathSource + numbersPreload[i] + '.png')
}

jsPsych.pluginAPI.preloadImages(images);

/* ************************************ */
/*          Define Game Boards          */
/* ************************************ */

var task_boards = [[['<div class = bigbox><div class = quad_box><div class = decision-top-left>'],['</div><div class = decision-top-right></div><div class = decision-bottom-right></div><div class = decision-bottom-left></div></div></div>']],
				   [['<div class = bigbox><div class = quad_box><div class = decision-top-left></div><div class = decision-top-right>'],['</div><div class = decision-bottom-right></div><div class = decision-bottom-left></div></div></div>']],
				   [['<div class = bigbox><div class = quad_box><div class = decision-top-left></div><div class = decision-top-right></div><div class = decision-bottom-right>'],['</div><div class = decision-bottom-left></div></div></div>']],
				   [['<div class = bigbox><div class = quad_box><div class = decision-top-left></div><div class = decision-top-right></div><div class = decision-bottom-right></div><div class = decision-bottom-left>'],['</div></div></div>']]]



var task_switches = makeTaskSwitches(practice_len)
var stims = createTrialTypes(task_switches, practice_len)

//ADDED FOR SCANNING
//fmri variables
var ITIs_stim = []
var ITIs_resp = []


var refresh_trial_id = "instructions"
var refresh_feedback_timing = -1
var refresh_response_ends = true

var motor_perm = 0
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
		des_task_switches = await getdesignEvents(design_perm)
	}
}

var motor_setup_block = {
	type: 'survey-text',
	data: {
		trial_id: "motor_setup"
	},
	questions: [
		[
			"<p class = center-block-text>motor permutation (0-3):</p>"
		]
	], on_finish: function(data) {
		motor_perm=parseInt(data.responses.slice(7, 10))
		task_switches = makeTaskSwitches(refresh_len)
		stims = createTrialTypes(task_switches)
		
	}
}
var end_block = {
	type: 'poldrack-text',
	data: {
		trial_id: "end",
	},
	timing_response:  180000,
	text: '<div class = centerbox><p class = center-block-text>Thanks for completing this task!</p></div>',
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
}

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
}

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
	  choices: 'none',
	  data: {
		trial_id: "refresh_fixation"
	  },
	  timing_post_trial: 0,
	  timing_stim: 500, //500
	  timing_response:  500, //500
	  prompt: getPromptText
	}
	
	var cue_block = {
		type: 'poldrack-single-stim',
		stimulus: getCue,
		is_html: true,
		data: {
			"trial_id": "refresh_cue_block",
		},
		choices: 'none',
		timing_stim: getCTI, //getCTI
		timing_response:  getCTI, //getCTI
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
			trial_id: "refresh_trial"
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
	practiceTrials.push(cue_block)
	practiceTrials.push(practice_block)
}

var refreshCount = 0
var practiceNode = {
	timeline: practiceTrials,
	loop_function: function(data) {
		refreshCount += 1
		task_switches = makeTaskSwitches(refresh_len)
		stims = createTrialTypes(task_switches)
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

		refresh_feedback_text = "<div class = instructbox><p class = instruct-text>Please take this time to read your feedback and to take a short break!"

		if (accuracy < accuracy_thresh){
			refresh_feedback_text +=
					'</p><p class = instruct-text> Remember: <br>' + getPromptTextList()
		}
			
		if (missed_responses > missed_thresh){
			refresh_feedback_text +=
				'</p><p class = instruct-text>You have not been responding to some trials.  Please respond on every trial that requires a response.'
		}

		if (ave_rt > rt_thresh){
			refresh_feedback_text += 
				'</p><p class = instruct-text>You have been responding too slowly.'
		}
	
		refresh_feedback_text +=
			'</p><p class = instruct-text>Done with this practice. The test session will begin shortly.'
		
		
		task_switches = des_task_switches.slice(0,numTrialsPerBlock) //GRAB NEWEST BLOCKS WORTH OF TRIALS
		des_task_switches = des_task_switches.slice(numTrialsPerBlock,) //SHAVE OFF THIS BLOCK FROM des_task_switches
		stims = createTrialTypes(task_switches)
		//stims.reverse() //reverse the order of trial types to match designs
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
		choices: 'none',
		data: {
		trial_id: "fixation"
		},
		timing_post_trial: 0,
		timing_stim: getITI_stim,
		timing_response: getITI_resp
	}
	
	var cue_block = {
		type: 'poldrack-single-stim',
		stimulus: getCue,
		is_html: true,
		data: {
			"trial_id": "test_cue_block",
		},
		choices: 'none',
		timing_stim: getCTI, //getCTI
		timing_response:  getCTI, //getCTI
		timing_post_trial: 0,
		response_ends_trial: false,
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
		timing_response:  2000, //2000
		timing_post_trial: 0,
		response_ends_trial: false,
		on_finish: appendData
	}
	testTrial0.push(fixation_block)
	testTrial0.push(cue_block)
	testTrial0.push(test_block)
}

var testCount = 0

var testNode0 = {
	timeline: testTrial0,
  	loop_function: function(data) {
  		console.log('testCount: ' + testCount)
  		console.log('ending first block')
    	testCount += 1
    	task_switches = des_task_switches.slice(0,numTrialsPerBlock) //GRAB NEWEST BLOCKS WORTH OF TRIALS
    	des_task_switches = des_task_switches.slice(numTrialsPerBlock,) //SHAVE OFF THIS BLOCK FROM des_task_switches
    	stims = createTrialTypes(task_switches)
    	console.log(stims.length)
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

		console.log(accuracy)

		feedback_text = "<br>Please take this time to read your feedback and to take a short break!"
		feedback_text += "</p><p class = block-text>You have completed: "+testCount+" out of "+numTestBlocks+" blocks of trials."
	
		if (accuracy < accuracy_thresh){
			feedback_text +=
				'</p><p class = block-text>Your accuracy is too low.  Remember: <br>' + getPromptTextList() 
		}

		if (missed_responses > missed_thresh){
			feedback_text +=
				'</p><p class = block-text>You have not been responding to some trials.  Please respond on every trial that requires a response.'
		}

		if (ave_rt > rt_thresh) {
			feedback_text += 
				'</p><p class = block-text>You have been responding too slowly.'
		}

		return false
	
	} 
}

var testTrials = []
testTrials.push(feedback_block)
for (i = 0; i < numTrialsPerBlock + 1; i++) {
	console.log(stim)
	var fixation_block = {
	  type: 'poldrack-single-stim',
	  stimulus: getFixation,
	  is_html: true,
	  choices: 'none',
	  data: {
		trial_id: "fixation"
	  },
	  timing_post_trial: 0,
	  timing_stim: getITI_stim,
	  timing_response: getITI_resp
	}
	
	var cue_block = {
		type: 'poldrack-single-stim',
		stimulus: getCue,
		is_html: true,
		data: {
			"trial_id": "test_cue_block",
		},
		choices: 'none',
		timing_stim: getCTI, //getCTI
		timing_response:  getCTI, //getCTI
		timing_post_trial: 0,
		response_ends_trial: false,
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
		timing_response:  2000, //2000
		timing_post_trial: 0,
		response_ends_trial: false,
		on_finish: appendData
	}
	testTrials.push(fixation_block)
	testTrials.push(cue_block)
	testTrials.push(test_block)
}

var testNode = {
	timeline: testTrials,
	loop_function: function(data) {
		testCount += 1
		console.log('testcount'+testCount)
    //task_switches = des_task_switches.slice(0,numTrialsPerBlock) //GRAB NEWEST BLOCKS WORTH OF TRIALS
    //des_task_switches = des_task_switches.slice(numTrialsPerBlock,) //SHAVE OFF THIS BLOCK FROM des_task_switches
    //stims = createTrialTypes(task_switches)
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
	
		feedback_text = "<br>Please take this time to read your feedback and to take a short break!"
		feedback_text += "</p><p class = block-text>You have completed: "+testCount+" out of "+numTestBlocks+" blocks of trials."
		
		if (accuracy < accuracy_thresh){
			feedback_text +=
					'</p><p class = block-text>Your accuracy is too low.  Remember: <br>' + getPromptTextList() 
		}
		if (missed_responses > missed_thresh){
			feedback_text +=
					'</p><p class = block-text>You have not been responding to some trials.  Please respond on every trial that requires a response.'
		}
	      	
      	if (ave_rt > rt_thresh) {
        	feedback_text += 
            	'</p><p class = block-text>You have been responding too slowly.'
      	}
	
		if (testCount == numTestBlocks){
			feedback_text +=
					'</p><p class = block-text>Done with this test.'
			return false
		} else {
		  
      task_switches = des_task_switches.slice(0,numTrialsPerBlock) //GRAB NEWEST BLOCKS WORTH OF TRIALS
		  des_task_switches = des_task_switches.slice(numTrialsPerBlock,) //SHAVE OFF THIS BLOCK FROM des_task_switches
		  stims = createTrialTypes(task_switches)

			return true
		}
	}
}


/* ************************************ */
/*          Set up Experiment           */
/* ************************************ */

var spatial_task_switching_with_cued_task_switching__fmri_experiment = []
spatial_task_switching_with_cued_task_switching__fmri_experiment.push(design_setup_block); //exp_input
spatial_task_switching_with_cued_task_switching__fmri_experiment.push(motor_setup_block); //exp_input

test_keys(spatial_task_switching_with_cued_task_switching__fmri_experiment, [89, 71])

spatial_task_switching_with_cued_task_switching__fmri_experiment.push(practiceNode);
spatial_task_switching_with_cued_task_switching__fmri_experiment.push(refresh_feedback_block);

cni_bore_setup(spatial_task_switching_with_cued_task_switching__fmri_experiment)
spatial_task_switching_with_cued_task_switching__fmri_experiment.push(testNode0);
spatial_task_switching_with_cued_task_switching__fmri_experiment.push(testNode);
spatial_task_switching_with_cued_task_switching__fmri_experiment.push(feedback_block);

spatial_task_switching_with_cued_task_switching__fmri_experiment.push(end_block);
