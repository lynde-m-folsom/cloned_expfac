/* ************************************ */
/*       Define Helper Functions        */
/* ************************************ */

// fMRI helper functions
var motor_perm = 0;

var getPromptText = function () {
  return (
    '<div class = prompt_box>' +
    `<p class = center-block-text style = "font-size:16px; line-height:80%%;">Match the current middle letter to the middle letter that appeared ${delay} trial ago</p>` +
    '<p class = center-block-text style = "font-size:16px; line-height:80%%;">If they match, press the ' +
    getPossibleResponses()[0][0] +
    '</p>' +
    '<p class = center-block-text style = "font-size:16px; line-height:80%%;">If they mismatch, press the ' +
    getPossibleResponses()[1][0] +
    '</p>' +
    '</div>'
  );
};

var getPromptTextList = function () {
  return (
    '<ul style="text-align:left;">' +
    '<li>Match the current middle letter to the middle letter that appeared some number of trials ago</li>' +
    '<li>If they match, press the ' +
    getPossibleResponses()[0][0] +
    '</li>' +
    '<li>If they mismatch, press the ' +
    getPossibleResponses()[1][0] +
    '</li>' +
    '</ul>'
  );
};

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
      '<p class = block-text>In this task, you will see a row of 5 letters on every trial.</p>' +
      '<p class = block-text>You will be asked to match the current <i>middle</i> letter, to the <i>middle</i> letter that appeared either 1 or 2 trials ago depending on the delay given to you for that block.</p>' +
      '<p class = block-text>Press the ' +
      getPossibleResponses()[0][0] +
      ' if the middle letters match, and the ' +
      getPossibleResponses()[1][0] +
      ' if they mismatch.</p>' +
      '<p class = block-text>The letters that are not in the middle do not matter, please try to ignore them. Capitalization does not matter, so "T" matches with "t".</p> ' +
      '<p class = block-text>Your delay (the number of trials ago which you must match the current letter to) will change from block to block. You will be given the delay at the start of every block of trials.</p>' +
      `<p class = block-text>Your delay for practice is ${delay}.</p>` +
      '<p class = block-text>We will start practice when you finish instructions. Please make sure you understand the instructions before moving on. You will be given a reminder of the rules for practice. <i>This will be removed for test!</i></p>' +
      '<p class = block-text>Please respond as quickly and accurately as possible to the letters on the screen.</p>' +
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

function insertBufferITIs(design_ITIs, delays) {
  var buffer_ITIs = genITIs();
  var out_ITIs = [];
  delay_seq = delays.slice();
  while (design_ITIs.length > 0) {
    block_delay = delay_seq.pop();
    if (block_delay == 2) {
      out_ITIs = out_ITIs.concat(buffer_ITIs.slice(0, 2)); //get 2 buffer ITIs to start each block
      buffer_ITIs = buffer_ITIs.slice(2); //remove the just used buffer ITIs from the buffer ITI array
    } else if (block_delay == 1) {
      out_ITIs = out_ITIs.concat(buffer_ITIs.slice(0, 1)); //get 1 buffer ITIs to start each block
      buffer_ITIs = buffer_ITIs.slice(1); //remove the just used buffer ITIs from the buffer ITI array
    }

    curr_block_ITIs = design_ITIs.slice(0, numTrialsPerBlock); //get this current block's ITIs
    design_ITIs = design_ITIs.slice(numTrialsPerBlock); //remove this current block's ITIs from des_ITIs

    out_ITIs = out_ITIs.concat(curr_block_ITIs); //add this current block's ITI's to the out array
  }
  return out_ITIs;
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

function getDisplayElement() {
  $('<div class = display_stage_background></div>').appendTo('body');
  return $('<div class = display_stage></div>').appendTo('body');
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

var getResponse = function () {
  return correct_response;
};

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

var counter = 1;
function gen_testTrials_1back() {
  var testTrials_1Back = [];
  testTrials_1Back.push(feedback_block);

  for (i = 0; i < numTrialsPerBlock + 1; i++) {
    //was changed from + 3 as delays went from 1:3 to 1:2 HERE THE NUMBER OF ITERATION NEEDS TO BE NTRIAL + DELAY!

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
      fixation_default: true,
    };
    testTrials_1Back.push(fixation_block);
    testTrials_1Back.push(test_block);
  }
  return testTrials_1Back;
}

function gen_testTrials_2back() {
  var testTrials_2Back = [];
  testTrials_2Back.push(feedback_block);

  for (i = 0; i < numTrialsPerBlock + 2; i++) {
    //was changed from + 3 as delays went from 1:3 to 1:2 HERE THE NUMBER OF ITERATION NEEDS TO BE NTRIAL + DELAY!

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
      fixation_default: true,
    };
    testTrials_2Back.push(fixation_block);
    testTrials_2Back.push(test_block);
  }
  return testTrials_2Back;
}

// Function to get the correct timeline depending on block delay
var getTestTrials = function (delay) {
  if (delay == 1) {
    testTrials = gen_testTrials_1back();
  } else if (delay == 2) {
    testTrials = gen_testTrials_2back();
  }
  return testTrials;
};

var createTrialTypes = function (numTrialsPerBlock, delay) {
  if (numTrialsPerBlock !== practice_len) {
    console.log('des events');
    // if not practice
    var curr_des_events = des_events.slice(0, numTrialsPerBlock);
    des_events = des_events.slice(numTrialsPerBlock); //grab this block's event
    console.log(curr_des_events);
    console.log(des_events);
  }

  first_stims = [];
  for (var i = 0; i < delay; i++) {
    n_back_condition = 'N/A';

    flanker_condition = jsPsych.randomization
      .repeat(['congruent', 'incongruent'], 1)
      .pop();
    probe = randomDraw(letters);
    correct_response = getPossibleResponses()[1][1];

    if (flanker_condition == 'congruent') {
      flankers = probe;
    } else if (flanker_condition == 'incongruent') {
      flankers = randomDraw(
        'bBdDgGtTvV'.split('').filter(function (y) {
          return $.inArray(y, [probe.toLowerCase(), probe.toUpperCase()]) == -1;
        })
      );
    }

    first_stim = {
      n_back_condition: n_back_condition,
      flanker_condition: flanker_condition,
      probe: probe,
      correct_response: correct_response,
      delay: delay,
      flankers: flankers,
    };
    first_stims.push(first_stim);
  }

  console.log('first stims', first_stims);
  stims = [];

  for (var i = 0; i < numTrialsPerBlock; i++) {
    if (numTrialsPerBlock !== practice_len) {
      flanker_condition = curr_des_events[i];
    } else {
      flanker_condition = jsPsych.randomization
        .repeat(['congruent', 'incongruent'], 1)
        .pop();
    }

    n_back_condition = i % 5 == 0 ? 'match' : 'mismatch';

    stim = {
      flanker_condition: flanker_condition,
      n_back_condition: n_back_condition,
    };

    stims.push(stim);
  }

  console.log('stims', stims);
  if (numTrialsPerBlock == practice_len) {
    stims = jsPsych.randomization.repeat(stims, 1);
  }
  stims = first_stims.concat(stims);
  stim_len = stims.length;
  new_stims = [];
  for (i = 0; i < stim_len; i++) {
    if (i < delay) {
      stim = stims.shift();
      n_back_condition = stim.n_back_condition;
      flanker_condition = stim.flanker_condition;
      probe = stim.probe;
      correct_response = stim.correct_response;
      delay = stim.delay;
      flankers = stim.flankers;
    } else {
      stim = stims.shift();
      n_back_condition = stim.n_back_condition;
      flanker_condition = stim.flanker_condition;

      if (n_back_condition == 'match') {
        probe = randomDraw([
          new_stims[i - delay].probe.toUpperCase(),
          new_stims[i - delay].probe.toLowerCase(),
        ]);
        correct_response = getPossibleResponses()[0][1];
      } else if (n_back_condition == 'mismatch') {
        probe = randomDraw(
          'bBdDgGtTvV'.split('').filter(function (y) {
            return (
              $.inArray(y, [
                new_stims[i - delay].probe.toLowerCase(),
                new_stims[i - delay].probe.toUpperCase(),
              ]) == -1
            );
          })
        );
        correct_response = getPossibleResponses()[1][1];
      }

      if (flanker_condition == 'congruent') {
        flankers = probe;
      } else if (flanker_condition == 'incongruent') {
        flankers = randomDraw(
          'bBdDgGtTvV'.split('').filter(function (y) {
            return (
              $.inArray(y, [probe.toLowerCase(), probe.toUpperCase()]) == -1
            );
          })
        );
      }
    }

    stim = {
      n_back_condition: n_back_condition,
      flanker_condition: flanker_condition,
      probe: probe,
      correct_response: correct_response,
      delay: delay,
      flankers: flankers,
    };

    new_stims.push(stim);
  }
  console.log('new stims', new_stims);
  return new_stims;
};
var count = 0;

var getStim = function () {
  console.log(count);
  count += 1;
  stim = stims.shift(); //stims has already been generated by this point by createTrialTypes, which is called in refreshNode and testNode; getStim is called in practice_block and test_block, which occur afterwards, within the nodes.
  n_back_condition = stim.n_back_condition;
  flanker_condition = stim.flanker_condition;
  probe = stim.probe;
  correct_response = stim.correct_response;
  delay = stim.delay;
  flankers = stim.flankers;

  if (probe == probe.toUpperCase()) {
    letter_case = 'uppercase';
  } else if (probe == probe.toLowerCase()) {
    letter_case = 'lowercase';
  }

  if (flankers == flankers.toUpperCase()) {
    letter_case_flankers = 'uppercase';
  } else if (flankers == flankers.toLowerCase()) {
    letter_case_flankers = 'lowercase';
  }

  return (
    flanker_boards[0] +
    preFileType +
    letter_case_flankers +
    '_' +
    flankers.toUpperCase() +
    fileTypePNG +
    flanker_boards[1] +
    preFileType +
    letter_case_flankers +
    '_' +
    flankers.toUpperCase() +
    fileTypePNG +
    flanker_boards[2] +
    preFileType +
    letter_case +
    '_' +
    probe.toUpperCase() +
    fileTypePNG +
    flanker_boards[3] +
    preFileType +
    letter_case_flankers +
    '_' +
    flankers.toUpperCase() +
    fileTypePNG +
    flanker_boards[4] +
    preFileType +
    letter_case_flankers +
    '_' +
    flankers.toUpperCase() +
    fileTypePNG
  );
};

var getResponse = function () {
  return correct_response;
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
    n_back_condition: n_back_condition,
    flanker_condition: flanker_condition,
    probe: probe,
    flankers: flankers,
    correct_response: correct_response,
    delay: delay,
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

var createDelay = function () {
  var array1_delay = jsPsych.randomization.repeat([1], numTestBlocks / 2);
  var array2_delay = jsPsych.randomization.repeat([2], numTestBlocks / 2);

  chance = Math.round(Math.random()) + 1;
  if (chance == 1) {
    temp = $.map(array2_delay, function (v, i) {
      return [v, array1_delay[i]];
    });
    return temp;
  } else if (chance == 2) {
    temp = $.map(array1_delay, function (v, i) {
      return [v, array2_delay[i]];
    });
    return temp;
  }
};

var testCount = 0;

function generateTestNode(delay) {
  var testNode = {};
  testNode = {
    timeline: getTestTrials(delay),
    //testTrials, // create testTrials using a function with delay
    loop_function: function (data) {
      count = 0;
      testCount += 1;
      current_trial = 0;
      var sum_rt = 0;
      var sum_responses = 0;
      var correct = 0;
      var total_trials = 0;
      var mismatch_press = 0;

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
          if (data[i].key_press == getPossibleResponses()[1][1]) {
            mismatch_press += 1;
          }
        }
      }

      var accuracy = correct / total_trials;
      var missed_responses = (total_trials - sum_responses) / total_trials;
      var ave_rt = sum_rt / sum_responses;
      var mismatch_press_percentage = mismatch_press / total_trials;

      delay = delays.pop();
      if (!delay) {
        feedback_text = '</p><p class = instruct-text>Done with this test.<br>';
        return false;
      } else {
        counter += 1;
        stims = createTrialTypes(numTrialsPerBlock, delay);

        feedback_text =
          "<strong><i><font color='black' size=+10>Delay for next round of trials:  " +
          delay +
          '</i></font></strong>';

        if (accuracy < accuracy_thresh) {
          feedback_text +=
            '</p><p class = block-text style = "font-size:32px; line-height:1.2;"> Remember: <br>' +
            getPromptTextList();
        }

        if (missed_responses > missed_thresh) {
          feedback_text +=
            '</p><p class = instruct-text>You have not been responding to some trials.  Please respond on every trial that requires a response.';
        }

        if (ave_rt > rt_thresh) {
          feedback_text +=
            '</p><p class = instruct-text>You have been responding too slowly.';
        }

        if (mismatch_press_percentage >= 0.9) {
          feedback_text +=
            '</p><p class = instruct-text>Please do not simply press your "' +
            getPossibleResponses()[1][0] +
            '" to every stimulus. Please try to identify the matches and press your "' +
            getPossibleResponses()[0][0] +
            '" when they occur.';
        }

        console.log(stims);
        return false;
      }
    },
  };
  return testNode;
}

/* ************************************ */
/*    Define Experimental Variables     */
/* ************************************ */
// generic task variables
var sumInstructTime = 0; //ms
var instructTimeThresh = 0; ///in seconds
var credit_var = 0;

var practice_len = 20; // 20 must be divisible by 10
var exp_len = 240; //240 must be divisible by 10
var numTrialsPerBlock = 40; // 40 must be divisible by 10 and we need to have a multiple of 3 blocks (3,6,9) in order to have equal delays across blocks
var numTestBlocks = exp_len / numTrialsPerBlock;
var practice_thresh = 3; // 3 blocks of 20 trials

var refresh_trial_id = 'instructions';
var refresh_feedback_timing = -1;
var refresh_response_ends = true;

var accuracy_thresh = 0.75;
var rt_thresh = 1000;
var missed_thresh = 0.1;

var delays = createDelay();
var delay = 2; // change?

var pathDesignSource = '/static/experiments/flanker_with_nback__fmri/designs/';
var pathSource = '/static/experiments/flanker_with_nback__fmri/images/';
var fileTypePNG = ".png'></img>";
var preFileType =
  "<img class = center src='/static/experiments/flanker_with_nback__fmri/images/";

var n_back_conditions = jsPsych.randomization.repeat(
  ['mismatch', 'mismatch', 'match', 'mismatch', 'mismatch'],
  1
);

var flanker_conditions = jsPsych.randomization.repeat(
  ['congruent', 'incongruent'],
  1
);

var letters = 'bBdDgGtTvV'.split('');

var current_trial = 0;
var current_block = 0;

//PRE LOAD IMAGES HERE
var lettersPreload = ['B', 'D', 'G', 'T', 'V'];
var casePreload = ['lowercase', 'uppercase'];
var pathSource = '/static/experiments/flanker_with_nback__fmri/images/';
var images = [];

for (i = 0; i < lettersPreload.length; i++) {
  for (y = 0; y < casePreload.length; y++) {
    images.push(pathSource + casePreload[y] + '_' + lettersPreload[i] + '.png');
  }
}
jsPsych.pluginAPI.preloadImages(images);
/* ************************************ */
/*          Define Game Boards          */
/* ************************************ */
var flanker_boards = [
  [
    '<div class = bigbox><div class = centerbox><div class = flankerLeft_2><div class = cue-text>',
  ],
  ['</div></div><div class = flankerLeft_1><div class = cue-text>'],
  ['</div></div><div class = flankerMiddle><div class = cue-text>'],
  ['</div></div><div class = flankerRight_1><div class = cue-text>'],
  ['</div></div><div class = flankerRight_2><div class = cue-text>'],
  ['</div></div></div></div>'],
];

/* ************************************ */
/*        Set up jsPsych blocks         */
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
    des_ITIs = insertBufferITIs(des_ITIs, delays);
    ITIs_stim = des_ITIs.slice(0);
    ITIs_resp = des_ITIs.slice(0);
    des_events = await getdesignEvents(design_perm);
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

var motor_setup_block = {
  type: 'survey-text',
  data: {
    trial_id: 'motor_setup',
  },
  questions: [['<p class = center-block-text>motor permutation (0-1):</p>']],
  on_finish: function (data) {
    motor_perm = parseInt(data.responses.slice(7, 10));
    stims = createTrialTypes(practice_len, delay);
    console.log(stims);
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

var feedback_instruct_text =
  'Welcome to the experiment. This experiment will take around 10 minutes. Press <i>enter</i> to begin.';
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

var fixation_block = {
  type: 'poldrack-single-stim',
  stimulus: '<div class = centerbox><div class = fixation>+</div></div>',
  is_html: true,
  choices: 'none',
  data: {
    trial_id: 'fixation',
  },
  timing_response: 500, //500
  timing_post_trial: 0,
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

/* ************************************ */
/*        Set up timeline blocks        */
/* ************************************ */
var refreshTrials = [];
refreshTrials.push(refresh_feedback_block);
for (i = 0; i < practice_len + 2; i++) {
  var practice_fixation_block = {
    type: 'poldrack-single-stim',
    stimulus: '<div class = centerbox><div class = fixation>+</div></div>',
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
    timing_feedback_duration: 500,
    show_stim_with_feedback: false,
    timing_post_trial: 0,
    on_finish: appendData,
    prompt: getPromptText,
  };
  refreshTrials.push(practice_fixation_block);
  refreshTrials.push(practice_block);
}

var refreshCount = 0;
var refreshNode = {
  timeline: refreshTrials,
  loop_function: function (data) {
    count = 0;
    refreshCount += 1;
    current_trial = 0;

    var sum_rt = 0;
    var sum_responses = 0;
    var correct = 0;
    var total_trials = 0;
    var mismatch_press = 0;

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

        if (data[i].key_press == getPossibleResponses()[1][1]) {
          mismatch_press += 1;
        }
      }
    }

    var accuracy = correct / total_trials;
    var missed_responses = (total_trials - sum_responses) / total_trials;
    var ave_rt = sum_rt / sum_responses;
    var mismatch_press_percentage = mismatch_press / total_trials;

    refresh_feedback_text =
      '<br>Please take this time to read your feedback and to take a short break! Press enter to continue';

    if (accuracy < accuracy_thresh) {
      refresh_feedback_text +=
        '</p><p class = block-text style = "font-size:32px; line-height:1.2;"> Remember: <br>' +
        getPromptTextList();
    }

    if (missed_responses > missed_thresh) {
      refresh_feedback_text +=
        '</p><p class = block-text>You have not been responding to some trials.  Please respond on every trial that requires a response.';
    }

    if (ave_rt > rt_thresh) {
      refresh_feedback_text +=
        '</p><p class = block-text>You have been responding too slowly.';
    }

    if (mismatch_press_percentage >= 0.9) {
      refresh_feedback_text +=
        '</p><p class = block-text>Please do not simply press the "' +
        getPossibleResponses()[1][0] +
        '" to every stimulus. Please try to identify the matches and press the "' +
        getPossibleResponses()[0][0] +
        '" when they occur.';
    }

    delay = delays.pop(); // at the end of practice get first delay
    stims = createTrialTypes(numTrialsPerBlock, delay);
    feedback_text =
      "<strong><i><font color='black' size=+10> Delay for next round of trials:  " +
      delay +
      '</i></font></strong>';
    console.log(stims);
    return false;
  },
};

/* ************************************ */
/*          Set up Experiment           */
/* ************************************ */

var flanker_with_nback__fmri_experiment = [];
flanker_with_nback__fmri_experiment.push(design_setup_block);
flanker_with_nback__fmri_experiment.push(motor_setup_block);
test_keys(flanker_with_nback__fmri_experiment, [
  getPossibleResponses()[0][1],
  getPossibleResponses()[1][1],
]);

flanker_with_nback__fmri_experiment.push(refreshNode);
flanker_with_nback__fmri_experiment.push(refresh_feedback_block);
//in scanner test
cni_bore_setup(flanker_with_nback__fmri_experiment);
delays
  .slice()
  .reverse()
  .forEach((d) => {
    flanker_with_nback__fmri_experiment.push(generateTestNode(d));
  });
flanker_with_nback__fmri_experiment.push(feedback_block);

flanker_with_nback__fmri_experiment.push(end_block);
