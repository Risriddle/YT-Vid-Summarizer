import { useState } from 'react';
import { Video } from 'lucide-react';
import '../css/videoInput.css'; 

interface VideoInputProps {
  onSubmit: (url: string) => Promise<void>;
  isLoading: boolean;
}

export default function VideoInput({ onSubmit, isLoading }: VideoInputProps) {
  const [url, setUrl] = useState('');
  const [error, setError] = useState('');

  const validateYouTubeUrl = (url: string) => {
    const pattern = /^(https?:\/\/)?(www\.)?(youtube\.com\/watch\?v=|youtu\.be\/)([a-zA-Z0-9_-]{11})/;
    return pattern.test(url);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!validateYouTubeUrl(url)) {
      setError('Please enter a valid YouTube video URL');
      return;
    }

    try {
      await onSubmit(url);
      setUrl(''); 
    } catch (error) {
      setError('Failed to generate summary. Please try again.');
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <label htmlFor="video-url" className="block text-sm font-medium text-gray-700">
          YouTube Video URL
        </label>
        
        <div className="mt-1 relative rounded-md shadow-sm">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <Video className="h-5 w-5 text-gray-400" />
          </div>
          <input
            type="url"
            id="video-url"
            value={url}
            onChange={(e) => setUrl(e.target.value)}
            className="focus:ring-blue-500 focus:border-blue-500 block w-full pl-10 pr-12 sm:text-sm border-gray-300 rounded-md"
            placeholder="https://www.youtube.com/watch?v=..."
            disabled={isLoading}
            aria-describedby="error-message"
            autoFocus
          />
        </div>
        {error && (
          <p id="error-message" className="mt-2 text-sm text-red-600" aria-live="assertive">
            {error}
          </p>
        )}
      </div>
      <button
        type="submit"
        disabled={isLoading || !url}
        className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
      >
        {isLoading ? (
          <>
            <svg className="animate-spin h-5 w-5 text-white mr-3" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8h8a8 8 0 01-16 0z"></path>
            </svg>
            Generating Summary...
          </>
        ) : (
          'Generate Summary'
        )}
      </button>
    </form>
  );
}


