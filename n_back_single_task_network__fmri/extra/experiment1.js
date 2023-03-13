/* ************************************ */
/*       Define Helper Functions        */
/* ************************************ */

/* ************************************ */
/*       Get Design       */
/* ************************************ */
function getdesignITIs(design_num) {
	x = fetch(pathDesignSource+'design_'+design_num+'/ITIs_clean.txt').then(res => res.text()).then(res => res).then(text => text.split(/\r?\n/));
	return x
}
function getdesignEvents(design_num) {
	x = fetch(pathDesignSource+'design_'+design_num+'/events_clean.txt').then(res => res.text()).then(res => res).then(text => text.split(/\r?\n/));
	return x
}

/* ************************************ */
/*       Buffer ITI                     */
/* ************************************ */
function insertBufferITIs(design_ITIs, delays) {
	var buffer_ITIs = genITIs()
	var out_ITIs = []
	delay_seq = delays.slice()
	while(design_ITIs.length > 0) {
		console.log(design_ITIs.length) // extra rows removed before design_ITIs comes into the loop here
		block_delay = delay_seq.pop()
		if (block_delay == 2) {
			out_ITIs = out_ITIs.concat(buffer_ITIs.slice(0,2)) //get 2 buffer ITIs to start each block
			buffer_ITIs = buffer_ITIs.slice(2,) //remove the just used buffer ITIs from the buffer ITI array
			console.log('Block delay', block_delay)
			console.log('Out ITIs (buffer ITIs)', out_ITIs)
		} else if (block_delay == 1) {
			out_ITIs = out_ITIs.concat(buffer_ITIs.slice(0,1)) //get 1 buffer ITIs to start each block
			buffer_ITIs = buffer_ITIs.slice(1,) //remove the just used buffer ITIs from the buffer ITI array
			console.log('Block delay', block_delay)
			console.log('Out ITIs (buffer ITIs)', out_ITIs)
		}

		console.log('Then add trials per block')
		curr_block_ITIs = design_ITIs.slice(0,numTrialsPerBlock) //get this current block's ITIs
		design_ITIs = design_ITIs.slice(numTrialsPerBlock,) //remove this current block's ITIs from des_ITIs

		out_ITIs = out_ITIs.concat(curr_block_ITIs) //add this current block's ITI's to the out array
		console.log('out itis before exiting insert Buffer', out_ITIs) // if not popping in design_ITIs you end up with an extra one here
	}
	return out_ITIs
}

/* ************************************ */
/*      used by insertBufferITIs
/* ************************************ */
//Get ITIs from exponential distribution - used as backup
function genITIs() {
	mean_iti = 0.5 //mean and standard deviation of 0.5 secs
	min_thresh = 0
	max_thresh = 4

	lambda = 1/mean_iti
	iti_array = []
	for (i=0; i < exp_len + 2*numTestBlocks ; i++) { //add 3 ITIs per test block to make sure there are enough
		curr_iti = - Math.log(Math.random()) / lambda;
		//console.log('Printing current iti generated randomly as backup')
		//console.log(curr_iti)
		while (curr_iti > max_thresh || curr_iti < min_thresh) {
			curr_iti = - Math.log(Math.random()) / lambda;
		}
		iti_array.push(curr_iti*1000) //convert ITIs from seconds to milliseconds
	}
	return(iti_array)
}

/* ************************************ */
/*      added for fmri compaibility
/* ************************************ */
function getITI_stim() { //added for fMRI compatibility
	var currITI = ITIs_stim.shift()
	if (currITI == 0.0) { //THIS IS JUST FOR CONVENIENCE BEFORE NEW DESIGNS ARE REGENERATED
		currITI = 0.1
	}
	return currITI
}

/* ************************************ */
/*      added for fmri compaibility
/* ************************************ */
function getITI_resp() { //added for fMRI compatibility
	var currITI = ITIs_resp.shift()
	if (currITI == 0.0) { //THIS IS JUST FOR CONVENIENCE BEFORE NEW DESIGNS ARE REGENERATED
		currITI = 0.1
	}
	return currITI
}

/* ************************************ */
/*      added for motor counterbalancing
/* ************************************ */
function getMotorPerm() {
	return motor_perm
}

/* ************************************ */
/*     Possible responses
/* ************************************ */
function getPossibleResponses() {
	if (getMotorPerm()==0) {
		return possible_responses
	} else if (getMotorPerm()==1) {
		return [['middle finger', 71],['index finger', 89]]
	}
}

/* ************************************ */
/*     Feedback
/* ************************************ */
function getPromptTextList() {
	return '<style="text-align:left;">'+
	//'<li>Match the current letter to the letter that appeared some number of trials ago</li>' + // some number of trials ago
	'Match = '  +getPossibleResponses()[0][0]+'<br>' +
	'Mismatch =  '+getPossibleResponses()[1][0]


}

function getPromptTextListPractice() {
	return '<ul style="text-align:left;">'+
	'<li>Match the current letter to the letter that appeared 2 trials ago</li>' + // some number of trials ago
	'<li>Match =  '  +getPossibleResponses()[0][0]+'</li>' +
	'<li>Mismatch = '+getPossibleResponses()[1][0]+'</li>' +
  '</ul>'

}

function getPromptText() {
	return '<div class = prompt_box>'+
	'<p class = center-block-text style = "font-size:16px; line-height:80%%;">Match the current letter to the letter that appeared 1 trial ago</p>' +
	'<p class = center-block-text style = "font-size:16px; line-height:80%%;">If they match, press your '+getPossibleResponses()[0][0]+'</p>' +
	'<p class = center-block-text style = "font-size:16px; line-height:80%%;">If they mismatch, press your '+getPossibleResponses()[1][0]+'</p>' +
'</div>'
}


function getTimeoutMessage() {
	return '<div class = upperbox><div class = center-text>Respond Faster!</div></div>' +
	getPromptTextListPractice() //getPromptTextList
  }

//feedback functions added for in-person version
var getRefreshFeedback = function() {
	if (getRefreshTrialID()=='instructions') {
		return '<div class = instructbox>'+
		'<p class = instruct-text>In this task, you will see a letter on every trial.</p>'+
		'<p class = instruct-text>You will be asked to match the current letter to the letter that appeared either 1 or 2 trials ago depending on the delay given to you for that block.</p>'+
		'<p class = instruct-text><strong>Press your '+getPossibleResponses()[0][0]+' if the letters match, and your '+ getPossibleResponses()[1][0]+' if they mismatch.</strong></p>'+
		'<p class = instruct-text>Your delay (the number of trials ago which you must match the current letter to) will change from block to block. You will be given the delay at the start of every block of trials.</p>'+
		'<p class = instruct-text>Capitalization does not matter, so "T" matches with "t".</p> '+
		'<p class = instruct-text><strong><i>Your delay for this upcoming practice round is 2 </i>.</strong></p> '+
		'<p class = instruct-text>During practice, you will see a reminder of the rules.  <i> This will be removed for the test</i>. </p>'+
		'<p class = instruct-text>Please press any button to let the experimenters know when you are ready to begin. </p>'+
		'</div>'

	} else {
		return '<div class = bigbox><div class = picture_box><p class = instruct-text><font color="white">' + refresh_feedback_text + '</font></p></div></div>'
	}
}

//feedback functions added for in-person version
// var getRefreshFeedback = function() {
// 	return '<div class = bigbox><div class = picture_box><p class = instruct-text><font color="white">' + refresh_feedback_text + '</font></p></div></div>'
// }

var getRefreshTrialID = function() {
	return refresh_trial_id
}

var getRefreshFeedbackTiming = function() {
	return refresh_feedback_timing
}

var getRefreshResponseEnds = function() {
	return refresh_response_ends
}


function getDisplayElement() {
    $('<div class = display_stage_background></div>').appendTo('body')
    return $('<div class = display_stage></div>').appendTo('body')
}

function addID() {
  jsPsych.data.addDataToLastTrial({exp_id: 'n_back_single_task_network__fmri'})
}

/* ************************************ */
/*    Assess Performance
/* ************************************ */
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
	choice_counts[71] = 0
	choice_counts[89] = 0
	for (var k = 0; k < getPossibleResponses().length; k++) {
		choice_counts[getPossibleResponses()[k][1]] = 0
	}
	for (var i = 0; i < experiment_data.length; i++) {
		if (experiment_data[i].trial_id == 'test_trial'){
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


var getResponse = function() {
	return correct_response
}

var getFeedback = function() {
	return '<div class = bigbox><div class = picture_box><p class = instruct-text><font color="white">' + feedback_text + '</font></p></div></div>'
}


var randomDraw = function(lst) {
	var index = Math.floor(Math.random() * (lst.length))
	return lst[index]
};

/* ************************************ */
/*     Create the trial type            */
/* ************************************ */
var createTrialTypes = function(numTrialsPerBlock, delay){
	first_stims = []
	console.log('Create Trial Type delay', delay)
	for (var i = 0; i < delay; i++){ //loop to insert the first N/A trials. Either one or two depending on block

		n_back_condition = 'N/A' // add N/A for the initial trial, number of N/A added should correspond to the amount of delay you have on a given block
			console.log('Adding N/A', i)

		probe = randomDraw(letters)
		correct_response = getPossibleResponses()[1][1]
		if (n_back_condition == 'match'){
			correct_response = getPossibleResponses()[0][1]
			probe = randomDraw([first_stims[i - delay].probe.toUpperCase(), first_stims[i - delay].probe.toLowerCase()])
		} else if (n_back_condition == "mismatch"){
			probe = randomDraw('bBdDgGtTvV'.split("").filter(function(y) {return $.inArray(y, [first_stims[i - delay].probe.toLowerCase(), first_stims[i - delay].probe.toUpperCase()]) == -1}))
			correct_response = getPossibleResponses()[1][1]
		}

		first_stim = {
			n_back_condition: n_back_condition,
			probe: probe,
			correct_response: correct_response,
			delay: delay
		}
		first_stims.push(first_stim)
	}

	stims = []
	if (numTrialsPerBlock == practice_len) { // for practice blocks, generate the stimuli randomly
		//ASSUMES PRACTICE_LEN != EXP_LEN/NUMTESTBLOCKS
		for(var numIterations = 0; numIterations < numTrialsPerBlock/n_back_conditions.length; numIterations++){
			for (var numNBackConds = 0; numNBackConds < n_back_conditions.length; numNBackConds++){

				n_back_condition = n_back_conditions[numNBackConds]

				stim = {
					n_back_condition: n_back_condition
					}
				stims.push(stim)
			}
		}
		stims = jsPsych.randomization.repeat(stims,1)
	} else { //if it's a test trial, grab the event types from the design
		console.log('Events from design', des_events)
		curr_des_events = des_events.slice(0, numTrialsPerBlock) //grab this block's event
		console.log('Current des events ( = to numTrialsPerBlock )', curr_des_events) // this should correspond to number
		des_events = des_events.slice(numTrialsPerBlock,) // not sure why this is needed
		for (var idx = 0; idx < numTrialsPerBlock; idx++) {
			n_back_condition = curr_des_events[idx]
			console.log('Current nback condition for stim', n_back_condition)
			stim = {
				n_back_condition: n_back_condition
				}
			stims.push(stim) // add stim to stims
		}
	}


	stims = first_stims.concat(stims) // concatenate the N/A with expertimental ones
	console.log('Stims after concat', stims)

	stim_len = stims.length
	console.log('Length stim (should be ntrials per block + delay)', stim_len)

	new_stims = [] // not sure why this is needed but new stims is what is returned by create Trial Type
	for (i = 0; i < stim_len; i++){
		if (i < delay) { //SHIFTED BECAUSE MAX DELAY == 2 NOW

			stim = stims.shift()
			//console.log(stim)
			n_back_condition = stim.n_back_condition
			probe = stim.probe
			correct_response = stim.correct_response
			delay = stim.delay
		} else {
			stim = stims.shift()
			n_back_condition = stim.n_back_condition

			if (n_back_condition == "match"){
				probe = randomDraw([new_stims[i - delay].probe.toUpperCase(), new_stims[i - delay].probe.toLowerCase()])
				correct_response = getPossibleResponses()[0][1]
			} else if (n_back_condition == "mismatch"){
				probe = randomDraw('bBdDgGtTvV'.split("").filter(function(y) {return $.inArray(y, [new_stims[i - delay].probe.toLowerCase(), new_stims[i - delay].probe.toUpperCase()]) == -1}))
				correct_response = getPossibleResponses()[1][1]

			}
		}

		stim = {
			n_back_condition: n_back_condition,
			probe: probe,
			correct_response: correct_response,
			delay: delay
		}
    console.log('Check to understand new_stims')
		new_stims.push(stim)
	}

	return new_stims
}

/* ************************************ */
/*   Get Stims												 */
/* ************************************ */

var getStim = function(){
	stim = stims.shift()
	console.log('Stim at each trial by get Stim', stim)
	n_back_condition = stim.n_back_condition
	probe = stim.probe
	correct_response = stim.correct_response
	delay = stim.delay

	if (probe == probe.toUpperCase()) {
	 letter_case = 'uppercase'
	} else if (probe == probe.toLowerCase()) {
	 letter_case = 'lowercase'
	}

	return task_boards[0]+ preFileType  + letter_case + '_' + probe.toUpperCase() + fileTypePNG + task_boards[1]
}



var getResponse =  function(){
	return correct_response
}

var appendData = function(){
	curr_trial = jsPsych.progress().current_trial_global
	trial_id = jsPsych.data.getDataByTrialIndex(curr_trial).trial_id
	current_trial+=1


	if (trial_id == 'practice_trial'){
		current_block = refreshCount
	} else if (trial_id == 'test_trial'){
		current_block = testCount
	}

	jsPsych.data.addDataToLastTrial({
		n_back_condition: n_back_condition,
		probe: probe,
		correct_response: correct_response,
		delay: delay,
		current_trial: current_trial,
		current_block: current_block,
		letter_case: letter_case
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

// Function to get the correct timeline depending on block delay
var getTestTrials =  function(delay, stims_length){
		var tmp = []
		var trials1back = stims_length
		var trials2back = stims_length
		if (delay == 1){
			for(i=0; i < trials1back; i++) {
				tmp[i] = testTrials_1Back.shift()
			}
			trials.push(tmp)
		} else if(delay == 2){
			for (i=0; i<trials2back; i++){
				tmp[i] = testTrials_2Back.shift()
			}
			trials.push(tmp)
		}
		return trials
	}
/* ************************************ */
/*    Define Experimental Variables     */
/* ************************************ */


// generic task variables
var sumInstructTime = 0 //ms
var instructTimeThresh = 0 ///in seconds
var credit_var = 0


var practice_len = 10 // must be divisible by 5
var exp_len = 320 //150 // must be divisible by 5 --9:30
var numTrialsPerBlock = 80 // must be divisible by 5 and we need to have a multiple of 2 blocks (2,4,6) in order to have equal delays across blocks
var numTestBlocks = exp_len / numTrialsPerBlock//should be divisble by 2 ^^

var accuracy_thresh = 0.75
var rt_thresh = 1000
var missed_thresh = 0.10

//var delays = jsPsych.randomization.repeat([1, 2], numTestBlocks / 2) //jsPsych.randomization.repeat([1, 2, 3], numTestBlocks / 3)
//console.log('Number of delays', delays)

var array1_delay = jsPsych.randomization.repeat([1], numTestBlocks / 2)
var array2_delay = jsPsych.randomization.repeat([2], numTestBlocks / 2)
var delays = $.map(array1_delay, function(v, i) { return [v, array2_delay[i]]; });
console.log('delays:', delays)
var delays_ref = delays.slice()
//console.log('delays_ref', delays_ref)

//var delay_ref = delays_ref[0] // to initialize delay_ref for some first iteration
var delay = 2 //1            // delay to be used for practice

var pathSource = "/static/experiments/n_back_single_task_network__fmri/images/"
var fileTypePNG = ".png'></img>"
var preFileType = "<img class = center src='/static/experiments/n_back_single_task_network__fmri/images/"


var n_back_conditions = jsPsych.randomization.repeat(['mismatch','mismatch','match','mismatch','mismatch'],1)
var possible_responses = [['index finger', 89],['middle finger', 71]]

var letters = 'bBdDgGtTvV'.split("")


var current_trial = 0
var current_block = 0

//PRE LOAD IMAGES HERE
var pathSource = "/static/experiments/n_back_single_task_network__fmri/images/"
var pathDesignSource = "/static/experiments/n_back_single_task_network__fmri/designs/" //ADDED FOR fMRI SEQUENCES
var lettersPreload = ['B','D','G','T','V']
var casePreload = ['lowercase','uppercase']
var images = []

for(i = 0; i < lettersPreload.length; i++){
	for(x = 0; x < casePreload.length; x++){
		images.push(pathSource + casePreload[x] + '_' + lettersPreload[i] + '.png')
	}
}

jsPsych.pluginAPI.preloadImages(images);

//ADDED FOR SCANNING
//fmri variables
var ITIs_stim = []
var ITIs_resp = []

var refresh_trial_id = "instructions"
var refresh_feedback_timing = -1
var refresh_response_ends = true

var motor_perm = 0
/* ************************************ */
/*          Define Game Boards          */
/* ************************************ */

var task_boards = ['<div class = bigbox><div class = centerbox><div class = gng_number><div class = cue-text>','</div></div></div></div>']

// var stims = createTrialTypes(practice_len, delay)
var stims = []
var stim_len =[]
var stims_length = 0 

/* ************************************ */
/*        Set up jsPsych blocks         */
/* ************************************ */
var end_block = {
	type: 'poldrack-text',
	data: {
		trial_id: "end"
	},
	timing_response: 10000,
	text: '<div class = centerbox><p class = center-block-text>Thanks for completing this task!</p></div>',
	cont_key: [32],
	timing_post_trial: 0,
	on_finish: function(){
		assessPerformance()
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
	timing_response: getRefreshFeedbackTiming, //10 seconds for feedback
	timing_stim: getRefreshFeedbackTiming,
	response_ends_trial: getRefreshResponseEnds,
	on_finish: function() {
		refresh_trial_id = "practice-no-stop-feedback"
		refresh_feedback_timing = 5000 // it was 10000
		refresh_response_ends = false
		// if (ITIs_stim.length===0) { //if ITIs haven't been generated, generate them!
		// 	ITIs_stim = genITIs()
		// 	ITIs_resp = ITIs_stim.slice(0) //make a copy of ITIs so that timing_stimulus & timing_response are the same
		// }

	}

};

var refresh_fixation_block = {
	type: 'poldrack-single-stim',
	stimulus: '<div class = centerbox><div class = fixation>+</div></div>',
	is_html: true,
	choices: 'none',
	data: {
		trial_id: "practice_fixation"
	},
	timing_response: 500, //500
	timing_post_trial: 0,
	prompt: getPromptTextListPractice // getPromptTextList
}

var ITI_fixation_block = {
	type: 'poldrack-single-stim',
	stimulus: '<div class = centerbox><div class = fixation>+</div></div>',
	is_html: true,
	choices: 'none',
	data: {
		trial_id: "fixation",
	},
	timing_post_trial: 0,
	timing_stim: getITI_stim, //500
	timing_response: getITI_resp //500
};



var feedback_text =
	'Welcome to the experiment. This experiment will take around 5 minutes. Press <i>enter</i> to begin.'

var feedback_block = {
	type: 'poldrack-single-stim',
	data: {
		trial_id: "practice-no-stop-feedback"
	},
	choices: 'none',
	stimulus: getFeedback,
	timing_post_trial: 0,
	is_html: true,
	timing_response: 5000,// it was 10000
	response_ends_trial: false,

};


/* ************************************ */
/*        Set up timeline blocks        */
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
			"<p class = center-block-text>Design permutation (0-4):</p>"
		]
	], on_finish: async function(data) {
		design_perm =parseInt(data.responses.slice(7, 10))
		des_ITIs = await getdesignITIs(design_perm)
		des_ITIs = des_ITIs.map(Number)//array of strings become array of numbers
		//des_ITIs.pop()// to remove last empty row
		console.log('Original design ITIs for a given permutation', des_ITIs)
		des_ITIs = insertBufferITIs(des_ITIs, delays)
		console.log('Design ITIs after buffer have been added ', des_ITIs)
		console.log('Print content of what becomes ITIS_stim', des_ITIs.slice(0))
		ITIs_stim = des_ITIs.slice(0)
		ITIs_resp = des_ITIs.slice(0)
		des_events = await getdesignEvents(design_perm)
		//des_events.pop()// to remove last empty row
		console.log('Design events', des_events)

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
		stims = createTrialTypes(practice_len, delay)

	}
}

//refresh trials for in scanner practice
var refreshTrials = []
refreshTrials.push(refresh_feedback_block)
for (i = 0; i < practice_len + 2; i++) {	//was changed from + 3 as delays went from 1:3 to 1:2
	var refresh_block = {
		type: 'poldrack-categorize',
		stimulus: getStim,
		is_html: true,
		choices: [getPossibleResponses()[0][1],getPossibleResponses()[1][1]],
		key_answer: getResponse,
		data: {
			trial_id: "practice_trial"
			},
		correct_text: '<div class = upperbox><div class = center-text>Correct!</font></div></div>',// + prompt_text_list,
		incorrect_text: '<div class = upperbox><div class = center-text>Incorrect</font></div></div>',// + prompt_text_list,
		timeout_message: getTimeoutMessage,
		timing_stim: 1000, //1000
		timing_response: 2000, //2000
		timing_feedback_duration: 500,
		show_stim_with_feedback: false,
		timing_post_trial: 0,
		on_finish: appendData,
		prompt: getPromptTextListPractice,//getPromptText List
		fixation_default: true
	}
	refreshTrials.push(refresh_fixation_block)
	refreshTrials.push(refresh_block)
}

var refreshCount = 0
var refreshNode = {
	timeline: refreshTrials,
	loop_function: function(data) {
		var sum_rt = 0
		var sum_responses = 0
		var correct = 0
		var total_trials = 0
		var mismatch_press = 0

		for (var i = 0; i < data.length; i++){
			if (data[i].trial_id == "practice_trial"){
				total_trials+=1
				if (data[i].rt != -1){
					sum_rt += data[i].rt
					sum_responses += 1
					if (data[i].key_press == data[i].correct_response){
						correct += 1

					}
				}

				if (data[i].key_press == getPossibleResponses()[1][1]){
					mismatch_press += 1
				}

			}

		}

		var accuracy = correct / total_trials
		var missed_responses = (total_trials - sum_responses) / total_trials
		var ave_rt = sum_rt / sum_responses
		var mismatch_press_percentage = mismatch_press / total_trials

		refresh_feedback_text = "<br><p class = instruct-text>Take a short break." // Press enter to continue"


		if (accuracy < accuracy_thresh){
			if (missed_responses > missed_thresh){
				refresh_feedback_text +=
						'</p><p class = instruct-text>You have not been responding to some trials.  Please respond on every trial that requires a response.'
			}

	      	if (ave_rt > rt_thresh){
	        	refresh_feedback_text +=
	            	'</p><p class = instruct-text>You have been responding too slowly.'
	      	}

			if (mismatch_press_percentage >= 0.90){
				refresh_feedback_text +=
						'</p><p class = instruct-text>Please do not simply press your "'+getPossibleResponses()[1][0]+'" to every stimulus. Please try to identify the matches and press your "'+getPossibleResponses()[0][0]+'" when they occur.'
			}

		}

		refresh_feedback_text +='</p><p class = instruct-text>Done with this practice. The test session will begin shortly.'
		//console.log(delays)
		delay = delays.pop() // at the end of practice get first delay
		console.log('Delay to come after practice', delay)
		//console.log('Printing delay')
		//console.log(delays)
		stims = createTrialTypes(numTrialsPerBlock, delay)
		console.log('Stims generated after practice', stims)
		console.log('End of Practice')
		stims_length = stims.length
		console.log("length of stims:")
		console.log(stims_length)
		feedback_text = "<strong><i><font color='black'> Delay for the next round of trials is: "+delay+".<br> Match the current letter to the letter that appeared "+delay+" trial(s) ago.</i></font></strong>"
		feedback_text += '</p><p class = instruct-text> <br>' + getPromptTextList()

		return false

	}
}


//delay_ref = [2, 2, 2, 2, 2, 2, 2, 1, 1, 1, 1, 1, 1] // actual order of blocks
//delay_ref = delay_ref.reverse() // reverse for getting the right stuff in the loop
//n_to_add = delay_ref[delay_ref.length - 1]//delay_ref.slice(delay_ref.length-1, delay_ref.length) // n to add from numerical value of last element of delay_ref


var testTrials = []
var trials = []
trials = getTestTrials(delay, stims_length)
// console.log('inserting feedback')
testTrials.push(feedback_block)
testTrials.push(trials)
// console.log(testTrials)
// counter = 1
// for (i = 0; i < numTrialsPerBlock ; i++) {//was changed from + 3 as delays went from 1:3 to 1:2 HERE THE NUMBER OF ITERATION NEEDS TO BE NTRIAL + DELAY!
//   console.log('CHECKING LOOP BEFORE GET STIM')
// 	//console.log(i)
// 	//delay_ref.pop() // remove last element of array
// 	var test_block = {
// 		type: 'poldrack-single-stim',
// 		stimulus: getStim,
// 		is_html: true,
// 		data: {
// 			"trial_id": "test_trial",
// 		},
// 		choices: [getPossibleResponses()[0][1],getPossibleResponses()[1][1]],
// 		timing_stim: 1000, //1000
// 		timing_response: 2000, //2000
// 		timing_post_trial: 0,
// 		response_ends_trial: false,
// 		on_finish: appendData,
// 		fixation_default: true
// 	}
// 	console.log('inserting fixation block')
// 	testTrials.push(ITI_fixation_block)
// 	console.log('inserting testing block')
// 	testTrials.push(test_block)
// 	console.log('The resulting test trials')
// 	console.log(testTrials)
// }


var testTrials_1Back = []
console.log('inserting feedback')
//testTrials_1Back.push(feedback_block)
console.log(testTrials_1Back)
counter = 1
for (i = 0; i < numTrialsPerBlock + 1; i++) {//was changed from + 3 as delays went from 1:3 to 1:2 HERE THE NUMBER OF ITERATION NEEDS TO BE NTRIAL + DELAY!
  console.log('CHECKING LOOP BEFORE GET STIM')
	//console.log(i)
	//delay_ref.pop() // remove last element of array
	var test_block = {
		type: 'poldrack-single-stim',
		stimulus: getStim,
		is_html: true,
		data: {
			"trial_id": "test_trial",
		},
		choices: [getPossibleResponses()[0][1],getPossibleResponses()[1][1]],
		timing_stim: 1000, //1000
		timing_response: 2000, //2000
		timing_post_trial: 0,
		response_ends_trial: false,
		on_finish: appendData,
		fixation_default: true
	}
	console.log('inserting fixation block')
	testTrials_1Back.push(ITI_fixation_block)
	console.log('inserting testing block')
	testTrials_1Back.push(test_block)
	console.log('The resulting test trials')
	console.log(testTrials_1Back)
}


var testTrials_2Back = []
console.log('inserting feedback')
//testTrials_2Back.push(feedback_block)
console.log(testTrials_2Back)
for (i = 0; i < numTrialsPerBlock + 2; i++) {//was changed from + 3 as delays went from 1:3 to 1:2 HERE THE NUMBER OF ITERATION NEEDS TO BE NTRIAL + DELAY!
  console.log('CHECKING LOOP BEFORE GET STIM')
	//console.log(i)
	//delay_ref.pop() // remove last element of array
	var test_block = {
		type: 'poldrack-single-stim',
		stimulus: getStim,
		is_html: true,
		data: {
			"trial_id": "test_trial",
		},
		choices: [getPossibleResponses()[0][1],getPossibleResponses()[1][1]],
		timing_stim: 1000, //1000
		timing_response: 2000, //2000
		timing_post_trial: 0,
		response_ends_trial: false,
		on_finish: appendData,
		fixation_default: true
	}
	console.log('inserting fixation block')
	testTrials_2Back.push(ITI_fixation_block)
	console.log('inserting testing block')
	testTrials_2Back.push(test_block)
	console.log('The resulting test trials')
	console.log(testTrials_2Back)
}

console.log('Counter outside Test Node')
console.log(counter)
var testCount = 0
var testNode = {
	timeline: testTrials, //testTrials, // create testTrials using a function with delay
	loop_function: function(data) {
	testCount += 1
	current_trial = 0
	console.log('Test COUNT')
	console.log(testCount)

	var sum_rt = 0
		var sum_responses = 0
		var correct = 0
		var total_trials = 0
		var mismatch_press = 0

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

				if (data[i].key_press == getPossibleResponses()[1][1]){
					mismatch_press += 1
				}
			}
		}

		var accuracy = correct / total_trials
		var missed_responses = (total_trials - sum_responses) / total_trials
		var ave_rt = sum_rt / sum_responses
		var mismatch_press_percentage = mismatch_press / total_trials

	//	feedback_text = "<br><p class = instruct-text>Short break!"
	//	feedback_text += "</p><p class = instruct-text>You have completed: "+testCount+" out of "+numTestBlocks+" blocks of trials."

	if (testCount == numTestBlocks){
		feedback_text =
				'</p><p class = instruct-text>Done with this test.<br>'
	} else {
		delay = delays.pop()
		//delay_ref = delays_ref.pop()
		//console.log(delays);
		// if (delay == 1) {
		// 	testTrials = testTrials_1Back
		// } else if (delay == 2) {
		// 	testTrials = testTrials_2Back
		// }
    console.log('TEST NODE')
		console.log(testNode)

		counter+=1
		console.log('Keeping track of counter')
		console.log(counter)
		//console.log(numTrialsPerBlock + delays_ref[delays_ref.length - counter])
		//console.log('Delay for a block, comes from delays at line 408')
    console.log('Current delay')
		console.log(delay)
		stims = createTrialTypes(numTrialsPerBlock, delay)
		//testTrials = createTestTrials(numTrialsPerBlock, delay)
		//console.log(testTrials)
		console.log('Stims generated before break')
		console.log(stims)
		console.log('End of test count within test node')
		stims_length = stims.length
		console.log("length of stims:")
		console.log(stims_length)
		//feedback_text += "</p><p class = instruct-text><strong><i><font color='black'>For the next round of trials, your delay is "+delay+"</i>.</font></strong>"
		feedback_text = "<strong><i><font color='black'>Your delay for the next round of trials is "+delay+".<br>Match the current letter to the letter that appeared "+delay+" trial(s) ago.</i></font></strong>"
		feedback_text += '</p><p class = instruct-text> <br>' + getPromptTextList()


	}

	//	if (accuracy < accuracy_thresh){
	//		feedback_text +=
	//				'</p><p class = instruct-text> Remember: <br>' + getPromptTextList()
	//	}
		if (missed_responses > missed_thresh){
			feedback_text +=
					'</p><p class = instruct-text>You have not been responding to some trials.  Please respond on every trial that requires a response.'
		}

      	if (ave_rt > rt_thresh){
        	feedback_text +=
            	'</p><p class = instruct-text>You have been responding too slowly.'
      	}

		if (mismatch_press_percentage >= 0.90){
				feedback_text +=
						'</p><p class = instruct-text>Please do not simply press your "'+getPossibleResponses()[1][0]+'" to every stimulus. Please try to identify the matches and press your "'+getPossibleResponses()[0][0]+'" when they occur.'
			}

		if (testCount == numTestBlocks){
			//feedback_text +='</p><p class = instruct-text>Done with this test.<br>'
			return false
		} else {
			//delay = delays.pop()
			//console.log('Delay for a block, comes from delays at line 408')
			//console.log(delay)
			//stims = createTrialTypes(numTrialsPerBlock, delay)
			//feedback_text += "</p><p class = instruct-text><strong><i><font color='black'>For the next round of trials, your delay is prova"//+delay+"</i>.</font></strong>"
			return true
		}
	}
}


/* ************************************ */
/*          Set up Experiment           */
/* ************************************ */

var n_back_single_task_network__fmri_experiment = []

n_back_single_task_network__fmri_experiment.push(design_setup_block); //exp_input, here the ITIs get defined
n_back_single_task_network__fmri_experiment.push(motor_setup_block); //exp_input
//test_keys(n_back_single_task_network__fmri_experiment, [possible_responses[0][1],possible_responses[1][1]])


n_back_single_task_network__fmri_experiment.push(refreshNode);
n_back_single_task_network__fmri_experiment.push(refresh_feedback_block);

//in scanner test
//cni_bore_setup(n_back_single_task_network__fmri_experiment)
n_back_single_task_network__fmri_experiment.push(testNode);
n_back_single_task_network__fmri_experiment.push(feedback_block); // pause between blocks

n_back_single_task_network__fmri_experiment.push(end_block);
