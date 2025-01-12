import { useState } from 'react';
import { useAuthenticationStatus, useSignOut, useUserData } from '@nhost/react';
import { FaYoutube } from 'react-icons/fa';
import { LogOut, Clock, ChevronDown,ChevronUp,User } from 'lucide-react'; 
import { useNavigate } from 'react-router-dom';
import VideoInput from './VideoInput';
import VideoSummary from './VideoSummary';
import History from './History';

import { useNhostClient } from '@nhost/react';

export default function Dashboard() {
  const { isAuthenticated, isLoading } = useAuthenticationStatus();
  const { signOut } = useSignOut();
  const navigate = useNavigate();
  const user = useUserData();
  const nhost = useNhostClient();
  const accessToken = nhost.auth.getAccessToken();
  const [videos, setVideos] = useState<
    { title: string; summary: string; video_url: string }[]
  >([]);
  const [isGenerating, setIsGenerating] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isHistoryOpen, setIsHistoryOpen] = useState(true); 


  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-gray-100 flex items-center justify-center">
        <p className="text-gray-500">You are not authenticated.</p>
      </div>
    );
  }


const handleSignOut = async () => {
    try {
      await signOut();
      navigate('/signin');
    } catch (error) {
      console.error('Error during sign out:', error);
    }
  };

  const handleToggleHistory = () => {
    setIsHistoryOpen(!isHistoryOpen);
  };

const handleVideoSubmit = async (url: string) => {
    setIsGenerating(true)
    setError(null)
   
     videos.length=0
    try {

      if (typeof url !== 'string') {
        throw new Error('Video URL must be a string');
      }
  
      // Step 1: Check if the video URL already exists in the database
      const checkQuery = `
        query CheckVideo($video_url: String!) {
          video_summary(where: { video_url: { _eq: $video_url } }) {
            title
            summary
            video_url
          }
        }
      `
      
      const checkResponse = await fetch('https://timvlofleklvzwdoykoy.hasura.ap-south-1.nhost.run/v1/graphql', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${accessToken}`, 
        },
        body: JSON.stringify({
          query: checkQuery,
          variables: { video_url: url },
        }),
      })
      
      const checkResult = await checkResponse.json()
      if (checkResponse.ok && checkResult.data?.video_summary?.length > 0) {
        // Video already exists in the database, use it from history
        setVideos([...videos, checkResult.data.video_summary[0]])
        
        return
      }
  
      // Step 2: Call the n8n workflow to get video data (if video doesn't exist)
      const mutation = `
        mutation MyMutation($video_url: String!) {
          call_n8n_workflow(input: {video_url: $video_url}) {
            summary
            title
            video_url
          }
        }
      `
  
      const response = await fetch('https://timvlofleklvzwdoykoy.hasura.ap-south-1.nhost.run/v1/graphql', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${accessToken}`, // Use Nhost JWT token
        },
        body: JSON.stringify({
          query: mutation,
          variables: { video_url:decodeURIComponent(url) },
        }),
      })
 
      const result = await response.json()
  
      if (response.ok && result.data?.call_n8n_workflow) {
        const { title, summary, video_url } = result.data.call_n8n_workflow
        const user_id = user?.id
  
        // Step 3: Save the data to the Hasura `videos` table
        const insertMutation = `
          mutation InsertVideo($title: String!, $summary: String!, $video_url: String!, $user_id: uuid!) {
            insert_video_summary(objects: {title: $title,summary: $summary, video_url: $video_url, user_id: $user_id}) {
              returning {
                title
                summary
                video_url
                user_id
              }
            }
          }
        `
  
        const insertResponse = await fetch('https://timvlofleklvzwdoykoy.hasura.ap-south-1.nhost.run/v1/graphql', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${accessToken}`, // Use Nhost JWT token
          },
          body: JSON.stringify({
            query: insertMutation,
            variables: { title, summary, video_url, user_id },
          }),
        })
  
        const insertResult = await insertResponse.json()
  
        if (insertResponse.ok && insertResult.data?.insert_video_summary?.returning?.length > 0) {
          const newVideo = insertResult.data.insert_video_summary.returning[0]
          setVideos([...videos, newVideo])

        } else {
          throw new Error(insertResult.errors?.[0]?.message || 'Failed to insert video')
        }
      } else {
        throw new Error(result.errors?.[0]?.message || 'Failed to trigger workflow')
      }
    } 
    catch (error) {
      setError(error instanceof Error?error.message:"Try again!")
 
    } finally {
      setIsGenerating(false)
    }
  }
  
if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-100 flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900" />
      </div>
    );
  }


return (
    <>
    <div className="min-h-screen bg-gradient-to-br from-gray-900 to-gray-800 ">
<header className="glass-effect sticky top-0 z-50 border-b border-white/20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
            </div>
        
            <div className="flex items-center">
  <FaYoutube className="h-6 w-6 text-white mr-2" />
  <h1 className="text-2xl font-bold text-white">YouTube Video Summary Generator</h1>
</div>

            <div className="flex items-center space-x-6">
              <div className="flex items-center space-x-3 bg-white/10 px-4 py-2 rounded-full">
                <User className="h-4 w-4 text-white" />
                <span className="text-sm text-white">{user?.email}</span>
              </div>
              <button
                onClick={handleSignOut}
                className="inline-flex items-center px-4 py-2 rounded-full bg-white/10 text-sm font-medium text-white hover:bg-white/20 focus:outline-none focus:ring-2 focus:ring-white/50 transition-all duration-200 ease-in-out transform hover:scale-105"
              >
                <LogOut className="h-4 w-4 mr-2" />
                Sign Out
              </button>
            </div>
          </div>
        </div>
      </header>
      

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Collapsible History Section */}
        <section className="bg-white shadow sm:rounded-lg p-4 mb-6">
          <div
            className="flex items-center justify-between cursor-pointer"
            onClick={handleToggleHistory}
          >
            <h2 className="text-2xl font-semibold text-gray-900 flex items-center">
              <Clock className="h-5 w-5 text-gray-500 mr-2" />
              History
            </h2>
            {isHistoryOpen ? (
              <ChevronUp className="h-5 w-5 text-gray-500" />
            ) : (
              <ChevronDown className="h-5 w-5 text-gray-500" />
            )}
          </div>

          {isHistoryOpen && (
            <div className="mt-4">
              <History />
            </div>
          )}
        </section>

        
        <section className="bg-white shadow sm:rounded-lg p-4">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">Generate Video Summary</h2>
          <VideoInput onSubmit={handleVideoSubmit} isLoading={isGenerating} />
          {error && (
            <div className="mt-4 p-4 rounded-md bg-red-50">
              <p className="text-sm text-red-700">{error}</p>
            </div>
          )}
        </section>

       
        {!isGenerating&&videos.length > 0 && (
          <section className="mt-6">
            <h2 className="text-xl font-semibold text-gray-900">Video Summary</h2>
            {videos.map((video) => (
              <VideoSummary
                key={video.video_url}
                title={video.title}
                summary={video.summary}
              />
            ))}
          </section>
        )}
      </main>
    </div>
    </>
  ); 
}

