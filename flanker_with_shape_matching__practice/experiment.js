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

function getTimeoutMessage() {
  return (
    '<div class = fb_box><div class = center-text>Respond Faster!</div></div>' +
    getPromptText()
  );
}

var fileTypePNG = ".png'></img>";
var preFileType =
  "<img class = center src='/static/experiments/flanker_with_shape_matching__practice/images/";
var pathSource =
  '/static/experiments/flanker_with_shape_matching__practice/images/';

function addID() {
  jsPsych.data.addDataToLastTrial({
    exp_id: 'flanker_with_shape_matching__practice',
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

var createTrialTypes = function (numTrialsPerBlock) {
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

  var stims = [];
  for (
    var numIterations = 0;
    numIterations <
    numTrialsPerBlock /
      (shape_matching_trial_types.length * flanker_trial_types.length);
    numIterations++
  ) {
    for (
      var numShapeConds = 0;
      numShapeConds < shape_matching_trial_types.length;
      numShapeConds++
    ) {
      for (
        var numFlankerConds = 0;
        numFlankerConds < flanker_trial_types.length;
        numFlankerConds++
      ) {
        shape_matching_condition = shape_matching_trial_types[numShapeConds];
        flanker_condition = flanker_trial_types[numFlankerConds];

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

        stims.push(stim);
      }
    }
  }
  stims = jsPsych.randomization.repeat(stims, 1);
  return stims;
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
    current_block = practiceCount;
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
var getPracticeTrialID = function () {
  return practice_trial_id;
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

var accuracy_thresh = 0.75;
var rt_thresh = 1000;
var missed_thresh = 0.1;
var practice_thresh = 3; // 3 blocks of 14 trials

var refresh_trial_id = 'instructions';
var refresh_feedback_timing = -1;
var refresh_response_ends = true;

var current_trial = 0;
var current_block = 0;
var practice_trial_id = 'instructions';

var fileTypePNG = '.png"></img>';
var preFileType =
  '<img class = center src="/static/experiments/flanker_with_shape_matching__practice/images/';

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
  '/static/experiments/flanker_with_shape_matching__practice/images/';
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

var motor_setup_block = {
  type: 'survey-text',
  data: {
    trial_id: 'motor_setup',
  },
  questions: [['<p class = center-block-text>motor permutation (0-1):</p>']],
  on_finish: function (data) {
    motor_perm = parseInt(data.responses.slice(7, 10));
    stims = createTrialTypes(practice_len);
  },
};

var feedback_text =
  'Welcome to the experiment. This experiment will take around 15 minutes. Press <i>enter</i> to begin.';

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

//feedback functions added for in-person version
var getPracticeFeedback = function () {
  if (getPracticeTrialID() == 'instructions') {
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
      practice_feedback_text +
      '</font></p></div></div>'
    );
  }
};

var intro_block = {
  type: 'poldrack-single-stim',
  data: {
    trial_id: 'instructions',
  },
  choices: [32],
  stimulus:
    '<div class = centerbox><p class = center-block-text> Welcome to the experiment.</p></div>',
  timing_post_trial: 0,
  is_html: true,
  timing_response: -1,
  response_ends_trial: true,
};

var practice_feedback_block = {
  type: 'poldrack-single-stim',
  stimulus: getPracticeFeedback,
  data: {
    trial_id: getPracticeTrialID,
  },
  choices: [32],
  timing_post_trial: 0,
  is_html: true,
  timing_response: -1, //10 seconds for feedback
  timing_stim: -1,
  response_ends_trial: true,
  on_finish: function () {
    practice_trial_id = 'practice-no-stop-feedback';
    practice_feedback_timing = 10000;
    practice_response_ends = false;
  },
};

var practiceTrials = [];
practiceTrials.push(practice_feedback_block);
for (i = 0; i < practice_len; i++) {
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

  var practice_block = {
    type: 'poldrack-categorize',
    stimulus: getStim,
    is_html: true,
    choices: [getPossibleResponses()[0][1], getPossibleResponses()[1][1]],
    key_answer: getResponse,
    data: {
      trial_id: 'practice_trial',
    },
    correct_text:
      '<div class = fb_box><div class = center-text><font size = 20>Correct!</font></div></div>',
    incorrect_text:
      '<div class = fb_box><div class = center-text><font size = 20>Incorrect</font></div></div>',
    timeout_message: getTimeoutMessage,
    timing_stim: 1000, //1000
    timing_response: 2000, //2000
    timing_feedback_duration: 500, //500
    show_stim_with_feedback: false,
    timing_post_trial: 0,
    on_finish: appendData,
    prompt: getPromptText,
  };
  practiceTrials.push(mask_block);
  practiceTrials.push(practice_block);
}

var practiceCount = 0;
var practiceNode = {
  timeline: practiceTrials,
  loop_function: function (data) {
    practiceCount += 1;
    stims = createTrialTypes(practice_len);
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

    if (practiceCount == practice_thresh) {
      practice_feedback_text +=
        '</p><p class = block-text>Done with this practice.';
      return false;
    }

    practice_feedback_text =
      '<br><p class=block-text>Please take this time to read your feedback and to take a short break!</p>';

    if (accuracy < accuracy_thresh) {
      practice_feedback_text +=
        '</p><p class = block-text>We are going to try practice again to see if you can achieve higher accuracy.  Remember: ' +
        getPromptTextList();
      if (missed_responses > missed_thresh) {
        practice_feedback_text +=
          '</p><p class = block-text>You have not been responding to some trials.  Please respond on every trial that requires a response.';
      }

      if (ave_rt > rt_thresh) {
        practice_feedback_text +=
          '</p><p class = block-text>You have been responding too slowly.';
      }

      practice_feedback_text +=
        '</p><p class = block-text>Redoing this practice. Press Space to continue.';

      stims = createTrialTypes(practice_len);

      return true;
    }
  },
};

var practice_end_block = {
  type: 'poldrack-text',
  data: {
    trial_id: 'end',
  },
  text: '<div class = centerbox><p class = center-block-text>Thanks for completing this practice!</p></div>',
  cont_key: [32],
  timing_response: 10000,
  response_ends_trial: true,
  on_finish: function () {
    assessPerformance();
  },
};

/* create experiment definition array */
flanker_with_shape_matching__practice_experiment = [];
flanker_with_shape_matching__practice_experiment.push(motor_setup_block); //exp_input

//out of scanner practice
flanker_with_shape_matching__practice_experiment.push(intro_block);
flanker_with_shape_matching__practice_experiment.push(practiceNode);
flanker_with_shape_matching__practice_experiment.push(practice_feedback_block);
flanker_with_shape_matching__practice_experiment.push(practice_end_block);
