
import { useEffect, useState } from 'react';

interface LoadingAnimationProps {
  text?: string;
  size?: 'sm' | 'md' | 'lg';
}

const LoadingAnimation = ({ text = "Loading...", size = 'md' }: LoadingAnimationProps) => {
  const [dots, setDots] = useState('.');
  
  useEffect(() => {
    const interval = setInterval(() => {
      setDots(prev => {
        if (prev.length >= 3) {
          return '.';
        }
        return prev + '.';
      });
    }, 400);
    
    return () => clearInterval(interval);
  }, []);

  const sizeClasses = {
    sm: {
      container: 'h-8 w-8',
      inner: 'h-4 w-4',
      text: 'text-sm'
    },
    md: {
      container: 'h-12 w-12',
      inner: 'h-6 w-6',
      text: 'text-base'
    },
    lg: {
      container: 'h-16 w-16',
      inner: 'h-8 w-8',
      text: 'text-lg'
    }
  };
  
  return (
    <div className="flex flex-col items-center justify-center py-4">
      <div className={`relative ${sizeClasses[size].container} mb-2`}>
        <div className="absolute h-full w-full rounded-full border-4 border-t-transparent border-b-transparent border-purple-500 animate-spin"></div>
        <div className="absolute h-full w-full rounded-full border-4 border-l-transparent border-r-transparent border-indigo-500 animate-spin animation-delay-150"></div>
        <div className="absolute inset-2 flex items-center justify-center">
          <div className={`${sizeClasses[size].inner} transform scale-75 opacity-60`}>
            <div className="h-full w-full rounded-sm bg-purple-500 animate-pulse"></div>
          </div>
        </div>
      </div>
      <p className={`text-purple-700 dark:text-purple-400 font-medium ${sizeClasses[size].text}`}>
        {text.replace('...', '')}<span className="w-6 inline-block">{dots}</span>
      </p>
    </div>
  );
};

export default LoadingAnimation;
