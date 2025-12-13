import { createContext, useContext, useEffect, useRef, useState } from "react";

const backendUrl = "https://82f73133b0b1.ngrok-free.app"; // Updated backend URL

// Improved lipsync generation function with accurate phoneme mapping
const generateAccurateLipsync = (text) => {
  const words = text.toLowerCase().split(' ').filter(word => word.length > 0);
  const mouthCues = [];
  let currentTime = 0;

  // Enhanced phoneme to viseme mapping based on English phonetics
  const phonemeMap = {
    // Vowels - open mouth shapes
    'a': 'A', 'e': 'E', 'i': 'I', 'o': 'O', 'u': 'U',
    // Bilabial consonants - closed lips
    'b': 'B', 'p': 'B', 'm': 'B',
    // Labiodental consonants - teeth on lip
    'f': 'F', 'v': 'F',
    // Dental/fricative consonants - tongue behind teeth
    'th': 'H', 's': 'H', 'z': 'H', 'sh': 'H', 'zh': 'H',
    // Alveolar consonants - tongue tip on alveolar ridge
    't': 'H', 'd': 'H', 'n': 'H', 'l': 'X', 'r': 'X',
    // Velar consonants - back of tongue
    'k': 'H', 'g': 'H', 'ng': 'H',
    // Palatal consonants - middle of tongue
    'ch': 'H', 'j': 'H', 'y': 'X',
    // Glottal consonants
    'h': 'X', 'w': 'X', 'q': 'X',
    'default': 'X'
  };

  words.forEach((word, index) => {
    let dominantPhoneme = 'default';
    let visemeIntensity = 1.0;

    // Analyze word for phoneme patterns
    if (word.includes('th')) {
      dominantPhoneme = 'th';
    } else if (word.includes('sh')) {
      dominantPhoneme = 'sh';
    } else if (word.includes('ch')) {
      dominantPhoneme = 'ch';
    } else if (word.includes('ng')) {
      dominantPhoneme = 'ng';
    } else if (/[aeiou]/.test(word)) {
      // Find the most prominent vowel
      const vowels = word.match(/[aeiou]/g);
      if (vowels && vowels.length > 0) {
        // Use the first vowel as dominant
        dominantPhoneme = vowels[0];
      }
    } else if (/[bpm]/.test(word)) {
      dominantPhoneme = 'b';
      visemeIntensity = 0.9; // Slightly less intense for plosives
    } else if (/[fv]/.test(word)) {
      dominantPhoneme = 'f';
    } else if (/[td]/.test(word)) {
      dominantPhoneme = 't';
      visemeIntensity = 0.8;
    } else if (/[kg]/.test(word)) {
      dominantPhoneme = 'k';
      visemeIntensity = 0.8;
    } else if (/[lrwy]/.test(word)) {
      dominantPhoneme = 'l';
    } else if (/[nz]/.test(word)) {
      dominantPhoneme = 'n';
    }

    const viseme = phonemeMap[dominantPhoneme] || phonemeMap['default'];

    // Calculate duration based on word length and type
    let baseDuration = Math.max(0.15, Math.min(0.6, word.length * 0.12));

    // Adjust duration for word type
    if (dominantPhoneme === 'default' || /[bptdkg]/.test(dominantPhoneme)) {
      baseDuration *= 0.8; // Shorter for plosives
    } else if (/[aeiou]/.test(dominantPhoneme)) {
      baseDuration *= 1.2; // Longer for vowels
    }

    // Add small pause between words for natural rhythm
    if (index > 0) {
      currentTime += 0.05;
    }

    mouthCues.push({
      start: currentTime,
      end: currentTime + baseDuration,
      value: viseme
    });

    currentTime += baseDuration;
  });

  return { mouthCues };
};

const ChatContext = createContext();

export const ChatProvider = ({ children }) => {
  const [conversationHistory, setConversationHistory] = useState([]);
  const [sessionId] = useState(() => `session_${Date.now()}`);
  const [isSessionActive, setIsSessionActive] = useState(false);
  const [autoListen, setAutoListen] = useState(false);
  
  // Audio recording state
  const [mediaRecorder, setMediaRecorder] = useState(null);
  const [audioChunks, setAudioChunks] = useState([]);
  const audioRef = useRef(null);

  const startSession = () => {
    setIsSessionActive(true);
    setAutoListen(true);
    clearHistory();
  };

  const endSession = () => {
    setIsSessionActive(false);
    setAutoListen(false);
  };

  // Start recording audio
  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const recorder = new MediaRecorder(stream);
      const chunks = [];

      recorder.ondataavailable = (event) => {
        if (event.data.size > 0) {
          chunks.push(event.data);
        }
      };

      recorder.onstop = async () => {
        const audioBlob = new Blob(chunks, { type: 'audio/webm' });
        await chat(audioBlob);
        stream.getTracks().forEach(track => track.stop());
      };

      recorder.start();
      setMediaRecorder(recorder);
      setAudioChunks(chunks);
    } catch (error) {
      console.error('Error accessing microphone:', error);
      throw new Error('Microphone access denied. Please allow microphone access to use this feature.');
    }
  };

  // Stop recording audio
  const stopRecording = () => {
    if (mediaRecorder && mediaRecorder.state !== 'inactive') {
      mediaRecorder.stop();
    }
  };

  const chat = async (audioBlob) => {
    setLoading(true);

    try {
      // Create FormData for audio file upload
      const formData = new FormData();
      formData.append('audio', audioBlob, 'audio.webm');

      // Call voice pipeline endpoint which returns full message structure
      const response = await fetch(`${backendUrl}/voice/pipeline`, {
        method: 'POST',
        body: formData,
        headers: {
          // Don't set Content-Type header - let the browser set it for FormData
        },
        mode: 'cors',
        credentials: 'omit'
      });

      // Check if the endpoint exists
      if (response.status === 404) {
        throw new Error('Backend voice service is not available (404 Not Found). Please check if the backend server is running and the endpoint is correctly configured.');
      }

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      // Get response as blob first to check content type
      const blob = await response.blob();
      const contentType = blob.type;
    
      console.log('Response content type:', contentType);

      // Handle JSON response
      if (contentType.includes('application/json')) {
        const responseText = await blob.text();
        console.log('JSON response:', responseText);
      
        let data;
        try {
          data = JSON.parse(responseText);
        } catch (parseError) {
          console.error('Failed to parse JSON response:', parseError);
          const cleanedText = responseText.replace(/[\x00-\x1F\x7F-\x9F]/g, '');
          try {
            data = JSON.parse(cleanedText);
          } catch {
            throw new Error('Invalid JSON response from server');
          }
        }
      
        // Handle different response formats
        if (data.messages && Array.isArray(data.messages) && data.messages.length > 0) {
          setMessages(data.messages);
        } else if (data.text !== undefined || data.audio !== undefined) {
          const message = {
            text: data.text || '',
            audio: data.audio || '',
            lipsync: data.lipsync || generateAccurateLipsync(data.text || ''),
            facialExpression: data.facialExpression || 'neutral',
            animation: data.animation || 'Talking_0'
          };
          setMessages([message]);
        } else {
          throw new Error('Unexpected response format from server');
        }
      } 
      // Handle audio response (backend returns audio directly)
      else if (contentType.includes('audio/') || contentType.includes('application/octet-stream')) {
        console.log('Received audio response');
        // Convert blob to base64
        const reader = new FileReader();
        reader.onloadend = () => {
          const base64Audio = reader.result.split(',')[1];
          const message = {
            text: 'I have processed your request',
            audio: base64Audio,
            lipsync: generateAccurateLipsync('I have processed your request'),
            facialExpression: 'smile',
            animation: 'Talking_0'
          };
          setMessages([message]);
        };
        reader.readAsDataURL(blob);
      } 
      else {
        console.error('Unexpected content type:', contentType);
        throw new Error(`Unsupported response type: ${contentType}`);
      }

    } catch (error) {
      console.error('Chat error:', error);
      
      // Better error messages based on error type
      let errorMessage = "I'm having trouble understanding. Could you try again?";
      
      if (error.message.includes('Failed to fetch') || error.message.includes('NetworkError')) {
        errorMessage = "I can't connect to the server. Please check your connection and make sure the backend service is running.";
      } else if (error.message.includes('404')) {
        errorMessage = "The voice service is currently unavailable. Please check if the backend server is properly configured and running.";
      } else if (error.message.includes('429') || error.message.includes('rate limit')) {
        errorMessage = "I'm processing too many requests. Please wait a moment and try again.";
      } else if (error.message.includes('401') || error.message.includes('403')) {
        errorMessage = "Authentication error. Please check your API configuration.";
      } else if (error.message) {
        errorMessage = error.message.length > 100 
          ? "Something went wrong. Please try again." 
          : error.message;
      }
      
      // Add fallback message with better error handling
      setMessages([{
        text: errorMessage,
        audio: "",
        lipsync: generateAccurateLipsync(errorMessage),
        facialExpression: "sad",
        animation: "Talking_1"
      }]);
    } finally {
      setLoading(false);
    }
  };

  // Play audio and handle message progression
  const playAudio = (base64Audio) => {
    if (!base64Audio) return;
    
    const audio = new Audio(`data:audio/wav;base64,${base64Audio}`);
    audioRef.current = audio;
    
    audio.onended = () => {
      onMessagePlayed();
    };
    
    audio.play().catch(error => {
      console.error('Error playing audio:', error);
      onMessagePlayed(); // Move to next message even if audio fails
    });
  };

  const clearHistory = () => {
    setConversationHistory([]);
  };

  const [messages, setMessages] = useState([]);
  const [message, setMessage] = useState();
  const [loading, setLoading] = useState(false);
  const [cameraZoomed, setCameraZoomed] = useState(true);
  const [isRecording, setIsRecording] = useState(false);

  const onMessagePlayed = () => {
    setMessages((messages) => messages.slice(1));

    // Auto-start listening after AI response if session is active
    if (isSessionActive && autoListen && !loading) {
      setTimeout(() => {
        if (isSessionActive && autoListen) {
          setIsRecording(true);
        }
      }, 500); // Start listening 500ms after response ends
    }
  };

  // Play audio when a new message arrives
  useEffect(() => {
    if (message && message.audio) {
      playAudio(message.audio);
    }
  }, [message]);

  useEffect(() => {
    if (messages.length > 0) {
      setMessage(messages[0]);
    } else {
      setMessage(null);
    }
  }, [messages]);

  return (
    <ChatContext.Provider
      value={{
        chat,
        message,
        onMessagePlayed,
        loading,
        cameraZoomed,
        setCameraZoomed,
        isRecording,
        setIsRecording,
        conversationHistory,
        clearHistory,
        sessionId,
        isSessionActive,
        startSession,
        endSession,
        autoListen,
        startRecording,
        stopRecording,
        currentAudio: audioRef.current // Provide current audio for lip-sync timing
      }}
    >
      {children}
    </ChatContext.Provider>
  );
};

export const useChat = () => {
  const context = useContext(ChatContext);
  if (!context) {
    throw new Error("useChat must be used within a ChatProvider");
  }
  return context;
};