import {useEffect, useRef} from "react";
import PropTypes from "prop-types";

// Proptypes to let us pass a prop into WebcamModel
WebcamModel.propTypes = {
  model: PropTypes.shape({
    id: PropTypes.string.isRequired,
    path: PropTypes.string.isRequired,
    description: PropTypes.string.isRequired
  }).isRequired
};

function WebcamModel({ model }) {
  // References to DOM elements where webcam and prediction labels go.
  const webcamRef = useRef(null);
  const labelRef = useRef(null);
  let webcam;

  useEffect(() => {
    // Function for coloring the evaluations.
    function getColorForProbability(probability) {
      const alpha = Math.max(0, Math.min(1, probability)); // Alpha is between 0 and 1
      return `rgba(0, 128, 0, ${alpha})`; // Return RGBA color
    }

    // Initialize webcam and model
    async function init() {

      // URLs for model and metadata
      const modelURL = `/models/${model.path}/model.json`;
      const metadataURL = `/models/${model.path}/metadata.json`;

      // Loading model and metadata from Teachable Machine.
      model = await window.tmImage.load(modelURL, metadataURL);
      // Obtain the number of prediction classes from the model.
      // eslint-disable-next-line react/prop-types
      const maxPredictions = model.getTotalClasses();

      // Initialize webcam
      const flip = true; // Mirror webcam feed.
      webcam = new window.tmImage.Webcam(200, 200, flip);
      await webcam.setup();
      await webcam.play();
      if (webcamRef.current) {
        // If the reference is attached go ahead and append to webcam canvas in the DOM
        webcamRef.current.appendChild(webcam.canvas);
      }

      // Initialize the predictions container
      if (labelRef.current) {
        labelRef.current.innerHTML = ''; // Clear any previous content
        labelRef.current.className = 'predictions-container';
      }

      // Create prediction items and append them to the predictions container
      for (let i = 0; i < maxPredictions; i++) {
        const labelDiv = document.createElement("div");
        labelDiv.className = 'prediction-item';
        labelRef.current.appendChild(labelDiv);
      }

      // This function updates predictions for each frame captured by the webcam.
      // eslint-disable-next-line no-inner-declarations
      async function predict() {
        webcam.update();
        // eslint-disable-next-line react/prop-types
        const prediction = await model.predict(webcam.canvas);

        // Make sure we have a div for each prediction
        while (labelRef.current && labelRef.current.children.length < maxPredictions) {
          const labelDiv = document.createElement("div");
          labelDiv.className = 'prediction-item';
          labelRef.current.appendChild(labelDiv);
        }

        // Update the predictions in their respective divs
        prediction.forEach((pred, i) => {
          const labelDiv = labelRef.current.children[i];
          const color = getColorForProbability(pred.probability);
          labelDiv.innerHTML = `${pred.className}: ${pred.probability.toFixed(2)}`;
          labelDiv.style.backgroundColor = color; // Apply the dynamic color based on probability
        });

        window.requestAnimationFrame(predict);
      }

      predict().catch(console.error);

    }

    init().catch(console.error);

    // Cleanup function to stop the webcam when the component dismounts.
    return () => {
      if (webcam) {
        webcam.stop();
        console.log("Webcam stopped.");
      }
    };
  }, [model]);

  return (
    <div className="webcam-container">
      <div className="webcam-video" ref={webcamRef}></div>
      <div ref={labelRef} className="predictions-container"></div>
    </div>
  );
}

export default WebcamModel;