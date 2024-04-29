import {useState} from "react";
import supabase from "./supabaseClient.jsx";
import useAuth from "./useAuth.jsx";

function StoreModelURLs() {
  const {user} = useAuth();
  const [modelURL, setModelURL] = useState("");
  const [description, setDescription] = useState("");
  const [error, setError] = useState("");

  const insertModel = async () => {
    setError("");
    if (!user) {
      setError("You must be logged in to do that.");
      return;
    }
    if (!modelURL) {
      setError("A model URL is required.");
      return;
    }
    if (!description) {
      setError("A description is required.");
      return;
    }

    const {data, error} = await supabase
      .from('models')
      .insert([
        {base_url: modelURL, description: description}
      ])
      .select();

    if (error) {
      setError(error);
    } else {
      console.log("Insert success.", data);
      // Clear state upon successful insert
      setModelURL("");
      setDescription("");
    }
  }

  return (
    <div>
      {error && <div style={{color: 'red'}}>{error}</div>}
      <input
        type="text"
        value={modelURL}
        onChange={(e) => setModelURL(e.target.value)}
        placeholder="Paste the model URL here."
        required={true}
      />
      <input
        type="text"
        value={description}
        onChange={(e) => setDescription(e.target.value)}
        placeholder="Enter a description for the model."
        required={true}
      />
      <button onClick={insertModel}>Save Model URL</button>
    </div>
  );
}

export default StoreModelURLs;