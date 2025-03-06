$(document).ready(function (e) {
  $("#makePred").click(function () {
    // Clear previous results
    $("#hfProb").empty();
    $("#hfPred").empty();
    $("#userInputValues").empty();

    // Get user input values
    var sex = $("#sex").val();
    var restingECG = $("#restingECG").val();
    var cpt = $("#chestPainType").val();
    var exerciseAngina = $("#exerciseAngina").val();
    var sts = $("#stSlope").val();
    var age = $("#age").val();
    var bp = $("#restingBP").val();
    var chol = $("#cholesterol").val();
    var bs = $("#fastingBS").val();
    var maxHR = $("#maxHR").val();
    var oldpeak = $("#oldpeak").val();

    // Input Validation
    let isValid = true;
    let errorMessage = "";

    // Validate Age
    if (age < 0 || age > 120 || isNaN(age)) {
      isValid = false;
      errorMessage += "Age must be between 0 and 120.<br>";
    }

    // Validate Resting Blood Pressure
    if (bp < 0 || bp > 300 || isNaN(bp)) {
      isValid = false;
      errorMessage += "Resting Blood Pressure must be between 0 and 300.<br>";
    }

    // Validate Cholesterol
    if (chol < 0 || chol > 700 || isNaN(chol)) {
      isValid = false;
      errorMessage += "Cholesterol must be between 0 and 700.<br>";
    }

    // Validate Fasting Blood Sugar
    if (bs < 0 || bs > 1 || isNaN(bs)) {
      isValid = false;
      errorMessage += "Fasting Blood Sugar must be either 0 or 1.<br>";
    }

    // Validate Max Heart Rate
    if (maxHR < 50 || maxHR > 300 || isNaN(maxHR)) {
      isValid = false;
      errorMessage += "Max Heart Rate must be between 50 and 300.<br>";
    }

    // Validate Oldpeak
    if (oldpeak < -3 || oldpeak > 7 || isNaN(oldpeak)) {
      isValid = false;
      errorMessage += "Oldpeak must be between -3 and 7.<br>";
    }

    // If validation fails, show error message and stop
    if (!isValid) {
      $("#hfProb").html(
        `<div class="alert alert-danger" role="alert">${errorMessage}</div>`
      );
      return;
    }

    // Display user input values
    $("#userInputValues").append(`
          <p><strong>Sex:</strong> ${sex}</p>
          <p><strong>Resting ECG:</strong> ${restingECG}</p>
          <p><strong>Chest Pain Type:</strong> ${cpt}</p>
          <p><strong>Exercise Angina:</strong> ${exerciseAngina}</p>
          <p><strong>ST Slope:</strong> ${sts}</p>
          <p><strong>Age:</strong> ${age}</p>
          <p><strong>Resting Blood Pressure:</strong> ${bp}</p>
          <p><strong>Cholesterol:</strong> ${chol}</p>
          <p><strong>Fasting Blood Sugar:</strong> ${bs}</p>
          <p><strong>Max Heart Rate:</strong> ${maxHR}</p>
          <p><strong>Oldpeak:</strong> ${oldpeak}</p>
      `);

    // Prepare input data for the model
    var inputData = {
      sex: sex,
      restingECG: restingECG,
      cpt: cpt,
      exerciseAngina: exerciseAngina,
      sts: sts,
      age: age,
      bp: bp,
      chol: chol,
      bs: bs,
      maxHR: maxHR,
      oldpeak: oldpeak,
    };

    // Send data to the server
    $.ajax({
      url: "main/api/make_prediction",
      data: inputData,
      type: "post",
      success: function (response) {
        console.log(response);

        // Hide the loader
        $("#loader").hide();

        // Display the prediction result
        $("#hfProb").append(`
                  <p style="color:white; font-size: 25px; font-weight: bold;">
                      Patient has a ${
                        response["pred"]
                      } probability of heart failure (${(
          response["pred"] * 100
        )}%)
                  </p>
              `);

        // Add the message and button
        $("#hfProb").append(`
                  <p style="color:white; font-size: 18px; margin-top: 10px;">
                      Your wellness journey starts here! Share your details with the chatbot for a custom diet and habit plan.
                  </p>
                  <button id="goToChatbotBtn" style="margin-bottom: 40px; padding: 10px 20px; background-color:rgb(0, 44, 94); color: white; border: none; border-radius: 5px; cursor: pointer;">
                      Go to Chatbot <i class='bx bx-right-arrow-alt'></i>
                  </button>
              `);

        // Get the chatbot URL from the hidden input field
        var chatbotUrl = $("#chatbotUrl").val();

        // Add event listener for the "Go to Chatbot" button
        $("#goToChatbotBtn").click(function () {
          window.location.href = chatbotUrl; // Redirect to the chatbot page
        });

        // Display the plot
        var figure = JSON.parse(response["plot"]);
        Plotly.newPlot("hfPlot", figure.data, figure.layout, {
          displayModeBar: false,
          responsive: true,
        });
      },
      error: function (xhr, status, error) {
        // Hide the loader on error
        $("#loader").hide();

        $("#hfProb").html(
          `<div class="alert alert-danger" role="alert">An error occurred while making the prediction. Please try again.</div>`
        );
      },
    });
  });
});
