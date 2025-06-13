/* ************************************ */
/* Define helper functions */
/* ************************************ */

function insertBufferITIs(design_ITIs) {
	var buffer_ITIs = genITIs()
	var out_ITIs = []
	while(design_ITIs.length > 0) {
		out_ITIs = out_ITIs.concat(buffer_ITIs.slice(0,1)) //get 2 buffer ITIs to start each block
		buffer_ITIs = buffer_ITIs.slice(1,) //remove the just used buffer ITIs from the buffer ITI array
		
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
	for (i=0; i < numTestBlocks ; i++) { //add 3 ITIs per test block to make sure there are enough
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

function addID() {
  jsPsych.data.addDataToLastTrial({exp_id: 'shape_matching_with_cued_task_switching__practice'})
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

var randomDraw = function(lst) {
  var index = Math.floor(Math.random() * (lst.length))
  return lst[index]
}

var getInstructFeedback = function() {
  return '<div class = centerbox><p class = center-block-text>' + feedback_instruct_text +
    '</p></div>'
}

// Task Specific Functions
var getKeys = function(obj) {
  var keys = [];
  for (var key in obj) {
    keys.push(key);
  }
  return keys
}

var genStims = function(n) {
  stims = []
  for (var i = 0; i < n; i++) {
    var number = randomDraw('12346789')
    var color = 'white'
    var stim = {
      number: parseInt(number),
      color: color
    }
    stims.push(stim)
  }
  return stims
}

//Sets the cue-target-interval for the cue block
var setCTI = function() {
  return CTI
}

var getCTI = function() {
  return CTI
}
//added for motor counterbalancing
function getMotorPerm() {
	return motor_perm
}

function getPossibleResponses(){
	mperm = getMotorPerm()
	if (mperm == 0) {
		stim1 = ['index finger', 37]
		stim2 = ['middle finger', 39]
	} else {
		stim1 = ['middle finger', 39]
		stim2 = ['index finger', 37]
	}
	return [stim1, stim2]
}


function getChoices() {
	return [getPossibleResponses()[0][1],getPossibleResponses()[1][1]]
}

var getFeedback = function() {
	return '<div class = bigbox><div class = picture_box><p class = block-text><font color="white">' + feedback_text + '</font></p></div></div>'
}

var getTaskSwitches = function(event_designs){
	var task_switches = []
	var shape_matching_trial_types = ['DDD','SDD','DSD','DDS','SSS','SNN','DNN']
	task_switches.push({
		task_switch: 'na',
		cue_switch: 'na',
		shape_matching_type: randomDraw(shape_matching_trial_types)
	})
	for (var i = 0; i < event_designs.length; i++) {
		console.log('events_design: ', event_designs[i])
		if (event_designs[i].includes('tstay_cstay')) {
			task_switch = 'stay',
			cue_switch = 'stay'
		} else if (event_designs[i].includes('tstay_cswitch')) {
			task_switch = 'stay',
			cue_switch = 'switch'
		} else if (event_designs[i].includes('tswitch_cstay')) {
			task_switch = 'switch',
			cue_switch = 'stay'
		} else if (event_designs[i].includes('tswitch_cswitch')) {
			task_switch = 'switch',
			cue_switch = 'switch'
		}

		if (event_designs[i].includes('DDD')) {
			shape_matching_type = 'DDD'
		} else if (event_designs[i].includes('SDD')) {
			shape_matching_type = 'SDD'
		} else if (event_designs[i].includes('DSD')) {
			shape_matching_type = 'DSD'
		} else if (event_designs[i].includes('DDS')) {
			shape_matching_type = 'DDS'
		} else if (event_designs[i].includes('SSS')) {
			shape_matching_type = 'SSS'
		} else if (event_designs[i].includes('SNN')) {
			shape_matching_type = 'SNN'
		} else if (event_designs[i].includes('DNN')) {
			shape_matching_type = 'DNN'
		}
		task_switches.push({
			task_switch: task_switch,
			cue_switch: cue_switch,
			shape_matching_type: shape_matching_type
		})
	}
	console.log('task_switches: ', task_switches)
		return task_switches
}

/* Index into task_switches using the global var current_trial. Using the task_switch and cue_switch
change the task. If "stay", keep the same task but change the cue based on "cue switch". 
If "switch new", switch to the task that wasn't the current or last task, choosing a random cue. 
*/
var setStims = function() {
  var tmp;
  console.log('task_switches current trial: ', task_switches[current_trial])
  switch (task_switches[current_trial].task_switch) {
    case "stay":
      if (curr_task == "na") {
        tmp = curr_task
        curr_task = randomDraw(getKeys(tasks))
      }
      if (task_switches[current_trial].cue_switch == "switch") {
        cue_i = 1 - cue_i
      }
      break
    case "switch":
      task_switches[current_trial].cue_switch = "switch"
      cue_i = randomDraw([0, 1])
      if (last_task == "na") {
        tmp = curr_task
        curr_task = randomDraw(getKeys(tasks).filter(function(x) {
          return (x != curr_task)
        }))
        last_task = tmp
      } else {
        tmp = curr_task
        curr_task = getKeys(tasks).filter(function(x) {
          return (x != curr_task)
        })[0]
        last_task = tmp
      }
      break
  }
  curr_cue = tasks[curr_task].cues[cue_i]
  curr_stim = stims[current_trial]
  shape_matching_condition = task_switches[current_trial].shape_matching_type
  PTDC = getPTDC(shape_matching_condition,curr_task)
  probe = PTDC[0]
  target = PTDC[1]
  distractor = PTDC[2]
  correct_response = PTDC[3] 
  current_trial = current_trial + 1
  CTI = setCTI() //setCTI and getCTI both return CTI. They are not made one function only because that would double CTI, resulting in a CTI of 300 instead of 150 in practice_cue_block and cue_block.
}

var getCue = function() {
  var cue_html = '<div class = upperbox><div class = "center-text" >' + curr_cue + '</div></div>'+
  				 '<div class = lowerbox>'+ 
					'<div class = leftbox>' + preFileType + 'mask' + fileTypePNG + 
					'<div class = centerbox><div class = fixation>+</div></div>' +
					'</div>' +
					'<div class = distractorbox>' + '' + '</div>' +
					'<div class = rightbox>' + preFileType + 'mask' + fileTypePNG + 
					'<div class = centerbox><div class = fixation>+</div></div>' +
					'</div>' +
				'</div>'
  return cue_html
}


var getStim = function(){
	var stim_html = ''
	if ((shape_matching_condition == "SNN") || (shape_matching_condition == "DNN")){
		stim_html = '<div class = upperbox><div class = "center-text" >' + curr_cue + '</div></div>' +
						'<div class = lowerbox>'+ 
							'<div class = leftbox>' + preFileType + target + '_green' + fileTypePNG + '</div>' +
							'<div class = distractorbox>' + '' + '</div>' +
							'<div class = rightbox>' + preFileType + probe + '_white' + fileTypePNG + '</div>' +
						'</div>'
	} else {
		stim_html = '<div class = upperbox><div class = "center-text" >' + curr_cue + '</div></div>' +
						'<div class = lowerbox>'+ 
							'<div class = leftbox>' + preFileType + target + '_green' + fileTypePNG + '</div>' +
							'<div class = distractorbox>' + preFileType + distractor + '_red' + fileTypePNG + '</div>' +
							'<div class = rightbox>' + preFileType + probe + '_white' + fileTypePNG + '</div>' +
						'</div>'
	}
	return stim_html
}

var getResponse = function() {
  return correct_response
}

var getPTDC = function(shape_matching_condition,curr_task){
	var probe_i = randomDraw([1,2,3,4,5,6,7,8,9,10])
	var target_i = 0
	var distractor_i = 0
	if (shape_matching_condition[0] == 'S') {
		target_i = probe_i
		if (curr_task == 'same'){
			correct_response = getPossibleResponses()[0][1]
		} else  {
			correct_response = getPossibleResponses()[1][1]		
		}
	} else {
		target_i = randomDraw([1,2,3,4,5,6,7,8,9,10].filter(function(y) {return y != probe_i}))				
		if (curr_task == 'different'){
			correct_response = getPossibleResponses()[0][1]
		} else  {
			correct_response = getPossibleResponses()[1][1]		
		}
	
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
	
	return [probe_i, target_i, distractor_i, correct_response]
}
var getFixation = function(){
		
	return '<div class = centerbox><div class = fixation>+</div></div>' //changed for spatial
}
/* Append gap and current trial to data and then recalculate for next trial*/
var appendData = function() {
	var curr_trial = jsPsych.progress().current_trial_global
	var trial_id = jsPsych.data.getDataByTrialIndex(curr_trial).trial_id
	var trial_num = current_trial - 1 //current_trial has already been updated with setStims, so subtract one to record data
	var task_switch = task_switches[trial_num]
	jsPsych.data.addDataToLastTrial({
		cue: curr_cue,
		task: curr_task,
		task_condition: task_switch.task_switch,
		cue_condition: task_switch.cue_switch,
		shape_matching_condition: shape_matching_condition,
		current_trial: trial_num,
		probe: probe,
		target: target,
		distractor: distractor,
		correct_response: correct_response,
		CTI: CTI
	})
  
	if ((trial_id == 'test_trial') || (trial_id == 'refresh_trial')){
		jsPsych.data.addDataToLastTrial({correct_response: correct_response})
		if (jsPsych.data.getDataByTrialIndex(curr_trial).key_press == jsPsych.data.getDataByTrialIndex(curr_trial).correct_response){
			jsPsych.data.addDataToLastTrial({shape_cued_acc: 1})
		} else {
			jsPsych.data.addDataToLastTrial({shape_cued_acc: 0})
		}

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
		return 		'<div class = centerbox>' +
			'<p class = block-text>In this experiment you will see a cue, either <i>same</i>, <i>equal</i>, <i>different</i>, or <i>distinct</i>, followed by some shapes. '+
			'You will see a white shape on the right side of the screen and a green shape on the left side.</p> '+
		
			'<p class = block-text> Depending on which cue you see, you will be asked if the green shape matches or mismatches the white shape.</p>'+

			'<p class = block-text>If you see the cue, <i>same</i> or <i>equal</i>, please judge whether the two shapes are the same. Press the <i>'+getPossibleResponses()[0][0]+
			'  </i>if they are the same, and the <i>'+getPossibleResponses()[1][0]+'  </i>if not.</p>'+
	
			'<p class = block-text>If you see the cue, <i>different</i> or <i>distinct</i>, please judge whether the two shapes are different. Press the <i>'+getPossibleResponses()[0][0]+
			'  </i>if they are different, and the <i>'+getPossibleResponses()[1][0]+'  </i>if not.</p>'+
		
			'<p class = block-text>On some trials a red shape will also be presented on the left. '+
			'You should ignore the red shape — your task is only to respond based on whether the white and green shapes matches or mismatches.</p>'+

			'<p class = block-text>We will start practice after you finish instructions. Please make sure you understand the instructions before moving on. During practice, you will receive a reminder of the rules.  <i>This reminder will not be available for test</i>.</p>'
			+ '</div>'
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

var fileTypePNG = '.png"></img>'
var preFileType = '<img class = center src="/static/experiments/shape_matching_with_cued_task_switching__practice/images/'
var accuracy_thresh = 0.75
var rt_thresh = 1000
var missed_thresh = 0.10
var practice_thresh = 3
var CTI = 150
// task specific variables

var refresh_len = 28
var refresh_thresh = 3
var numTrialsPerBlock = 28
var numTestBlocks = 8

var motor_perm = 0

//set up block stim. correct_responses indexed by [block][stim][type]
var tasks = {
  same: {
    task: 'same',
    cues: ['Same', 'Equal']
  },
  different: {
    task: 'different',
    cues: ['Different', 'Distinct']
  }
}

var task_switch_types = ["stay", "switch"]
var cue_switch_types = ["stay", "switch"]
var shape_matching_trial_types = ['DDD','SDD','DSD','DDS','SSS','SNN','DNN']
var task_switches_arr = []
for (var t = 0; t < task_switch_types.length; t++) {
  for (var c = 0; c < cue_switch_types.length; c++) {
  	for (var s = 0; s < shape_matching_trial_types.length; s++){
  	
		task_switches_arr.push({
		  task_switch: task_switch_types[t],
		  cue_switch: cue_switch_types[c],
		  shape_matching_type: shape_matching_trial_types[s]
		})
	}
  }
}
var task_switches = jsPsych.randomization.repeat(task_switches_arr, refresh_len)
var practiceStims = genStims(refresh_len)
var stims = practiceStims
var curr_task = randomDraw(getKeys(tasks))
var last_task = 'na' //object that holds the last task, set by setStims()
var curr_cue = 'na' //object that holds the current cue, set by setStims()
var cue_i = randomDraw([0, 1]) //index for one of two cues of the current task
var curr_stim = 'na' //object that holds the current stim, set by setStims()
var current_trial = 0
var exp_stage = 'practice' // defines the exp_stage, switched by start_test_block

var getPromptTextList = function(){ 
	return'<ul style="text-align:left; font-size: 32px; line-height:1.2;">'+
					  '<li>Same or Equal: ' + getPossibleResponses()[0][0] + 'if shapes are the same and '+ getPossibleResponses()[1][0] + ' if not. </li>' +
					  '<li>Different or Distinct: ' + getPossibleResponses()[0][0] + 'if shapes are different and '+ getPossibleResponses()[1][0] + ' if not. </li>' +
					'</ul>'
}

var getPromptText = function(){
return '<ul stype="text-align:left;"><div class = prompt_box>'+
				  '<p class = center-block-text style = "font-size:26px; line-height:80%%;">Same or Equal: ' + getPossibleResponses()[0][0]+ ' if shapes are same, ' + getPossibleResponses()[1][0] + ' if not. </p>' +
				  '<p class = center-block-text style = "font-size:26px; line-height:80%%;">Different or Distinct: ' + getPossibleResponses()[0][0] + ' if shapes are different, ' + getPossibleResponses()[1][0] + ' if not. </p>' +
		  '</div>'
}

var task_boards = [['<div class = bigbox><div class = leftbox>'],['</div><div class = distractorbox>'],['</div><div class = rightbox>'],['</div></div>']]

//PRE LOAD IMAGES HERE
var pathSource = "/static/experiments/shape_matching_with_cued_task_switching__practice/images/"
var pathDesignSource = '/static/experiments/shape_matching_with_cued_task_switching__practice/designs/' 
var numbersPreload = ['1','2','3','4','6','7','8','9']
var colorsPreload = ['white','green','red']
var images = []

//ADDED FOR SCANNING
//fmri variables
var ITIs_stim = [];
var ITIs_resp = [];

var refresh_trial_id = "instructions";
var refresh_feedback_timing = -1;
var refresh_response_ends = true;

var motor_perm = 0;

for(i=0;i<numbersPreload.length;i++){
	for(x=0;x<colorsPreload.length;x++){
		images.push(pathSource + numbersPreload[i] + '_' + colorsPreload[x] + '.png')
	}
}
images.push(pathSource + 'mask' + '.png')

jsPsych.pluginAPI.preloadImages(images);

/* ************************************ */
/* Set up jsPsych blocks */
/* ************************************ */
var des_ITIs = []
var des_events = []

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
		// task_conditions = makeTaskSwitches(refresh_len)
		// stims = createTrialTypes(task_conditions)
		
	}
}

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

var end_block = {
  type: 'poldrack-text',
  data: {
    exp_id: "shape_matching_with_cued_task_switching__practice",
    trial_id: "end",
  },
  text: '<div class = centerbox><p class = center-block-text>Thanks for completing this task!</p><p class = center-block-text>Press <i>enter</i> to continue.</p></div>',
  cont_key: [13],
  timing_response: 10000,
  on_finish: function(){
		assessPerformance()
    },
	response_ends_trial: true
};

/* define practice and test blocks */
var setStims_block = {
  type: 'call-function',
  data: {
    trial_id: "set_stims"
  },
  func: setStims,
  timing_post_trial: 0
}

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

	var practice_cue_block = {
	  type: 'poldrack-single-stim',
	  stimulus: getCue,
	  is_html: true,
	  choices: 'none',
	  data: {
		trial_id: 'cue'
	  },
	  timing_response: getCTI, 
	  timing_stim: getCTI, 
	  timing_post_trial: 0,
	  prompt: getPromptText,
	  on_finish: function() {
		jsPsych.data.addDataToLastTrial({
		  exp_stage: exp_stage
		})
		appendData()
	  }
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
  practiceTrials.push(setStims_block)
  practiceTrials.push(practice_fixation_block)
  practiceTrials.push(practice_cue_block);
  practiceTrials.push(practice_block);
}

var refreshCount = 0
var practiceNode = {
	timeline: practiceTrials,
	loop_function: function(data) {
		refreshCount += 1
		task_switches = jsPsych.randomization.repeat(task_switches_arr, refresh_len)
		practiceStims = genStims(refresh_len)
		stims = practiceStims
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

		if (accuracy > accuracy_thresh) {
			refresh_feedback_text +=
			  "</p><p class = block-text>Done with this practice. Press Enter to end practice.";
			return false;
		  } else if (accuracy < accuracy_thresh) {
			refresh_feedback_text +=
			  "</p><p class = block-text>We are going to try practice again to see if you can achieve higher accuracy.  Remember: <br>" +
			  getPromptTextList();
	  
			if (missed_responses > missed_thresh) {
			  refresh_feedback_text +=
				"</p><p class = block-text>You have not been responding to some trials.  Please respond on every trial that requires a response.";
			}
	  
			if (ave_rt > rt_thresh) {
			  refresh_feedback_text +=
				"</p><p class = block-text>You have been responding too slowly.";
			}
	  
			if (refreshCount == refresh_thresh) {
			  refresh_feedback_text +=
				"</p><p class = block-text>Done with this practice.";
			  return false;
			}
	  
			refresh_feedback_text +=
			  "</p><p class = block-text>Redoing this practice. Press Enter to continue.";
	  
			return true;
		  }
		},
	  };

/* create experiment definition array */
var shape_matching_with_cued_task_switching__practice_experiment= [];
shape_matching_with_cued_task_switching__practice_experiment.push(motor_setup_block)

shape_matching_with_cued_task_switching__practice_experiment.push(practiceNode);
shape_matching_with_cued_task_switching__practice_experiment.push(refresh_feedback_block);

shape_matching_with_cued_task_switching__practice_experiment.push(end_block)
