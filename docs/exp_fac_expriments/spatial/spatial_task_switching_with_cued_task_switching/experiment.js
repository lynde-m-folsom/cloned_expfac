/* ************************************ */
/*       Define Helper Functions        */
/* ************************************ */

function getDisplayElement() {
	$('<div class = display_stage_background></div>').appendTo('body')
	return $('<div class = display_stage></div>').appendTo('body')
}

function addID() {
	jsPsych.data.addDataToLastTrial({exp_id: 'spatial_task_switching_with_cued_task_switching'})
}

function evalAttentionChecks() {
	var check_percent = 1
	if (run_attention_checks) {
		var attention_check_trials = jsPsych.data.getTrialsOfType('attention-check')
    var checks_passed = 0
    for (var i = 0; i < attention_check_trials.length; i++) {
      if (attention_check_trials[i].correct === true) {
        checks_passed += 1
      }
    }
    check_percent = checks_passed / attention_check_trials.length
  }
  return check_percent
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
		correct_response = possible_responses[mag_ind][1]
	} else if (predictable_dimension == 'parity'){
		correct_response = possible_responses[par_ind][1]
	}
	
	return [correct_response,magnitude,parity]

}

//added for spatial task
var makeTaskSwitches = function(numTrials) {
	task_switch_arr = ["tstay_cstay", "tstay_cswitch", "tswitch_cswitch", "tswitch_cswitch"]

	out = jsPsych.randomization.repeat(task_switch_arr, numTrials / 4)
	return out
}

//added for spatial task
var getQuad = function(oldQuad, curr_switch) {
	var out;
	switch(curr_switch){
		case "tstay_cstay":
			out = oldQuad
			break
		case "tstay_cswitch":
			if (oldQuad%2==0) { // if even (2,4), subtract 1
				out = oldQuad - 1
			} else {
				out = oldQuad + 1 //if odd (1,3), add 1
			}
			break
		case "tswitch_cswitch":
			if (oldQuad < 3) { //if in top quadrants (1,2)
				out = Math.ceil(Math.random() * 2) + 2 // should return 3 or 4
			} else  { //if in bottom quadrants (3,4) 
				out = Math.ceil(Math.random() * 2)  // should return 1 or 2
			}
			break
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
		right_response_arr = getCorrectResponse(left_number,predictable_dimension)
		
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
	for (var ii = 0; ii < task_switches.length; ii++){
		whichQuadStart += 1
		quadIndex = whichQuadStart%4
		if (quadIndex === 0){
			quadIndex = 4
		}

		quadIdx = getQuad(oldQuad, task_switches[ii]) //changed for spatial task

		var temp_2_cond = all_two_by_two_conditions[quadIndex - 1].pop()    
		cued_condition = temp_2_cond.task_cond
		cued_switch_condition = temp_2_cond.cue_cond
		predictable_dimension = predictable_dimensions[quadIdx - 1]
		predictable_condition = predictable_cond_array[ii%2]
		
		last_task = curr_task
		if (cued_condition == "switch"){ // if switch tasks, pick a random cue and switch to other task
			cued_switch_condition = 'switch'
			curr_task = randomDraw(['left','right'].filter(function(y) {return $.inArray(y, [last_task]) == -1}))
			curr_cue = tasks[curr_task].cues[Math.floor(Math.random() * 2)]
		} else if (cued_condition == "stay"){ // if stay tasks, if cued_switch condition is switch, then switch to other cue, stay if not.
			if (cued_switch_condition == 'switch'){
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
			cued_condition: cued_condition,
			cued_switch_condition: cued_switch_condition,
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



var appendData = function(){
	curr_trial = jsPsych.progress().current_trial_global
	trial_id = jsPsych.data.getDataByTrialIndex(curr_trial).trial_id
	current_trial+=1
	task_switch = 'na'
	if (current_trial > 1) {
		task_switch = task_switches[current_trial - 2] //this might be off
	}


	if (trial_id == 'practice_trial'){
		current_block = practiceCount
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

/* ************************************ */
/*    Define Experimental Variables     */
/* ************************************ */
// generic task variables
var sumInstructTime = 0 //ms
var instructTimeThresh = 0 ///in seconds
var credit_var = 0
var run_attention_checks = true


var practice_len = 16 // must be divisible by 16
var exp_len = 240 //320 must be divisible by 16
var numTrialsPerBlock = 48 // 64 must be divisible by 16
var numTestBlocks = exp_len / numTrialsPerBlock
var CTI = 150

var accuracy_thresh = 0.75
var rt_thresh = 1000
var missed_thresh = 0.10
var practice_thresh = 3  // 3 blocks of 16 trials

var pathSource = "/static/experiments/spatial_task_switching_with_cued_task_switching/images/"
var fileTypePNG = ".png'></img>"
var preFileType = "<img class = center src='/static/experiments/spatial_task_switching_with_cued_task_switching/images/"


var numbers_list = [[6,8],[7,9],[2,4],[1,3]]

var predictable_conditions = [['switch','stay'],
															['stay','switch']]
							 


var predictable_dimensions_list = [stim = {dim:'magnitude', values: ['high','low']}, 
																		stim = {dim:'parity', values: ['even','odd']}]

							 	  
var possible_responses = [['M Key', 77],['Z Key', 90]]

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

var prompt_text_list = '<ul style="text-align:left;">'+
						'<li>Top 2 quadrants: Judge cued number on '+predictable_dimensions_list[0].dim+'</li>' +
						'<li>'+predictable_dimensions_list[0].values[0]+': ' + possible_responses[0][0] + '</li>' +
						'<li>'+predictable_dimensions_list[0].values[1]+': ' + possible_responses[1][0] + '</li>' +
						'<li>Bottom 2 quadrants: Judge cued number on '+predictable_dimensions_list[1].dim+'</li>' +
						'<li>'+predictable_dimensions_list[1].values[0]+': ' + possible_responses[0][0] + '</li>' +
						'<li>'+predictable_dimensions_list[1].values[1]+': ' + possible_responses[1][0] + '</li>' +
						'<li>Cue was <i>left</i> or <i>first</i>, judge left number</li>' +
						'<li>Cue was <i>right</i> or <i>second</i>, judge right number</li>' +
					  '</ul>'

var prompt_text = '<div class = prompt_box>'+
					  '<p class = center-block-text style = "font-size:16px; line-height:80%%;">Top 2 quadrants: Judge cued number on '+predictable_dimensions_list[0].dim+'</p>' +
					  '<p class = center-block-text style = "font-size:16px; line-height:80%%;">'+predictable_dimensions_list[0].values[0]+': ' + possible_responses[0][0] + ' | ' + predictable_dimensions_list[0].values[1]+': ' + possible_responses[1][0] + '</p>' +
					  '<p>&nbsp</p>' +
					  '<p class = center-block-text style = "font-size:16px; line-height:80%%;">Bottom 2 quadrants: Judge cued number on '+predictable_dimensions_list[1].dim+'</p>' +
					  '<p class = center-block-text style = "font-size:16px; line-height:80%%;">'+predictable_dimensions_list[1].values[0]+': ' + possible_responses[0][0] + ' | ' + predictable_dimensions_list[1].values[1]+': ' + possible_responses[1][0] + '</p>' +
					  '<p class = center-block-text style = "font-size:16px; line-height:80%%;">Cue was <i>left</i> or <i>first</i>, judge left number</p>' +
					  '<p class = center-block-text style = "font-size:16px; line-height:80%%;">Cue was <i>right</i> or <i>second</i>, judge right number</p>' +
				  '</div>' 

//PRE LOAD IMAGES HERE
var pathSource = "/static/experiments/spatial_task_switching_with_cued_task_switching/images/"
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

/* ************************************ */
/*        Set up jsPsych blocks         */
/* ************************************ */
// Set up attention check node
var attention_check_block = {
  type: 'attention-check',
  data: {
    trial_id: "attention_check"
  },
  timing_response:  180000,
  response_ends_trial: true,
  timing_post_trial: 200
}

var attention_node = {
  timeline: [attention_check_block],
  conditional_function: function() {
    return run_attention_checks
  }
}

//Set up post task questionnaire
var post_task_block = {
   type: 'survey-text',
   data: {
       exp_id: "spatial_task_switching_with_cued_task_switching",
       trial_id: "post task questions"
   },
   questions: ['<p class = center-block-text style = "font-size: 20px">Please summarize what you were asked to do in this task.</p>',
              '<p class = center-block-text style = "font-size: 20px">Do you have any comments about this task?</p>'],
   rows: [15, 15],
   timing_response:  360000,
   columns: [60,60]
};

var end_block = {
	type: 'poldrack-text',
	data: {
		trial_id: "end",
	},
	timing_response:  180000,
	text: '<div class = centerbox><p class = center-block-text>Thanks for completing this task!</p><p class = center-block-text>Press <i>enter</i> to continue.</p></div>',
	cont_key: [13],
	timing_post_trial: 0,
	on_finish: function(){
		assessPerformance()
		evalAttentionChecks()
    }
};


var feedback_instruct_text =
	'Welcome to the experiment. This experiment will take around 15 minutes. Press <i>enter</i> to begin.'
var feedback_instruct_block = {
	type: 'poldrack-text',
	data: {
		trial_id: "instruction"
	},
	cont_key: [13],
	text: getInstructFeedback,
	timing_post_trial: 0,
	timing_response:  180000
};

/// This ensures that the subject does not read through the instructions too quickly.  If they do it too quickly, then we will go over the loop again.
var instructions_block = {
	type: 'poldrack-instructions',
	data: {
		trial_id: "instruction"
	},
	pages: [
		'<div class = centerbox>'+
			'<p class = block-text>In this experiment, across trials you will see a cue, either <i>left</i>, <i>first</i>, <i>right</i>, or <i>second</i>, followed by 2 numbers in one of the 4 quadrants.  '+
			'On any trial, one quadrant will have a cue, followed by 2 numbers.</p> '+
		
			'<p class = block-text>The cue will instruct you which of the following 2 numbers, you must make a judgement on.</p>'+
			
			'<p class = block-text>If you see the cue, <i>left</i> or <i>first</i>, please judge the upcoming left number.</p>'+
			
			'<p class = block-text>If you saw the cue, <i>right</i> or <i>second</i>, please judge the upcoming right number.</p>'+
			
		
		'</div>',
		
		'<div class = centerbox>'+
			'<p class = block-text>You will be asked to judge the <i>cued number </i>on magnitude (higher or lower than 5) or parity (odd or even), depending on which quadrant '+
			'the cue and numbers are in.</p>'+
			
			'<p class = block-text>In the top two quadrants, please judge the cued number based on <i>'+predictable_dimensions_list[0].dim+'</i>. Press the <i>'+possible_responses[0][0]+
			'  if '+predictable_dimensions_list[0].values[0]+'</i>, and the <i>'+possible_responses[1][0]+'  if '+predictable_dimensions_list[0].values[1]+'</i>.</p>'+
			/*In the top two quadrants, please judge the cued number based on magnitude. Press the M Key if high, and the Z Key if low.*/

			'<p class = block-text>In the bottom two quadrants, please judge the cued number based on <i>'+predictable_dimensions_list[1].dim+'.</i>'+
			' Press the <i>'+possible_responses[0][0]+' if '+predictable_dimensions_list[1].values[0]+'</i>, and the <i>'+possible_responses[1][0]+
			' if '+predictable_dimensions_list[1].values[1]+'</i>.</p>'+
			/*In the bottom two quadrants, please judge the cued number based on parity. Press the M Key if even, and the Z Key if odd.*/
			
			'<p class = block-text>Please judge only the cued number for that trial!</p>'+
		'</div>',
		
		'<div class = centerbox>'+
			'<p class = block-text>We will start practice after you finish instructions. Please make sure you understand the instructions before moving on. During practice, you will receive a reminder of the rules.  <i>This reminder will not be available for test</i>.</p>'+
			'<p class = block-text>To avoid technical issues, please keep the experiment tab (on Chrome or Firefox) <i>active and in full-screen mode</i> for the whole duration of each task.</p>'+
		'</div>'
	],
	allow_keys: false,
	show_clickable_nav: true,
	timing_post_trial: 1000
};



/* This function defines stopping criteria */

var instruction_node = {
	timeline: [feedback_instruct_block, instructions_block],
	
	loop_function: function(data) {
		for (i = 0; i < data.length; i++) {
			if ((data[i].trial_type == 'poldrack-instructions') && (data[i].rt != -1)) {
				rt = data[i].rt
				sumInstructTime = sumInstructTime + rt
			}
		}
		if (sumInstructTime <= instructTimeThresh * 1000) {
			feedback_instruct_text =
				'Read through instructions too quickly.  Please take your time and make sure you understand the instructions.  Press <i>enter</i> to continue.'
			return true
		} else if (sumInstructTime > instructTimeThresh * 1000) {
			feedback_instruct_text = 'Done with instructions. Press <i>enter</i> to continue.'
			return false
		}
	}
}

var start_test_block = {
	type: 'poldrack-text',
	data: {
		trial_id: "instruction"
	},
	timing_response:  180000,
	text: '<div class = centerbox>'+
			'<p class = block-text>We will now start the test portion</p>'+
			
			'<p class = block-text>You will see a cue, either <i>left</i>, <i>first</i>, <i>right</i>, or <i>second</i>, which will instruct you to judge the upcoming <i>right</i> or <i>left</i> number.</p>'+
			
			'<p class = block-text>Please judge the <i>cued number </i>on magnitude (higher or lower than 5) or parity (odd or even), depending on which quadrant '+
			'the cues and numbers are in.</p>'+
			
			'<p class = block-text>In the top two quadrants, please judge the cued number based on <i>'+predictable_dimensions_list[0].dim+'</i>. Press the <i>'+possible_responses[0][0]+
			'  if '+predictable_dimensions_list[0].values[0]+'</i>, and the <i>'+possible_responses[1][0]+'  if '+predictable_dimensions_list[0].values[1]+'</i>.</p>'+
		
			'<p class = block-text>In the bottom two quadrants, please judge the cued number based on <i>'+predictable_dimensions_list[1].dim+'.</i>'+
			' Press the <i>'+possible_responses[0][0]+' if '+predictable_dimensions_list[1].values[0]+'</i>, and the <i>'+possible_responses[1][0]+
			' if '+predictable_dimensions_list[1].values[1]+'</i>.</p>'+
		
			'<p class = block-text>Please judge only the cued number for that trial!</p>'+
	
			'<p class = block-text>You will no longer receive the rule prompt, so remember the instructions before you continue. Press Enter to begin.</p>'+ 
		 '</div>',
	cont_key: [13],
	timing_post_trial: 1000,
	on_finish: function(){
		feedback_text = "We will now start the test portion. Press enter to begin."
	}
};

var fixation_block = {
	type: 'poldrack-single-stim',
	stimulus: '<div class = centerbox><div class = fixation>+</div></div>',
	is_html: true,
	choices: 'none',
	data: {
		trial_id: "practice_fixation"
	},
	timing_response:  500, //500
	timing_post_trial: 0,
}



var feedback_text = 
'Welcome to the experiment. This experiment will take around 15 minutes. Press <i>enter</i> to begin.'
var feedback_block = {
	type: 'poldrack-single-stim',
	data: {
		exp_id: "spatial_task_switching_with_cued_task_switching",
		trial_id: "practice-no-stop-feedback"
	},
	choices: [13],
	stimulus: getFeedback,
	timing_post_trial: 0,
	is_html: true,
	timing_response:  180000,
	response_ends_trial: true, 

};

/* ************************************ */
/*        Set up timeline blocks        */
/* ************************************ */

var practiceTrials = []
practiceTrials.push(feedback_block)
practiceTrials.push(instructions_block)
for (i = 0; i < practice_len + 1; i++) {
	var fixation_block = {
	  type: 'poldrack-single-stim',
	  stimulus: getFixation,
	  is_html: true,
	  choices: 'none',
	  data: {
		trial_id: "fixation"
	  },
	  timing_post_trial: 0,
	  timing_stim: 500, //500
	  timing_response:  500, //500
	  prompt: prompt_text
	}
	
	var cue_block = {
		type: 'poldrack-single-stim',
		stimulus: getCue,
		is_html: true,
		data: {
			"trial_id": "practice_cue_block",
		},
		choices: 'none',
		timing_stim: getCTI, //getCTI
		timing_response:  getCTI, //getCTI
		timing_post_trial: 0,
		response_ends_trial: false,
		prompt: prompt_text
	}
	
	var practice_block = {
		type: 'poldrack-categorize',
		stimulus: getStim,
		is_html: true,
		choices: [possible_responses[0][1],possible_responses[1][1]],
		key_answer: getResponse,
		data: {
			trial_id: "practice_trial"
			},
		correct_text: '<div class = fb_box><div class = center-text><font size = 20>Correct!</font></div></div>' + prompt_text,
		incorrect_text: '<div class = fb_box><div class = center-text><font size = 20>Incorrect</font></div></div>' + prompt_text,
		timeout_message: '<div class = fb_box><div class = center-text><font size = 20>Respond Faster!</font></div></div>' + prompt_text,
		timing_stim: 1000, //1000
		timing_response:  2000, //2000
		timing_feedback_duration: 500,
		show_stim_with_feedback: false,
		timing_post_trial: 0,
		on_finish: appendData,
		prompt: prompt_text
	}
	practiceTrials.push(fixation_block)
	practiceTrials.push(cue_block)
	practiceTrials.push(practice_block)
}

var practiceCount = 0
var practiceNode = {
	timeline: practiceTrials,
	loop_function: function(data) {
		practiceCount += 1
		task_switches = makeTaskSwitches(practice_len)
		stims = createTrialTypes(task_switches, practice_len)
		current_trial = 0 
	
		var sum_rt = 0
		var sum_responses = 0
		var correct = 0
		var total_trials = 0
	
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
		
			}
	
		}
	
		var accuracy = correct / total_trials
		var missed_responses = (total_trials - sum_responses) / total_trials
		var ave_rt = sum_rt / sum_responses
	
		feedback_text = "<br>Please take this time to read your feedback and to take a short break! Press enter to continue"

		if (accuracy > accuracy_thresh){
			feedback_text +=
					'</p><p class = block-text>Done with this practice. Press Enter to continue.' 
			task_switches = makeTaskSwitches(numTrialsPerBlock)
			stims = createTrialTypes(task_switches, numTrialsPerBlock)
			return false
	
		} else if (accuracy < accuracy_thresh){
			feedback_text +=
					'</p><p class = block-text>We are going to try practice again to see if you can achieve higher accuracy.  Remember: <br>' + prompt_text_list 
			if (missed_responses > missed_thresh){
				feedback_text +=
						'</p><p class = block-text>You have not been responding to some trials.  Please respond on every trial that requires a response.'
			}
	      	
	      	if (ave_rt > rt_thresh) {
	        	feedback_text += 
	            	'</p><p class = block-text>You have been responding too slowly.'
	      	}
		
			if (practiceCount == practice_thresh){
				feedback_text +=
					'</p><p class = block-text>Done with this practice.' 
					task_switches = makeTaskSwitches(numTrialsPerBlock)
					stims = createTrialTypes(task_switches, numTrialsPerBlock)
					return false
			}
			
			feedback_text +=
				'</p><p class = block-text>Redoing this practice. Press Enter to continue.' 
			
			return true
		
		}
		
	}
}

var testTrials = []
testTrials.push(feedback_block)
testTrials.push(attention_node)
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
	  timing_stim: 500, //500
	  timing_response:  500 //500
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
		choices: [possible_responses[0][1],possible_responses[1][1]],
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

var testCount = 0
var testNode = {
	timeline: testTrials,
	loop_function: function(data) {
	testCount += 1
	task_switches = makeTaskSwitches(numTrialsPerBlock)
	stims = createTrialTypes(task_switches, numTrialsPerBlock)
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
	
		feedback_text = "<br>Please take this time to read your feedback and to take a short break! Press enter to continue"
		feedback_text += "</p><p class = block-text>You have completed: "+testCount+" out of "+numTestBlocks+" blocks of trials."
		
		if (accuracy < accuracy_thresh){
			feedback_text +=
					'</p><p class = block-text>Your accuracy is too low.  Remember: <br>' + prompt_text_list 
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
					'</p><p class = block-text>Done with this test. Press Enter to continue.<br> If you have been completing tasks continuously for an hour or more, please take a 15-minute break before starting again.'
			return false
		} else {
		
			return true
		}
	
	}
}


/* ************************************ */
/*          Set up Experiment           */
/* ************************************ */

var spatial_task_switching_with_cued_task_switching_experiment = []

spatial_task_switching_with_cued_task_switching_experiment.push(practiceNode);
spatial_task_switching_with_cued_task_switching_experiment.push(feedback_block);

spatial_task_switching_with_cued_task_switching_experiment.push(start_test_block);
spatial_task_switching_with_cued_task_switching_experiment.push(testNode);
spatial_task_switching_with_cued_task_switching_experiment.push(feedback_block);

spatial_task_switching_with_cued_task_switching_experiment.push(post_task_block);
spatial_task_switching_with_cued_task_switching_experiment.push(end_block);
