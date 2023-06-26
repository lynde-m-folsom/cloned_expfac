/* N-BACK WITH SHAPE MATCHING */

/* ************************************ */
/*       Define Helper Functions        */
/* ************************************ */
var getPromptTextList = function () {
  return (
    '<ul style="text-align:left;">' +
    "<li>Match the current WHITE letter to the WHITE letter that appeared some number of trials ago</li>" +
    "<li>If they match, press the " +
    getPossibleResponses()[0][0] +
    "</li>" +
    "<li>If they mismatch, press the " +
    getPossibleResponses()[1][0] +
    "</li>" +
    "</ul>"
  );
};
function getPossibleResponses() {
  mperm = getMotorPerm();
  if (mperm == 0) {
    stim1 = ["index finger", 89];
    stim2 = ["middle finger", 71];
  } else {
    stim1 = ["middle finger", 71];
    stim2 = ["index finger", 89];
  }
  return [stim1, stim2];
}

function getTimeoutMessage() {
  return (
    "<div class = fb_box><div class = center-text>Respond Faster!</div></div>" +
    getPromptTextList()
  );
}

function getChoices() {
  return [getPossibleResponses()[0][1], getPossibleResponses()[1][1]];
}

var counter = 1;

function getDisplayElement() {
  $("<div class = display_stage_background></div>").appendTo("body");
  return $("<div class = display_stage></div>").appendTo("body");
}

function addID() {
  jsPsych.data.addDataToLastTrial({
    exp_id: "n_back_with_shape_matching__practice",
  });
}

function assessPerformance() {
  var experiment_data = jsPsych.data.getTrialsOfType("poldrack-single-stim");
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
    if (experiment_data[i].trial_id == "test_trial") {
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

var getFixation = function () {
  stim = stims.shift(); //stims = [] at initial stage
  predictable_condition = stim.predictable_condition;
  shape_matching_condition = stim.shape_matching_condition;
  probe = stim.probe;
  target = stim.target;
  distractor = stim.distractor;
  correct_response = stim.correct_response;
  whichQuadrant = stim.whichQuad;

  return "<div class = centerbox><div class = fixation>+</div></div>"; //changed for spatial
};

var getFeedback = function () {
  return (
    '<div class = bigbox><div class = picture_box><p class = block-text><font color="white">' +
    feedback_text +
    "</font></p></div></div>"
  );
};

var randomDraw = function (lst) {
  var index = Math.floor(Math.random() * lst.length);
  return lst[index];
};

function getRandomInt(max) {
  return Math.floor(Math.random() * Math.floor(max));
}

var feedback_block = {
  type: "poldrack-single-stim",
  data: {
    trial_id: "feedback_block",
  },
  choices: "none",
  stimulus: getFeedback,
  timing_post_trial: 0,
  is_html: true,
  timing_response: 10000,
  response_ends_trial: false,
};

var trial_types = jsPsych.randomization.repeat(
  ["SSS", "SDD", "SNN", "DSD", "DDD", "DDS", "DNN"],
  practice_len / 7
);

var getStim = function () {
  stim = stims.shift();
  n_back_condition = stim.n_back_condition;
  shape_matching_condition = stim.shape_matching_condition;
  probe = stim.probe;
  correct_response = stim.correct_response;
  delay = stim.delay;
  distractor = stim.distractor;

  if (probe == probe.toUpperCase()) {
    letter_case = "uppercase";
  } else if (probe == probe.toLowerCase()) {
    letter_case = "lowercase";
  }

  if (distractor == distractor.toUpperCase()) {
    letter_case_distractor = "uppercase";
  } else if (distractor == distractor.toLowerCase()) {
    letter_case_distractor = "lowercase";
  }

  if (distractor !== "") {
    return (
      "<div class = bigbox><div class = centerbox>" +
      "<div class = distractor-text><div class = cue-text>" +
      preFileTypeDistractor +
      "red_" +
      letter_case_distractor +
      "_" +
      distractor.toUpperCase() +
      fileTypePNG +
      "</div></div>" +
      "<div class = gng_number><div class = cue-text>" +
      preFileType +
      letter_case +
      "_" +
      probe.toUpperCase() +
      fileTypePNG +
      "</div></div>" +
      "</div></div>"
    );
  } else {
    return (
      "<div class = bigbox><div class = centerbox>" +
      "<div class = gng_number><div class = cue-text>" +
      preFileType +
      letter_case +
      "_" +
      probe.toUpperCase() +
      fileTypePNG +
      "</div></div>" +
      "</div></div>"
    );
  }
};

/* ************************************ */
/*     Create the trial type            */
/* ************************************ */

var createTrialTypes = function (numTrialsPerBlock, delay) {
  first_stims = [];
  for (var i = 0; i < delay; i++) {
    //SHIFTED BECAUSE MAX DELAY == 2 NOW
    if (i < delay) {
      n_back_condition = "N/A";
    } else {
      n_back_condition = n_back_conditions[Math.floor(Math.random() * 5)];
    }

    correct_response = getPossibleResponses()[1][1];
    shape_matching_condition = jsPsych.randomization
      .repeat(["match", "mismatch"], 1)
      .pop();
    probe = randomDraw(letters);

    if (shape_matching_condition == "match") {
      distractor = probe;
    } else if (shape_matching_condition == "mismatch") {
      distractor = randomDraw(
        "bBdDgGtTvV".split("").filter(function (y) {
          return $.inArray(y, [probe.toLowerCase(), probe.toUpperCase()]) == -1;
        })
      );
    }
    first_stim = {
      n_back_condition: n_back_condition,
      probe: probe,
      correct_response: correct_response,
      delay: delay,
      shape_matching_condition: shape_matching_condition,
      distractor: distractor,
    };
    first_stims.push(first_stim);
  }

  console.log("first_stims", first_stims);
  stims = [];

  for (
    var numIterations = 0;
    numIterations <
    numTrialsPerBlock /
      (n_back_conditions.length * shape_matching_conditions.length);
    numIterations++
  ) {
    for (
      var numNBackConds = 0;
      numNBackConds < n_back_conditions.length;
      numNBackConds++
    ) {
      for (
        var numShapeConds = 0;
        numShapeConds < shape_matching_conditions.length;
        numShapeConds++
      ) {
        shape_matching_condition = shape_matching_conditions[numShapeConds];
        n_back_condition = n_back_conditions[numNBackConds];

        stim = {
          shape_matching_condition: shape_matching_condition,
          n_back_condition: n_back_condition,
        };

        stims.push(stim);
      }
    }
  }

  stims = jsPsych.randomization.repeat(stims, 1);
  stims = first_stims.concat(stims);

  stim_len = stims.length;

  new_stims = [];
  for (i = 0; i < stim_len; i++) {
    if (i < delay) {
      //meaning only the first_stims
      stim = stims.shift(); //stim. now has the properties from first_stims
      n_back_condition = stim.n_back_condition;
      shape_matching_condition = stim.shape_matching_condition;
      probe = stim.probe;
      correct_response = stim.correct_response;
      delay = stim.delay;
      distractor = stim.distractor;
    } else {
      stim = stims.shift();
      n_back_condition = stim.n_back_condition;
      shape_matching_condition = stim.shape_matching_condition;

      if (n_back_condition == "match") {
        probe = randomDraw([
          new_stims[i - delay].probe.toUpperCase(),
          new_stims[i - delay].probe.toLowerCase(),
        ]);
        correct_response = getPossibleResponses()[0][1];
      } else if (n_back_condition == "mismatch") {
        probe = randomDraw(
          "bBdDgGtTvV".split("").filter(function (y) {
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

      if (shape_matching_condition == "match") {
        distractor = probe;
      } else if (shape_matching_condition == "mismatch") {
        distractor = randomDraw(
          "bBdDgGtTvV".split("").filter(function (y) {
            return (
              $.inArray(y, [probe.toLowerCase(), probe.toUpperCase()]) == -1
            );
          })
        );
      }
    }

    stim = {
      n_back_condition: n_back_condition,
      shape_matching_condition: shape_matching_condition,
      probe: probe,
      correct_response: correct_response,
      delay: delay,
      distractor: distractor,
    };

    new_stims.push(stim);
  }
  console.log(stims);
  console.log("new_stims", new_stims);
  return new_stims;
};

//feedback functions added for in-person version
var getPracticeFeedback = function () {
  if (getPracticeTrialID() == "instructions") {
    return (
      "<div style='top:40%;' class = centerbox>" +
      "<p class = block-text>In this experiment, across trials you will see a white letter with an overlapping red letter on every trial.</p>" +
      "<p class = block-text>You will be asked to match the current white letter to the white letter that appeared either 1 or 2 trials ago depending on the delay given to you for that block.</p>" +
      "<p class = block-text>Press the " +
      getPossibleResponses()[0][0] +
      " if the white letters match, and the " +
      getPossibleResponses()[1][0] +
      " if they mismatch.</p>" +
      "<p class = block-text>Your delay (the number of trials ago which you must match the current letter to) will change from block to block. You will be given the delay at the start of every block of trials.</p>" +
      "<p class = block-text>Ignore the red letter, focus only on the white letter.</p>" +
      '<p class = block-text>Capitalization does not matter, so "T" matches with "t".</p> ' +
      "<p class = block-text>Please respond as quickly and accurately as possible to the presentation of the letters.</p> " +
      "<p class = block-text>We will start practice when you finish instructions. Your delay for practice is 1. Please make sure you understand the instructions before moving on. You will be given a reminder of the rules for practice. <i>This will be removed for test!</i></p>" +
      "<p class = block-text>During practice, you will receive a reminder of the rules. <i>This reminder will be taken out for test</i>.</p>" +
      "</div>"
    );
  } else {
    return (
      '<div class = bigbox><div class = picture_box><p class = instruct-text><font color="white">' +
      practice_feedback_text +
      "</font></p></div></div>"
    );
  }
};

var getPracticeTrialID = function () {
  return practice_trial_id;
};

var getPracticeFeedbackTiming = function () {
  return practice_feedback_timing;
};

var getPracticeResponseEnds = function () {
  return practice_response_ends;
};

var getPracticeTrialID = function () {
  return practice_trial_id;
};

var getResponse = function () {
  return correct_response;
};

var appendData = function () {
  curr_trial = jsPsych.progress().current_trial_global;
  trial_id = jsPsych.data.getDataByTrialIndex(curr_trial).trial_id;
  current_trial += 1;

  if (trial_id == "refresh_trial") {
    current_block = refreshCount;
  } else if (trial_id == "test_trial") {
    current_block = testCount;
  }

  jsPsych.data.addDataToLastTrial({
    n_back_condition: n_back_condition,
    shape_matching_condition: shape_matching_condition,
    probe: probe,
    distractor: distractor,
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

/* ************************************ */
/*    Define Experimental Variables     */
/* ************************************ */
// generic task variables
var sumInstructTime = 0; //ms
var instructTimeThresh = 0; ///in seconds
var credit_var = 0;

var practice_len = 15; // must be divisible by 5
var exp_len = 220; //150 // must be divisible by 5 --9:30
var numTrialsPerBlock = 55; // 50, must be divisible by 5 and we need to have a multiple of 2 blocks (2,4,6) in order to have equal delays across blocks
var numTestBlocks = exp_len / numTrialsPerBlock; //should be divisble by 3 ^^
var practice_thresh = 4; // 4 blocks of 15 trials

var practice_trial_id = "instructions";
var practice_feedback_timing = -1;
var practice_response_ends = true;

var delays = jsPsych.randomization.repeat([1, 2], numTestBlocks / 2); //jsPsych.randomization.repeat([1, 2, 3], numTestBlocks / 3)

var delay = 1;

var accuracy_thresh = 0.75;
var rt_thresh = 1000;
var missed_thresh = 0.1;

var pathSource =
  "/static/experiments/n_back_with_shape_matching__practice/images/";
var pathDesignSource =
  "/static/experiments/n_back_with_shape_matching__practice/designs/";

var fileTypePNG = ".png'></img>";
var preFileType =
  "<img class = center src='/static/experiments/n_back_with_shape_matching__practice/images/";
var preFileTypeDistractor =
  "<img class = distractor src='/static/experiments/n_back_with_shape_matching__practice/images/";

// 20 percent, 80 percent mismatch
// won't tell
var n_back_conditions = [
  "match",
  "mismatch",
  "mismatch",
  "mismatch",
  "mismatch",
];
var shape_matching_conditions = jsPsych.randomization.repeat(
  ["match", "mismatch"],
  1
);
//var shape_matching_conditions_control = jsPsych.randomization.repeat(['match','mismatch'],1)
// var getPossibleResponses() = getPossibleResponses();

var letters = "bBdDgGtTvV".split("");

var prompt_text_list =
  '<ul style="text-align:left;">' +
  "<li>Match the current WHITE letter to the WHITE letter that appeared some number of trials ago</li>" +
  "<li>If they match, press the " +
  getPossibleResponses()[0][0] +
  "</li>" +
  "<li>If they mismatch, press the " +
  getPossibleResponses()[1][0] +
  "</li>" +
  "</ul>";

var prompt_text =
  "<div class = prompt_box>" +
  '<p class = center-block-text style = "font-size:16px; line-height:80%%;">Match the current WHITE letter to the WHITE letter that appeared 1 trial ago</p>' +
  '<p class = center-block-text style = "font-size:16px; line-height:80%%;">If they match, press the ' +
  getPossibleResponses()[0][0] +
  "</p>" +
  '<p class = center-block-text style = "font-size:16px; line-height:80%%;">If they mismatch, press the ' +
  getPossibleResponses()[1][0] +
  "</p>" +
  "</div>";

var current_trial = 0;
var current_block = 0;

//PRE LOAD IMAGES HERE
var lettersPreload = ["B", "D", "G", "T", "V"];
var casePreload = ["lowercase", "uppercase"];
var pathSource =
  "/static/experiments/n_back_with_shape_matching__practice/images/";
var images = [];

// ADDED FOR SCANNING

var refresh_trial_id = "instructions";
var refresh_feedback_timing = -1;
var refresh_response_ends = true;

var motor_perm = 0;

//added for motor counterbalancing
function getMotorPerm() {
  return motor_perm;
}

for (i = 0; i < lettersPreload.length; i++) {
  for (y = 0; y < casePreload.length; y++) {
    images.push(pathSource + casePreload[y] + "_" + lettersPreload[i] + ".png");
  }
}

for (i = 0; i < lettersPreload.length; i++) {
  for (y = 0; y < casePreload.length; y++) {
    images.push(
      pathSource + "red_" + casePreload[y] + "_" + lettersPreload[i] + ".png"
    );
  }
}
jsPsych.pluginAPI.preloadImages(images);
/* ************************************ */
/*          Define Game Boards          */
/* ************************************ */

var task_boards = [
  ["<div class = bigbox><div class = centerbox><div class = fixation>"],
  ["</div></div></div>"],
];

/* ************************************ */
/*        Set up jsPsych blocks         */
/* ************************************ */

var motor_setup_block = {
  type: "survey-text",
  data: {
    trial_id: "motor_setup",
  },
  questions: [["<p class = center-block-text>motor permutation (0-1):</p>"]],
  on_finish: function (data) {
    motor_perm = parseInt(data.responses.slice(7, 10));
    stims = createTrialTypes(practice_len, delay);
  },
};

var intro_block = {
  type: "poldrack-single-stim",
  data: {
    trial_id: "instructions",
  },
  choices: [32],
  stimulus:
    "<div class = centerbox><p class = center-block-text> Welcome to the experiment.</p></div>",
  timing_post_trial: 0,
  is_html: true,
  timing_response: -1,
  response_ends_trial: true,
};

var practice_feedback_block = {
  type: "poldrack-single-stim",
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
    practice_trial_id = "practice-no-stop-feedback";
    practice_feedback_timing = 10000;
    practice_response_ends = false;
  },
};
var exp_stage = "practice";
var practice_fixation_block = {
  type: "poldrack-single-stim",
  stimulus: "<div class = centerbox><div class = fixation>+</div></div>",
  is_html: true,
  choices: "none",
  data: {
    trial_id: "practice_fixation",
  },
  timing_response: 500,
  timing_post_trial: 0,
  prompt: getPromptTextList,
  on_finish: function () {
    jsPsych.data.addDataToLastTrial({ exp_stage: exp_stage });
  },
};

var practiceTrials = [];
practiceTrials.push(practice_feedback_block);
for (i = 0; i < practice_len + 2; i++) {
  //was changed from + 3 as delays went from 1:3 to 1:2
  var practice_block = {
    type: "poldrack-categorize",
    stimulus: getStim,
    is_html: true,
    choices: [getPossibleResponses()[0][1], getPossibleResponses()[1][1]],
    key_answer: getResponse,
    data: {
      trial_id: "practice_trial",
    },
    correct_text:
      "<div class = upperbox><div class = center-text><font size = 20>Correct!</font></div></div>", // + prompt_text_list,
    incorrect_text:
      "<div class = upperbox><div class = center-text><font size = 20>Incorrect</font></div></div>", // + prompt_text_list,
    timeout_message: getTimeoutMessage,
    timing_stim: 1000, //1000
    timing_response: 2000, //2000
    timing_feedback_duration: 500,
    show_stim_with_feedback: false,
    timing_post_trial: 0,
    on_finish: appendData,
    prompt: getPromptTextList,
    fixation_default: true,
  };
  practiceTrials.push(practice_fixation_block);
  practiceTrials.push(practice_block);
}

var practiceCount = 0;
var practiceNode1 = {
  timeline: practiceTrials,
  loop_function: function (data) {
    practiceCount += 1;
    stims = createTrialTypes(practice_len, delay);
    current_trial = 0;

    var sum_rt = 0;
    var sum_responses = 0;
    var correct = 0;
    var total_trials = 0;
    var mismatch_press = 0;

    for (var i = 0; i < data.length; i++) {
      if (data[i].trial_id == "practice_trial") {
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

    practice_feedback_text =
      "<br>Please take this time to read your feedback and to take a short break."; // Press enter to continue"

    if (accuracy > accuracy_thresh) {
      delay = 2;
      stims = createTrialTypes(practice_len, delay);
      practice_feedback_text =
        "Your delay for this block is " +
        delay +
        ". Please match the current letter to the letter that appeared " +
        delay +
        " trial(s) ago.";
      return false;
    } else if (accuracy < accuracy_thresh) {
      if (missed_responses > missed_thresh) {
        practice_feedback_text +=
          "</p><p class = instruct-text>You have not been responding to some trials.  Please respond on every trial that requires a response.";
      }

      if (ave_rt > rt_thresh) {
        practice_feedback_text +=
          "</p><p class = instruct-text>You have been responding too slowly.";
      }

      if (mismatch_press_percentage >= 0.9) {
        practice_feedback_text +=
          '</p><p class = instruct-text>Please do not simply press your "' +
          getPossibleResponses()[1][0] +
          '" to every stimulus. Please try to identify the matches and press your "' +
          getPossibleResponses()[0][0] +
          '" when they occur.';
      }

      if (practiceCount == practice_thresh) {
        // practice_feedback_text +=
        delay = 2;
        stims = createTrialTypes(practice_len, delay);
        practice_feedback_text =
          "<p class = instruct-text><strong>Your delay for this block is " +
          delay +
          ". Please match the current letter to the letter that appeared " +
          delay +
          " trial(s) ago.</strong></p>";
        return false;
      }

      practice_feedback_text +=
        "</p><p class = instruct-text>We are going to try practice again to see if you can achieve higher accuracy.  Remember: <br>" +
        getPromptTextList() +
        "</p><p class = instruct-text>When you are ready to continue, please press the spacebar.</p>";

      return true;
    }
  },
};

var practiceCount2 = 0;
var practiceNode2 = {
  timeline: practiceTrials,
  loop_function: function (data) {
    practiceCount2 += 1;
    stims = createTrialTypes(practice_len, delay);
    current_trial = 0;

    var sum_rt = 0;
    var sum_responses = 0;
    var correct = 0;
    var total_trials = 0;
    var mismatch_press = 0;

    for (var i = 0; i < data.length; i++) {
      if (data[i].trial_id == "practice_trial") {
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

    practice_feedback_text =
      "<br>Please take this time to read your feedback and to take a short break."; // Press enter to continue"

    if (accuracy > accuracy_thresh) {
      delay = delays.pop();
      stims = createTrialTypes(numTrialsPerBlock, delay);
      feedback_text =
        "<p class = instruct-text><strong>Your delay for this block is " +
        delay +
        ". Please match the current letter to the letter that appeared " +
        delay +
        " trial(s) ago.</strong></p>";
      return false;
    } else if (accuracy < accuracy_thresh) {
      if (missed_responses > missed_thresh) {
        practice_feedback_text +=
          "</p><p class = instruct-text>You have not been responding to some trials.  Please respond on every trial that requires a response.";
      }

      if (ave_rt > rt_thresh) {
        practice_feedback_text +=
          "</p><p class = instruct-text>You have been responding too slowly.";
      }

      if (mismatch_press_percentage >= 0.9) {
        practice_feedback_text +=
          '</p><p class = instruct-text>Please do not simply press your "' +
          getPossibleResponses()[1][0] +
          '" to every stimulus. Please try to identify the matches and press your "' +
          getPossibleResponses()[0][0] +
          '" when they occur.';
      }

      if (practiceCount2 == practice_thresh) {
        delay = delays.pop();
        stims = createTrialTypes(numTrialsPerBlock, delay);
        feedback_text =
          "<p class = instruct-text><strong>Your delay for this block is " +
          delay +
          ". Please match the current letter to the letter that appeared " +
          delay +
          " trial(s) ago.</strong></p>";
        return false;
      }

      practice_feedback_text +=
        "</p><p class = instruct-text>We are going to try practice again to see if you can achieve higher accuracy.  Remember: <br>" +
        getPromptTextList() +
        "</p><p class = instruct-text>When you are ready to continue, please press the spacebar.</p>";

      return true;
    }
  },
};

var practice_end_block = {
  type: "poldrack-text",
  data: {
    trial_id: "end",
  },
  text: "<div class = centerbox><p class = center-block-text>Thanks for completing this practice!</p></div>",
  cont_key: [32],
  timing_response: 10000,
  response_ends_trial: true,
  on_finish: function () {
    assessPerformance();
  },
};

// init array
var n_back_with_shape_matching__practice_experiment = [];

n_back_with_shape_matching__practice_experiment.push(motor_setup_block); //exp_input

//out of scanner practice
n_back_with_shape_matching__practice_experiment.push(intro_block);
n_back_with_shape_matching__practice_experiment.push(practiceNode1);
n_back_with_shape_matching__practice_experiment.push(practiceNode2);
n_back_with_shape_matching__practice_experiment.push(practice_feedback_block);
n_back_with_shape_matching__practice_experiment.push(practice_end_block);
