/* ************************************ */
/* Define helper functions */
/* ************************************ */
function addID() {
  jsPsych.data.addDataToLastTrial({
    exp_id: "cued_task_switching_with_directed_forgetting__practice",
  });
}

function getMotorPerm() {
  return motor_perm;
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

function assessPerformance() {
  /* Function to calculate the "credit_var", which is a boolean used to
	credit individual experiments in expfactory. */
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
    choice_counts[possible_responses[k]] = 0;
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

var getFeedback = function () {
  console.log("getFeedback");
  return (
    "<div class = bigbox><div class = picture_box><p class = block-text>" +
    feedback_text +
    "</p></div></div>"
  );
};

var getCategorizeFeedback = function () {
  curr_trial = jsPsych.progress().current_trial_global - 1;
  trial_id = jsPsych.data.getDataByTrialIndex(curr_trial).trial_id;
  if (trial_id == "practice_trial") {
    if (
      jsPsych.data.getDataByTrialIndex(curr_trial).key_press ==
      jsPsych.data.getDataByTrialIndex(curr_trial).correct_response
    ) {
      return "<div class = fb_box><div class = center-text><font size = 20>Correct!</font></div></div>";
    } else if (
      jsPsych.data.getDataByTrialIndex(curr_trial).key_press !=
        jsPsych.data.getDataByTrialIndex(curr_trial).correct_response &&
      jsPsych.data.getDataByTrialIndex(curr_trial).key_press != -1
    ) {
      return "<div class = fb_box><div class = center-text><font size = 20>Incorrect</font></div></div>";
    } else if (jsPsych.data.getDataByTrialIndex(curr_trial).key_press == -1) {
      return "<div class = fb_box><div class = center-text><font size = 20>Respond Faster!</font></div></div>";
    }
  }
};

var randomDraw = function (lst) {
  var index = Math.floor(Math.random() * lst.length);
  return lst[index];
};

var createTrialTypes = function (numTrialsPerBlock) {
  var temp_index = Math.floor(Math.random() * 2);

  cued_dimension = cued_dimensions[temp_index];
  task_cue = cues[temp_index][Math.floor(Math.random() * 2)];

  directed_condition = directed_cond_array[Math.floor(Math.random() * 4)];

  var stims = [];
  var first_stim = {
    task_condition: "N/A",
    cued_condition: "N/A",
    cued_dimension: cued_dimension,
    directed_condition: directed_condition,
  };

  if (numTrialsPerBlock == refresh_len) {
    stims = [];
    for (
      var numIterations = 0;
      numIterations <
      numTrialsPerBlock /
        (directed_cond_array.length *
          task_conditions.length *
          cued_conditions.length);
      numIterations++
    ) {
      for (
        var numDirectedConds = 0;
        numDirectedConds < directed_cond_array.length;
        numDirectedConds++
      ) {
        for (
          var numTaskConds = 0;
          numTaskConds < task_conditions.length;
          numTaskConds++
        ) {
          for (
            var numCuedConds = 0;
            numCuedConds < cued_conditions.length;
            numCuedConds++
          ) {
            cued_dimension = "N/A";
            task_condition = task_conditions[numTaskConds];
            cued_condition = cued_conditions[numCuedConds];
            directed_condition = directed_cond_array[numDirectedConds];

            stim = {
              cued_dimension: cued_dimension,
              task_condition: task_condition,
              cued_condition: cued_condition,
              directed_condition: directed_condition,
            };

            stims.push(stim);
          }
        }
      }
    }

    stims = jsPsych.randomization.repeat(stims, 1);
    stims = stims.slice(0, refresh_len);
  } else {
    stims = [];
    curr_des_events = des_events.slice(0, numTrialsPerBlock);
    des_events = des_events.slice(numTrialsPerBlock); //grab this block's event

    for (var i = 0; i < numTrialsPerBlock; i++) {
      var cued_dimension = "N/A";
      var task_condition = getCuedTaskCondition(curr_des_events[i]);
      var cued_condition = getCuedCueCondition(curr_des_events[i]);

      var directed_condition = curr_des_events[i].split("_")[0];

      stim = {
        cued_dimension: cued_dimension,
        task_condition: task_condition,
        cued_condition: cued_condition,
        directed_condition: directed_condition,
      };
      stims.unshift(stim);

      used_letters = used_letters.concat(letters);
    }
  }

  stims.push(first_stim);
  stim_len = stims.length;

  used_letters = [];

  var new_stims = [];
  for (var i = 0; i < stim_len; i++) {
    if (i > 0) {
      last_dim = cued_dimension;
      last_task_cue = task_cue;
    }

    stim = stims.pop();
    cued_condition = stim.cued_condition;
    task_condition = stim.task_condition;
    directed_condition = stim.directed_condition;
    cued_dimension = stim.cued_dimension;

    if (task_condition == "switch") {
      cued_condition = "switch";
      cued_dimension = randomDraw(
        ["forget", "remember"].filter(function (y) {
          return $.inArray(y, [last_dim]) == -1;
        })
      );
      if (cued_dimension == "forget") {
        temp_index = 1;
        task_cue = randomDraw(
          cues[temp_index].filter(function (y) {
            return $.inArray(y, [last_task_cue]) == -1;
          })
        );
      } else if (cued_dimension == "remember") {
        temp_index = 0;
        task_cue = randomDraw(
          cues[temp_index].filter(function (y) {
            return $.inArray(y, [last_task_cue]) == -1;
          })
        );
      }
    } else if (task_condition == "stay") {
      cued_dimension = last_dim;

      if (cued_condition == "switch") {
        if (cued_dimension == "forget") {
          temp_index = 1;
          task_cue = randomDraw(
            cues[temp_index].filter(function (y) {
              return $.inArray(y, [last_task_cue]) == -1;
            })
          );
        } else if (cued_dimension == "remember") {
          temp_index = 0;
          task_cue = randomDraw(
            cues[temp_index].filter(function (y) {
              return $.inArray(y, [last_task_cue]) == -1;
            })
          );
        }
      } else if (cued_condition == "stay") {
        task_cue = last_task_cue;
      }
    }

    letters = getTrainingSet(used_letters, numLetters);
    cue = getCue();
    probe = getProbe(directed_condition, letters, cue, cued_dimension);
    correct_response = getCorrectResponse(cued_dimension, cue, probe, letters);
    stim = {
      task_condition: task_condition,
      cued_condition: cued_condition,
      cued_dimension: cued_dimension,
      directed_condition: directed_condition,
      letters: letters,
      cue: cue,
      probe: probe,
      correct_response: correct_response,
      task_cue: task_cue,
    };

    new_stims.push(stim);

    used_letters = used_letters.concat(letters);
  }
  return new_stims;
};

function getCuedCueCondition(text) {
  cued = text.split("_")[1] + text.split("_")[2];
  if (cued == "tstaycstay") {
    return "stay";
  } else if (cued == "tswitchcswitch") {
    return "switch";
  } else if (cued == "tstaycswitch") {
    return "switch";
  }
}

function getCuedTaskCondition(text) {
  cued = text.split("_")[1] + text.split("_")[2];
  if (cued == "tstaycstay") {
    return "stay";
  } else if (cued == "tswitchcswitch") {
    return "switch";
  } else if (cued == "tstaycswitch") {
    return "stay";
  }
}

//this is an algorithm to choose the training set based on rules of the game (training sets are composed of any letter not presented in the last two training sets)
var getTrainingSet = function (used_letters, numLetters) {
  var trainingArray = jsPsych.randomization.repeat(stimArray, 1);
  var letters = trainingArray
    .filter(function (y) {
      return jQuery.inArray(y, used_letters.slice(-numLetters * 2)) == -1;
    })
    .slice(0, numLetters);

  return letters;
};

//returns a cue randomly, either TOP or BOT
var getCue = function () {
  cue = directed_cue_array[Math.floor(Math.random() * 2)];

  return cue;
};

// Will pop out a probe type from the entire probeTypeArray and then choose a probe congruent with the probe type
var getProbe = function (directed_cond, letters, cue, cued_dimension) {
  var trainingArray = jsPsych.randomization.repeat(stimArray, 1);
  var lastCue = cue;
  var lastSet_top = letters.slice(0, numLetters / 2);
  var lastSet_bottom = letters.slice(numLetters / 2);
  if (cued_dimension == "forget") {
    if (directed_cond == "pos") {
      if (lastCue == "BOT") {
        probe = lastSet_top[Math.floor((Math.random() * numLetters) / 2)];
      } else if (lastCue == "TOP") {
        probe = lastSet_bottom[Math.floor((Math.random() * numLetters) / 2)];
      }
    } else if (directed_cond == "neg") {
      if (lastCue == "BOT") {
        probe = lastSet_bottom[Math.floor((Math.random() * numLetters) / 2)];
      } else if (lastCue == "TOP") {
        probe = lastSet_top[Math.floor((Math.random() * numLetters) / 2)];
      }
    } else if (directed_cond == "con") {
      newArray = trainingArray.filter(function (y) {
        return (
          y != lastSet_top[0] &&
          y != lastSet_top[1] &&
          y != lastSet_bottom[0] &&
          y != lastSet_bottom[1]
        );
      });
      probe = newArray.pop();
    }
  } else if (cued_dimension == "remember") {
    if (directed_cond == "pos") {
      if (lastCue == "BOT") {
        probe = lastSet_bottom[Math.floor((Math.random() * numLetters) / 2)];
      } else if (lastCue == "TOP") {
        probe = lastSet_top[Math.floor((Math.random() * numLetters) / 2)];
      }
    } else if (directed_cond == "neg") {
      if (lastCue == "BOT") {
        probe = lastSet_top[Math.floor((Math.random() * numLetters) / 2)];
      } else if (lastCue == "TOP") {
        probe = lastSet_bottom[Math.floor((Math.random() * numLetters) / 2)];
      }
    } else if (directed_cond == "con") {
      newArray = trainingArray.filter(function (y) {
        return (
          y != lastSet_top[0] &&
          y != lastSet_top[1] &&
          y != lastSet_bottom[0] &&
          y != lastSet_bottom[1]
        );
      });
      probe = newArray.pop();
    }
  }

  return probe;
};

var getCorrectResponse = function (cued_dimension, cue, probe, letters) {
  if (cued_dimension == "remember") {
    if (cue == "TOP") {
      if (jQuery.inArray(probe, letters.slice(0, numLetters / 2)) != -1) {
        return getPossibleResponses()[0][1];
      } else {
        return getPossibleResponses()[1][1];
      }
    } else if (cue == "BOT") {
      if (jQuery.inArray(probe, letters.slice(numLetters / 2)) != -1) {
        return getPossibleResponses()[0][1];
      } else {
        return getPossibleResponses()[1][1];
      }
    }
  } else if (cued_dimension == "forget") {
    if (cue == "TOP") {
      if (jQuery.inArray(probe, letters.slice(numLetters / 2)) != -1) {
        return getPossibleResponses()[0][1];
      } else {
        return getPossibleResponses()[1][1];
      }
    } else if (cue == "BOT") {
      if (jQuery.inArray(probe, letters.slice(0, numLetters / 2)) != -1) {
        return getPossibleResponses()[0][1];
      } else {
        return getPossibleResponses()[1][1];
      }
    }
  }
};

var getResponse = function () {
  return correct_response;
};

var appendData = function () {
  curr_trial = jsPsych.progress().current_trial_global;
  trial_id = jsPsych.data.getDataByTrialIndex(curr_trial).trial_id;

  if (trial_id == "practice_trial") {
    current_block = 0;
  } else if (trial_id == "test_trial") {
    current_block = testCount;
  }

  current_trial += 1;

  var lastSet_top = letters.slice(0, numLetters / 2);
  var lastSet_bottom = letters.slice(numLetters / 2);

  jsPsych.data.addDataToLastTrial({
    task_condition: task_condition,
    cue_condition: cued_condition,
    task_cue: task_cue,
    cued_dimension: cued_dimension,
    directed_forgetting_condition: directed_condition,
    probe: probe,
    directed_forgetting_cue: cue,
    correct_response: correct_response,
    current_trial: current_trial,
    top_stim: lastSet_top,
    bottom_stim: lastSet_bottom,
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

var getFixation = function () {
  return '<div class = bigbox><div class = centerbox><div class = fixation><span style="color:white">+</span></font></div></div></div>';
};

var getTrainingStim = function () {
  return (
    task_boards[0] +
    preFileType +
    letters[0] +
    fileTypePNG +
    task_boards[1] +
    task_boards[2] +
    preFileType +
    letters[1] +
    fileTypePNG +
    task_boards[3] +
    preFileType +
    letters[2] +
    fileTypePNG +
    task_boards[4] +
    task_boards[5] +
    preFileType +
    letters[3] +
    fileTypePNG +
    task_boards[6]
  );
};

var getDirectedCueStim = function () {
  return (
    "<div class = bigbox><div class = centerbox><div class = cue-text>" +
    preFileType +
    cue +
    fileTypePNG +
    "</div></div></div>"
  );
};

var getSwitchingCueStim = function () {
  stim = stims.shift();
  task_condition = stim.task_condition;
  cued_condition = stim.cued_condition;
  cued_dimension = stim.cued_dimension;
  directed_condition = stim.directed_condition;
  probe = stim.probe;
  letters = stim.letters;
  cue = stim.cue;
  correct_response = stim.correct_response;
  task_cue = stim.task_cue;

  return (
    "<div class = bigbox><div class = centerbox><div class = cue-text>" +
    preFileType +
    task_cue +
    fileTypePNG +
    "</div></div></div>"
  );
};

var getProbeStim = function () {
  return (
    "<div class = bigbox><div class = centerbox><div class = cue-text>" +
    preFileType +
    probe +
    fileTypePNG +
    "</div></div></div>"
  );
};

function getChoices() {
  if (getMotorPerm() == 0) {
    return [choices[1], choices[0]];
  } else if (getMotorPerm() == 1) {
    return choices;
  }
}

function getPossibleResponses() {
  if (getMotorPerm() == 0) {
    return possible_responses;
  } else if (getMotorPerm() == 1) {
    return [
      ["middle finger", 39],
      ["index finger", 37],
    ];
  }
}

function getPromptTaskList() {
  return (
    '<ul style="text-align:left"><font color="white">' +
    "<li>Cue was " +
    cued_dimensions[0] +
    " : " +
    cued_dimensions[0] +
    " the cued location</li>" +
    "<li>Cue was " +
    cued_dimensions[1] +
    " : " +
    cued_dimensions[1] +
    " the cued location</li>" +
    "<li>Please respond if the probe (single letter) was in the memory set.</li>" +
    "<li>In memory set: " +
    getPossibleResponses()[0][0] +
    "</li>" +
    "<li>Not in memory set: " +
    getPossibleResponses()[1][0] +
    "</li>" +
    "</ul>"
  );
}

function getRefreshFeedback() {
  console.log("refresh feedback");
  if (getRefreshTrialID() == "instructions") {
    return (
      '<div class = bigbox><div class = picture_box><p class = instruct-text><font color="white"><div class = instructbox>' +
      "<p class = instruct-text>In this experiment you will be presented with a cue, either remember (or retain) or forget (or disregard). This cue instructs what kind of task you will be doing for that trial.</p> " +
      "<p class = instruct-text>After the remember (or retain) or forget (or disregard) cue disappears, you will be presented with 4 letters. You must memorize all 4 letters.</p> " +
      "<p class =instruct-text>After the 4 letters disappear, you will see another cue, either TOP or BOT. This instructs you which letters you should remember or forget, either the top or bottom letters.</p>" +
      "<p class = instruct-text> For example, if the first cue was forget and the second cue was TOP, please forget the top 2 letters. <i>The other 2 letters are called your memory set!</i></p>" +
      "<p class = instruct-text>If you see the cue, " +
      cued_dimensions[0] +
      ", please  <i>" +
      cued_dimensions[0] +
      "</i> the cued set.</p>" +
      "<p class = instruct-text>If you see the cue, " +
      cued_dimensions[1] +
      ", please  <i>" +
      cued_dimensions[1] +
      "</i> the cued set.</p>" +
      "<p class = instruct-text>After, you will be presented with a probe (single letter).  Please indicate whether this probe was in your memory set.</p>" +
      "<p class = instruct-text>Press the <i>" +
      getPossibleResponses()[0][0] +
      "  </i>if the probe was in the memory set, and the <i>" +
      getPossibleResponses()[1][0] +
      "  </i>if not.</p>" +
      "<p class = instruct-text>Please respond to the probe as quickly and accurately as possible.</p>" +
      "<p class = instruct-text>During practice, you will receive a reminder of the rules.  <i>This reminder will be taken out for test</i>. Please press any button to let the researchers know you are ready to start.</p>" +
      "</div>"
    );
  } else {
    return (
      '<div class = bigbox><div class = picture_box><p class = instruct-text><font color="white">' +
      feedback_text +
      "</font></p></div></div>"
    );
  }
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

var getTestFeedback = function () {
  return (
    "<div class = bigbox><div class = picture_box><p class = block-text>" +
    test_feedback_text +
    "</p></div></div>"
  );
};

var getNextStim = function () {
  stim = stims.shift();
  cued_condition = stim.cued_condition;
  task_condition = stim.task_condition;
  cued_dimension = stim.cued_dimension;
  directed_condition = stim.directed_condition;
  probe = stim.probe;
  letters = stim.letters;
  cue = stim.cue;
  correct_response = stim.correct_response;

  return stim;
};

/* ************************************ */
/* Define experimental variables */
/* ************************************ */
// generic task variables
var sumInstructTime = 0; //ms
var instructTimeThresh = 0; ///in seconds
var credit_var = 0;

var motor_perm = 0;

var refresh_trial_id = "instructions";
var refresh_feedback_timing = -1;
var refresh_response_ends = true;

// new vars
var refresh_len = 8; // must be divisible by 16
var exp_len = 96; // must be divisible by 16
var numTrialsPerBlock = 32; // divisible by 16
var numTestBlocks = exp_len / numTrialsPerBlock;
var choices = [71, 89];

var accuracy_thresh = 0.75;
var rt_thresh = 1000;
var missed_thresh = 0.1;
var practice_thresh = 3; // 3 blocks of 16 trials
var numLetters = 4;

var directed_cond_array = ["pos", "pos", "neg", "con"];
var directed_cue_array = ["TOP", "BOT"];
var task_conditions = jsPsych.randomization.repeat(["stay", "switch"], 1);
var cued_conditions = jsPsych.randomization.repeat(["stay", "switch"], 1);

var cues = [
  ["retain", "remember"],
  ["forget", "disregard"],
];
var cued_dimensions = ["remember", "forget"];

var possible_responses = [
  ["index finger", 37],
  ["middle finger", 39],
];

var current_trial = 0;

var fileTypePNG = ".png'></img>";
var preFileType =
  "<img class = center src='/static/experiments/cued_task_switching_with_directed_forgetting__practice/images/";
var pathDesignSource =
  "/static/experiments/cued_task_switching_with_directed_forgetting__practice/designs/"; //ADDED FOR fMRI SEQUENCES

var stimArray = [
  "A",
  "B",
  "C",
  "D",
  "E",
  "F",
  "G",
  "H",
  "I",
  "J",
  "K",
  "L",
  "M",
  "N",
  "O",
  "P",
  "Q",
  "R",
  "S",
  "T",
  "U",
  "V",
  "W",
  "X",
  "Y",
  "Z",
];

var task_boards = [
  [
    '<div class = bigbox><div class = lettersBox><div class = topLeft style="font-size:50px;"><div class = cue-text>',
  ],
  [
    '</div></div><div class = topMiddle style="font-size:50px;"><div class = cue-text>',
  ],
  [
    '</div></div><div class = topRight style="font-size:50px;"><div class = cue-text>',
  ],
  [
    '</div></div><div class = bottomLeft style="font-size:50px;"><div class = cue-text>',
  ],
  [
    '</div></div><div class = bottomMiddle style="font-size:50px;"><div class = cue-text>',
  ],
  [
    '</div></div><div class = bottomRight style="font-size:50px;"><div class = cue-text>',
  ],
  ["</div></div></div></div>"],
];

var prompt_text_list =
  '<ul style="text-align:left">' +
  "<li>Cue was " +
  cued_dimensions[0] +
  " : " +
  cued_dimensions[0] +
  " the cued location</li>" +
  "<li>Cue was " +
  cued_dimensions[1] +
  " : " +
  cued_dimensions[1] +
  " the cued location</li>" +
  "<li>Please respond if the probe (single letter) was in the memory set.</li>" +
  "<li>In memory set: " +
  getPossibleResponses() +
  "</li>" +
  "<li>Not in memory set: " +
  getPossibleResponses() +
  "</li>" +
  "</ul>";

var prompt_text =
  "<div class = prompt_box>" +
  '<p class = center-block-text style = "font-size:16px; line-height:80%%;">Cue was ' +
  cued_dimensions[0] +
  " : " +
  cued_dimensions[0] +
  " the cued location</p>" +
  '<p class = center-block-text style = "font-size:16px; line-height:80%%;">Cue was ' +
  cued_dimensions[1] +
  " : " +
  cued_dimensions[1] +
  " the cued location</p>" +
  '<p class = center-block-text style = "font-size:16px; line-height:80%%;">Please respond if the probe (single letter) was in the memory set.</p>' +
  '<p class = center-block-text style = "font-size:16px; line-height:80%%;">In memory set: ' +
  getPossibleResponses() +
  "</p>" +
  '<p class = center-block-text style = "font-size:16px; line-height:80%%;">Not in memory set: ' +
  getPossibleResponses() +
  "</p>" +
  "</div>";

//PRE LOAD IMAGES HERE
var pathSource =
  "/static/experiments/cued_task_switching_with_directed_forgetting__practice/images/";
var images = [];

for (i = 0; i < stimArray.length; i++) {
  images.push(pathSource + stimArray[i] + ".png");
}

images.push(pathSource + "BOT.png");
images.push(pathSource + "TOP.png");
images.push(pathSource + "remember.png");
images.push(pathSource + "retain.png");
images.push(pathSource + "forget.png");
images.push(pathSource + "disregard.png");
jsPsych.pluginAPI.preloadImages(images);

var stims = [];

/* ************************************ */
/* Set up jsPsych blocks */
/* ************************************ */

var motor_setup_block = {
  type: "survey-text",
  data: {
    trial_id: "motor_setup",
  },
  questions: [["<p class = center-block-text>motor permutation (0-1):</p>"]],
  on_finish: function (data) {
    motor_perm = parseInt(data.responses.slice(7, 10));
    stims = createTrialTypes(refresh_len);
  },
};

var refresh_feedback_block = {
  type: "poldrack-single-stim",
  data: {
    trial_id: getRefreshTrialID,
  },
  choices: [32],
  stimulus: getRefreshFeedback,
  timing_post_trial: 0,
  is_html: true,
  timing_response: getRefreshFeedbackTiming, //10 seconds for feedback
  timing_stim: getRefreshFeedbackTiming,
  response_ends_trial: getRefreshResponseEnds,
  on_finish: function () {
    refresh_trial_id = "practice-no-stop-feedback";
    refresh_feedback_timing = 10000;
    refresh_response_ends = false;
  },
};
var end_block = {
  type: "poldrack-text",
  data: {
    trial_id: "end",
  },
  timing_response: 180000,
  text: "<div class = centerbox><p class = center-block-text>Thanks for completing this task!</p><p class = center-block-text>Press <i>enter</i> to continue.</p></div>",
  cont_key: [13],
  timing_post_trial: 0,
  on_finish: function () {
    assessPerformance();
  },
};

/// This ensures that the subject does not read through the instructions too quickly.  If they do it too quickly, then we will go over the loop again.
var instructions_block = {
  type: "poldrack-single-stim",
  data: {
    trial_id: getRefreshTrialID,
  },
  choices: [32],
  stimulus: getRefreshFeedback,
  timing_post_trial: 0,
  is_html: true,
  timing_response: -1, //10 seconds for feedback
  timing_stim: -1,
  response_ends_trial: true,
  on_finish: function () {
    refresh_trial_id = "practice-no-stop-feedback";
    practice_feedback_timing = 10000;
    practice_response_ends = false;
  },
};

var feedback_instruct_text =
  "Welcome to the experiment. This task will take around 30 minutes. Press <i>enter</i> to begin.";

var feedback_instruct_block = {
  type: "poldrack-text",
  data: {
    trial_id: "practice_feedback",
  },
  cont_key: [32],
  text: getFeedback,
  timing_post_trial: 0,
  is_html: true,
  timing_response: 10000,
  response_ends_trial: true,
};

var test_feedback_block = {
  type: "poldrack-single-stim",
  data: {
    trial_id: "test_feedback",
  },
  choices: "none",
  stimulus: getTestFeedback,
  timing_post_trial: 0,
  is_html: true,
  timing_response: 10000,
  response_ends_trial: false, // HJ CHANGE
};

var refreshTrials = [];
refreshTrials.push(instructions_block);
for (i = 0; i < refresh_len + 1; i++) {
  var start_fixation_block = {
    type: "poldrack-single-stim",
    stimulus: getFixation,
    is_html: true,
    choices: "none",
    data: {
      trial_id: "practice_start_fixation",
    },
    timing_post_trial: 0,
    timing_stim: 500, //500
    timing_response: 500, //500
    prompt: getPromptTaskList,
  };

  var fixation_block = {
    type: "poldrack-single-stim",
    stimulus: getFixation,
    is_html: true,
    choices: "none",
    data: {
      trial_id: "practice_fixation",
    },
    timing_post_trial: 0,
    timing_stim: 2000, //2000
    timing_response: 2000, //2000
    prompt: getPromptTaskList,
  };

  var training_block = {
    type: "poldrack-single-stim",
    stimulus: getTrainingStim,
    is_html: true,
    data: {
      trial_id: "practice_four_letters",
    },
    choices: "none",
    timing_post_trial: 0,
    timing_stim: 2000, //2000
    timing_response: 2000, //2000
    prompt: getPromptTaskList,
  };

  var cue_directed_block = {
    type: "poldrack-single-stim",
    stimulus: getDirectedCueStim,
    is_html: true,
    data: {
      trial_id: "practice_directed_cue",
    },
    choices: false,
    timing_post_trial: 0,
    timing_stim: 1000, //1000
    timing_response: 1000, //1000
    prompt: getPromptTaskList,
  };

  var cue_switching_block = {
    type: "poldrack-single-stim",
    stimulus: getSwitchingCueStim,
    is_html: true,
    data: {
      trial_id: "practice_switching_cue",
    },
    choices: false,
    timing_post_trial: 0,
    timing_stim: 150, //1000
    timing_response: 150, //1000
    prompt: getPromptTaskList,
  };

  var practice_probe_block = {
    type: "poldrack-single-stim",
    stimulus: getProbeStim,
    choices: [getPossibleResponses()[0][1], getPossibleResponses()[1][1]],
    data: { trial_id: "practice_trial" },
    timing_stim: 1000, //1000
    timing_response: 2000, //1000
    is_html: true,
    on_finish: appendData,
    prompt: getPromptTaskList,
    timing_post_trial: 0,
  };

  var categorize_block = {
    type: "poldrack-single-stim",
    data: {
      trial_id: "practice-stop-feedback",
    },
    choices: "none",
    stimulus: getCategorizeFeedback,
    timing_post_trial: 0,
    is_html: true,
    timing_stim: 500, //500
    timing_response: 500, //500
    prompt: getPromptTaskList,
    response_ends_trial: false,
  };
  refreshTrials.push(start_fixation_block);
  refreshTrials.push(cue_switching_block);
  refreshTrials.push(training_block);
  refreshTrials.push(cue_directed_block);
  refreshTrials.push(fixation_block);
  refreshTrials.push(practice_probe_block);
  refreshTrials.push(categorize_block);
}

var refreshCount = 0;
var refreshNode = {
  timeline: refreshTrials,
  loop_function: function (data) {
    refreshCount += 1;
    current_trial = 0;
    stims = createTrialTypes(refresh_len);

    var sum_rt = 0;
    var sum_responses = 0;
    var correct = 0;
    var total_trials = 0;

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
      }
    }

    var accuracy = correct / total_trials;
    var missed_responses = (total_trials - sum_responses) / total_trials;
    var ave_rt = sum_rt / sum_responses;

    feedback_text =
      "<br>Please take this time to read your feedback and to take a short break! Press space to continue";

    if (accuracy > accuracy_thresh) {
      feedback_text +=
        "</p><p class = block-text>Done with this practice. Press Enter to continue.";
      return false;
    } else if (accuracy < accuracy_thresh) {
      feedback_text +=
        "</p><p class = block-text>We are going to try practice again to see if you can achieve higher accuracy.  Remember: <br>" +
        getPromptTaskList();

      if (missed_responses > missed_thresh) {
        feedback_text +=
          "</p><p class = block-text>You have not been responding to some trials.  Please respond on every trial that requires a response.";
      }

      if (ave_rt > rt_thresh) {
        feedback_text +=
          "</p><p class = block-text>You have been responding too slowly.";
      }

      if (refreshCount == practice_thresh) {
        feedback_text += "</p><p class = block-text>Done with this practice.";
        return false;
      }

      feedback_text +=
        "</p><p class = block-text>Redoing this practice. Press space to continue.";

      return true;
    }
  },
};

/* create experiment definition array */
var cued_task_switching_with_directed_forgetting__practice_experiment = [];

cued_task_switching_with_directed_forgetting__practice_experiment.push(
  motor_setup_block
); //exp_input

cued_task_switching_with_directed_forgetting__practice_experiment.push(
  refreshNode
);
cued_task_switching_with_directed_forgetting__practice_experiment.push(
  feedback_instruct_block
);

cued_task_switching_with_directed_forgetting__practice_experiment.push(
  end_block
);
