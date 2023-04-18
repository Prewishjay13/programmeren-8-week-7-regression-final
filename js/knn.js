
const options = {
  data: './data/data.csv',
  task: 'classification',
  debug: true
}

// Step 3: initialize your neural network
const nn = ml5.neuralNetwork(options, modelLoaded);

// Step 4: add data to the neural network
data.forEach(item => {
  const inputs = {
    r: item.r, 
    g: item.g
  };
  const output = {
    b: item.b
  };

  nn.addData(inputs, output);
});

// Step 5: normalize your data;
nn.normalizeData();

// Step 6: train your neural network
const trainingOptions = {
  epochs: 32,
  batchSize: 12
}
nn.train(trainingOptions, finishedTraining);

// Step 7: use the trained model
function finishedTraining(){
  classify();
}

// Step 8: make a classification
function classify(){
  const input = {
    r: 255, 
    g: 2,
  }
  nn.classify(input, handleResults);
}

// Step 9: define a function to handle the results of your classification
function handleResults(error, result) {
    if(error){
      console.error(error);
      return;
    }
    console.log(result); // {label: 'red', confidence: 0.8};
}
