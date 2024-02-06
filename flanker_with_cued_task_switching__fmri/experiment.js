/* ************************************ */
/* Define helper functions */
/* ************************************ */
//FUNCTIONS FOR GETTING FMRI SEQUENCES
function getdesignITIs(design_num) {
  x = fetch(pathDesignSource + 'design_' + design_num + '/ITIs_clean.txt')
    .then((res) => res.text())
    .then((res) => res)
    .then((text) => text.split(/\r?\n/));
  return x;
}
function getdesignEvents(design_num) {
  x = fetch(pathDesignSource + 'design_' + design_num + '/events_clean.txt')
    .then((res) => res.text())
    .then((res) => res)
    .then((text) => text.split(/\r?\n/));
  return x;
}

function makeDesignSwitches(design_events) {
  var task_switches_array = [];
  for (var i = 0; i < design_events.length; i++) {
    switch (design_events[i]) {
      case 'congruent_tstay_cstay':
        task_switches_array.push({
          task_switch: 'stay',
          cue_switch: 'stay',
          flanker_condition: 'congruent',
        });
        break;
      case 'congruent_tstay_cswitch':
        task_switches_array.push({
          task_switch: 'stay',
          cue_switch: 'switch',
          flanker_condition: 'congruent',
        });
        break;
      case 'congruent_tswitch_cswitch':
        task_switches_array.push({
          task_switch: 'switch',
          cue_switch: 'switch',
          flanker_condition: 'congruent',
        });
        break;
      case 'incongruent_tstay_cstay':
        task_switches_array.push({
          task_switch: 'stay',
          cue_switch: 'stay',
          flanker_condition: 'incongruent',
        });
        break;
      case 'incongruent_tstay_cswitch':
        task_switches_array.push({
          task_switch: 'stay',
          cue_switch: 'switch',
          flanker_condition: 'incongruent',
        });
        break;
      case 'incongruent_tswitch_cswitch':
        task_switches_array.push({
          task_switch: 'switch',
          cue_switch: 'switch',
          flanker_condition: 'incongruent',
        });
        break;
    }
  }
  return task_switches_array;
}

function insertBufferITIs(design_ITIs) {
  //required to add a buffer ITI for before the 'na' trial (the first trial of the block)
  var buffer_ITIs = genITIs();
  var out_ITIs = [];
  while (design_ITIs.length > 0) {
    out_ITIs = out_ITIs.concat(buffer_ITIs.slice(0, 1)); //get 1 buffer ITI to start each block
    buffer_ITIs = buffer_ITIs.slice(1); //remove the just used buffer ITI from the buffer ITI array

    curr_block_ITIs = design_ITIs.slice(0, numTrialsPerBlock); //get this current block's ITIs
    design_ITIs = design_ITIs.slice(numTrialsPerBlock); //remove this current block's ITIs from des_ITIs

    out_ITIs = out_ITIs.concat(curr_block_ITIs); //add this current block's ITI's to the out array
  }
  return out_ITIs;
}
function addID() {
  jsPsych.data.addDataToLastTrial({
    exp_id: 'flanker_with_cued_task_switching',
  });
}
//Functions added for in-person sessions
function genITIs() {
  mean_iti = 0.5; //mean and standard deviation of 0.5 secs
  min_thresh = 0;
  max_thresh = 4;

  lambda = 1 / mean_iti;
  iti_array = [];
  for (i = 0; i < test_length + numTestBlocks; i++) {
    //add 3 ITIs per test block to make sure there are enough
    curr_iti = -Math.log(Math.random()) / lambda;
    while (curr_iti > max_thresh || curr_iti < min_thresh) {
      curr_iti = -Math.log(Math.random()) / lambda;
    }
    iti_array.push(curr_iti * 1000); //convert ITIs from seconds to milliseconds
  }
  return iti_array;
}

function getITI_stim() {
  //added for fMRI compatibility
  var currITI = ITIs_stim.shift();
  if (currITI == 0.0) {
    //THIS IS JUST FOR CONVENIENCE BEFORE NEW DESIGNS ARE REGENERATED
    currITI = 0.1;
  }
  return currITI;
}

function getITI_resp() {
  //added for fMRI compatibility
  var currITI = ITIs_resp.shift();
  if (currITI == 0.0) {
    //THIS IS JUST FOR CONVENIENCE BEFORE NEW DESIGNS ARE REGENERATED
    currITI = 0.1;
  }
  return currITI;
}

//added for motor counterbalancing
function getMotorPerm() {
  return motor_perm;
}
function getCurrTask() {
  return curr_task;
}

// returns dictionary with keys for and fingers for the two tasks. set [0] = magnitude, set [1] = parity
function getResponseKeys() {
  if (getMotorPerm() == 0) {
    return {
      key: [
        [89, 71],
        [89, 71],
      ],
      key_name: [
        ['index finger', 'middle finger'],
        ['index finger', 'middle finger'],
      ],
    };
  } else if (getMotorPerm() == 1) {
    return {
      key: [
        [71, 89],
        [89, 71],
      ],
      key_name: [
        ['middle finger', 'index finger'],
        ['index finger', 'middle finger'],
      ],
    };
  } else if (getMotorPerm() == 2) {
    return {
      key: [
        [89, 71],
        [71, 89],
      ],
      key_name: [
        ['index finger', 'middle finger'],
        ['middle finger', 'index finger'],
      ],
    };
  } else if (getMotorPerm() == 3) {
    return {
      key: [
        [71, 89],
        [71, 89],
      ],
      key_name: [
        ['middle finger', 'index finger'],
        ['middle finger', 'index finger'],
      ],
    };
  }
}

function getChoices() {
  if (getCurrTask() == 'magnitude') {
    return getResponseKeys().key[0];
  } else if (getCurrTask() == 'parity') {
    return getResponseKeys().key[1];
  }
}

function assessPerformance() {
  var experiment_data = jsPsych.data.getTrialsOfType('poldrack-single-stim');
  var missed_count = 0;
  var trial_count = 0;
  var rt_array = [];
  var rt = 0;
  var correct = 0;

  //record choices participants made
  var choice_counts = {};
  choice_counts[-1] = 0;
  choice_counts[77] = 0;
  choice_counts[90] = 0;

  for (var i = 0; i < experiment_data.length; i++) {
    if (experiment_data[i].trial_id == 'test_trial') {
      trial_count += 1;
      rt = experiment_data[i].rt;
      key = experiment_data[i].key_press;
      choice_counts[key] += 1;
      if (rt == -1) {
        missed_count += 1;
      } else {
        rt_array.push(rt);
      }

      if (key == experiment_data[i].correct_response) {
        correct += 1;
      }
    }
  }

  //calculate average rt
  var avg_rt = -1;
  if (rt_array.length !== 0) {
    avg_rt = math.median(rt_array);
  }
  //calculate whether response distribution is okay
  var responses_ok = true;
  Object.keys(choice_counts).forEach(function (key, index) {
    if (choice_counts[key] > trial_count * 0.85) {
      responses_ok = false;
    }
  });
  var missed_percent = missed_count / trial_count;
  var accuracy = correct / trial_count;
  credit_var =
    missed_percent < 0.25 && avg_rt > 200 && responses_ok && accuracy > 0.6;
  jsPsych.data.addDataToLastTrial({
    final_credit_var: credit_var,
    final_missed_percent: missed_percent,
    final_avg_rt: avg_rt,
    final_responses_ok: responses_ok,
    final_accuracy: accuracy,
  });
}

var randomDraw = function (lst) {
  var index = Math.floor(Math.random() * lst.length);
  return lst[index];
};

var getInstructFeedback = function () {
  return (
    '<div class = centerbox><p class = center-block-text>' +
    feedback_instruct_text +
    '</p></div>'
  );
};

// Task Specific Functions
var getKeys = function (obj) {
  var keys = [];
  for (var key in obj) {
    keys.push(key);
  }
  return keys;
};

var genStims = function (n) {
  stims = [];
  for (var i = 0; i < n; i++) {
    var number = randomDraw('12346789');
    var color = 'white';
    var stim = {
      number: parseInt(number),
      color: color,
    };
    stims.push(stim);
  }
  return stims;
};

//Sets the cue-target-interval for the cue block
var setCTI = function () {
  return CTI; //randomDraw([100, 900])
};

var getCTI = function () {
  return CTI;
};

var getFeedback = function () {
  return (
    '<div class = bigbox><div class = picture_box><p class = block-text><font color="white">' +
    feedback_text +
    '</font></p></div></div>'
  );
};

/* Index into task_switches using the global var current_trial. Using the task_switch and cue_switch
change the task. If "stay", keep the same task but change the cue based on "cue switch". 
If "switch new", switch to the task that wasn't the current or last task, choosing a random cue. 
If "switch old", switch to the last task and randomly choose a cue.
*/
var setStims = function () {
  var tmp;
  var numbers = [1, 2, 3, 4, 6, 7, 8, 9];
  console.log('task_switches: ', task_switches);
  console.log('task switches [current_trial]: ', task_switches[current_trial]);
  switch (task_switches[current_trial].task_switch) {
    case 'stay':
      if (curr_task == 'na') {
        tmp = curr_task;
        curr_task = randomDraw(getKeys(tasks));
      }
      if (task_switches[current_trial].cue_switch == 'switch') {
        cue_i = 1 - cue_i;
      }
      break;
    case 'switch':
      task_switches[current_trial].cue_switch = 'switch';
      cue_i = randomDraw([0, 1]);
      if (last_task == 'na') {
        tmp = curr_task;
        curr_task = randomDraw(
          getKeys(tasks).filter(function (x) {
            return x != curr_task;
          })
        );
        last_task = tmp;
      } else {
        tmp = curr_task;
        curr_task = getKeys(tasks).filter(function (x) {
          return x != curr_task;
        })[0];
        last_task = tmp;
      }
      break;
    case 'switch_old':
      task_switches[current_trial].cue_switch = 'switch';
      cue_i = randomDraw([0, 1]);
      if (last_task == 'na') {
        tmp = curr_task;
        curr_task = randomDraw(
          getKeys(tasks).filter(function (x) {
            return x != curr_task;
          })
        );
        last_task = tmp;
      } else {
        tmp = curr_task;
        curr_task = last_task;
        last_task = tmp;
      }
      break;
  }
  curr_cue = tasks[curr_task].cues[cue_i];
  curr_stim = stims[current_trial];
  flanker_condition = task_switches[current_trial].flanker_condition;
  if (flanker_condition == 'congruent') {
    flanking_number = curr_stim.number;
  } else {
    flanking_number = randomDraw(
      numbers.filter(function (y) {
        return y != curr_stim.number;
      })
    );
  }
  current_trial = current_trial + 1;
  CTI = setCTI();
};

var getCue = function () {
  var cue_html =
    '<div class = upperbox><div class = "center-text" style="font-size: 85px;" >' +
    curr_cue +
    '</div></div><div class = lowerbox><div class = fixation>+</div></div>';
  return cue_html;
};

var task_boards = [
  [
    '<div class = bigbox><div class = centerbox><div class = flankerLeft_2><div class = cue-text>',
  ],
  ['</div></div><div class = flankerLeft_1><div class = cue-text>'],
  ['</div></div><div class = flankerMiddle><div class = cue-text>'],
  ['</div></div><div class = flankerRight_1><div class = cue-text>'],
  ['</div></div><div class = flankerRight_2><div class = cue-text>'],
  ['</div></div></div></div>'],
];

var getStim = function () {
  var stim_html =
    '<div class = upperbox><div class = "center-text" style="font-size:85px;" >' +
    curr_cue +
    '</div></div>' +
    '<div class = lowerbox>' +
    '<div class = flankerLeft_2><div class = cue-text>' +
    preFileType +
    flanking_number +
    fileTypePNG +
    '</div></div>' +
    '<div class = flankerLeft_1><div class = cue-text>' +
    preFileType +
    flanking_number +
    fileTypePNG +
    '</div></div>' +
    '<div class = flankerMiddle><div class = cue-text>' +
    preFileType +
    curr_stim.number +
    fileTypePNG +
    '</div></div>' +
    '<div class = flankerRight_1><div class = cue-text>' +
    preFileType +
    flanking_number +
    fileTypePNG +
    '</div></div>' +
    '<div class = flankerRight_2><div class = cue-text>' +
    preFileType +
    flanking_number +
    fileTypePNG +
    '</div></div>' +
    '</div>';
  return stim_html;
};

//Returns the key corresponding to the correct response for the current
// task and stim
var getResponse = function () {
  switch (curr_task) {
    case 'magnitude':
      if (curr_stim.number > 5) {
        correct_response = getResponseKeys().key[0][0];
        return correct_response;
      } else {
        correct_response = getResponseKeys().key[0][1];
        return correct_response;
      }
    case 'parity':
      if (curr_stim.number % 2 === 0) {
        correct_response = getResponseKeys().key[1][0];
        return correct_response;
      } else {
        correct_response = getResponseKeys().key[1][1];
        return correct_response;
      }
  }
};

function getTimeoutMessage() {
  return (
    '<div class = upperbox><div class = center-text>Respond Faster!</div></div>' +
    getPromptTaskList()
  );
}

function getTaskList() {
  return (
    '<p class = instruct-text>If you see the cue, <i>magnitude</i> or <i>high-low</i>, please judge the number based on whether it is lower or higher than 5. Press the <i>' +
    getResponseKeys().key_name[0][0] +
    ' key</i> if high, and the <i>' +
    getResponseKeys().key_name[0][1] +
    ' key</i> if low.</p>' +
    '<p class = instruct-text>If you see the cue, <i>parity</i> or <i>odd-even</i>, please judge the number based on whether it is odd or even. Press the <i>' +
    getResponseKeys().key_name[1][0] +
    ' key</i> if even, and the <i>' +
    getResponseKeys().key_name[1][1] +
    ' key</i> if odd.</p>'
  );
}

//feedback functions added for in-person version
var getRefreshFeedback = function () {
  if (getRefreshTrialID() == 'instructions') {
    return (
      '<div class = centerbox>' +
      '<p class = instruct-text>In this experiment you will see a cue, either <i>magnitude</i>, <i>high-low</i>, <i>odd-even</i>, or <i>parity</i>, followed by a row of numbers.</p> ' +
      '<p class = instruct-text>You will be asked to judge the <i>center number </i>on magnitude (higher or lower than 5) or parity (odd or even), depending on which cue you saw.</p>' +
      getTaskList() +
      '<p class = instruct-text>Please judge only the center number, you should ignore the other numbers.</p>' +
      '<p class = instruct-text>During practice, you will receive a reminder of the rules.  <i>This reminder will not be available for test</i>.</p>' +
      '</div>'
    );
  } else {
    return (
      '<div class = bigbox><div class = picture_box><p class = block-text><font color="white">' +
      refresh_feedback_text +
      '</font></p></div></div>'
    );
  }
};

var getRefreshTrialID = function () {
  return refresh_trial_id;
};

var getRefreshFeedbackTiming = function () {
  return refresh_feedback_timing;
};

var getRefreshResponseEnds = function () {
  return refresh_response_ends;
};

/* Append gap and current trial to data and then recalculate for next trial*/
var appendData = function () {
  var curr_trial = jsPsych.progress().current_trial_global;
  var trial_id = jsPsych.data.getDataByTrialIndex(curr_trial).trial_id;
  var trial_num = current_trial - 1; //current_trial has already been updated with setStims, so subtract one to record data
  var task_switch = task_switches[trial_num];

  jsPsych.data.addDataToLastTrial({
    cue: curr_cue,
    stim_color: curr_stim.color,
    stim_number: curr_stim.number,
    task: curr_task,
    task_condition: task_switch.task_switch,
    cue_condition: task_switch.cue_switch,
    flanker_condition: flanker_condition,
    flanking_number: flanking_number,
    trial_num: trial_num,
    CTI: CTI,
    current_trial: current_trial,
  });
};

/* ************************************ */
/* Define experimental variables */
/* ************************************ */
// generic task variables
var sumInstructTime = 0; //ms
var instructTimeThresh = 0; ///in seconds
var credit_var = 0;

var fileTypePNG = '.png"></img>';
var preFileType =
  '<img class = center src="/static/experiments/flanker_with_cued_task_switching__fmri/images/';
var accuracy_thresh = 0.75;
var rt_thresh = 1000;
var missed_response_thresh = 0.1;
var practice_thresh = 3;
var lowestNumCond = 8;
var CTI = 150;

var choices = [71, 89];
var refresh_length = 8;
var test_length = 240;
var numTrialsPerBlock = 40;
var numTestBlocks = test_length / numTrialsPerBlock;

var flanker_styles = ['solid', 'outlined'];

//set up block stim. correct_responses indexed by [block][stim][type]
var tasks = {
  parity: {
    task: 'parity',
    cues: ['Parity', 'Odd-Even'],
  },
  magnitude: {
    task: 'magnitude',
    cues: ['Magnitude', 'High-Low'],
  },
};
/*
color: {
    task: 'color',
    cues: ['Color', 'Orange-Blue']
  },
*/
var current_trial = 0;
var task_switch_types = ['stay', 'switch'];
var cue_switch_types = ['stay', 'switch'];
var flanker_types = ['congruent', 'incongruent'];
var task_switches_array = [];
for (var t = 0; t < task_switch_types.length; t++) {
  for (var c = 0; c < cue_switch_types.length; c++) {
    for (var s = 0; s < flanker_types.length; s++) {
      task_switches_array.push({
        task_switch: task_switch_types[t],
        cue_switch: cue_switch_types[c],
        flanker_condition: flanker_types[s],
      });
    }
  }
}
var task_switches = jsPsych.randomization.repeat(
  task_switches_array,
  refresh_length / lowestNumCond
);
task_switches.unshift({
  task_switch: 'na',
  cue_switch: 'na',
  flanker_condition: jsPsych.randomization.repeat(flanker_types, 1).pop(),
});

var curr_task = randomDraw(getKeys(tasks));
var last_task = 'na'; //object that holds the last task, set by setStims()
var curr_cue = 'na'; //object that holds the current cue, set by setStims()
var cue_i = randomDraw([0, 1]); //index for one of two cues of the current task
var curr_stim = 'na'; //object that holds the current stim, set by setStims()
var exp_stage = 'practice'; // defines the exp_stage, switched by start_test_block

function getPromptTaskList() {
  return (
    '<ul style="text-align:left;"><font color="white">' +
    '<li><i>Magnitude</i> or <i>High-Low</i>: ' +
    getResponseKeys().key_name[0][0] +
    ' if >5 and ' +
    getResponseKeys().key_name[0][1] +
    ' if <5.</li>' +
    '<li><i>Parity</i> or <i>Odd-Even</i>: ' +
    getResponseKeys().key_name[1][0] +
    ' if even and ' +
    getResponseKeys().key_name[1][1] +
    ' if odd.</li>' +
    '<li>Only judge the center number!</li>' +
    '</ul>'
  );
}

//PRE LOAD IMAGES HERE
var pathSource =
  '/static/experiments/flanker_with_cued_task_switching__fmri/images/';
var pathDesignSource =
  '/static/experiments/flanker_with_cued_task_switching__fmri/designs/'; //ADDED FOR fMRI SEQUENCES
var numbersPreload = ['1', '2', '3', '4', '6', '7', '8', '9'];
var images = [];
for (i = 0; i < numbersPreload.length; i++) {
  images.push(pathSource + numbersPreload[i] + '.png');
}

jsPsych.pluginAPI.preloadImages(images);

//ADDED FOR SCANNING
//fmri variables
var ITIs_stim = [];
var ITIs_resp = [];
var refresh_trial_id = 'instructions';
var refresh_feedback_timing = -1;
var refresh_response_ends = true;
var refreshStims = [];
var testStims = [];
var stims = [];

var motor_perm = 0;
/* ************************************ */
/* Set up jsPsych blocks */
/* ************************************ */

var refresh_intro_block = {
  type: 'poldrack-single-stim',
  stimulus: getRefreshFeedback,
  data: {
    trial_id: getRefreshTrialID,
  },
  choices: [32],
  timing_post_trial: 0,
  is_html: true,
  timing_response: getRefreshFeedbackTiming, //10 seconds for feedback
  timing_stim: getRefreshFeedbackTiming,
  response_ends_trial: getRefreshResponseEnds,
  on_finish: function () {
    refresh_trial_id = 'practice-no-stop-feedback';
    refresh_feedback_timing = 10000;
    refresh_response_ends = false;
    // if (ITIs_stim.length===0) { //if ITIs haven't been generated, generate them!
    // 	ITIs_stim = genITIs()
    // 	ITIs_resp = ITIs_stim.slice(0) //make a copy of ITIs so that timing_stimulus & timing_response are the same
    // }
    var task_switches = jsPsych.randomization.repeat(
      task_switches_array,
      refresh_length / 4
    );
    task_switches.unshift({
      task_switch: 'na',
      cue_switch: 'na',
      flanker_condition: jsPsych.randomization.repeat(flanker_types, 1).pop(),
    }); //changed pop to shift
    var refreshStims = genStims(refresh_length + 1);
    stims = refreshStims;
  },
};

var refresh_feedback_block = {
  type: 'poldrack-single-stim',
  stimulus: getRefreshFeedback,
  data: {
    trial_id: getRefreshTrialID,
  },
  choices: [32],
  timing_post_trial: 0,
  is_html: true,
  timing_response: getRefreshFeedbackTiming, //10 seconds for feedback
  timing_stim: getRefreshFeedbackTiming,
  response_ends_trial: getRefreshResponseEnds,
  on_finish: function () {
    refresh_trial_id = 'practice-no-stop-feedback';
    refresh_feedback_timing = 10000;
    refresh_response_ends = false;
    // if (ITIs_stim.length===0) { //if ITIs haven't been generated, generate them!
    // 	ITIs_stim = genITIs()
    // 	ITIs_resp = ITIs_stim.slice(0) //make a copy of ITIs so that timing_stimulus & timing_response are the same
    // }
  },
};

var end_block = {
  type: 'poldrack-text',
  data: {
    trial_id: 'end',
  },
  text: '<div class = centerbox><p class = center-block-text>Thanks for completing this task!</p>',
  cont_key: [13],
  timing_response: 10000,
  on_finish: function () {
    assessPerformance();
  },
};

/* define practice and test blocks */
var setStims_block = {
  type: 'call-function',
  data: {
    trial_id: 'set_stims',
  },
  func: setStims,
  timing_post_trial: 0,
};

var feedback_block = {
  type: 'poldrack-single-stim',
  data: {
    trial_id: 'practice-stop-feedback',
  },
  choices: 'none',
  stimulus: getFeedback,
  timing_post_trial: 0,
  is_html: true,
  timing_response: 10000,
  response_ends_trial: false,
};

/********************************************/
/*				Set up nodes				*/
/********************************************/

var des_ITIs = [];
var des_events = [];
var des_task_switches = [];

var design_setup_block = {
  type: 'survey-text',
  data: {
    trial_id: 'design_setup',
  },
  questions: [['<p class = center-block-text>Design permutation (0-1):</p>']],
  on_finish: async function (data) {
    design_perm = parseInt(data.responses.slice(7, 10));
    des_ITIs = await getdesignITIs(design_perm);
    des_ITIs = des_ITIs.map(Number);
    des_ITIs = insertBufferITIs(des_ITIs);
    ITIs_stim = des_ITIs.slice(0);
    ITIs_resp = des_ITIs.slice(0);
    des_events = await getdesignEvents(design_perm);
    console.log(des_events);
    des_task_switches = makeDesignSwitches(des_events);
    console.log(des_task_switches);
  },
};

var motor_setup_block = {
  type: 'survey-text',
  data: {
    trial_id: 'motor_setup',
  },
  questions: [['<p class = center-block-text>motor permutation (0-3):</p>']],
  on_finish: function (data) {
    motor_perm = parseInt(data.responses.slice(7, 10));
    practiceStims = genStims(refresh_length + 1);
    testStims = genStims(numTrialsPerBlock + 1);
    stims = practiceStims;
    console.log(stims);
  },
};

//in scanner refresh trials
var refreshTrials = [];
refreshTrials.push(refresh_intro_block);
for (var i = 0; i < refresh_length + 1; i++) {
  var refresh_fixation_block = {
    type: 'poldrack-single-stim',
    stimulus:
      '<div class = upperbox><div class = fixation>+</div></div><div class = lowerbox><div class = fixation>+</div></div>',
    is_html: true,
    choices: 'none',
    data: {
      trial_id: 'practice_fixation',
    },
    timing_post_trial: 0,
    timing_stim: 500, //500
    timing_response: 500, //500
    prompt: getPromptTaskList,
    on_finish: function () {
      jsPsych.data.addDataToLastTrial({
        exp_stage: exp_stage,
      });
    },
  };

  var refresh_cue_block = {
    type: 'poldrack-single-stim',
    stimulus: getCue,
    is_html: true,
    choices: 'none',
    data: {
      trial_id: 'practice_cue',
    },
    timing_response: getCTI, //getCTI
    timing_stim: getCTI, //getCTI
    timing_post_trial: 0,
    prompt: getPromptTaskList,
    on_finish: function () {
      jsPsych.data.addDataToLastTrial({
        exp_stage: exp_stage,
      });
      appendData();
    },
  };

  var refresh_block = {
    type: 'poldrack-categorize',
    stimulus: getStim,
    is_html: true,
    key_answer: getResponse,
    correct_text:
      '<div class = upperbox><div class = center-text>Correct!</font></div></div>',
    incorrect_text:
      '<div class = upperbox><div class = center-text>Incorrect</font></div></div>',
    timeout_message: getTimeoutMessage,
    choices: getChoices,
    data: {
      trial_id: 'practice_trial',
    },
    timing_feedback_duration: 500, //500
    show_stim_with_feedback: false,
    timing_response: 2000, //2000
    timing_stim: 1000, //1000
    timing_post_trial: 0,
    prompt: getPromptTaskList,
    on_finish: appendData,
    fixation_default: true,
    fixation_stim:
      '<div class = upperbox><div class = fixation>+</div></div><div class = lowerbox><div class = fixation>+</div></div>',
    on_finish: function (data) {
      data.correct_response = getResponse();
      data.correct = getResponse() === data.key_press ? 1 : 0;
      data.flanker_condition = flanker_condition;
      console.log(data);
    },
  };

  refreshTrials.push(setStims_block);
  refreshTrials.push(refresh_fixation_block);
  refreshTrials.push(refresh_cue_block);
  refreshTrials.push(refresh_block);
}

var refreshNode = {
  timeline: refreshTrials,
  loop_function: function (data) {
    current_trial = 0;

    var sum_rt = 0;
    var sum_responses = 0;
    var correct = 0;
    var total_trials = 0;

    for (var i = 0; i < data.length; i++) {
      if (data[i].trial_id == 'practice_trial') {
        total_trials += 1;
        if (data[i].rt != -1) {
          sum_rt += data[i].rt;
          sum_responses += 1;
          if (data[i].key_press == data[i].correct_response) {
            correct += 1;
          }
        }
      }
    }

    var accuracy = correct / total_trials;
    var missed_responses = (total_trials - sum_responses) / total_trials;
    var ave_rt = sum_rt / sum_responses;

    refresh_feedback_text =
      '<br><p class = block-text>Please take this time to read your feedback and to take a short break!';

    if (accuracy < accuracy_thresh) {
      refresh_feedback_text +=
        '</p><p class = block-text>  Remember: <br>' + getPromptTaskList();
      if (missed_responses > missed_response_thresh) {
        refresh_feedback_text +=
          '</p><p class = block-text>You have been responding too slowly. Please respond as quickly and as accurately as possible.';
      }

      if (ave_rt > rt_thresh) {
        refresh_feedback_text +=
          '</p><p class = block-text>You have been responding too slowly.';
      }
    }

    refresh_feedback_text +=
      '</p><p class = block-text>Done with this practice.';

    // task_switches = jsPsych.randomization.repeat(task_switches_arr, numTrialsPerBlock / 4) //TO BE CHANGED OUT w/ DES_EVENTS
    task_switches = des_task_switches.slice(0, numTrialsPerBlock); //GRAB NEWEST BLOCKS WORTH OF TRIALS
    des_task_switches = des_task_switches.slice(numTrialsPerBlock); //SHAVE OFF THIS BLOCK FROM des_task_switches
    task_switches.unshift({
      task_switch: 'na',
      cue_switch: 'na',
      flanker_condition: jsPsych.randomization.repeat(flanker_types, 1).pop(),
    });
    stims = genStims(numTrialsPerBlock + 1);
    exp_stage = 'test';

    console.log(task_switches);
    console.log(des_task_switches);
    return false;
  },
};

//in scanner test trials
//first block begins without feedback
var testTrials0 = [];
for (i = 0; i < numTrialsPerBlock + 1; i++) {
  var fixation_block = {
    type: 'poldrack-single-stim',
    stimulus:
      '<div class = upperbox><div class = fixation>+</div></div><div class = lowerbox><div class = fixation>+</div></div>',
    is_html: true,
    choices: 'none',
    data: {
      trial_id: 'test_fixation',
    },
    timing_post_trial: 0,
    timing_stim: getITI_stim, //500
    timing_response: getITI_resp, //500
    on_finish: function () {
      jsPsych.data.addDataToLastTrial({
        exp_stage: exp_stage,
      });
    },
  };

  var cue_block = {
    type: 'poldrack-single-stim',
    stimulus: getCue,
    is_html: true,
    choices: 'none',
    data: {
      trial_id: 'test_cue',
    },
    timing_response: getCTI, //getCTI
    timing_stim: getCTI, //getCTI
    timing_post_trial: 0,
    on_finish: function () {
      jsPsych.data.addDataToLastTrial({
        exp_stage: exp_stage,
      });
      appendData();
    },
  };

  var test_block = {
    type: 'poldrack-single-stim',
    stimulus: getStim,
    is_html: true,
    choices: getChoices,
    data: {
      trial_id: 'test_trial',
      exp_stage: 'test',
    },
    timing_post_trial: 0,
    timing_response: 2000, //2000
    timing_stim: 1000, //1000
    response_ends_trial: false,
    on_finish: function (data) {
      appendData();
      data.correct_response = getResponse();
      data.correct = getResponse() === data.key_press ? 1 : 0;
      data.flanker_condition = flanker_condition;
      console.log(data);
    },
    fixation_default: true,
    fixation_stim:
      '<div class = upperbox><div class = fixation>+</div></div><div class = lowerbox><div class = fixation>+</div></div>',
  };

  testTrials0.push(setStims_block);
  testTrials0.push(fixation_block);
  testTrials0.push(cue_block);
  testTrials0.push(test_block);
}

//remaining blocks
var testTrials = [];
testTrials.push(feedback_block);
for (i = 0; i < numTrialsPerBlock + 1; i++) {
  var fixation_block = {
    type: 'poldrack-single-stim',
    stimulus:
      '<div class = upperbox><div class = fixation>+</div></div><div class = lowerbox><div class = fixation>+</div></div>',
    is_html: true,
    choices: 'none',
    data: {
      trial_id: 'test_fixation',
    },
    timing_post_trial: 0,
    timing_stim: getITI_stim, //500
    timing_response: getITI_resp, //500
    on_finish: function () {
      jsPsych.data.addDataToLastTrial({
        exp_stage: exp_stage,
      });
    },
  };

  var cue_block = {
    type: 'poldrack-single-stim',
    stimulus: getCue,
    is_html: true,
    choices: 'none',
    data: {
      trial_id: 'test_cue',
    },
    timing_response: getCTI, //getCTI
    timing_stim: getCTI, //getCTI
    timing_post_trial: 0,
    on_finish: function () {
      jsPsych.data.addDataToLastTrial({
        exp_stage: exp_stage,
      });
      appendData();
    },
  };

  var test_block = {
    type: 'poldrack-single-stim',
    stimulus: getStim,
    is_html: true,
    choices: getChoices,
    data: {
      trial_id: 'test_trial',
      exp_stage: 'test',
    },
    timing_post_trial: 0,
    timing_response: 2000, //2000
    timing_stim: 1000, //1000
    response_ends_trial: false,
    on_finish: appendData,
    fixation_default: true,
    fixation_stim:
      '<div class = upperbox><div class = fixation>+</div></div><div class = lowerbox><div class = fixation>+</div></div>',
  };

  testTrials.push(setStims_block);
  testTrials.push(fixation_block);
  testTrials.push(cue_block);
  testTrials.push(test_block);
}

//create test nodes
var testCount = 0;

var testNode0 = {
  timeline: testTrials0,
  loop_function: function (data) {
    testCount += 1;
    current_trial = 0;
    task_switches = des_task_switches.slice(0, numTrialsPerBlock); //GRAB NEWEST BLOCKS WORTH OF TRIALS
    des_task_switches = des_task_switches.slice(numTrialsPerBlock); //SHAVE OFF THIS BLOCK FROM des_task_switches
    // task_switches = jsPsych.randomization.repeat(task_switches_arr, numTrialsPerBlock / 4) //TO BE CHANGED OUT W/ DES_EVENTS
    task_switches.unshift({
      task_switch: 'na',
      cue_switch: 'na',
      flanker_condition: jsPsych.randomization.repeat(flanker_types, 1).pop(),
    });
    stims = genStims(numTrialsPerBlock + 1);
    //stims.reverse() //reverse the order of trial types to match designs

    var sum_rt = 0;
    var sum_responses = 0;
    var correct = 0;
    var total_trials = 0;

    for (var i = 0; i < data.length; i++) {
      if (data[i].trial_id == 'test_trial') {
        total_trials += 1;
        if (data[i].rt != -1) {
          sum_rt += data[i].rt;
          sum_responses += 1;
          if (data[i].key_press == data[i].correct_response) {
            correct += 1;
          }
        }
      }
    }

    var accuracy = correct / total_trials;
    var missed_responses = (total_trials - sum_responses) / total_trials;
    var ave_rt = sum_rt / sum_responses;

    feedback_text =
      '<br><p class = block-text>Please take this time to read your feedback and to take a short break!';
    feedback_text +=
      '</p><p class = block-text>You have completed: ' +
      testCount +
      ' out of ' +
      numTestBlocks +
      ' blocks of trials.';

    if (accuracy < accuracy_thresh) {
      feedback_text +=
        '</p><p class = block-text>Your accuracy is too low.  Remember: <br>' +
        getPromptTaskList();
    }
    if (missed_responses > missed_response_thresh) {
      feedback_text +=
        '</p><p class = block-text>You have not been responding to some trials.  Please respond on every trial that requires a response.';
    }

    if (ave_rt > rt_thresh) {
      feedback_text +=
        '</p><p class = block-text>You have been responding too slowly.';
    }

    return false;
  },
};

//remaining blocks
var testNode = {
  timeline: testTrials,
  loop_function: function (data) {
    testCount += 1;
    current_trial = 0;
    task_switches = des_task_switches.slice(0, numTrialsPerBlock); //GRAB NEWEST BLOCKS WORTH OF TRIALS
    des_task_switches = des_task_switches.slice(numTrialsPerBlock); //SHAVE OFF THIS BLOCK FROM des_task_switches
    // task_switches = jsPsych.randomization.repeat(task_switches_arr, numTrialsPerBlock / 4) //TO BE CHANGED OUT W/ DES_EVENTS
    task_switches.unshift({
      task_switch: 'na',
      cue_switch: 'na',
      flanker_condition: jsPsych.randomization.repeat(flanker_types, 1).pop(),
    });
    stims = genStims(numTrialsPerBlock + 1);
    //stims.reverse() //reverse the order of trial types to match designs

    var sum_rt = 0;
    var sum_responses = 0;
    var correct = 0;
    var total_trials = 0;

    for (var i = 0; i < data.length; i++) {
      if (data[i].trial_id == 'test_trial') {
        total_trials += 1;
        if (data[i].rt != -1) {
          sum_rt += data[i].rt;
          sum_responses += 1;
          if (data[i].key_press == data[i].correct_response) {
            correct += 1;
          }
        }
      }
    }

    var accuracy = correct / total_trials;
    var missed_responses = (total_trials - sum_responses) / total_trials;
    var ave_rt = sum_rt / sum_responses;

    feedback_text =
      '<br><p class = block-text>Please take this time to read your feedback and to take a short break!';
    feedback_text +=
      '</p><p class = block-text>You have completed: ' +
      testCount +
      ' out of ' +
      numTestBlocks +
      ' blocks of trials.';

    if (accuracy < accuracy_thresh) {
      feedback_text +=
        '</p><p class = block-text>Your accuracy is too low.  Remember: <br>' +
        getPromptTaskList();
    }
    if (missed_responses > missed_response_thresh) {
      feedback_text +=
        '</p><p class = block-text>You have not been responding to some trials.  Please respond on every trial that requires a response.';
    }

    if (ave_rt > rt_thresh) {
      feedback_text +=
        '</p><p class = block-text>You have been responding too slowly.';
    }

    if (testCount == numTestBlocks) {
      feedback_text += '</p><p class = block-text>Done with this test.';
      return false;
    } else {
      return true;
    }
  },
};

/* create experiment definition array */
var flanker_with_cued_task_switching__fmri_experiment = [];

flanker_with_cued_task_switching__fmri_experiment.push(design_setup_block);
flanker_with_cued_task_switching__fmri_experiment.push(motor_setup_block);

test_keys(flanker_with_cued_task_switching__fmri_experiment, [89, 71]);

flanker_with_cued_task_switching__fmri_experiment.push(refreshNode);
flanker_with_cued_task_switching__fmri_experiment.push(refresh_feedback_block);

cni_bore_setup(flanker_with_cued_task_switching__fmri_experiment);
flanker_with_cued_task_switching__fmri_experiment.push(testNode0);
flanker_with_cued_task_switching__fmri_experiment.push(testNode);
flanker_with_cued_task_switching__fmri_experiment.push(feedback_block);

flanker_with_cued_task_switching__fmri_experiment.push(end_block);
