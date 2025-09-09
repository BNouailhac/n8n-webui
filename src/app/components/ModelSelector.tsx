import { useState, useEffect } from 'react';
import { Model } from '../types';

interface ModelSelectorProps {
  selectedModel: string;
  onModelSelect: (model: string) => void;
  baseUrl: string;
}

export default function ModelSelector({ selectedModel, onModelSelect, baseUrl }: ModelSelectorProps) {
  const [models, setModels] = useState<Model[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchModels = async () => {
    try {
      setError(null);
      setLoading(true);

      const modelList = [
        { name: "IA Générale", id: "0" },
        { name: "Traducteur", id: "1" },
      ];

      setModels(modelList);

      if (modelList.length > 0) {
        const modelNames = modelList.map((m: Model) => m.name);
        if (!modelNames.includes(selectedModel)) {
          onModelSelect(modelList[0].name);
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
  }, [baseUrl, selectedModel]);

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
    <select
      className="select select-bordered w-full max-w-xs"
      value={selectedModel}
      onChange={(e) => onModelSelect(e.target.value)}
    >
      {models.length === 0 ? (
        <option value="">No models available</option>
      ) : (
        models.map((model) => (
          <option key={model.name} value={model.name}>
            {model.name}
          </option>
        ))
      )}
    </select>
  );
} 