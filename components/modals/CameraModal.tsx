import React, { useState, useRef, useEffect, useCallback } from 'react';
import { XIcon, CameraIcon, VideoIcon, CameraReverseIcon } from '../assets/Icons';

interface CameraModalProps {
  mode: 'photo' | 'video';
  onClose: () => void;
  onCapture: (attachment: { data: string; mimeType: string; name: string; }) => void;
}

const blobToBase64 = (blob: Blob): Promise<string> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onloadend = () => resolve(reader.result as string);
    reader.onerror = reject;
    reader.readAsDataURL(blob);
  });
};

const CameraModal: React.FC<CameraModalProps> = ({ mode, onClose, onCapture }) => {
  const videoRef = useRef<HTMLVideoElement>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  
  const [isRecording, setIsRecording] = useState(false);
  const [recordedChunks, setRecordedChunks] = useState<Blob[]>([]);
  const [currentMode, setCurrentMode] = useState<'photo' | 'video'>(mode);
  const [facingMode, setFacingMode] = useState<'user' | 'environment'>('user');
  const [error, setError] = useState<string | null>(null);

  const stopCamera = useCallback(() => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach(track => track.stop());
      streamRef.current = null;
    }
  }, []);

  const startCamera = useCallback(async () => {
    // Stop any existing stream before starting a new one
    stopCamera();
    try {
      setError(null);
      const constraints = {
        video: { facingMode: facingMode },
        audio: true,
      };
      const stream = await navigator.mediaDevices.getUserMedia(constraints);
      streamRef.current = stream;
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
      }
    } catch (err) {
      console.error('Error accessing camera:', err);
      setError('Could not access camera. Please check permissions.');
    }
  }, [facingMode, stopCamera]);

  useEffect(() => {
    startCamera();
    return () => {
      stopCamera();
    };
  }, [startCamera, stopCamera]);

  const handleSwitchCamera = () => {
    setFacingMode(prev => prev === 'user' ? 'environment' : 'user');
  };

  const handleTakePhoto = async () => {
    if (videoRef.current) {
      const canvas = document.createElement('canvas');
      canvas.width = videoRef.current.videoWidth;
      canvas.height = videoRef.current.videoHeight;
      const context = canvas.getContext('2d');
      if (context) {
        // Flip the image horizontally if it's from the front camera
        if (facingMode === 'user') {
          context.translate(canvas.width, 0);
          context.scale(-1, 1);
        }
        context.drawImage(videoRef.current, 0, 0, canvas.width, canvas.height);
      }
      
      const blob = await new Promise<Blob | null>(resolve => canvas.toBlob(resolve, 'image/jpeg'));
      if (blob) {
        const dataUrl = await blobToBase64(blob);
        onCapture({
          data: dataUrl,
          mimeType: 'image/jpeg',
          name: `photo-${Date.now()}.jpg`,
        });
      }
    }
  };

  const handleStartRecording = () => {
    if (streamRef.current) {
      setRecordedChunks([]);
      const options = { mimeType: 'video/webm' };
      mediaRecorderRef.current = new MediaRecorder(streamRef.current, options);
      mediaRecorderRef.current.ondataavailable = (event) => {
        if (event.data.size > 0) {
          setRecordedChunks((prev) => [...prev, event.data]);
        }
      };
      mediaRecorderRef.current.onstop = async () => {
          const videoBlob = new Blob(recordedChunks, { type: 'video/webm' });
          const dataUrl = await blobToBase64(videoBlob);
          onCapture({
              data: dataUrl,
              mimeType: 'video/webm',
              name: `video-${Date.now()}.webm`,
          });
      };
      mediaRecorderRef.current.start();
      setIsRecording(true);
    }
  };

  const handleStopRecording = () => {
    mediaRecorderRef.current?.stop();
    setIsRecording(false);
  };
  
  const handleShutterClick = () => {
    if (currentMode === 'photo') {
        handleTakePhoto();
    } else {
        isRecording ? handleStopRecording() : handleStartRecording();
    }
  };

  return (
    <div className="fixed inset-0 bg-black z-50 flex flex-col items-center justify-center">
      <video ref={videoRef} autoPlay playsInline muted className="w-full h-full object-cover" style={{ transform: facingMode === 'user' ? 'scaleX(-1)' : 'scaleX(1)' }}/>

      {error && (
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 text-white bg-red-500/80 p-4 rounded-lg">
            {error}
        </div>
      )}

      <button onClick={onClose} className="absolute top-4 right-4 text-white bg-black/50 rounded-full p-2">
        <XIcon className="w-6 h-6" />
      </button>

      <div className="absolute bottom-0 left-0 right-0 p-6 bg-gradient-to-t from-black/70 to-transparent flex items-center justify-between">
        <div className="w-1/3 flex justify-start">
           <button onClick={() => setCurrentMode(m => m === 'photo' ? 'video' : 'photo')} className={`p-2 rounded-full text-white bg-white/20 hover:bg-white/30`}>
                {currentMode === 'photo' ? <VideoIcon className="w-7 h-7"/> : <CameraIcon className="w-7 h-7 text-white" />}
            </button>
        </div>
        <div className="w-1/3 flex justify-center">
            <button onClick={handleShutterClick} className="w-20 h-20 rounded-full border-4 border-white flex items-center justify-center transition-colors hover:bg-white/20">
                {currentMode === 'video' && isRecording && <div className="w-8 h-8 bg-red-500 rounded-md animate-pulse"></div>}
            </button>
        </div>
        <div className="w-1/3 flex justify-end">
            <button onClick={handleSwitchCamera} className="p-2 rounded-full text-white bg-white/20 hover:bg-white/30">
                <CameraReverseIcon className="w-7 h-7"/>
            </button>
        </div>
      </div>
    </div>
  );
};

export default CameraModal;
