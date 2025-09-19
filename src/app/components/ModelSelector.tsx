import { useState, useEffect } from 'react';
import { Model } from '../types';
import OutlinedInput from '@mui/material/OutlinedInput';
import MenuItem from '@mui/material/MenuItem';
import FormControl from '@mui/material/FormControl';
import Select, { SelectChangeEvent } from '@mui/material/Select';


interface ModelSelectorProps {
  selectedModel: Model;
  onModelSelect: (model: Model) => void;
}

export default function ModelSelector({ selectedModel, onModelSelect }: ModelSelectorProps) {
  const [models, setModels] = useState<Model[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const modelList = [
    { name: "Sélection Automatique", icon: "icon/star.png", model: "openrouter/auto", source: "cloud", id: "0" },
    { name: "Chat GPT", icon: "icon/openai-icon.webp", model: "openai/gpt-5-mini", source: "cloud", id: "1" },
    { name: "Grok", icon: "icon/grok-icon.webp", model: "x-ai/grok-3-mini", source: "cloud", id: "2" },
    { name: "Claude", icon: "icon/claude-icon.webp", model: "anthropic/claude-3-haiku", source: "cloud", id: "3" },
    { name: "Google Gemini", icon: "icon/google-bard-icon.webp", model: "google/gemini-2.5-flash", source: "cloud", id: "4" },
    { name: "Mistral", icon: "icon/mistral-icon.webp", model: "mistralai/mistral-medium-3.1", source: "cloud", id: "5" },
    { name: "Deepseek", icon: "icon/deepseek-icon.webp", model: "deepseek/deepseek-chat-v3.1:free", source: "cloud", id: "6" },
    { name: "Qwen", icon: "icon/qwen-icon.webp", model: "deepseek/deepseek-r1-0528-qwen3-8b:free", source: "cloud", id: "7" },
    { name: "gpt-oss:20b", icon: "icon/gpt-oss-120b.png", model: "gpt-oss:20b", source: "local", id: "8" },
    { name: "gemma3:27b", icon: "icon/gemma.png", model: "gemma3:27b", source: "local", id: "9" },
    { name: "mixtral:8x7b", icon: "icon/mistral-icon.webp", model: "mixtral:8x7b", source: "local", id: "10" }
  ];

  const fetchModels = async () => {
    try {
      setError(null);
      setLoading(true);

      setModels(modelList);
 
      if (modelList.length > 0) {
        const modelNames = modelList.map((m: Model) => m.name);
        if (!modelNames.includes(selectedModel.name)) {
          onModelSelect(modelList[0]);
        }
      }
    } catch (error) {
      console.error('Error fetching models:', error);
      setError('Failed to connect to Ollama server');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchModels();
  }, [selectedModel]);

  if (loading) {
    return <div className="loading loading-spinner loading-sm"></div>;
  }

  if (error) {
    return (
      <div className="text-error text-sm">
        {error}
      </div>
    );
  }

  return (
    <FormControl sx={{ width: 260 }}>
      <Select
        displayEmpty
        value={selectedModel.name}
        onChange={(e) => onModelSelect(modelList.find(m => m.name === e.target.value))}
        input={<OutlinedInput />}
        inputProps={{ 'aria-label': 'Without label' }}
      >
        <MenuItem disabled value="">
          <em>Model Cloud</em>
        </MenuItem>
        {models.slice(0, 8).map((model) => (
          <MenuItem
            key={model.name}
            value={model.name}
          >
            <div style={{"gap": "10px", "display": "flex"}}>
              <img style={{"width": "24.4px", "borderRadius": "30px"}} src={model.icon} alt="Tickitall logo"/>
              <div style={{"fontWeight": "bold"}}>
                {model.name}
              </div>
            </div>
          </MenuItem>
        ))}
        <MenuItem disabled value="">
          <em>Model Local</em>
        </MenuItem>
        {models.slice(8).map((model) => (
          <MenuItem
            key={model.name}
            value={model.name}
          >
            <div style={{"gap": "10px", "display": "flex"}}>
              <img style={{"width": "24.4px", "borderRadius": "30px"}} src={model.icon} alt="Tickitall logo"/>
              <div style={{"fontWeight": "bold"}}>
                {model.name}
              </div>
            </div>
          </MenuItem>
        ))}
      </Select>
    </FormControl>
  );
} 