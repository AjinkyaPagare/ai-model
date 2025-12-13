import { createContext, useContext, useEffect, useRef, useState } from "react";

const getBackendBaseUrl = () => "https://059c3f4df85b.ngrok-free.app";


const buildApiUrl = (path) => {
  const base = getBackendBaseUrl();
  if (base) {
    return `${base}${path}`;
  }
  return `/api${path}`;
};

// Professional phoneme-based lipsync generation with coarticulation
const generateProfessionalLipsync = (text) => {
  // Split text into phonemes (simplified for this example)
  // In a real implementation, this would come from audio analysis
  const words = text.toLowerCase().split(' ').filter(word => word.length > 0);
  const mouthCues = [];
  let currentTime = 0;

  // Professional viseme set based on Disney/Apple standards
  const visemeMap = {
    // Vowels - strong mouth shapes
    'aa': 'A', 'ah': 'A', 'a': 'A',      // father, hot, cat
    'eh': 'E', 'ae': 'E', 'e': 'E',      // get, bat, bed
    'ih': 'I', 'i': 'I',                 // sit, see
    'oh': 'O', 'o': 'O',                 // got, boot
    'uh': 'U', 'u': 'U',                 // put, foot
    
    // Bilabials - closed lips
    'b': 'B', 'p': 'B', 'm': 'B',
    
    // Labiodentals - upper teeth on lower lip
    'f': 'F', 'v': 'F',
    
    // Interdentals - tongue between teeth
    'th': 'H',                           // thin, this
    
    // Alveolars - tongue tip on alveolar ridge
    's': 'H', 'z': 'H', 't': 'H', 'd': 'H', 'n': 'H', 'l': 'H', 'r': 'H',
    
    // Post-alveolars - tongue cupped
    'sh': 'H', 'ch': 'H', 'jh': 'H', 'zh': 'H',
    
    // Velars - back of tongue raised
    'k': 'G', 'g': 'G', 'ng': 'G',
    
    // Glides - transitional sounds
    'w': 'X', 'y': 'X',
    
    // Silence/rest
    'sil': 'X'
  };

  // Coarticulation rules - how adjacent phonemes influence each other
  const coarticulationRules = {
    'B': ['viseme_PP', 'viseme_kk'],      // Bilabials: tight lips, slight jaw closure
    'F': ['viseme_FF', 'viseme_TH'],      // Labiodentals: upper teeth on lower lip
    'H': ['viseme_TH', 'viseme_FF'],      // Interdentals/Alveolars: tongue position variety
    'G': ['viseme_kk', 'viseme_TH'],      // Velars: back of tongue raised
    'A': ['viseme_AA', 'viseme_PP'],      // Open vowels: jaw dropped
    'E': ['viseme_O', 'viseme_FF'],       // Mid vowels: moderate mouth opening
    'I': ['viseme_I', 'viseme_kk'],       // High front vowels: tongue forward
    'O': ['viseme_O', 'viseme_PP'],       // Rounded vowels: lips rounded
    'U': ['viseme_U', 'viseme_kk'],       // High back vowels: lips rounded, tongue back
    'X': ['viseme_PP', 'viseme_kk']       // Rest/silence: neutral position
  };

  words.forEach((word, wordIndex) => {
    // Convert word to approximate phonemes (in practice, this would come from audio analysis)
    const phonemes = convertWordToPhonemes(word);
    
    phonemes.forEach((phoneme, phonemeIndex) => {
      const visemeType = visemeMap[phoneme] || 'X';
      
      // Base duration calculation
      let baseDuration = 0.15; // Default for consonants
      
      // Adjust duration based on phoneme type
      if (['A', 'E', 'I', 'O', 'U'].includes(visemeType)) {
        baseDuration = 0.25; // Longer for vowels
      } else if (['B', 'P', 'M', 'F', 'V'].includes(visemeType)) {
        baseDuration = 0.1; // Shorter for stops/fricatives
      }
      
      // Apply coarticulation effects based on surrounding phonemes
      const prevPhoneme = phonemeIndex > 0 ? phonemes[phonemeIndex - 1] : 
                         wordIndex > 0 ? convertWordToPhonemes(words[wordIndex - 1]).pop() : 'sil';
      const nextPhoneme = phonemeIndex < phonemes.length - 1 ? phonemes[phonemeIndex + 1] : 
                         wordIndex < words.length - 1 ? convertWordToPhonemes(words[wordIndex + 1])[0] : 'sil';
      
      // Anticipatory timing - slightly advance transitions
      const anticipation = 0.02;
      
      mouthCues.push({
        start: currentTime - anticipation,
        end: currentTime + baseDuration,
        value: visemeType,
        phoneme: phoneme,
        prevPhoneme: prevPhoneme,
        nextPhoneme: nextPhoneme
      });
      
      currentTime += baseDuration;
      
      // Add slight pause between phonemes for natural rhythm
      if (phonemeIndex < phonemes.length - 1) {
        currentTime += 0.03;
      }
    });
    
    // Add pause between words
    if (wordIndex < words.length - 1) {
      currentTime += 0.1;
    }
  });

  const totalDuration = currentTime;
  return { mouthCues, duration: totalDuration };
};

const generateAccurateLipsync = (text) => {
  return generateProfessionalLipsync(text);
};

// Helper function to convert words to approximate phonemes
const convertWordToPhonemes = (word) => {
  // This is a simplified implementation - in reality, this would use a phoneme dictionary
  // or be derived from actual audio analysis
  
  // Handle common phoneme patterns
  const phonemePatterns = [
    { pattern: /tion/g, replacement: ['t', 'sh', 'n'] },
    { pattern: /sion/g, replacement: ['sh', 'n'] },
    { pattern: /ough/g, replacement: ['ah', 'f'] },
    { pattern: /ight/g, replacement: ['ah', 't'] },
    { pattern: /eau/g, replacement: ['o'] },
    { pattern: /ing/g, replacement: ['ih', 'ng'] },
    { pattern: /th/g, replacement: ['th'] },
    { pattern: /sh/g, replacement: ['sh'] },
    { pattern: /ch/g, replacement: ['ch'] },
    { pattern: /ph/g, replacement: ['f'] },
    { pattern: /qu/g, replacement: ['k', 'w'] },
    { pattern: /ck/g, replacement: ['k'] },
    { pattern: /ng/g, replacement: ['ng'] },
  ];
  
  // Apply patterns
  let phonemes = [word]; // Start with whole word
  
  phonemePatterns.forEach(({ pattern, replacement }) => {
    const newPhonemes = [];
    phonemes.forEach(phoneme => {
      if (pattern.test(phoneme)) {
        const parts = phoneme.split(pattern);
        for (let i = 0; i < parts.length - 1; i++) {
          newPhonemes.push(parts[i]);
          newPhonemes.push(...replacement);
        }
        newPhonemes.push(parts[parts.length - 1]);
      } else {
        newPhonemes.push(phoneme);
      }
    });
    phonemes = newPhonemes.filter(p => p.length > 0);
  });
  
  // Convert remaining letters to basic phonemes
  const result = [];
  phonemes.forEach(phoneme => {
    if (phoneme.length === 1) {
      // Map single letters to basic phonemes
      const letterMap = {
        'a': 'ae', 'e': 'eh', 'i': 'ih', 'o': 'ao', 'u': 'ah',
        'b': 'b', 'c': 'k', 'd': 'd', 'f': 'f', 'g': 'g',
        'h': 'hh', 'j': 'jh', 'k': 'k', 'l': 'l', 'm': 'm',
        'n': 'n', 'p': 'p', 'q': 'k', 'r': 'r', 's': 's',
        't': 't', 'v': 'v', 'w': 'w', 'x': 'ks', 'y': 'y', 'z': 'z'
      };
      result.push(letterMap[phoneme] || 'ah');
    } else if (phoneme.length > 1) {
      // For multi-letter segments, use the first letter's phoneme
      result.push(convertWordToPhonemes(phoneme.charAt(0))[0]);
    }
  });
  
  return result;
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
      const response = await fetch(buildApiUrl("/voice/pipeline"), {
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
          // Validate lipsync data in messages
          const validatedMessages = data.messages.map(msg => ({
            ...msg,
            lipsync: msg.lipsync || generateAccurateLipsync(msg.text || '')
          }));
          setMessages(validatedMessages);
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

        const transcriptionHeader = response.headers.get('X-Transcription') || '';
        const aiReplyHeader = response.headers.get('X-AI-Response') || '';
        const emotionHeader = response.headers.get('X-Emotion') || 'neutral';

        const transcription = transcriptionHeader ? decodeURIComponent(transcriptionHeader) : '';
        const aiReply = aiReplyHeader ? decodeURIComponent(aiReplyHeader) : 'I have processed your request';

        // Convert blob to base64
        const reader = new FileReader();
        reader.onloadend = () => {
          const base64Audio = reader.result.split(',')[1];
          const message = {
            text: aiReply,
            transcript: transcription,
            audio: base64Audio,
            lipsync: generateAccurateLipsync(aiReply),
            facialExpression: emotionHeader,
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
    
    // Force update the context to provide the new audio reference
    setCurrentAudioRef(audio);

    // Prepare Web Audio analyser for real-time lipsync if supported
    try {
      if (typeof window !== 'undefined' && window.AudioContext) {
        // Clean up any previous analyser to avoid node leaks
        cleanupAnalyser(currentAnalyser);

        const AudioCtx = window.AudioContext || window.webkitAudioContext;
        const audioContext = new AudioCtx();
        const source = audioContext.createMediaElementSource(audio);
        const analyser = audioContext.createAnalyser();
        analyser.fftSize = 2048;
        source.connect(analyser);
        analyser.connect(audioContext.destination);
        const dataArray = new Uint8Array(analyser.frequencyBinCount);

        const analyserBundle = { analyser, audioContext, source, dataArray };
        setCurrentAnalyser(analyserBundle);

        if (audioContext.state === 'suspended') {
          audioContext.resume().catch((error) => {
            console.warn('Failed to resume audio context', error);
          });
        }

        audio.onended = () => {
          cleanupAnalyser(analyserBundle);
          setCurrentAnalyser(null);
          onMessagePlayed();
        };
      } else {
        audio.onended = () => {
          onMessagePlayed();
        };
      }
    } catch (error) {
      console.warn('Error creating audio analyser:', error);
      audio.onended = () => {
        onMessagePlayed();
      };
    }

    audio.play().catch(error => {
      console.error('Error playing audio:', error);
      cleanupAnalyser(currentAnalyser);
      setCurrentAnalyser(null);
      onMessagePlayed(); // Move to next message even if audio fails
    });
  };
  
  const [currentAudioRef, setCurrentAudioRef] = useState(null);
  const clearHistory = () => {
    setConversationHistory([]);
  };

  const [messages, setMessages] = useState([]);
  const [message, setMessage] = useState();
  const [loading, setLoading] = useState(false);
  const [cameraZoomed, setCameraZoomed] = useState(true);
  const [isRecording, setIsRecording] = useState(false);
  const [currentAnalyser, setCurrentAnalyser] = useState(null);

  const cleanupAnalyser = (bundle) => {
    if (!bundle) return;
    try {
      bundle.source?.disconnect();
    } catch (err) {
      console.warn('Error disconnecting audio source', err);
    }
    try {
      bundle.analyser?.disconnect();
    } catch (err) {
      console.warn('Error disconnecting analyser', err);
    }
    try {
      if (bundle.audioContext?.state !== 'closed') {
        bundle.audioContext?.close();
      }
    } catch (err) {
      console.warn('Error closing audio context', err);
    }
  };

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
        currentAudio: currentAudioRef, // Provide current audio for lip-sync timing
        currentAnalyser
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