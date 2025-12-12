import { useRef, useState, useEffect } from "react";
import { useChat } from "../hooks/useChat";

export const UI = ({ hidden, ...props }) => {
  const {
    loading,
    cameraZoomed,
    setCameraZoomed,
    message,
    isRecording,
    setIsRecording,
    startRecording,
    stopRecording,
    isSessionActive,
    startSession,
    endSession,
    autoListen
    
  } = useChat();

  const [micError, setMicError] = useState(null);

  // Handle recording state changes
  useEffect(() => {
    if (isRecording) {
      startRecording().catch((error) => {
        console.error('Error starting recording:', error);
        setIsRecording(false);
        setMicError('Failed to start recording. Please check your microphone.');
      });
    } else {
      stopRecording();
    }
  }, [isRecording]);

  const handleRecordButtonClick = () => {
    if (!isSessionActive) {
      // Start new session - welcome message will play automatically
      // Recording will start automatically after welcome finishes
      startSession();
      // Don't start recording immediately - wait for welcome message
    } else {
      // Toggle recording in active session
      setIsRecording(!isRecording);
    }
  };

  if (hidden) {
    return null;
  }

  return (
    <>
      <div className="fixed top-0 left-0 right-0 bottom-0 z-10 flex justify-between p-6 flex-col pointer-events-none font-sans">
        {/* Header */}
        <div className="flex justify-between items-start">
          <div className="pointer-events-auto backdrop-blur-md bg-white/70 dark:bg-black/60 p-4 rounded-2xl shadow-xl border border-white/20 transition-all hover:bg-white/80 dark:hover:bg-black/70">
            <h1 className="font-black text-3xl bg-gradient-to-r from-pink-500 via-purple-500 to-indigo-600 bg-clip-text text-transparent">
              Baap AI
            </h1>
            <p className="text-sm font-medium text-gray-700 dark:text-gray-300 mt-1">
              {isSessionActive
                ? (isRecording ? "Listening..." : "Thinking...")
                : "Intelligent Assistant"}
            </p>
            
            {micError && (
              <div className="mt-2 p-2 bg-red-100/90 border border-red-300 rounded-lg text-xs text-red-700 backdrop-blur-sm">
                {micError}
              </div>
            )}
          </div>

          {/* Right Side Controls */}
          <div className="flex flex-col gap-3">
            <button
              onClick={() => setCameraZoomed(!cameraZoomed)}
              className="pointer-events-auto bg-white/30 dark:bg-black/30 backdrop-blur-md hover:bg-white/50 dark:hover:bg-black/50 text-gray-800 dark:text-white p-3 rounded-xl shadow-lg border border-white/20 transition-all duration-200 hover:scale-105 active:scale-95 group"
              title={cameraZoomed ? "Zoom Out" : "Zoom In"}
            >
              {cameraZoomed ? (
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-6 h-6 group-hover:text-purple-600">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-5.197-5.197m0 0A7.5 7.5 0 105.196 5.196a7.5 7.5 0 0010.607 10.607zM13.5 10.5h-6" />
                </svg>
              ) : (
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-6 h-6 group-hover:text-purple-600">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-5.197-5.197m0 0A7.5 7.5 0 105.196 5.196a7.5 7.5 0 0010.607 10.607zM10.5 7.5v6m3-3h-6" />
                </svg>
              )}
            </button>
            <button
              onClick={() => {
                const body = document.querySelector("body");
                if (body.classList.contains("greenScreen")) {
                  body.classList.remove("greenScreen");
                } else {
                  body.classList.add("greenScreen");
                }
              }}
              className="pointer-events-auto bg-white/30 dark:bg-black/30 backdrop-blur-md hover:bg-white/50 dark:hover:bg-black/50 text-gray-800 dark:text-white p-3 rounded-xl shadow-lg border border-white/20 transition-all duration-200 hover:scale-105 active:scale-95 group"
              title="Toggle Green Screen"
            >
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-6 h-6 group-hover:text-green-500">
                <path strokeLinecap="round" d="M15.75 10.5l4.72-4.72a.75.75 0 011.28.53v11.38a.75.75 0 01-1.28.53l-4.72-4.72M4.5 18.75h9a2.25 2.25 0 002.25-2.25v-9a2.25 2.25 0 00-2.25-2.25h-9A2.25 2.25 0 002.25 7.5v9a2.25 2.25 0 002.25 2.25z" />
              </svg>
            </button>
          </div>
        </div>

        {/* Message Indicator */}
        {message && (
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 pointer-events-none">
            {/* Optional: Add a subtle overlay text or animation here if needed */}
          </div>
        )}

        {/* Bottom Control Area */}
        <div className="flex flex-col items-center justify-end gap-6 pb-8">

          {/* Listen Lines Animation */}
          <div className={`flex items-center gap-1.5 h-12 transition-opacity duration-300 ${isRecording ? "opacity-100" : "opacity-0"}`}>
            {[...Array(8)].map((_, i) => (
              <div
                key={i}
                className="w-1.5 bg-white/90 rounded-full animate-listening-line shadow-[0_0_10px_rgba(255,255,255,0.6)]"
                style={{
                  animationDelay: `${i * 0.1}s`,
                  height: '30%'
                }}
              ></div>
            ))}
          </div>

          {/* Main Recording Button */}
          <div className="relative group">
            {/* Glowing ring effect */}
            <div className={`absolute -inset-1 rounded-full blur opacity-40 transition-opacity duration-500 ${isRecording ? 'bg-red-500 opacity-70 animate-pulse' : 'bg-gradient-to-r from-pink-600 to-purple-600 opacity-0 group-hover:opacity-100'
              }`}></div>

            <button
              onClick={handleRecordButtonClick}
              className={`relative pointer-events-auto flex items-center justify-center p-6 rounded-full shadow-2xl transition-all duration-300 hover:scale-105 active:scale-95 border-4 ${isRecording
                  ? "bg-red-500 border-red-400 hover:bg-red-600"
                  : "bg-gradient-to-br from-indigo-500 via-purple-500 to-pink-500 border-white/20 hover:brightness-110"
                }`}
              title={isRecording ? "Stop Recording" : "Start Conversation"}
            >
              {isRecording ? (
                <svg xmlns="http://www.w3.org/2000/svg" fill="currentColor" viewBox="0 0 24 24" className="w-10 h-10 text-white animate-[pulse_2s_infinite]">
                  <path d="M6 6h12v12H6z" />
                </svg>
              ) : (
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-10 h-10 text-white">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M12 18.75a6 6 0 006-6v-1.5m-6 7.5a6 6 0 01-6-6v-1.5m6 7.5v3.75m-3.75 0h7.5M12 15.75a3 3 0 01-3-3V4.5a3 3 0 116 0v8.25a3 3 0 01-3 3z" />
                </svg>
              )}
            </button>
          </div>

          {/* Status Text Pill */}
          <div className="bg-black/40 backdrop-blur-md px-6 py-2 rounded-full border border-white/10 shadow-lg">
            <span className="text-white/90 text-sm font-medium tracking-wide">
              {isRecording ? "Listening to you..." : isSessionActive ? "Click mic to speak" : "Click mic to start"}
            </span>
          </div>
        </div>
      </div>
    </>
  );
};