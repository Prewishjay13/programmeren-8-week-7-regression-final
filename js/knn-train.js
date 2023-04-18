import { kNear } from "knear";
let classifier;
let trainingData;
const k = 3; // Number of neighbors to consider
const knn = new kNear(k);

// Load the CSV file
function preload() {
  trainingData = loadTable('mobilephone.csv', 'csv', 'header', () => {
    // Filter out rows with empty values
    trainingData = trainingData.rows.filter(row => {
      const values = row.arr;
      for (let i = 0; i < values.length; i++) {
        if (values[i] === '') {
          return false;
        }
      }
      return true;
    });

    // Train the k-NN classifier
    classifier = ml5.KNNClassifier();
    for (let row of trainingData) {
      const label = row.get('price'); // Update to the appropriate label column name
      const features = [
        row.getNum('battery'),
        row.getNum('cores'),
        row.getNum('resolution'),
        row.getNum('memory')
      ]; // Update to the appropriate feature column names
      classifier.addExample(features, label);
    }

    // Classify a test example
    const testFeatures = [3000, 4, 170, 64]; // Replace with your own test features
    classifier.classify(testFeatures, (error, result) => {
      if (error) {
        console.error(error);
      } else {
        console.log('Label:', result.label);
        console.log('Confidence:', result.confidence);
      }
    });
  });
}
