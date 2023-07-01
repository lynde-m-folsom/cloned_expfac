/* ************************************ */
/* Define helper functions */
/* ************************************ */
// fMRI functions
var motor_perm = 0;
var getPracticeTrialID = function () {
  return practice_trial_id;
};

//feedback functions added for in-person version
var getPracticeFeedback = function () {
  if (getPracticeTrialID() == 'instructions') {
    return (
      '<div class = centerbox>' +
        '<p class = block-text>In this experiment, across trials you will see a row of numbers on the screen in one of the 4 quadrants.  ' +
        'On any trial, one quadrant will have a  row of numbers.</p> ' +
        '<p class = block-text>You will be asked to judge the <i>middle number</i> on magnitude (higher or lower than 5) or parity (odd or even), depending on which quadrant ' +
        'the numbers are in.</p>' +
        '</div>',
      '<div class = centerbox>' +
        '<p class = block-text>In the top two quadrants, please judge the number based on <i>' +
        predictable_dimensions_list[0].dim +
        '</i>. Press your <i>' +
        getPossibleResponses()[0][0] +
        '  if ' +
        predictable_dimensions_list[0].values[0] +
        '</i>, and the <i>' +
        getPossibleResponses()[1][0] +
        '  if ' +
        predictable_dimensions_list[0].values[1] +
        '</i>.</p>' +
        '<p class = block-text>In the bottom two quadrants, please judge the number based on <i>' +
        predictable_dimensions_list[1].dim +
        '.</i>' +
        ' Press your <i>' +
        getPossibleResponses()[0][0] +
        ' if ' +
        predictable_dimensions_list[1].values[0] +
        '</i>, and the <i>' +
        getPossibleResponses()[1][0] +
        ' if ' +
        predictable_dimensions_list[1].values[1] +
        '</i>.</p>' +
        '<p class = block-text>Please judge only the middle number, you should ignore the other numbers.</p>' +
        '<p class = block-text>We will start practice when you finish instructions. Please make sure you understand the instructions before moving on. During practice, you will receive a reminder of the rules.  <i>This reminder will be taken out for test</i>.</p>' +
        '<p class = block-text>Please respond as quickly and accurately as possible to the numbers on the screen.</p>' +
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

var getPromptText = function () {
  return (
    '<div class = prompt_box>' +
    '<p class = center-block-text style = "font-size:16px;">Top 2 quadrants: Judge number on ' +
    predictable_dimensions_list[0].dim +
    '</p>' +
    '<p class = center-block-text style = "font-size:16px;">' +
    predictable_dimensions_list[0].values[0] +
    ': ' +
    getPossibleResponses()[0][0] +
    ' ' +
    predictable_dimensions_list[0].values[1] +
    ': ' +
    getPossibleResponses()[1][0] +
    '</p>' +
    '<p>&nbsp</p>' +
    '<p class = center-block-text style = "font-size:16px;">Bottom 2 quadrants: Judge number on ' +
    predictable_dimensions_list[1].dim +
    '</p>' +
    '<p class = center-block-text style = "font-size:16px;">' +
    predictable_dimensions_list[1].values[0] +
    ': ' +
    getPossibleResponses()[0][0] +
    ' ' +
    predictable_dimensions_list[1].values[1] +
    ': ' +
    getPossibleResponses()[1][0] +
    '</p>' +
    '</div>'
  );
};

var getPromptTextList = function () {
  return (
    '<ul style="text-align:left;">' +
    '<li>Top 2 quadrants: Judge <i>middle</i> number on ' +
    predictable_dimensions_list[0].dim +
    '</li>' +
    '<li>' +
    predictable_dimensions_list[0].values[0] +
    ': ' +
    getPossibleResponses()[0][0] +
    '</li>' +
    '<li>' +
    predictable_dimensions_list[0].values[1] +
    ': ' +
    getPossibleResponses()[1][0] +
    '</li>' +
    '<li>Bottom 2 quadrants: Judge <i>middle</i> number on ' +
    predictable_dimensions_list[1].dim +
    '</li>' +
    '<li>' +
    predictable_dimensions_list[1].values[0] +
    ': ' +
    getPossibleResponses()[0][0] +
    '</li>' +
    '<li>' +
    predictable_dimensions_list[1].values[1] +
    ': ' +
    getPossibleResponses()[1][0] +
    '</li>' +
    '</ul>'
  );
};

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

function getPossibleResponses() {
  mperm = getMotorPerm();
  if (mperm == 0) {
    stim1 = ['index finger', 89];
    stim2 = ['middle finger', 71];
  } else {
    stim1 = ['middle finger', 71];
    stim2 = ['index finger', 89];
  }
  return [stim1, stim2];
}

function getChoices() {
  return [getPossibleResponses()[0][1], getPossibleResponses()[1][1]];
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

var getCorrectResponse = function (number, predictable_dimension) {
  if (number > 5) {
    magnitude = 'high';
  } else if (number < 5) {
    magnitude = 'low';
  }

  if (number % 2 === 0) {
    parity = 'even';
  } else if (number % 2 !== 0) {
    parity = 'odd';
  }

  par_ind = predictable_dimensions_list[0].values.indexOf(parity);
  if (par_ind == -1) {
    par_ind = predictable_dimensions_list[1].values.indexOf(parity);
    mag_ind = predictable_dimensions_list[0].values.indexOf(magnitude);
  } else {
    mag_ind = predictable_dimensions_list[1].values.indexOf(magnitude);
  }

  if (predictable_dimension == 'magnitude') {
    correct_response = getPossibleResponses()[mag_ind][1];
  } else if (predictable_dimension == 'parity') {
    correct_response = getPossibleResponses()[par_ind][1];
  }

  return [correct_response, magnitude, parity];
};

//added for spatial task
var makeTaskSwitches = function (numTrials) {
  task_switch_arr = [
    'tstay_cstay',
    'tstay_cswitch',
    'tswitch_cswitch',
    'tswitch_cswitch',
  ];

  out = jsPsych.randomization.repeat(task_switch_arr, numTrials / 4);
  return out;
};

//added for spatial task
var getQuad = function (oldQuad, curr_switch) {
  var out;
  switch (curr_switch) {
    case 'tstay_cstay':
      out = oldQuad;
      break;
    case 'tstay_cswitch':
      if (oldQuad % 2 == 0) {
        // if even (2,4), subtract 1
        out = oldQuad - 1;
      } else {
        out = oldQuad + 1; //if odd (1,3), add 1
      }
      break;
    case 'tswitch_cswitch':
      if (oldQuad < 3) {
        //if in top quadrants (1,2)
        out = Math.ceil(Math.random() * 2) + 2; // should return 3 or 4
      } else {
        //if in bottom quadrants (3,4)
        out = Math.ceil(Math.random() * 2); // should return 1 or 2
      }
      break;
  }
  return out;
};

var predictable_conditions = [
  ['switch', 'stay'],
  ['stay', 'switch'],
];
var stims = [];
var task_switches = [];

var createTrialTypes = function (task_switches, numTrialsPerBlock) {
  var whichQuadStart = jsPsych.randomization.repeat([1, 2, 3, 4], 1).pop();
  var predictable_cond_array = predictable_conditions[whichQuadStart % 2];
  var predictable_dimensions = [
    predictable_dimensions_list[0].dim,
    predictable_dimensions_list[0].dim,
    predictable_dimensions_list[1].dim,
    predictable_dimensions_list[1].dim,
  ];

  numbers_list = [
    [6, 8],
    [7, 9],
    [2, 4],
    [1, 3],
  ];
  numbers = [1, 2, 3, 4, 6, 7, 8, 9];

  var flanker_trial_type_list = [];
  var flanker_trial_types1 = jsPsych.randomization.repeat(
    ['congruent', 'incongruent'],
    numTrialsPerBlock / 8
  ); // 8 = 2(switch vs. stay)*2(magnitude vs. parity)*2(congruent vs. incongruent)
  var flanker_trial_types2 = jsPsych.randomization.repeat(
    ['congruent', 'incongruent'],
    numTrialsPerBlock / 8
  );
  var flanker_trial_types3 = jsPsych.randomization.repeat(
    ['congruent', 'incongruent'],
    numTrialsPerBlock / 8
  );
  var flanker_trial_types4 = jsPsych.randomization.repeat(
    ['congruent', 'incongruent'],
    numTrialsPerBlock / 8
  );
  flanker_trial_type_list.push(flanker_trial_types1);
  flanker_trial_type_list.push(flanker_trial_types2);
  flanker_trial_type_list.push(flanker_trial_types3);
  flanker_trial_type_list.push(flanker_trial_types4);

  predictable_dimension = predictable_dimensions[whichQuadStart - 1];

  number = numbers[Math.floor(Math.random() * 8)];
  flanker_condition = jsPsych.randomization
    .repeat(['congruent', 'incongruent'], 1)
    .pop();
  if (flanker_condition == 'congruent') {
    flanking_number = number;
  } else {
    flanking_number = randomDraw(
      numbers.filter(function (y) {
        return y != number;
      })
    );
  }

  response_arr = getCorrectResponse(number, predictable_dimension);

  var stims = [];

  var first_stim = {
    whichQuadrant: whichQuadStart,
    predictable_condition: 'N/A',
    predictable_dimension: predictable_dimension,
    flanker_condition: flanker_condition,
    number: number,
    flanking_number: flanking_number,
    magnitude: response_arr[1],
    parity: response_arr[2],
    correct_response: response_arr[0],
  };
  stims.push(first_stim);

  oldQuad = whichQuadStart; //added for spatial task
  for (var i = 0; i < task_switches.length; i++) {
    whichQuadStart += 1;
    quadIndex = whichQuadStart % 4;
    if (quadIndex === 0) {
      quadIndex = 4;
    }
    flanker_condition = flanker_trial_type_list[quadIndex - 1].pop();
    quadIndex = getQuad(oldQuad, task_switches[i]); //changed for spatial task
    predictable_dimension = predictable_dimensions[quadIndex - 1];
    number = numbers[Math.floor(Math.random() * 8)];

    if (flanker_condition == 'congruent') {
      flanking_number = number;
    } else {
      flanking_number = randomDraw(
        numbers.filter(function (y) {
          return y != number;
        })
      );
    }

    response_arr = getCorrectResponse(number, predictable_dimension);

    stim = {
      whichQuadrant: quadIndex,
      predictable_condition: predictable_cond_array[i % 2],
      predictable_dimension: predictable_dimension,
      flanker_condition: flanker_condition,
      number: number,
      flanking_number: flanking_number,
      magnitude: response_arr[1],
      parity: response_arr[2],
      correct_response: response_arr[0],
    };

    stims.push(stim);

    oldQuad = quadIndex; //changed for spatial task
  }

  return stims;
};

var getFixation = function () {
  stim = stims.shift();
  predictable_condition = stim.predictable_condition;
  predictable_dimension = stim.predictable_dimension;
  flanker_condition = stim.flanker_condition;
  number = stim.number;
  flanking_number = stim.flanking_number;
  correct_response = stim.correct_response;
  whichQuadrant = stim.whichQuadrant;
  magnitude = stim.magnitude;
  parity = stim.parity;

  return '<div class = centerbox><div class = fixation>+</div></div>';
};

var getResponse = function () {
  return correct_response;
};

var getStim = function () {
  return (
    task_boards[whichQuadrant - 1][0] +
    preFileType +
    flanking_number +
    fileTypePNG +
    task_boards[whichQuadrant - 1][1] +
    preFileType +
    flanking_number +
    fileTypePNG +
    task_boards[whichQuadrant - 1][2] +
    preFileType +
    number +
    fileTypePNG +
    task_boards[whichQuadrant - 1][3] +
    preFileType +
    flanking_number +
    fileTypePNG +
    task_boards[whichQuadrant - 1][4] +
    preFileType +
    flanking_number +
    fileTypePNG +
    task_boards[whichQuadrant - 1][5]
  );
};

var appendData = function () {
  curr_trial = jsPsych.progress().current_trial_global;
  trial_id = jsPsych.data.getDataByTrialIndex(curr_trial).trial_id;
  current_trial += 1;

  task_switch = 'na';
  if (current_trial > 1) {
    //TODO: change this prob
    task_switch = task_switches[current_trial - 2]; //this might be off
  }

  if (trial_id == 'practice_trial') {
    current_block = practiceCount;
  } else if (trial_id == 'test_trial') {
    current_block = testCount;
  }

  jsPsych.data.addDataToLastTrial({
    predictable_condition: predictable_condition,
    predictable_dimension: predictable_dimension,
    flanker_condition: flanker_condition,
    task_switch: task_switch,
    number: number,
    flanking_number: flanking_number,
    correct_response: correct_response,
    whichQuadrant: whichQuadrant,
    magnitude: magnitude,
    parity: parity,
    current_trial: current_trial,
    current_block: current_block,
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
// Set up variables for stimuli
var practice_len = 16; // divisible by 8
var exp_len = 200; //200 must be divisible by 8
var numTrialsPerBlock = 40; //  40 divisible by 8
var numTestBlocks = exp_len / numTrialsPerBlock;

var practice_trial_id = 'instructions';
var practice_feedback_timing = -1;
var practice_response_ends = true;

var accuracy_thresh = 0.75;
var rt_thresh = 1000;
var missed_thresh = 0.1;
var practice_thresh = 3; // 3 blocks of 8 trials

var predictable_conditions = [
  ['switch', 'stay'],
  ['stay', 'switch'],
];

var predictable_dimensions_list = [
  (stim = { dim: 'magnitude', values: ['high', 'low'] }),
  (stim = { dim: 'parity', values: ['even', 'odd'] }),
];

var fileTypePNG = ".png'></img>";
var preFileType =
  "<img class = center src='/static/experiments/flanker_with_spatial_task_switching__practice/images/";

var current_trial = 0;

var task_boards = [
  [
    [
      '<div class = bigbox><div class = quad_box><div class = decision-top-left><div class = flankerLeft_2><div class = cue-text>',
    ],
    ['</div></div><div class = flankerLeft_1><div class = cue-text>'],
    ['</div></div><div class = flankerMiddle><div class = cue-text>'],
    ['</div></div><div class = flankerRight_1><div class = cue-text>'],
    ['</div></div><div class = flankerRight_2><div class = cue-text>'],
    ['</div></div></div><div></div>'],
  ],
  [
    [
      '<div class = bigbox><div class = quad_box><div class = decision-top-right><div class = flankerLeft_2><div class = cue-text>',
    ],
    ['</div></div><div class = flankerLeft_1><div class = cue-text>'],
    ['</div></div><div class = flankerMiddle><div class = cue-text>'],
    ['</div></div><div class = flankerRight_1><div class = cue-text>'],
    ['</div></div><div class = flankerRight_2><div class = cue-text>'],
    ['</div></div></div></div></div>'],
  ],
  [
    [
      '<div class = bigbox><div class = quad_box><div class = decision-bottom-right><div class = flankerLeft_2><div class = cue-text>',
    ],
    ['</div></div><div class = flankerLeft_1><div class = cue-text>'],
    ['</div></div><div class = flankerMiddle><div class = cue-text>'],
    ['</div></div><div class = flankerRight_1><div class = cue-text>'],
    ['</div></div><div class = flankerRight_2><div class = cue-text>'],
    ['</div></div></div><div></div>'],
  ],
  [
    [
      '<div class = bigbox><div class = quad_box><div class = decision-bottom-left><div class = flankerLeft_2><div class = cue-text>',
    ],
    ['</div></div><div class = flankerLeft_1><div class = cue-text>'],
    ['</div></div><div class = flankerMiddle><div class = cue-text>'],
    ['</div></div><div class = flankerRight_1><div class = cue-text>'],
    ['</div></div><div class = flankerRight_2><div class = cue-text>'],
    ['</div></div></div><div></div>'],
  ],
];

var fixation_boards = [
  [
    '<div class = bigbox><div class = quad_box><div class = decision-top-left><div class = fixation>+</div></div></div></div>',
  ],
  [
    '<div class = bigbox><div class = quad_box><div class = decision-top-right><div class = fixation>+</div></div></div></div>',
  ],
  [
    '<div class = bigbox><div class = quad_box><div class = decision-bottom-right><div class = fixation>+</div></div></div></div>',
  ],
  [
    '<div class = bigbox><div class = quad_box><div class = decision-bottom-left><div class = fixation>+</div></div></div></div>',
  ],
];

//PRE LOAD IMAGES HERE
var pathSource =
  '/static/experiments/flanker_with_spatial_task_switching__practice/images/';

var numbersPreload = ['1', '2', '3', '4', '5', '6', '7', '8', '9'];
var images = [];

for (i = 0; i < numbersPreload.length; i++) {
  images.push(pathSource + numbersPreload[i] + '.png');
}

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
    task_switches = makeTaskSwitches(practice_len);
    stims = createTrialTypes(task_switches, practice_len);
  },
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

for (i = 0; i < practice_len + 1; i++) {
  var fixation_block = {
    type: 'poldrack-single-stim',
    stimulus: getFixation,
    is_html: true,
    choices: 'none',
    data: {
      trial_id: 'practice_fixation',
    },
    timing_response: 500, //500
    timing_post_trial: 0,
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
  practiceTrials.push(fixation_block);
  practiceTrials.push(practice_block);
}
// fMRI EDITS: CHANGING PRACTICE TO practice
var practiceCount = 0;
var practiceNode = {
  timeline: practiceTrials,
  loop_function: function (data) {
    practiceCount += 1;
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

      task_switches = makeTaskSwitches(practice_len);
      stims = createTrialTypes(task_switches, practice_len);
      return true;
    }
  },
};

var feedback_block = {
  type: 'poldrack-single-stim',
  data: {
    trial_id: 'test_feedback',
  },
  choices: 'none',
  stimulus: getFeedback,
  timing_post_trial: 0,
  is_html: true,
  timing_response: 10000,
  response_ends_trial: false, // HJ CHANGE
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
flanker_with_spatial_task_switching__practice_experiment = [];
flanker_with_spatial_task_switching__practice_experiment.push(
  motor_setup_block
); //exp_input

//out of scanner practice
flanker_with_spatial_task_switching__practice_experiment.push(intro_block);
flanker_with_spatial_task_switching__practice_experiment.push(practiceNode);
flanker_with_spatial_task_switching__practice_experiment.push(
  practice_feedback_block
);
flanker_with_spatial_task_switching__practice_experiment.push(
  practice_end_block
);
