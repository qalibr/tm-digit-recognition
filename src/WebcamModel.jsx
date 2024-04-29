import {useEffect, useRef, useState} from "react";
import supabase from "./supabaseClient.jsx";
import StoreModelURLs from "./StoreModelURLs.jsx";
import Login from "./Login.jsx";

function WebcamModel() {
  // References to DOM elements where webcam and prediction labels go.
  const webcamRef = useRef(null);
  const labelRef = useRef(null);
  const [error, setError] = useState("");

  // Array for fetched models
  const [models, setModels] = useState([]);

  // baseURL of chosen model
  const [baseURL, setBaseURL] = useState("");

  // Description of the model
  const [description, setDescription] = useState("");

  let webcam;

  useEffect(() => {
    async function fetchModels() {
      try {
        const {data, error} = await supabase
          .from("models")
          .select("id, base_url, description");

        if (error) {
          throw error;
        }
        setModels(data);
        if (data.length > 0 && !baseURL) {
          // Default, 0th entry.
          setBaseURL(data[0].base_url);
          setDescription(data[0].description);
        }
      } catch (error) {
        setError(`Failed to fetch models: ${error.message}`);
      }
    }

    fetchModels().catch();
  }, []);

  useEffect(() => {
    if (!baseURL) return;

    function getColorForProbability(probability) {
      const alpha = Math.max(0, Math.min(1, probability)); // Alpha is between 0 and 1
      return `rgba(0, 128, 0, ${alpha})`; // Return RGBA color
    }

    // Initialize webcam and model
    async function init() {
      try {
        // URLs for model and metadata
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
      } catch (err) {
        setError(`Initialization failed: ${err.message}`);
      }
    }

    init().catch(console.error);

    // Cleanup function to stop the webcam when the component dismounts.
    return () => {
      if (webcam && typeof webcam.stop === "function") {
        webcam.stop();
      }
    };

    // *Effect only runs once, causing the webcam to freeze when hot-loading changes.
    // Effect now runs whenever we change the model.
  }, [baseURL]);

  const handleModelChange = (event) => {
    const selectedURL = event.target.value;
    const selectedModel = models.find((model) => model.base_url === selectedURL);
    if (selectedModel) {
      setBaseURL(selectedModel.base_url);
      setDescription(selectedModel.description);
    }
  };

  return (
    <div className="webcam-container">
      {error && <div style={{color: 'red'}}>{error}</div>}
      <div className="webcam-video" ref={webcamRef}></div>
      <div ref={labelRef} className="predictions-container"></div>
      <div className="flex items-center">
        <h2>Model Description: {description}</h2>
        <select onChange={handleModelChange} value={baseURL}>
          {models.map((model) => (
            <option key={model.id} value={model.base_url}>{model.base_url}</option>
          ))}
        </select>
      </div>
      <StoreModelURLs/>
      <Login/>
    </div>
  );
}

export default WebcamModel;