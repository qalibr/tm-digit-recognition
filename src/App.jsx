import {useState} from "react";
import WebcamModel from "./components/WebcamModel.jsx";
import './App.css'

function App() {
  // Some model variants.
  const modelVariants = [
    {id: "default", path: "default", description: "Default Model"},
    {id: "2x-epoch", path: "2x-epoch", description: "Model trained for 2x epochs"},
    {id: "3x-epoch", path: "3x-epoch", description: "Model trained for 3x epochs"},
    {id: "3x-epoch_2x-batchsize", path: "3x-epoch_2x-batchsize", description: "Model trained for 3x epochs and 2x batch size"},
    {id: "3x-epoch_8x-batchsize", path: "3x-epoch_8x-batchsize", description: "Model trained for 3x epochs and 8x batch size"},
    {id: "6x-epoch", path: "6x-epoch", description: "Model trained for 6x epochs"},
  ];

  // State variable, set to default initially.
  const [currentModel, setCurrentModel] = useState(modelVariants[0]);

  // Handler to change model.
  const handleModelChange = (event) => {
    const newModel = modelVariants.find(model => model.id === event.target.value);
    setCurrentModel(newModel);
  };

  return (
    <div>
      <div className="flex items-center">
        <h2>Model Description: {currentModel.description}</h2>
        <select onChange={handleModelChange} value={currentModel.id}>
          {modelVariants.map(model => (
            <option key={model.id} value={model.id}>{model.description}</option>
          ))}
        </select>
      </div>
      {/* Passing current model as prop. This forces a refresh and fixes the issue
          of the webcam duplicating on model changes. */}
      <WebcamModel key={currentModel.id} model={currentModel}/>
    </div>
  )
}

export default App
