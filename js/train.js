import { createChart, updateChart } from "../libraries/scatterplot.js";

let nn;

// Getting DOM elements
const memoryInputField = document.getElementById("memory-input-field");
const resoloutionInputField = document.getElementById(
  "resoloution-input-field"
);
const batteryInputField = document.getElementById("battery-input-field");
const coresInputField = document.getElementById("cores-input-field");
const predictButton = document.getElementById("prediction-btn");
const saveButton = document.getElementById("save-btn");
const resultDiv = document.getElementById("result");


predictButton.style.display = "none";
saveButton.style.display = "none";


predictButton.addEventListener("click", (e) => {
  e.preventDefault();
  let memoryInputFieldValue =
    document.getElementById("memory-input-field").value;
  let resoloutionInputFieldValue = document.getElementById(
    "resoloution-input-field"
  ).value;
  let batteryInputFieldValue = document.getElementById("battery-input-field").value;
  let coresInputFieldValue = document.getElementById("cores-input-field").value;
  makePrediction(
    +memoryInputFieldValue,
    +resoloutionInputFieldValue,
    +batteryInputFieldValue,
    +coresInputFieldValue
  );
});

/**
 * Save the trained model
 */
saveButton.addEventListener("click", (e) => {
  e.preventDefault();
  nn.save();
});

/**
 * Preparing the data
 */
function loadData() {
  Papa.parse("./data/mobilephone.csv", {
    download: true,
    header: true,
    dynamicTyping: true,
    complete: (results) => createNeuralNetwork(results.data),
  });
}

/**
 * Creating a Neural Network
 */
function createNeuralNetwork(data) {
  data.sort(() => Math.random() - 0.5);
  // Slice data into test and training data
  let trainData = data.slice(0, Math.floor(data.length * 0.8));
  let testData = data.slice(Math.floor(data.length * 0.8) + 1);
  console.table(testData);

  nn = ml5.neuralNetwork({
    task: "regression",
    debug: true,
  });

  // Adding data to the Neural Network
  for (let mobilePhone of trainData) {
    let inputs = {
      memory: mobilePhone.memory,
      resoloution: mobilePhone.resoloution,
      battery: mobilePhone.battery,
      cores: mobilePhone.cores,
    };
    let label = mobilePhone.price > 2500 ? 1 : 0; 
    nn.addData(inputs, { label });
  }

  // Normalize
  nn.normalizeData();

  //Pass data to next function
  checkData(trainData, testData);
}

/**
 * Checks if loading of CSV file was succesful
 */
function checkData(trainData, testData) {
  console.table(testData);



  // Prepare the data for the scatterplot
  const chartdata = trainData.map((mobilePhone) => ({
    x: mobilePhone.price,
    y: mobilePhone.memory,
  }));

  // Create a scatterplot
  createChart(chartdata, "memory", "Price");

  // Pass data to next function
  startTraining(trainData, testData);
}

/**
 * Trains the neural network
 * epochs: A value that should be as close as possible to value 0
 */
function startTraining(trainData, testData) {
  nn.train({ epochs: 20 }, () => finishedTraining(trainData, testData));
}

async function finishedTraining(trainData = false, testData) {
  // Empty array to push all the data in
  let predictions = [];

  // For loop for every possible label (0 or 1)
  for (let label of [0, 1]) {
    if (testData && testData.length > 0) {
      const testPhone = {
        memory: testData[0].memory,
        resoloution: testData[0].resoloution,
        battery: testData[0].battery,
        cores: testData[0].cores,
      };
      const pred = await nn.classify(testPhone);
      predictions.push({ x: label, y: pred[0].price === label ? 1 : 0 });
    } else {
      console.error('testData is undefined or empty');
    }
  }
  // Adds the neural network data to the chart
  updateChart("Predictions: ", predictions);
  console.log("Finished training!");

  // Show the DOM elements after loading the scatterplot and neural network
  memoryInputField.style.display = "inline";
  resoloutionInputField.style.display = "inline";
  batteryInputField.style.display = "inline";
  coresInputField.style.display = "inline";
  predictButton.style.display = "inline";
  saveButton.style.display = "inline";
}



async function makePrediction(memory, resoloution, battery, cores) {
  let inputs = {
    memory,
    resoloution,
    battery,
    cores,
  };
  let results = await nn.classify(inputs);
  let label = results[0].label;
  resultDiv.innerHTML = `Predicted label: ${label}`;
}


/**
 * Creates a prediction of the price of a phone based on its specs
 */
// async function makePrediction(memory, resoloution, battery, cores) {
//   if (memory && resoloution && battery && cores) {
//     const results = await nn.predict(
//       {
//         memory: memory,
//         resoloution: resoloution,
//         battery: battery,
//         cores: cores,
//       },
//       () => console.log("Successfully predicted!")
//     );
//     const priceTwoDecimals = results[0].price.toFixed(2);
//     resultDiv.innerText = `The price of this phone is predicted to be arund: €${priceTwoDecimals}`;
//   } else {
//     resultDiv.innerText = `Please fill in everthing.`;
//   }
// }

loadData();