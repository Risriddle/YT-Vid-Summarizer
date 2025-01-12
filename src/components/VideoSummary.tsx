import { useState, useEffect } from 'react';
import { FileText } from 'lucide-react';
import '../css/videoSummary.css';

interface VideoSummaryProps {
  title: string;
  summary: string;
}

const renderSummaryWithBold = (summary: string) => {
  const boldTextPattern = /\*\*(.*?)\*\*/g;

  return summary.split("\n").map((line, index) => {
    const formattedLine = line.replace(boldTextPattern, '<strong>$1</strong>');
    return (
      <p key={index} className="whitespace-pre-wrap" dangerouslySetInnerHTML={{ __html: formattedLine }} />
    );
  });
};

export default function VideoSummary({ title, summary }: VideoSummaryProps) {
  const [displayedText, setDisplayedText] = useState('');
  const [isTyping, setIsTyping] = useState(true);

  useEffect(() => {
    let currentIndex = 0;

    const typingInterval = setInterval(() => {
      if (currentIndex < summary.length) {
        setDisplayedText((prev) => prev + summary[currentIndex]);
        currentIndex += 1;
      } else {
        clearInterval(typingInterval);
        setIsTyping(false);
      }
    }, 7); 
    return () => clearInterval(typingInterval);
  }, [summary]);

  return (
    <div className="mt-6 bg-white shadow sm:rounded-lg">
      <div className="px-4 py-5 sm:p-6">
        <h3 className="text-2xl leading-6 font-bold text-black-900 flex items-center gap-2">
          <FileText className="h-5 w-5" />
          {title}
        </h3>
        <h3>Summary</h3>
        <div className="mt-4  text-black-600">
          {renderSummaryWithBold(displayedText)}
          {isTyping && <span className="blinking-cursor">|</span>}
        </div>
        
      </div>
    </div>
  );
}

