import React, {useEffect, useRef} from "react";

function WebcamModel() {
  // References to DOM elements where webcam and prediction labels go.
  const webcamRef = useRef(null);
  const labelRef = useRef(null);
  let webcam;

  useEffect(() => {
    // Initialize webcam and model
    async function init() {
      // URLs for model and metadata
      const baseURL = "https://teachablemachine.withgoogle.com/models/sKWVzb-8A/";
      const modelURL = baseURL + "model.json";
      const metadataURL = baseURL + "metadata.json";

      // Loading model and metadata from Teachable Machine.
      const model = await window.tmImage.load(modelURL, metadataURL);
      // Obtain the number of prediction classes from the model.
      const maxPredictions = model.getTotalClasses();


      // Initialize webcam
      const flip = true; // Mirror webcam feed.
      webcam = new window.tmImage.Webcam(200, 200, flip);
      await webcam.setup().catch(console.error);
      await webcam.play().catch(console.error);
      if (webcamRef.current) {
        // If the reference is attached go ahead and append to webcam canvas in the DOM
        webcamRef.current.appendChild(webcam.canvas);
      }

      // This function updates predictions for each frame captured by the webcam.
      async function predict() {
        webcam.update(); // update the frame
        const prediction = await model.predict(webcam.canvas);
        for (let i = 0; i < maxPredictions; i++) {
          // Initial formating and display, TODO: Make nicer.
          const classPrediction = prediction[i].className + ": " + prediction[i].probability.toFixed(2);
          if (labelRef.current && labelRef.current.children[i]) {
            labelRef.current.children[i].innerHTML = classPrediction;
          }
        }

        window.requestAnimationFrame(predict); // Continuous predictions.
      }

      predict();

      // Creating placeholders for each prediction class in the DOM.
      for (let i = 0; i < maxPredictions; i++) {
        const labelDiv = document.createElement("div");
        if (labelRef.current) {
          labelRef.current.appendChild(labelDiv);
        }
      }
    }

    init();

    // Cleanup function to stop the webcam when the component dismounts.
    return () => {
      if (webcam && typeof webcam.stop === 'function') {
        webcam.stop();
      }
    };

  }, []); // Effect only runs once, causing the webcam to freeze when hot-loading changes.

  return (
    <div className="webcam-container">
      <div className="webcam-video" ref={webcamRef}></div>
      <div className="predictions" ref={labelRef}></div>
    </div>
  )
}

export default WebcamModel;