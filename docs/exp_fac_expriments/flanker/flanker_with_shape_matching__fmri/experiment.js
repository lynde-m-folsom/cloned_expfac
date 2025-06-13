/* ************************************ */
/* Define helper functions */
/* ************************************ */
var motor_perm = 0;

var getPromptText = function () {
  return (
    '<div class = prompt_box>' +
    '<p class = center-block-text style = "font-size:16px; line-height:80%%;">Please judge if the green and the <i>middle</i> white shapes are the same.</p>' +
    '<p class = center-block-text style = "font-size:16px; line-height:80%%;">Same: ' +
    getPossibleResponses()[0][0] +
    '</p>' +
    '<p class = center-block-text style = "font-size:16px; line-height:80%%;">Different: ' +
    getPossibleResponses()[1][0] +
    '</p>' +
    '</div>'
  );
};

var getPromptTextList = function () {
  return (
    '<ul style="text-align:left;"><font color="white">' +
    '<li>Same: ' +
    getPossibleResponses()[1][0] +
    '</li>' +
    '<li>Different: ' +
    getPossibleResponses()[0][0] +
    '</li>' +
    '</font></ul>'
  );
};

function getPossibleResponses() {
  mperm = getMotorPerm();
  var stim1, stim2;
  if (mperm == 0) {
    stim1 = ['index finger', 89];
    stim2 = ['middle finger', 71];
  } else {
    stim1 = ['middle finger', 71];
    stim2 = ['index finger', 89];
  }
  return [stim1, stim2];
}

//added for motor counterbalancing
function getMotorPerm() {
  return motor_perm;
}

function getRefreshTrialID() {
  return refresh_trial_id;
}

function getRefreshFeedbackTiming() {
  return refresh_feedback_timing;
}

function getRefreshResponseEnds() {
  return refresh_response_ends;
}

function getRefreshFeedback() {
  if (getRefreshTrialID() == 'instructions') {
    return (
      '<div class = centerbox>' +
      '<p class = block-text>In this experiment you will see a row of shapes. You will always see 5 white shapes to the right, 1 green shape to the left, and sometimes, 1 red shape overlapping with the green shape.</p> ' +
      '<p class = block-text>You will be asked to judge whether the green shape on the left matches the <i>middle</i> white shape on the right.</p>' +
      '<p class = block-text>If the shapes are the same, please press the ' +
      getPossibleResponses()[0][0] +
      '.  If the shapes are different, press the ' +
      getPossibleResponses()[1][0] +
      '.</p>' +
      '<p class = block-text>You will always see multiple white shapes. Please match the green shape only to the <i>middle</i> white shape. Ignore the other white shapes.</p>' +
      '<p class = block-text>Sometimes, you will also see a red shape near the green shape.  Ignore this red shape as well.</p>' +
      '<p class = block-text>We will start practice when you finish instructions. Please make sure you understand the instructions before moving on. During practice, you will receive a reminder of the rules.  <i>This reminder will be taken out for test</i>.</p>' +
      '<p class = block-text>Please respond as quickly and accurately as possible to the shapes presented on the screen.</p>' +
      '</div>'
    );
  } else {
    return (
      '<div class = bigbox><div class = picture_box><p class = instruct-text><font color="white">' +
      refresh_feedback_text +
      '</font></p></div></div>'
    );
  }
}
function getTimeoutMessage() {
  return (
    '<div class = fb_box><div class = center-text>Respond Faster!</div></div>' +
    getPromptText()
  );
}

var fileTypePNG = ".png'></img>";
var preFileType =
  "<img class = center src='/static/experiments/flanker_with_shape_matching__fmri/images/";
var pathSource =
  '/static/experiments/flanker_with_shape_matching__fmri/images/';
var pathDesignSource =
  '/static/experiments/flanker_with_shape_matching__fmri/designs/';

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

//Functions added for in-person sessions
function genITIs() {
  mean_iti = 0.5; //mean and standard deviation of 0.5 secs
  min_thresh = 0;
  max_thresh = 4;

  lambda = 1 / mean_iti;
  iti_array = [];
  for (i = 0; i < exp_len + numTestBlocks; i++) {
    //add 3 ITIs per test block to make sure there are enough
    curr_iti = -Math.log(Math.random()) / lambda;
    while (curr_iti > max_thresh || curr_iti < min_thresh) {
      curr_iti = -Math.log(Math.random()) / lambda;
    }
    iti_array.push(curr_iti * 1000); //convert ITIs from seconds to milliseconds
  }
  return iti_array;
}

function insertBufferITIs(design_ITIs) {
  var buffer_ITIs = genITIs();
  var out_ITIs = [];
  while (design_ITIs.length > 0) {
    out_ITIs = out_ITIs.concat(buffer_ITIs.slice(0, 2)); //get 2 buffer ITIs to start each block
    buffer_ITIs = buffer_ITIs.slice(2); //remove the just used buffer ITIs from the buffer ITI array

    curr_block_ITIs = design_ITIs.slice(0, numTrialsPerBlock); //get this current block's ITIs
    design_ITIs = design_ITIs.slice(numTrialsPerBlock); //remove this current block's ITIs from des_ITIs

    out_ITIs = out_ITIs.concat(curr_block_ITIs); //add this current block's ITI's to the out array
  }
  return out_ITIs;
}

function addID() {
  jsPsych.data.addDataToLastTrial({
    exp_id: 'flanker_with_shape_matching__fmri',
  });
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
  for (var k = 0; k < getPossibleResponses().length; k++) {
    choice_counts[getPossibleResponses()[k][1]] = 0;
  }

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

var getInstructFeedback = function () {
  return (
    '<div class = centerbox><p class = center-block-text>' +
    feedback_instruct_text +
    '</p></div>'
  );
};

feedback_text = '';

var getFeedback = function () {
  return (
    '<div class = bigbox><div class = picture_box><p class = block-text><font color="white">' +
    feedback_text +
    '</font></p></div></div>'
  );
};

var randomDraw = function (lst) {
  var index = Math.floor(Math.random() * lst.length);
  return lst[index];
};

var getPTD = function (shape_matching_condition, flanker_condition) {
  var probe_i = randomDraw([1, 2, 3, 4, 5, 6, 7, 8, 9, 10]);
  var target_i = 0;
  var distractor_i = 0;
  if (shape_matching_condition[0] == 'S') {
    target_i = probe_i;
    correct_response = getPossibleResponses()[0][1];
  } else {
    target_i = randomDraw(
      [1, 2, 3, 4, 5, 6, 7, 8, 9, 10].filter(function (y) {
        return y != probe_i;
      })
    );
    correct_response = getPossibleResponses()[1][1];
  }
  //console.log('probe = ' + probe + ', target = ' + target)
  if (shape_matching_condition[1] == 'S') {
    distractor_i = target_i;
  } else if (shape_matching_condition[2] == 'S') {
    distractor_i = probe_i;
  } else if (shape_matching_condition[2] == 'D') {
    distractor_i = randomDraw(
      [1, 2, 3, 4, 5, 6, 7, 8, 9, 10].filter(function (y) {
        return $.inArray(y, [target_i, probe_i]) == -1;
      })
    );
  } else if (shape_matching_condition[2] == 'N') {
    distractor_i = 'none';
  }

  if (flanker_condition == 'congruent') {
    flankers = probe_i;
  } else if (flanker_condition == 'incongruent') {
    flankers = randomDraw(
      [1, 2, 3, 4, 5, 6, 7, 8, 9, 10].filter(function (y) {
        return y != probe_i;
      })
    );
  }
  return [probe_i, target_i, distractor_i, correct_response, flankers];
};

var getShapeMatchingCondition = function (sm_condition) {
  function getRandomInt(n) {
    return Math.floor(Math.random() * n);
  }

  switch (sm_condition) {
    case 'td_same':
      possible_events = ['SSS', 'DSD'];
      idx = getRandomInt(2);
      return possible_events[idx];
    case 'td_diff':
      possible_events = ['SDD', 'DDD', 'DDS'];
      idx = getRandomInt(3);
      return possible_events[idx];
    case 'td_na':
      possible_events = ['SNN', 'DNN'];
      idx = getRandomInt(2);
      return possible_events[idx];
    default:
      break;
  }
};

var createTrialTypes = function (trials_len) {
  function splitValue(value) {
    // Find the last index of underscore
    const lastIndex = value.lastIndexOf('_');

    // Split the string into two parts based on the last underscore
    const shapeMatch = value.substring(0, lastIndex);
    const congruency = value.substring(lastIndex + 1);

    // Return both parts as an object
    return { shapeMatch, congruency };
  }

  if (trials_len !== practice_len) {
    var curr_des_events = des_events.slice(0, trials_len);
    des_events = des_events.slice(trials_len);
  } else {
    flanker_trial_types = ['congruent', 'incongruent'];
    shape_matching_trial_types = [
      'DDD',
      'SDD',
      'DSD',
      'DDS',
      'SSS',
      'SNN',
      'DNN',
    ];
  }

  let stimuli = [];

  for (var i = 0; i < trials_len; i++) {
    if (trials_len !== practice_len) {
      console.log('###################');

      let { shapeMatch, congruency } = splitValue(curr_des_events[i]);

      console.log('shape match');
      console.log(shapeMatch);

      shape_matching_condition = getShapeMatchingCondition(shapeMatch);
      flanker_condition = congruency;

      console.log(shape_matching_condition);
      console.log(flanker_condition);
    } else {
      const randomIndex1 = Math.floor(Math.random() * 6);
      const randomIndex2 = Math.random() < 0.5 ? 0 : 1;
      shape_matching_condition = shape_matching_trial_types[randomIndex1];
      flanker_condition = flanker_trial_types[randomIndex2];
    }

    answer_arr = getPTD(shape_matching_condition, flanker_condition);

    probe = answer_arr[0];
    target = answer_arr[1];
    distractor = answer_arr[2];
    correct_response = answer_arr[3];
    flankers = answer_arr[4];

    stim = {
      flanker_condition: flanker_condition,
      shape_matching_condition: shape_matching_condition,
      probe: probe,
      target: target,
      distractor: distractor,
      flankers: flankers,
      correct_response: correct_response,
    };

    stimuli.push(stim);
  }
  return stimuli;
};

var getResponse = function () {
  return correct_response;
};

var getStim = function () {
  if (shape_matching_condition == 'SNN' || shape_matching_condition == 'DNN') {
    return (
      task_boards[0] +
      preFileType +
      target +
      '_green' +
      fileTypePNG +
      task_boards[1] +
      task_boards[2] +
      preFileType +
      flankers +
      '_white' +
      fileTypePNG +
      task_boards[3] +
      preFileType +
      flankers +
      '_white' +
      fileTypePNG +
      task_boards[4] +
      preFileType +
      probe +
      '_white' +
      fileTypePNG +
      task_boards[5] +
      preFileType +
      flankers +
      '_white' +
      fileTypePNG +
      task_boards[6] +
      preFileType +
      flankers +
      '_white' +
      fileTypePNG +
      task_boards[7]
    );
  } else {
    return (
      task_boards[0] +
      preFileType +
      target +
      '_green' +
      fileTypePNG +
      task_boards[1] +
      preFileType +
      distractor +
      '_red' +
      fileTypePNG +
      task_boards[2] +
      preFileType +
      flankers +
      '_white' +
      fileTypePNG +
      task_boards[3] +
      preFileType +
      flankers +
      '_white' +
      fileTypePNG +
      task_boards[4] +
      preFileType +
      probe +
      '_white' +
      fileTypePNG +
      task_boards[5] +
      preFileType +
      flankers +
      '_white' +
      fileTypePNG +
      task_boards[6] +
      preFileType +
      flankers +
      '_white' +
      fileTypePNG +
      task_boards[7]
    );
  }
};

var getMask = function () {
  stim = stims.shift();
  shape_matching_condition = stim.shape_matching_condition;
  flanker_condition = stim.flanker_condition;

  correct_response = stim.correct_response;
  probe = stim.probe;
  target = stim.target;
  distractor = stim.distractor;
  flankers = stim.flankers;

  //console.log('shape condition = '+shape_matching_condition+', flanker_condition: '+ flanker_condition+', correct_response: '+correct_response+', probe: '+probe+', target: '+target+', distractor: '+distractor+', flankers: '+flankers)

  return (
    task_boards[0] +
    preFileType +
    'mask' +
    fileTypePNG +
    task_boards[1] +
    task_boards[2] +
    preFileType +
    'mask' +
    fileTypePNG +
    task_boards[3] +
    preFileType +
    'mask' +
    fileTypePNG +
    task_boards[4] +
    preFileType +
    'mask' +
    fileTypePNG +
    '<div class = centerbox><div class = fixation>+</div></div>' +
    task_boards[5] +
    preFileType +
    'mask' +
    fileTypePNG +
    task_boards[6] +
    preFileType +
    'mask' +
    fileTypePNG +
    task_boards[7]
  );
};

var appendData = function () {
  curr_trial = jsPsych.progress().current_trial_global;
  trial_id = jsPsych.data.getDataByTrialIndex(curr_trial).trial_id;

  current_trial += 1;

  if (trial_id == 'practice_trial') {
    current_block = refreshCount;
  } else if (trial_id == 'test_trial') {
    current_block = testCount;
  }

  jsPsych.data.addDataToLastTrial({
    shape_matching_condition: shape_matching_condition,
    flanker_condition: flanker_condition,
    correct_response: correct_response,
    flankers: flankers,
    probe: probe,
    target: target,
    distractor: distractor,
    current_block: current_block,
    current_trial: current_trial,
  });

  if (
    jsPsych.data.getDataByTrialIndex(curr_trial).key_press == correct_response
  ) {
    jsPsych.data.addDataToLastTrial({
      correct_trial: 1,
    });
  } else if (
    jsPsych.data.getDataByTrialIndex(curr_trial).key_press != correct_response
  ) {
    jsPsych.data.addDataToLastTrial({
      correct_trial: 0,
    });
  }
};

/* ************************************ */
/* Define experimental variables */
/* ************************************ */
// generic task variables
var sumInstructTime = 0; //ms
var instructTimeThresh = 0; ///in seconds
var credit_var = 0;

// task specific variables
// fmri
var refresh_len = 8;
// Set up variables for stimuli
var practice_len = 14; // must be divisible by 14
var exp_len = 280; // must be divisible by 14
var numTrialsPerBlock = 56; // divisible by 14
var numTestBlocks = exp_len / numTrialsPerBlock;

var accuracy_thresh = 0.75;
var rt_thresh = 1000;
var missed_thresh = 0.1;
var practice_thresh = 3; // 3 blocks of 14 trials

var refresh_trial_id = 'instructions';
var refresh_feedback_timing = -1;
var refresh_response_ends = true;

var current_trial = 0;
var current_block = 0;

var fileTypePNG = '.png"></img>';
var preFileType =
  '<img class = center src="/static/experiments/flanker_with_shape_matching__fmri/images/';

var task_boards = [
  ['<div class = bigbox><div class = centerbox><div class = leftbox>'],
  ['</div><div class = distractorbox>'],
  ['</div><div class = rightbox1>'],
  ['</div><div class = rightbox2>'],
  ['</div><div class = rightbox_center>'],
  ['</div><div class = rightbox3>'],
  ['</div><div class = rightbox4>'],
  ['</div></div></div>'],
];

//PRE LOAD IMAGES HERE
var pathSource =
  '/static/experiments/flanker_with_shape_matching__fmri/images/';
var numbersPreload = ['1', '2', '3', '4', '5', '6', '7', '8', '9', '10'];
var colorsPreload = ['red', 'white', 'green'];
var images = [];

for (i = 0; i < numbersPreload.length; i++) {
  for (x = 0; x < colorsPreload.length; x++) {
    images.push(
      pathSource + numbersPreload[i] + '_' + colorsPreload[x] + '.png'
    );
  }
}

images.push(pathSource + 'mask.png');
jsPsych.pluginAPI.preloadImages(images);
/* ************************************ */
/* Set up jsPsych blocks */
/* ************************************ */
var des_ITIs = [];
var des_events = [];

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
  },
};

var motor_setup_block = {
  type: 'survey-text',
  data: {
    trial_id: 'motor_setup',
  },
  questions: [['<p class = center-block-text>motor permutation (0-1):</p>']],
  on_finish: function (data) {
    motor_perm = parseInt(data.responses.slice(7, 10));
    console.log('before:', des_events);
    stims = createTrialTypes(practice_len);
    console.log('after', des_events);
    console.log('stims', stims);
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
  timing_response: getRefreshFeedbackTiming,
  timing_stim: getRefreshFeedbackTiming,
  response_ends_trial: getRefreshResponseEnds,
  on_finish: function () {
    (refresh_trial_id = 'practice-no-stop-feedback'),
      (refresh_feedback_timing = 10000),
      (refresh_response_ends = false);
  },
};
var feedback_block = {
  type: 'poldrack-single-stim',
  data: {
    trial_id: 'feedback_block',
  },
  choices: 'none',
  stimulus: getFeedback,
  timing_post_trial: 0,
  is_html: true,
  timing_response: 4000,
  response_ends_trial: false,
};

var feedback_instruct_block = {
  type: 'poldrack-text',
  data: {
    trial_id: 'instruction',
  },
  cont_key: [13],
  text: getInstructFeedback,
  timing_post_trial: 0,
  timing_response: 180000,
};

/// This ensures that the subject does not read through the instructions too quickly.  If they do it too quickly, then we will go over the loop again.
var instructions_block = {
  type: 'poldrack-instructions',
  data: {
    trial_id: 'instruction',
  },
  pages: [
    '<div class = centerbox>' +
      '<p class = block-text>In this experiment you will see a row of shapes. You will always see 5 white shapes to the right, 1 green shape to the left, and sometimes, 1 red shape overlapping with the green shape.</p> ' +
      '<p class = block-text>You will be asked to judge whether the green shape on the left matches the <i>middle</i> white shape on the right.</p>' +
      '</div>',

    '<div class = centerbox>' +
      '<p class = block-text>If the shapes are the same, please press the ' +
      getPossibleResponses()[0][0] +
      '.  If the shapes are different, press the ' +
      getPossibleResponses()[1][0] +
      '.</p>' +
      '<p class = block-text>You will always see multiple white shapes. Please match the green shape only to the <i>middle</i> white shape. Ignore the other white shapes.</p>' +
      '<p class = block-text>Sometimes, you will also see a red shape near the green shape.  Ignore this red shape as well.</p>' +
      '<p class = block-text>We will start practice when you finish instructions. Please make sure you understand the instructions before moving on. During practice, you will receive a reminder of the rules.  <i>This reminder will be taken out for test</i>.</p>' +
      '</div>',
  ],
  allow_keys: false,
  show_clickable_nav: true,
  timing_post_trial: 1000,
};

var instruction_node = {
  timeline: [feedback_instruct_block, instructions_block],
  /* This function defines stopping criteria */
  loop_function: function (data) {
    for (i = 0; i < data.length; i++) {
      if (data[i].trial_type == 'poldrack-instructions' && data[i].rt != -1) {
        rt = data[i].rt;
        sumInstructTime = sumInstructTime + rt;
      }
    }
    if (sumInstructTime <= instructTimeThresh * 1000) {
      feedback_instruct_text =
        'Read through instructions too quickly.  Please take your time and make sure you understand the instructions.  Press <i>enter</i> to continue.';
      return true;
    } else if (sumInstructTime > instructTimeThresh * 1000) {
      feedback_instruct_text =
        'Done with instructions. Press <i>enter</i> to continue.';
      return false;
    }
  },
};

var end_block = {
  type: 'poldrack-text',
  data: {
    trial_id: 'end',
  },
  timing_response: 180000,
  text: '<div class = centerbox><p class = center-block-text>Thanks for completing this task!</p><p class = center-block-text>Press <i>enter</i> to continue.</p></div>',
  cont_key: [13],
  timing_post_trial: 0,
  on_finish: function () {
    assessPerformance();
  },
};

var start_test_block = {
  type: 'poldrack-text',
  data: {
    trial_id: 'instruction',
  },
  timing_response: 180000,
  text:
    '<div class = centerbox>' +
    '<p class = block-text>We will now start the test portion</p>' +
    '<p class = block-text>You will be asked to judge whether the green shape on the left matches the <i>middle</i> white shape on the right..</p>' +
    '<p class = block-text>If the shapes are the same, please press the ' +
    getPossibleResponses()[0][0] +
    '.  If the shapes are different, press the ' +
    getPossibleResponses()[1][0] +
    '.</p>' +
    '<p class = block-text>You will always see multiple white shapes. Please match the green shape only to the <i>middle</i> white shape. Ignore the other white shapes.</p>' +
    '<p class = block-text>Sometimes, you will also see a red shape near the green shape.  Ignore this red shape as well.</p>' +
    '<p class = block-text>You will no longer receive the rule prompt, so remember the instructions before you continue. Press Enter to begin.</p>' +
    '</div>',
  cont_key: [13],
  timing_post_trial: 1000,
  on_finish: function () {
    feedback_text = 'We will now start the test portion. Press enter to begin.';
  },
};

var refreshTrials = [];
refreshTrials.push(refresh_feedback_block);

for (i = 0; i < refresh_len; i++) {
  var mask_block = {
    type: 'poldrack-single-stim',
    stimulus: getMask,
    is_html: true,
    data: {
      trial_id: 'practice_mask',
    },
    choices: 'none',
    timing_response: 500, //500
    timing_post_trial: 0,
    response_ends_trial: false,
    prompt: getPromptText,
  };

  var refresh_block = {
    type: 'poldrack-categorize',
    stimulus: getStim,
    is_html: true,
    choices: [getPossibleResponses()[0][1], getPossibleResponses()[1][1]],
    key_answer: getResponse,
    data: {
      trial_id: 'practice_trial',
    },
    correct_text:
      '<div class = upperbox><div class = feedback-text>Correct!</font></div></div>', // + getPromptTextList,
    incorrect_text:
      '<div class = upperbox><div class = feedback-text>Incorrect</font></div></div>', // + getPromptTextList,
    timeout_message: getTimeoutMessage,
    timing_stim: 1000, //1000
    timing_response: 2000, //2000
    timing_feedback_duration: 500,
    show_stim_with_feedback: false,
    timing_post_trial: 0,
    on_finish: appendData,
    prompt: getPromptText, //getPromptText List
    fixation_default: false,
  };
  refreshTrials.push(mask_block);
  refreshTrials.push(refresh_block);
}

var refreshCount = 0;
var refreshNode = {
  timeline: refreshTrials,
  loop_function: function (data) {
    refreshCount += 1;
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
      '<br><p class = instruct-text>Please take this time to read your feedback and to take a short break!';

    if (accuracy < accuracy_thresh) {
      if (missed_responses > missed_thresh) {
        refresh_feedback_text +=
          '</p><p class = instruct-text>You have not been responding to some trials.  Please respond on every trial that requires a response.';
      }

      if (ave_rt > rt_thresh) {
        refresh_feedback_text +=
          '</p><p class = instruct-text>You have been responding too slowly.';
      }
    }

    console.log('before:', des_events);
    stims = createTrialTypes(numTrialsPerBlock);
    console.log('after', des_events);
    console.log('stims', stims);
    return false;
  },
};

var testTrials = [];
for (i = 0; i < numTrialsPerBlock; i++) {
  var mask_block = {
    type: 'poldrack-single-stim',
    stimulus: getMask,
    is_html: true,
    data: {
      trial_id: 'test_mask',
    },
    choices: 'none',
    timing_response: 500, //500
    timing_post_trial: 0,
    response_ends_trial: false,
  };

  var test_block = {
    type: 'poldrack-single-stim',
    stimulus: getStim,
    is_html: true,
    data: {
      trial_id: 'test_trial',
    },
    choices: [getPossibleResponses()[0][1], getPossibleResponses()[1][1]],
    timing_stim: 1000, //1000
    timing_response: 2000, //2000
    timing_post_trial: 0,
    response_ends_trial: false,
    on_finish: appendData,
  };
  testTrials.push(mask_block);
  testTrials.push(test_block);
}

var testCount = 0;
var testNode = {
  timeline: testTrials,
  loop_function: function (data) {
    testCount += 1;
    current_trial = 0;

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
      '<br><p class = block-text>Please take this time to read your feedback and to take a short break! Press enter to continue';
    feedback_text +=
      '</p><p class = block-text>You have completed: ' +
      testCount +
      ' out of ' +
      numTestBlocks +
      ' blocks of trials.';

    if (testCount == numTestBlocks) {
      feedback_text = '</p><p class = instruct-text>Done with this test.<br>';
      return false;
    }

    if (accuracy < accuracy_thresh) {
      feedback_text +=
        '</p><p class = block-text>Your accuracy is too low.  Remember:' +
        getPromptTextList();
    }

    if (missed_responses > missed_thresh) {
      feedback_text +=
        '</p><p class = block-text>You have not been responding to some trials.  Please respond on every trial that requires a response.';
    }

    if (ave_rt > rt_thresh) {
      feedback_text +=
        '</p><p class = block-text>You have been responding too slowly.';
    }

    console.log('before:', des_events);
    stims = createTrialTypes(numTrialsPerBlock);
    console.log('after', des_events);
    console.log('stims', stims);

    return true;
  },
};

/* create experiment definition array */
flanker_with_shape_matching__fmri_experiment = [];
flanker_with_shape_matching__fmri_experiment.push(design_setup_block); //exp_input, here the ITIs get defined
flanker_with_shape_matching__fmri_experiment.push(motor_setup_block); //exp_input

test_keys(flanker_with_shape_matching__fmri_experiment, [
  getPossibleResponses()[0][1],
  getPossibleResponses()[1][1],
]);

flanker_with_shape_matching__fmri_experiment.push(refreshNode);
flanker_with_shape_matching__fmri_experiment.push(refresh_feedback_block);
//in scanner test
cni_bore_setup(flanker_with_shape_matching__fmri_experiment);
flanker_with_shape_matching__fmri_experiment.push(testNode);
flanker_with_shape_matching__fmri_experiment.push(feedback_block);

flanker_with_shape_matching__fmri_experiment.push(end_block);
