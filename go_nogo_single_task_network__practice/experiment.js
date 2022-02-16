/* ************************************ */
/* Define helper functions */
/* ************************************ */

//added for motor counterbalancing
function getMotorPerm() {
	  return motor_perm
}

var getStim = function(){
	console.log(stim.stimulus);
	return stim.stimulus
}

function getGlobal() { 
	stim = block_stims.pop()
	console.log(stim);
	correct_response = stim.data.correct_response
	console.log(correct_response);
	return '<div class = centerbox><div class = fixation>+</div></div>'
}

function getPossibleResponses() {
	  if (getMotorPerm()==0) {
		  return ['index finger', 37]
	  } else if (getMotorPerm()==1) {
		  return ['middle finger', 39]
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

  
function getKey() {
	  return [getPossibleResponses()[1]]
}

function assessPerformance() {
	/* unction to calculate the "credit_var", which is a boolean used to
	credit individual experiments in expfactory. */
	var experiment_data = jsPsych.data.getTrialsOfType('poldrack-categorize')
	var missed_count = 0
	var trial_count = 0
	var rt_array = []
	var rt = 0
	var correct = 0
	//record choices participants made
	var choice_counts = {}
	choice_counts[-1] = 0
	choice_counts[32] = 0
	  
	for (var i = 0; i < experiment_data.length; i++) {
		if (experiment_data[i].trial_id == 'practice_trial') {
			trial_count += 1
			key = experiment_data[i].key_press
			choice_counts[key] += 1
			if (experiment_data[i].go_nogo_condition == 'go'){
				if (experiment_data[i].key_press == experiment_data[i].correct_response){
					correct += 1
				}
				if (experiment_data[i].key_press == -1){
					missed_count += 1
				}
				if (experiment_data[i].key_press != -1){
					rt = experiment_data[i].rt
					rt_array.push(rt)
				}
			} else if (experiment_data[i].go_nogo_condition == 'nogo'){
				if (experiment_data[i].key_press == -1){
					correct += 1
				} else if (experiment_data[i].key_press != -1){
						rt = experiment_data[i].rt
					  	rt_array.push(rt)
				}
			  }
		}	
	}
	//calculate average rt
	var avg_rt = -1
	if (rt_array.length !== 0) {
		avg_rt = math.median(rt_array) // ???median???
	} 
	//calculate whether response distribution is okay
	var responses_ok = true
	Object.keys(choice_counts).forEach(function(key, index) {
		if (choice_counts[key] > trial_count * 0.95) {
			responses_ok = false
		}
	})
	var missed_percent = missed_count/trial_count
	var accuracy = correct / trial_count
	credit_var = (missed_percent < 0.25 && avg_rt > 200 && accuracy > 0.60)
	jsPsych.data.addDataToLastTrial({final_credit_var: credit_var,
									   final_missed_percent: missed_percent,
									   final_avg_rt: avg_rt,
									   final_responses_ok: responses_ok,
									   final_accuracy: accuracy})
}


/* Append gap and current trial to data and then recalculate for next trial*/
var appendData = function(data) {
	var curr_trial = jsPsych.progress().current_trial_global
	
	if (jsPsych.data.getDataByTrialIndex(curr_trial).key_press == correct_response){
		jsPsych.data.addDataToLastTrial({
			correct_trial: 1,
		})
  
	} else if (jsPsych.data.getDataByTrialIndex(curr_trial).key_press != correct_response){
		jsPsych.data.addDataToLastTrial({
			correct_trial: 0,
		})
	}
	  
	jsPsych.data.addDataToLastTrial({
		current_trial: current_trial,
	})
	  
	current_trial +=1
}

var getFeedback = function() {
	if (stim.key_answer == -1) {
	  return '<div class = fb_box><div class = center-text>Correct!</div></div>' + prompt_text_list
	} else {
	  return '<div class = fb_box><div class = center-text>Respond Faster!</div></p></div>'  + prompt_text_list
	}
}

var getInstructFeedback = function() {
	return '<div class = centerbox><p class = block-text>' + feedback_instruct_text +
	  '</p></div>'
}

var getData = function(){
	return stim.data
}

var getCorrectResponse = function(){
	return stim.data.correct_response
}


function getRefreshFeedback() { 
	if (getRefreshTrialID()=='instructions') {
  		return '<div class = bigbox><div class = centerbox><p class = block-text>' + 
		  'In this experiment, ' + stims[0][0] + ' and ' + stims[1][0] + ' squares will appear on the screen. '+
		  'If you see the ' + stims[0][0] + ' square you should <b> respond by pressing your ' + getPossibleResponses()[0] +  ' as quickly as possible</b>. '+
		  'If you see the ' + stims[1][0] + ' square you should <b> not respond</b>.</p>'+
		  '<p class = block-text>We will begin with practice. You will receive feedback telling you if you were correct.</p>'+
		  '<p class = block-text> Press any button when you are ready to begin </p></div></div>'} 
  
	else {
		return '<div class = bigbox><div class = centerbox><p class = instruct-text><font color="white">' + feedback_text + '</font></p></div></div>'
  
	}
}

function getCorrectMapping() { 
   	correct_responses = [
	  ['go', [getPossibleResponses()[1]]],
	  ['nogo', -1]
	]
	return correct_responses
}



function createPracticeTrials(length) { 
   var practice_stimuli = [{ //To change go:nogo ratio, add or remove one or more sub-dictionaries within practice_stimuli and test_stimuli_block
	stimulus: '<div class = bigbox><div class = centerbox><div class = gng_number><div class = cue-text><div id = ' + stims[1][1] + '></div></div></div></div></div>',
	data: {
	  correct_response: getCorrectMapping()[1][1],
	  go_nogo_condition: getCorrectMapping()[1][0],
	  trial_id: 'practice_trial'
	},
	key_answer: getCorrectMapping()[1][1]
  }, {
		stimulus: '<div class = bigbox><div class = centerbox><div class = gng_number><div class = cue-text><div  id = ' + stims[0][1] + '></div></div></div></div></div>',
		data: {
		  correct_response: getCorrectMapping()[0][1],
		  go_nogo_condition: getCorrectMapping()[0][0],
		  trial_id: 'practice_trial'
		},
		key_answer: getCorrectMapping()[0][1]
  }, {
		stimulus: '<div class = bigbox><div class = centerbox><div class = gng_number><div class = cue-text><div  id = ' + stims[0][1] + '></div></div></div></div></div>',
		data: {
		  correct_response: getCorrectMapping()[0][1],
		  go_nogo_condition: getCorrectMapping()[0][0],
		  trial_id: 'practice_trial'
		},
		key_answer: getCorrectMapping()[0][1]
  }, {
		stimulus: '<div class = bigbox><div class = centerbox><div class = gng_number><div class = cue-text><div  id = ' + stims[0][1] + '></div></div></div></div></div>',
		data: {
		  correct_response: getCorrectMapping()[0][1],
		  go_nogo_condition: getCorrectMapping()[0][0],
		  trial_id: 'practice_trial'
		},
		key_answer: getCorrectMapping()[0][1]
  }, {
		stimulus: '<div class = bigbox><div class = centerbox><div class = gng_number><div class = cue-text><div  id = ' + stims[0][1] + '></div></div></div></div></div>',
		data: {
		  correct_response: getCorrectMapping()[0][1],
		  go_nogo_condition: getCorrectMapping()[0][0],
		  trial_id: 'practice_trial'
		},
		key_answer: getCorrectMapping()[0][1]
  }, {
		stimulus: '<div class = bigbox><div class = centerbox><div class = gng_number><div class = cue-text><div  id = ' + stims[0][1] + '></div></div></div></div></div>',
		data: {
		  correct_response: getCorrectMapping()[0][1],
		  go_nogo_condition: getCorrectMapping()[0][0],
		  trial_id: 'practice_trial'
		},
		key_answer: getCorrectMapping()[0][1]
  }, {
		stimulus: '<div class = bigbox><div class = centerbox><div class = gng_number><div class = cue-text><div  id = ' + stims[0][1] + '></div></div></div></div></div>',
		data: {
		  correct_response: getCorrectMapping()[0][1],
		  go_nogo_condition: getCorrectMapping()[0][0],
		  trial_id: 'practice_trial'
		},
		key_answer: getCorrectMapping()[0][1]
  }
  ];
	stimuli = jsPsych.randomization.repeat(practice_stimuli, length / practice_stimuli.length); 
	console.log(stimuli);
	return stimuli 
}


/* ************************************ */
/* Define experimental variables */
/* ************************************ */


// generic task variables
var credit_var = 0
var block_stims = []
var key_choices = [['index finger', 37], ['middle finger', 39]] //fmri responses - keys: BYGRM = thumb->pinky

// task specific variables
var num_go_stim = 6 //per one no-go stim

var motor_perm = 0
var stims = [["solid", "stim1"],["outlined","stim2"]] //solid and outlined squares used as stimuli for this task are not png files as in some others, but they are defined in style.css
var stim = []
var gap = 0
var refresh_trial_id = "instructions"
var refresh_feedback_timing = -1
var refresh_response_ends = true
var current_trial = 0
var practice_length = 8
var accuracy_thresh = 0.75
var missed_thresh = 0.10
  
var refresh_len = 8
var refresh_thresh = 3
  
  
var prompt_text_list = '<ul style="text-align:left;"><font color="white">'+
						  '<li>'+stims[0][0]+' square: respond</li>' +
						  '<li>'+stims[1][0]+' square: do not respond</li>' +
						'</font></ul>'











practice_stimuli = []

/* ************************************ */
/* Set up jsPsych blocks */
/* ************************************ */


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
		  block_stims = createPracticeTrials(practice_length)
		  console.log(block_stims); 
	  }
}


/* define static blocks */
var feedback_instruct_text = 'Welcome to the experiment.'
var feedback_instruct_block = {
	type: 'poldrack-text',
	cont_key: [32],
	data: {
	  trial_id: "instruction"
	},
	text: getInstructFeedback,
	timing_post_trial: 0,
	timing_response: 180000
}


var refresh_feedback_block = {
	type: 'poldrack-single-stim',
	data: {
		  trial_id: getRefreshTrialID
	},
	stimulus: getRefreshFeedback,
	timing_post_trial: 0,
	is_html: true,
	timing_response: getRefreshFeedbackTiming, //10 seconds for feedback
	timing_stim: getRefreshFeedbackTiming,
	response_ends_trial: getRefreshResponseEnds,
	cont_key: [32],
	on_finish: function() {
		refresh_trial_id = "practice-no-stop-feedback"
		refresh_feedback_timing = 10000
		refresh_response_ends = false
	} 
}

var end_block = {
	type: 'poldrack-text',
	timing_response: 180000,
	data: {
		trial_id: "end",
	},
	text: '<div class = centerbox><p class = center-block-text>Thanks for completing this task!</p>'+'</div>',
	cont_key: [32],
	timing_post_trial: 0,
	on_finish: function(){
			assessPerformance()	  
		}
}


/********************************************/
/*				Set up nodes				*/
/********************************************/


var refreshTrials = []
console.log(refreshTrials);
console.log(refreshTrials.length);
refreshTrials.push(refresh_feedback_block)
for (var i = 0; i < refresh_len + 1; i++){
  
	var update_global_fixation = {
			type: 'poldrack-single-stim',
			stimulus: getGlobal, 
			is_html: true,
			choices: 'none',
			data: {
				trial_id: "update_correct_response",
			},
			timing_post_trial: 0,
			timing_stim: 500,
			timing_response: 500,
			prompt: prompt_text_list,
			fixation_default: true
		}
  
  
	var refresh_block = {
		type: 'poldrack-categorize',
		stimulus: getStim,
		is_html: true,
		data: getData,
		key_answer: getCorrectResponse,
		correct_text: '<div class = fb_box><div class = center-text>Correct!</div></div>',
		incorrect_text: '<div class = fb_box><div class = center-text><font size = 20>Incorrect!</font></div></div>', 
		timeout_message: getFeedback,
		choices: getKey,
		timing_response: 2000, //2000
		timing_stim: 1000, //1000
		timing_feedback_duration: 500,
		show_stim_with_feedback: false,
		fixation_default: true, 
		timing_post_trial: 0,
		on_finish: appendData,
		prompt: prompt_text_list
	}
	  
	refreshTrials.push(update_global_fixation)
	refreshTrials.push(refresh_block)
}

console.log('start');
var refreshCount = 0
var refreshNode = {
	timeline: refreshTrials,
	loop_function: function(data){
		  
		block_stims = createPracticeTrials(refresh_len)
		console.log(block_stims);
		console.log(block_stims.length);

		refreshCount += 1
		current_trial = 0
		var correct = 0
		var total_trials = 0
		var sum_rt = 0
		var sum_responses = 0
		  
		var total_go_trials = 0
		var missed_response = 0
		  
		for (var i = 0; i < data.length; i++){
			if (data[i].trial_id == "practice_trial"){
				total_trials+=1
				if (data[i].rt != -1){
					sum_rt += data[i].rt
					sum_responses += 1
				}
				
				if (data[i].key_press == data[i].correct_response){
					correct += 1
	  
				}
				  
				if (data[i].go_nogo_condition == 'go'){
					total_go_trials += 1
					if (data[i].rt == -1){
						missed_response += 1
					}
				}
				  
			}
		}
		
		var accuracy = correct / total_trials
		var missed_responses = missed_response / total_go_trials

		console.log(accuracy);
		console.log(accuracy_thresh);
	  
		feedback_text = "<br>Please take this time to read your feedback and to take a short break! "
  
		if (accuracy > accuracy_thresh){
			return false;
	  
		} else if (accuracy < accuracy_thresh){
			feedback_text +=
					'</p><p class = block-text>We are going to try practice again to see if you can achieve higher accuracy.  Remember: <br>' + prompt_text_list
			if (missed_responses > missed_thresh){
				feedback_text +=
						  '</p><p class = block-text>You have not been responding to some trials.  Please respond on every trial that requires a response.'
			}
			if (refresh_thresh != refreshCount) {
				block_stims = createPracticeTrials(refresh_len) 

				return true; 
			}

		}
		  
  
		  
	  
	}
	  
}








/* create experiment definition array */
var go_nogo_single_task_network__fmri_experiment = [];
  
go_nogo_single_task_network__fmri_experiment.push(motor_setup_block)
  
  
go_nogo_single_task_network__fmri_experiment.push(refreshNode)
go_nogo_single_task_network__fmri_experiment.push(refresh_feedback_block)
  
go_nogo_single_task_network__fmri_experiment.push(end_block)