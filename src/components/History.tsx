
import React, { useEffect, useState } from 'react';
import { useNhostClient } from '@nhost/react';

interface Video {
  title: string;
  summary: string;
  video_url: string;
}

const History: React.FC = () => {
  const [videos, setVideos] = useState<Video[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [selectedVideo, setSelectedVideo] = useState<Video | null>(null);
  const [loading, setLoading] = useState<boolean>(false);
  const nhost = useNhostClient();
  const accessToken = nhost.auth.getAccessToken();

  useEffect(() => {
    const fetchVideos = async () => {
      setLoading(true);
      try {
        setError(null);
        const query = `
          query GetVideos {
            video_summary {
              title
              summary
              video_url
            }
          }
        `;

        const response = await fetch('https://timvlofleklvzwdoykoy.hasura.ap-south-1.nhost.run/v1/graphql', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${accessToken}`,
          },
          body: JSON.stringify({ query }),
        });

        const result = await response.json();

        if (response.ok && result.data?.video_summary) {
          setVideos(result.data.video_summary);
        } else {
          throw new Error(result.errors?.[0]?.message || 'Failed to fetch videos');
        }
      } catch (error) {
        setError(error instanceof Error ? error.message : 'An unexpected error occurred');
      } finally {
        setLoading(false);
      }
    };

    fetchVideos();
  }, [accessToken]);

  const handleVideoClick = (video: Video) => {
    if (selectedVideo?.video_url === video.video_url) {
      setSelectedVideo(null);
    } else {
      setSelectedVideo(video);
    }
  };

  

  // Function to render summary with bold formatting
  const renderSummaryWithBold = (summary: string) => {
    const boldTextPattern = /\*\*(.*?)\*\*/g;

    return summary.split("\n").map((line, index) => {
      const formattedLine = line.replace(boldTextPattern, '<strong>$1</strong>');
      return (
        <p key={index} className="whitespace-pre-wrap" dangerouslySetInnerHTML={{ __html: formattedLine }} />
      );
    });
  };


  return (
    <div className="mt-6">
    
      {error && (
        <div className="flex items-center mt-4 p-4 rounded-md bg-red-50">
          <span className="text-red-700 text-lg mr-2">⚠️</span>
          <p className="text-sm text-red-700">{error}</p>
        </div>
      )}

     
      {loading && (
        <div className="text-center mt-4 text-gray-500">
          <span className="spinner-border animate-spin border-4 border-blue-500 border-t-transparent w-6 h-6 inline-block"></span>
          Loading videos...
        </div>
      )}

   
      {videos.length > 0 ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {videos.map((video) => (
            <div
              key={video.video_url}
              className={`bg-white shadow-lg rounded-lg p-4 cursor-pointer hover:shadow-xl transition-all ${
                selectedVideo?.video_url === video.video_url ? 'bg-blue-50' : ''
              }`}
              onClick={() => handleVideoClick(video)}
            >
              <h4 className="text-xl font-semibold text-blue-500 hover:text-blue-700 ">
                <strong>{video.title}</strong>
              </h4>
             
            </div>
          ))}
        </div>
      ) : (
        <p className="text-gray-500 mt-4">No videos found.</p>
      )}

      
      {selectedVideo && (
        <div className="mt-6 p-6 bg-white shadow-lg rounded-md">
          <h3 className="text-2xl font-bold">{selectedVideo.title}</h3>
          <div className="text-black mt-2">
            {renderSummaryWithBold(selectedVideo.summary)}
          </div>
          <a
            href={selectedVideo.video_url}
            target="_blank"
            rel="noopener noreferrer"
            className="text-blue-500 hover:underline mt-4 inline-block"
          >
            Watch Video
          </a>
        </div>
      )}
    </div>
  );
};

export default History;
