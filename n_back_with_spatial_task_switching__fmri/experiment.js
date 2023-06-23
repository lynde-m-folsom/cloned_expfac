/* ************************************ */
/*       Define Helper Functions        */
/* ************************************ */
//FUNCTIONS FOR GETTING FMRI SEQUENCES
function getdesignITIs(design_num) {
  x = fetch(pathDesignSource + "design_" + design_num + "/ITIs_clean.txt")
    .then((res) => res.text())
    .then((res) => res)
    .then((text) => text.split(/\r?\n/));
  return x;
}
function getdesignEvents(design_num) {
  x = fetch(pathDesignSource + "design_" + design_num + "/events_clean.txt")
    .then((res) => res.text())
    .then((res) => res)
    .then((text) => text.split(/\r?\n/));
  return x;
}

function insertBufferITIs(design_ITIs) {
  var buffer_ITIs = genITIs();
  var out_ITIs = [];
  while (design_ITIs.length > 0) {
    out_ITIs = out_ITIs.concat(buffer_ITIs.slice(0, 1)); //get 2 buffer ITIs to start each block
    buffer_ITIs = buffer_ITIs.slice(1); //remove the just used buffer ITIs from the buffer ITI array

    curr_block_ITIs = design_ITIs.slice(0, numTrialsPerBlock); //get this current block's ITIs
    design_ITIs = design_ITIs.slice(numTrialsPerBlock); //remove this current block's ITIs from des_ITIs

    out_ITIs = out_ITIs.concat(curr_block_ITIs); //add this current block's ITI's to the out array
  }
  return out_ITIs;
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

function getDisplayElement() {
  $("<div class = display_stage_background></div>").appendTo("body");
  return $("<div class = display_stage></div>").appendTo("body");
}

function addID() {
  jsPsych.data.addDataToLastTrial({
    exp_id: "n_back_with_spatial_task_switching__fmri",
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
  for (var k = 0; k < possible_responses.length; k++) {
    choice_counts[possible_responses[k][1]] = 0;
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

var getInstructFeedback = function () {
  return (
    "<div class = centerbox><p class = center-block-text>" +
    feedback_instruct_text +
    "</p></div>"
  );
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
//added for motor counterbalancing
function getMotorPerm() {
  return motor_perm;
}

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

function getChoices() {
  return [getPossibleResponses()[0][1], getPossibleResponses()[1][1]];
}

//added for spatial task
var makeTaskSwitches = function (numTrials) {
  task_switch_arr = [
    "tstay_cstay",
    "tstay_cswitch",
    "tswitch_cswitch",
    "tswitch_cswitch",
  ];

  out = jsPsych.randomization.repeat(task_switch_arr, numTrials / 4);
  return out;
};

//added for spatial task
var getQuad = function (oldQuad, curr_switch) {
  var out;
  switch (curr_switch) {
    case "tstay_cstay":
      out = oldQuad;
      break;
    case "tstay_cswitch":
      if (oldQuad % 2 == 0) {
        // if even (2,4), subtract 1
        out = oldQuad - 1;
      } else {
        out = oldQuad + 1; //if odd (1,3), add 1
      }
      break;
    case "tswitch_cswitch":
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

function createNBackConditionsArray(length) {
  var numMatch = Math.floor(length * 0.2); // 20% of total length
  var numMismatch = length - numMatch; // Remaining elements are 'mismatch'

  // Create array with numMatch 'match' elements and numMismatch 'mismatch' elements
  var n_back_conditions = Array(numMatch)
    .fill("match")
    .concat(Array(numMismatch).fill("mismatch"));

  // Randomize the array
  n_back_conditions = jsPsych.randomization.shuffle(n_back_conditions);

  return n_back_conditions;
}

var createTrialTypes = function (task_switches, trial_lens) {
  //spatial task
  // 1 or 3 is stay for predictable
  // 2 or 4 is switch for predictable
  var whichQuadStart = jsPsych.randomization.repeat([1, 2, 3, 4], 1).pop();
  //1 2
  //4 3

  var n_back_trial_type_list = createNBackConditionsArray(trial_lens);

  stims = [];

  oldQuad = whichQuadStart; //added for spatial
  for (var i = 0; i < trial_lens + 1; i++) {
    if (i === 0) {
      quadIndex = oldQuad;
      n_back_cond = "Mismatch";
      probe = randomDraw(letters);
      correct_response = getPossibleResponses()[1][1];
      predictable_dimension = "N/A"; //originally 'N/A' here (because for trials =< current delay, there've not enough previous trials yet to match to). However, '1-back' or '2-back' being shown is okay, too.
      task_switch_condition = "N/A";
      delay = "N/A";
    } else if (i == 1) {
      quadIndex = getQuad(oldQuad, task_switches[i - 1]); //added for spatial
      n_back_cond = n_back_trial_type_list[i - 1];
      task_switch_condition = task_switches[i - 1];

      if (quadIndex < 3) {
        predictable_dimension = "1-back";
        delay = 1;
      } else {
        predictable_dimension = "2-back";
        delay = 2;
      }

      if (n_back_cond == "match" && predictable_dimension == "1-back") {
        probe = randomDraw([
          stims[i - delay].probe.toUpperCase(),
          stims[i - delay].probe.toLowerCase(),
        ]);
        correct_response = getPossibleResponses()[0][1];
      } else if (
        n_back_cond == "mismatch" &&
        predictable_dimension == "1-back"
      ) {
        probe = randomDraw(
          "bBdDgGtTvV".split("").filter(function (y) {
            return (
              $.inArray(y, [
                stims[i - delay].probe.toLowerCase(),
                stims[i - delay].probe.toUpperCase(),
              ]) == -1
            );
          })
        );
        correct_response = getPossibleResponses()[1][1];
      } else if (predictable_dimension == "2-back") {
        probe = randomDraw(letters);
        correct_response = getPossibleResponses()[1][1];
        predictable_dimension = predictable_dimension;
        n_back_cond = "Mismatch";
      }
    } else if (i > 1) {
      quadIndex = getQuad(oldQuad, task_switches[i - 1]); //added for spatial
      n_back_cond = n_back_trial_type_list[i - 1];
      task_switch_condition = task_switches[i - 1];
      if (quadIndex < 3) {
        predictable_dimension = "1-back";
        delay = 1;
      } else {
        predictable_dimension = "2-back";
        delay = 2;
      }

      if (n_back_cond == "match") {
        probe = randomDraw([
          stims[i - delay].probe.toUpperCase(),
          stims[i - delay].probe.toLowerCase(),
        ]);
        correct_response = getPossibleResponses()[0][1];
      } else if (n_back_cond == "mismatch") {
        probe = randomDraw(
          "bBdDgGtTvV".split("").filter(function (y) {
            return (
              $.inArray(y, [
                stims[i - delay].probe.toLowerCase(),
                stims[i - delay].probe.toUpperCase(),
              ]) == -1
            );
          })
        );
        correct_response = getPossibleResponses()[1][1];
      }
    }

    stim = {
      whichQuad: quadIndex,
      n_back_condition: n_back_cond,
      task: predictable_dimension,
      task_switch_condition: task_switch_condition,
      probe: probe,
      correct_response: correct_response,
      delay: delay,
    };

    stims.push(stim);
    oldQuad = quadIndex; // added for spatial
  }
  return stims;
};

var getStim = function () {
  if (stims.length === 0) {
    // handle the error, possibly by returning or throwing an error
    throw new Error("No more stims left");
  }

  stim = stims.shift();

  whichQuadrant = stim.whichQuad;
  n_back_condition = stim.n_back_condition;
  task = stim.task;
  task_switch_condition = stim.task_switch_condition;
  probe = stim.probe;
  correct_response = stim.correct_response;
  delay = stim.delay;
  if (probe == probe.toUpperCase()) {
    letter_case = "uppercase";
  } else if (probe == probe.toLowerCase()) {
    letter_case = "lowercase";
  }

  return (
    task_boards[whichQuadrant - 1][0] +
    preFileType +
    letter_case +
    "_" +
    probe.toUpperCase() +
    fileTypePNG +
    task_boards[whichQuadrant - 1][1]
  );
};

var getResponse = function () {
  return correct_response;
};
var getFixation = function () {
  // stim = stims.shift() //stims = [] at initial stage
  // console.log('fixation stim :', stim)
  // task = stim.predictable_dimension
  // task_switch_condition = stim.task_switch_condition
  // probe = stim.probe
  // correct_response = stim.correct_response
  // delay = stim.delay
  // correct_response = stim.correct_response
  // whichQuadrant = stim.whichQuad

  return "<div class = centerbox><div class = fixation>+</div></div>"; //changed for spatial
};

var appendData = function () {
  curr_trial = jsPsych.progress().current_trial_global;
  trial_id = jsPsych.data.getDataByTrialIndex(curr_trial).trial_id;
  current_trial += 1;

  if (trial_id == "practice_trial") {
    current_block = practiceCount;
  } else if (trial_id == "test_trial") {
    current_block = testCount;
  }

  jsPsych.data.addDataToLastTrial({
    whichQuadrant: whichQuadrant,
    n_back_condition: n_back_condition,
    task: predictable_dimension,
    task_switch_condition: task_switch_condition,
    probe: probe,
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
  if (getRefreshTrialID() == "instructions") {
    return (
      "<div class = centerbox>" +
      "<p class = block-text>In this task, you will see a letter on the screen in one of 4 quadrants.</p>" +
      "<p class = block-text>You will be asked to match the current letter to the letter that appeared either 1 or 2 trials ago depending on if the letter was on the top or bottom quadrants.</p> " +
      "<p class = block-text>When in the top two quadrants, the rule is 1-back. Please respond if the current letter was the same as the letter that occurred 1 trial ago.</p> " +
      "<p class = block-text>When in the bottom two quadrants, the rule is 2-back. Please respond if the current letter was the same as the letter that occurred 2 trials ago.</p> " +
      "<p class = block-text>Press the " +
      getPossibleResponses()[0][0] +
      " if the current letter matches the letter 1 or 2 trials ago, and the " +
      getPossibleResponses()[1][0] +
      " if they mismatch.</p> " +
      '<p class = block-text>Capitalization does not matter, so "T" matches with "t".</p> '
    );
  } else {
    return (
      '<div class = bigbox><div class = picture_box><p class = instruct-text><font color="white">' +
      refresh_feedback_text +
      "</font></p></div></div>"
    );
  }
}

function getTimeoutMessage() {
  return (
    "<div class = fb_box><div class = center-text>Respond Faster!</div></div>" +
    getPromptText()
  );
}
/* ************************************ */
/*    Define Experimental Variables     */
/* ************************************ */
// generic task variables
var sumInstructTime = 0; //ms
var instructTimeThresh = 0; ///in seconds
var credit_var = 0;
var run_attention_checks = false;

var refresh_len = 8; // must be divisible by 4
var exp_len = 240; // must be divisible by 10
var numTrialsPerBlock = 40; // must be divisible by 10
var numTestBlocks = 6; //exp_len / numTrialsPerBlock

var accuracy_thresh = 0.75;
var rt_thresh = 1000;
var missed_thresh = 0.1;

var practice_thresh = 3; // 3 blocks of 20 trials

var pathSource =
  "/static/experiments/n_back_with_spatial_task_switching__fmri/images/";
var pathDesignSource =
  "/static/experiments/n_back_with_spatial_task_switching__fmri/designs/";

var fileTypePNG = ".png'></img>";
var preFileType =
  "<img class = center src='/static/experiments/n_back_with_spatial_task_switching__fmri/images/";

var n_back_conditions = [
  "match",
  "mismatch",
  "mismatch",
  "mismatch",
  "mismatch",
];
var predictable_conditions = [
  ["stay", "switch"],
  ["switch", "stay"],
];

var predictable_dimensions_list = [
  [
    ["1-back", 1],
    ["1-back", 1],
    ["2-back", 2],
    ["2-back", 2],
  ],
  [
    ["2-back", 2],
    ["2-back", 2],
    ["1-back", 1],
    ["1-back", 1],
  ],
];
var numConds =
  n_back_conditions.length *
  predictable_conditions.length *
  predictable_dimensions_list.length;
var letters = "bBdDgGtTvV".split("");

var possible_responses = getPossibleResponses();

//ADDED FOR SCANNING
//fmri variables
var ITIs_stim = [];
var ITIs_resp = [];

var refresh_trial_id = "instructions";
var refresh_feedback_timing = -1;
var refresh_response_ends = true;

var motor_perm = 0;

var getPromptTextList = function () {
  return (
    '<ul style="text-align:left;">' +
    "<li>Top 2 quadrants: match the current letter to the letter that appeared 1 trial ago</li>" +
    "<li>Bottom 2 quadrants: match the current letter to the letter that occurred 2 trials ago</li>" +
    "<li>If they match, press the " +
    getPossibleResponses()[0][0] +
    "</li>" +
    "<li>If they mismatch, press the " +
    getPossibleResponses()[1][0] +
    "</li>" +
    "</ul>"
  );
};

var getPromptText = function () {
  return (
    "<div class = prompt_box>" +
    '<p class = center-block-text style = "font-size:16px; line-height:80%%;">Top 2 quadrants: match the current letter to the letter that appeared 1 trial ago</p>' +
    '<p class = center-block-text style = "font-size:16px; line-height:80%%;">Bottom 2 quadrants: match the current letter to the letter that occurred 2 trials ago</p>' +
    "<p>&nbsp</p>" +
    "<p>&nbsp</p>" +
    '<p class = center-block-text style = "font-size:16px; line-height:80%%;">If they match, press the ' +
    getPossibleResponses()[0][0] +
    "</p>" +
    '<p class = center-block-text style = "font-size:16px; line-height:80%%;">If they mismatch, press the ' +
    getPossibleResponses()[1][0] +
    "</p>" +
    "</div>"
  );
};
var current_trial = 0;
var current_block = 0;

//PRE LOAD IMAGES HERE
var lettersPreload = ["B", "D", "G", "T", "V"];
var casePreload = ["lowercase", "uppercase"];
var pathSource =
  "/static/experiments/n_back_with_spatial_task_switching__fmri/images/";
var images = [];

for (i = 0; i < lettersPreload.length; i++) {
  for (y = 0; y < casePreload.length; y++) {
    images.push(pathSource + casePreload[y] + "_" + lettersPreload[i] + ".png");
  }
}
jsPsych.pluginAPI.preloadImages(images);
/* ************************************ */
/*          Define Game Boards          */
/* ************************************ */

var task_boards = [
  [
    [
      "<div class = bigbox><div class = quad_box><div class = decision-top-left><div class = gng_number><div class = cue-text>",
    ],
    [
      "</div></div></div><div class = decision-top-right></div><div class = decision-bottom-right></div><div class = decision-bottom-left></div></div></div>",
    ],
  ],
  [
    [
      "<div class = bigbox><div class = quad_box><div class = decision-top-left></div><div class = decision-top-right><div class = gng_number><div class = cue-text>",
    ],
    [
      "</div></div></div><div class = decision-bottom-right></div><div class = decision-bottom-left></div></div></div>",
    ],
  ],
  [
    [
      "<div class = bigbox><div class = quad_box><div class = decision-top-left></div><div class = decision-top-right></div><div class = decision-bottom-right><div class = gng_number><div class = cue-text>",
    ],
    ["</div></div></div><div class = decision-bottom-left></div></div></div>"],
  ],
  [
    [
      "<div class = bigbox><div class = quad_box><div class = decision-top-left></div><div class = decision-top-right></div><div class = decision-bottom-right></div><div class = decision-bottom-left><div class = gng_number><div class = cue-text>",
    ],
    ["</div></div></div></div></div>"],
  ],
];

/* ************************************ */
/*        Set up jsPsych blocks         */
/* ************************************ */
var des_ITIs = [];
var des_events = [];

var design_setup_block = {
  type: "survey-text",
  data: {
    trial_id: "design_setup",
  },
  questions: [["<p class = center-block-text>Design permutation (0-1):</p>"]],
  on_finish: async function (data) {
    design_perm = parseInt(data.responses.slice(7, 10));
    des_ITIs = await getdesignITIs(design_perm);
    des_ITIs = des_ITIs.map(Number);
    console.log(des_ITIs);
    des_ITIs = insertBufferITIs(des_ITIs);
    console.log(des_ITIs);
    ITIs_stim = des_ITIs.slice(0);
    ITIs_resp = des_ITIs.slice(0);
    des_events = await getdesignEvents(design_perm);
  },
};

var motor_setup_block = {
  type: "survey-text",
  data: {
    trial_id: "motor_setup",
  },
  questions: [["<p class = center-block-text>motor permutation (0-1):</p>"]],
  on_finish: function (data) {
    motor_perm = parseInt(data.responses.slice(7, 10));
    task_conditions = makeTaskSwitches(refresh_len);
    stims = createTrialTypes(task_conditions, refresh_len);
  },
};

var end_block = {
  type: "poldrack-text",
  data: {
    trial_id: "end",
  },
  text: "<div class = centerbox><p class = center-block-text>Thanks for completing this task!</p><p class = center-block-text>Press <i>enter</i> to continue.</p></div>",
  cont_key: [13],
  timing_response: 100000,
  on_finish: function () {
    assessPerformance();
  },
};

var fixation_block = {
  type: "poldrack-single-stim",
  stimulus: "<div class = centerbox><div class = fixation>+</div></div>",
  is_html: true,
  choices: "none",
  data: {
    trial_id: "fixation",
  },
  timing_stim: getITI_stim, //500
  timing_response: getITI_resp, //500
  timing_post_trial: 0,
  on_finish: function () {
    jsPsych.data.addDataToLastTrial({ exp_stage: exp_stage });
  },
};

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
  on_finish: function () {
    jsPsych.data.addDataToLastTrial({ exp_stage: exp_stage });
  },
};

var refresh_feedback_block = {
  type: "poldrack-single-stim",
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
    (refresh_trial_id = "practice-no-stop-feedback"),
      (refresh_feedback_timing = 10000),
      (refresh_response_ends = false);
  },
};

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

/* ************************************ */
/*        Set up timeline blocks        */
/* ************************************ */

var practiceTrials = [];
practiceTrials.push(refresh_feedback_block);

for (i = 0; i < refresh_len + 1; i++) {
  var practice_fixation_block = {
    type: "poldrack-single-stim",
    stimulus: getFixation,
    is_html: true,
    data: {
      trial_id: "refresh_fixation",
    },
    choices: "none",
    timing_response: 500, //500
    timing_stim: 500, //500
    timing_post_trial: 0,
    response_ends_trial: false,
    prompt: getPromptText,
  };

  var practice_block = {
    type: "poldrack-categorize",
    stimulus: getStim,
    is_html: true,
    choices: getChoices(),
    key_answer: getResponse,
    data: {
      trial_id: "refresh_trial",
    },
    correct_text:
      "<div class = fb_box><div class = center-text><font size = 20>Correct!</font></div></div>",
    incorrect_text:
      "<div class = fb_box><div class = center-text><font size = 20>Incorrect</font></div></div>",
    timeout_message: getTimeoutMessage,
    timing_stim: 1000, //1000
    timing_response: 2000, //2000
    timing_feedback_duration: 500,
    show_stim_with_feedback: false,
    timing_post_trial: 0,
    on_finish: appendData,
    prompt: getPromptText,
  };
  practiceTrials.push(practice_fixation_block);
  practiceTrials.push(practice_block);
}

var refreshCount = 0;
var practiceNode = {
  timeline: practiceTrials,
  loop_function: function (data) {
    refreshCount += 1;
    current_trial = 0;

    var sum_rt = 0;
    var sum_responses = 0;
    var correct = 0;
    var total_trials = 0;

    for (var i = 0; i < data.length; i++) {
      if (data[i].trial_id == "refresh_trial") {
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
      '</p><p class = block-text style = "font-size:32px; line-height:1.2;">Please take this time to read your feedback and to take a short break!';

    if (accuracy < accuracy_thresh) {
      refresh_feedback_text +=
        '</p><p class = block-text style = "font-size:32px; line-height:1.2;"> Remember: <br>' +
        getPromptTextList();
    }

    if (missed_responses > missed_thresh) {
      refresh_feedback_text +=
        '</p><p class = block-text style = "font-size:32px; line-height:1.2;">You have not been responding to some trials.  Please respond on every trial that requires a response.';
    }

    if (ave_rt > rt_thresh) {
      refresh_feedback_text +=
        '</p><p class = block-text style = "font-size:32px; line-height:1.2;">You have been responding too slowly.';
    }

    refresh_feedback_text +=
      '</p><p class = block-text style = "font-size:32px; line-height:1.2;">Done with this practice. The test session will begin shortly.';

    task_conditions = des_events.slice(0, numTrialsPerBlock); //GRAB NEWEST BLOCKS WORTH OF TRIALS
    des_events = des_events.slice(numTrialsPerBlock); //SHAVE OFF THIS BLOCK FROM des_events
    stims = createTrialTypes(task_conditions, numTrialsPerBlock);
    exp_stage = "test";
    return false;
  },
};

var testTrial0 = [];
for (i = 0; i < numTrialsPerBlock + 1; i++) {
  var fixation_block = {
    type: "poldrack-single-stim",
    stimulus: getFixation,
    is_html: true,
    data: {
      trial_id: "fixation",
    },
    choices: "none",
    timing_post_trial: 0,
    timing_stim: getITI_stim,
    timing_response: getITI_resp,
  };

  var test_block = {
    type: "poldrack-single-stim",
    stimulus: getStim,
    is_html: true,
    data: {
      trial_id: "test_trial",
    },
    choices: getChoices(),
    fixation_default: true,
    timing_stim: 1000, //1000
    timing_response: 2000, //2000
    timing_post_trial: 0,
    response_ends_trial: false,
    on_finish: appendData,
  };
  testTrial0.push(fixation_block);
  testTrial0.push(test_block);
}

var testCount = 0;

var testNode0 = {
  timeline: testTrial0,
  loop_function: function (data) {
    console.log(data);
    testCount += 1;
    task_conditions = des_events.slice(0, numTrialsPerBlock); //GRAB NEWEST BLOCKS WORTH OF TRIALS
    des_events = des_events.slice(numTrialsPerBlock); //SHAVE OFF THIS BLOCK FROM des_events
    stims = createTrialTypes(task_conditions, numTrialsPerBlock);

    current_trial = 0;

    var sum_rt = 0;
    var sum_responses = 0;
    var correct = 0;
    var total_trials = 0;

    for (var i = 0; i < data.length; i++) {
      if (data[i].trial_id == "test_trial") {
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
      '</p><p class = block-text style = "font-size:32px; line-height:1.2;">Please take this time to read your feedback and to take a short break!';
    feedback_text +=
      '</p><p class = block-text style = "font-size:32px; line-height:1.2;"> You have completed: ' +
      testCount +
      " out of " +
      numTestBlocks +
      " blocks of trials.";

    if (accuracy < accuracy_thresh) {
      feedback_text +=
        '</p><p class = block-text style = "font-size:32px; line-height:1.2;"> Your accuracy is too low.  Remember: <br>' +
        getPromptTextList();
    }

    if (missed_responses > missed_thresh) {
      feedback_text +=
        '</p><p class = block-text style = "font-size:32px; line-height:1.2;"> You have not been responding to some trials.  Please respond on every trial that requires a response.';
    }

    if (ave_rt > rt_thresh) {
      feedback_text +=
        '</p><p class = block-text style = "font-size:32px; line-height:1.2;"> You have been responding too slowly.';
    }
    return false;
  },
};

var testTrials = [];
testTrials.push(feedback_block);
for (i = 0; i < numTrialsPerBlock + 1; i++) {
  var fixation_block = {
    type: "poldrack-single-stim",
    stimulus: getFixation,
    is_html: true,
    data: {
      trial_id: "fixation",
    },
    choices: "none",
    timing_post_trial: 0,
    timing_stim: getITI_stim,
    timing_response: getITI_resp,
  };

  var test_block = {
    type: "poldrack-single-stim",
    stimulus: getStim,
    is_html: true,
    data: {
      trial_id: "test_trial",
    },
    choices: getChoices(),
    fixation_default: true,
    timing_stim: 1000, //1000
    timing_response: 2000, //2000
    timing_post_trial: 0,
    response_ends_trial: false,
    on_finish: appendData,
  };
  testTrials.push(fixation_block);
  testTrials.push(test_block);
}

var testNode = {
  timeline: testTrials,
  loop_function: function (data) {
    testCount += 1;
    current_trial = 0;

    var sum_rt = 0;
    var sum_responses = 0;
    var correct = 0;
    var total_trials = 0;
    console.log(data);
    for (var i = 0; i < data.length; i++) {
      if (data[i].trial_id == "test_trial") {
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
      '</p><p class = block-text style = "font-size:32px; line-height:1.2;">Please take this time to read your feedback and to take a short break!';
    feedback_text +=
      '</p><p class = block-text style = "font-size:32px; line-height:1.2;"> You have completed: ' +
      testCount +
      " out of " +
      numTestBlocks +
      " blocks of trials.";
    console.log("testCount:", testCount, "numTestBlocks: ", numTestBlocks);
    if (accuracy < accuracy_thresh) {
      feedback_text +=
        '</p><p class = block-text style = "font-size:32px; line-height:1.2;"> Your accuracy is too low.  Remember: <br>' +
        getPromptTextList();
    }

    if (missed_responses > missed_thresh) {
      feedback_text +=
        '</p><p class = block-text style = "font-size:32px; line-height:1.2;"> You have not been responding to some trials.  Please respond on every trial that requires a response.';
    }

    if (ave_rt > rt_thresh) {
      feedback_text +=
        '</p><p class = block-text style = "font-size:32px; line-height:1.2;"> You have been responding too slowly.';
    }

    if (testCount == numTestBlocks) {
      feedback_text += "</p><p class = block-text>Done with this test.";

      return false;
    } else {
      task_conditions = des_events.slice(0, numTrialsPerBlock); //GRAB NEWEST BLOCKS WORTH OF TRIALS
      des_events = des_events.slice(numTrialsPerBlock); //SHAVE OFF THIS BLOCK FROM des_events
      stims = createTrialTypes(task_conditions, numTrialsPerBlock);
      console.log(stims);
      console.log(stims.length);
      return true;
    }
  },
};

/* ************************************ */
/*          Set up Experiment           */
/* ************************************ */

n_back_with_spatial_task_switching__fmri_experiment = [];
n_back_with_spatial_task_switching__fmri_experiment.push(design_setup_block);
n_back_with_spatial_task_switching__fmri_experiment.push(motor_setup_block);

test_keys(n_back_with_spatial_task_switching__fmri_experiment, [89, 71]);

n_back_with_spatial_task_switching__fmri_experiment.push(practiceNode);
n_back_with_spatial_task_switching__fmri_experiment.push(
  refresh_feedback_block
);

cni_bore_setup(n_back_with_spatial_task_switching__fmri_experiment);
n_back_with_spatial_task_switching__fmri_experiment.push(testNode0);
n_back_with_spatial_task_switching__fmri_experiment.push(testNode);
n_back_with_spatial_task_switching__fmri_experiment.push(feedback_block);

n_back_with_spatial_task_switching__fmri_experiment.push(end_block);
