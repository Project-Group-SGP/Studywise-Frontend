"use client";

import React, { memo, useCallback, useEffect, useRef, useState } from "react";
import {
  Call,
  CallControls,
  StreamCall,
  StreamVideo,
  StreamVideoClient,
  useCall,
  useCallStateHooks,
} from "@stream-io/video-react-sdk";
import "@stream-io/video-react-sdk/dist/css/styles.css";
import {
  Mic,
  MicOff,
  Phone,
  PhoneOff,
  RefreshCw,
  Users,
  Volume2,
  VolumeX,
} from "lucide-react";
import { toast } from "sonner";
import { useAuth } from "../providers/auth";
import {
  disconnectClient,
  getOrCreateCall,
  initializeVideoClient,
  setupCallEventListeners,
} from "./StreamClient";
import { Button } from "@/components/ui/button";

interface AudioCallProps {
  callId: string;
  mode?: "fullscreen" | "embedded" | "compact";
  onCallStateChange?: (state: { isInCall: boolean; isMuted: boolean }) => void;
  className?: string;
  autoJoin?: boolean;
  showControls?: boolean;
  participantNames?: { [key: string]: string };
}

// Create a separate component for participants to prevent re-renders
const ParticipantItem = memo(
  ({ participant, currentUserId, participantNames }: { 
    participant: any; 
    currentUserId: string;
    participantNames?: { [key: string]: string };
  }) => {
    const isCurrentUser = participant.userId === currentUserId;
    
    // Improved name display logic:
    // 1. Try participant names mapping first (from Chat component)
    // 2. Fall back to participant.user?.name from Stream
    // 3. Try to show a more human-readable ID if all else fails
    const displayName = 
      participantNames?.[participant.userId] || 
      participant.user?.name || 
      (participant.userId ? `User-${participant.userId.substring(0, 6)}` : "Unknown user");

    return (
      <div className="flex items-center gap-2 p-2 bg-gray-800/50 rounded-md">
        {participant.user?.image ? (
          <img
            src={participant.user.image}
            alt={displayName}
            className="w-6 h-6 rounded-full"
          />
        ) : (
          <div className="w-6 h-6 rounded-full bg-gray-600 flex items-center justify-center text-xs text-white">
            {displayName.charAt(0).toUpperCase()}
          </div>
        )}
        <span className="text-sm text-white truncate">
          {displayName} {isCurrentUser ? "(You)" : ""}
        </span>
        {participant.isSpeaking && (
          <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse"></div>
        )}
        {participant.isMuted && <MicOff size={12} className="text-red-400" />}
      </div>
    );
  }
);

// Separate component for the audio visualizer
const AudioVisualizer = memo(({ audioStream }: { audioStream: MediaStream | null }) => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const animationRef = useRef<number | null>(null);
  const analyserRef = useRef<AnalyserNode | null>(null);
  const audioContextRef = useRef<AudioContext | null>(null);

  useEffect(() => {
    if (!audioStream || !canvasRef.current) return;

    try {
      if (!audioContextRef.current) {
        audioContextRef.current = new (window.AudioContext || (window as any).webkitAudioContext)();
      }

      const audioContext = audioContextRef.current;
      if (!analyserRef.current) {
        analyserRef.current = audioContext.createAnalyser();
        analyserRef.current.fftSize = 256;
      }

      const source = audioContext.createMediaStreamSource(audioStream);
      source.connect(analyserRef.current);

      const bufferLength = analyserRef.current.frequencyBinCount;
      const dataArray = new Uint8Array(bufferLength);

      const canvas = canvasRef.current;
      const canvasCtx = canvas.getContext("2d");

      if (!canvasCtx) {
        console.error("Failed to get canvas context");
        return;
      }

      canvas.width = canvas.offsetWidth;
      canvas.height = canvas.offsetHeight;

      const draw = () => {
        analyserRef.current?.getByteFrequencyData(dataArray);
        canvasCtx.fillStyle = "#1f2937";
        canvasCtx.fillRect(0, 0, canvas.width, canvas.height);

        const barWidth = (canvas.width / bufferLength) * 2.5;
        let x = 0;

        for (let i = 0; i < bufferLength; i++) {
          const barHeight = (dataArray[i] / 255) * canvas.height;
          const gradient = canvasCtx.createLinearGradient(0, canvas.height, 0, 0);
          gradient.addColorStop(0, "#22c55e");
          gradient.addColorStop(1, "#4ade80");
          canvasCtx.fillStyle = gradient;
          canvasCtx.fillRect(x, canvas.height - barHeight, barWidth, barHeight);
          x += barWidth + 1;
        }

        animationRef.current = requestAnimationFrame(draw);
      };

      draw();

      return () => {
        cancelAnimationFrame(animationRef.current!);
        source.disconnect();
        // Don't close the audio context every time to prevent re-creation issues
      };
    } catch (error) {
      console.error("Error setting up audio visualizer:", error);
    }
  }, [audioStream]);

  return <canvas ref={canvasRef} className="w-full h-full" />;
});

// Separate component to handle the call content
const CallContent = memo(({ user, participantNames, onLeave }: { 
  user: any; 
  participantNames?: { [key: string]: string };
  onLeave: () => void; 
}) => {
  const call = useCall();
  const { useParticipants, useRemoteParticipants } = useCallStateHooks();
  const participants = useParticipants();
  const remoteParticipants = useRemoteParticipants();
  const [isMuted, setIsMuted] = useState(false);
  
  // Remote participant audio stream (for visualizer)
  const [activeAudioStream, setActiveAudioStream] = useState<MediaStream | null>(null);
  
  // Update active audio stream when remote participants change
  useEffect(() => {
    // Find the first participant with an audio stream
    const participantWithAudio = remoteParticipants?.find(p => p.audioStream);
    if (participantWithAudio?.audioStream) {
      setActiveAudioStream(participantWithAudio.audioStream);
    } else {
      setActiveAudioStream(null);
    }
  }, [remoteParticipants]);
  
  // Add debug effect to monitor audio
  useEffect(() => {
    console.log("=== Call Audio Debug ===");
    console.log("Total participants:", participants?.length);
    console.log("Remote participants:", remoteParticipants?.length);
    
    if (call) {
      console.log("Call object:", call);
      console.log("Call type:", call.type);
      console.log("Call state:", call.state);
      console.log("Audio settings:", call.state.settings?.audio);
      
      // Check if we're receiving audio
      remoteParticipants?.forEach(participant => {
        console.log(`Participant ${participant.userId} audio state:`, participant.audioStream);
        console.log(`Participant ${participant.userId} is speaking:`, participant.isSpeaking);
        console.log(`Participant ${participant.userId} microphone state:`, participant.publishedTracks);
      });
    }
  }, [call, participants, remoteParticipants]);

  const toggleMute = useCallback(async () => {
    if (!call) return;

    try {
      if (isMuted) {
        await call.microphone?.enable();
        setIsMuted(false);
        toast.success("Microphone enabled");
      } else {
        await call.microphone?.disable();
        setIsMuted(true);
        toast.success("Microphone muted");
      }
    } catch (error) {
      console.error("Error toggling microphone:", error);
      toast.error("Failed to change microphone state");
    }
  }, [call, isMuted]);

  const leaveCall = useCallback(async () => {
    if (!call) return;
    try {
      // Use the provided onLeave callback
      onLeave();
    } catch (error) {
      console.error("Error leaving call:", error);
      toast.error("Error leaving call");
    }
  }, [call, onLeave]);
  
  // Find who is speaking
  const speakingParticipants = participants?.filter(p => p.isSpeaking) || [];
  const isAnySpeaking = speakingParticipants.length > 0;

  return (
    <div className="flex flex-col bg-gray-900 rounded-md overflow-hidden">
      {/* Minimal header like in the image */}
      <div className="bg-gray-800 px-3 py-2 flex justify-between items-center">
        <div className="flex items-center">
          <Volume2 size={16} className="text-green-400 mr-2" />
          <span className="text-sm font-medium text-white">
            Voice Call ({participants?.length || 0})
          </span>
        </div>
        
        <div className="flex items-center space-x-2">
          <button
            onClick={toggleMute}
            className={`p-1.5 rounded-full ${
              isMuted 
                ? "bg-red-500/20 text-red-400 hover:bg-red-500/30" 
                : "bg-gray-700 text-white hover:bg-gray-600"
            }`}
          >
            {isMuted ? <MicOff size={14} /> : <Mic size={14} />}
          </button>
          <button
            onClick={leaveCall}
            className="p-1.5 rounded-full bg-red-500/20 text-red-400 hover:bg-red-500/30"
          >
            <PhoneOff size={14} />
          </button>
        </div>
      </div>

      {/* Participant list directly below header - no gap */}
      <div className="pt-0.5 px-1">
        {/* Participant list */}
        <div className="flex flex-wrap gap-1 py-1">
          {participants?.map((participant) => {
            // Get user properties safely, handling any type issues
            // Need to cast to any to access properties that TypeScript doesn't recognize
            const participantAny = participant as any;
            const userImage = participantAny.user?.image;
            const userName = 
              participantNames?.[participant.userId] || 
              participantAny.user?.name || 
              (participant.userId ? `User-${participant.userId.substring(0, 6)}` : "Unknown");
            const isCurrentUser = participant.userId === user?.id;
            const participantIsMuted = participantAny.isMuted || false;
            
            return (
              <div 
                key={participant.userId}
                className={`flex items-center px-2 py-1 rounded-full ${
                  participant.isSpeaking 
                    ? "bg-green-500/20" 
                    : "bg-gray-800"
                }`}
              >
                {userImage ? (
                  <img
                    src={userImage}
                    alt="User"
                    className="w-5 h-5 rounded-full mr-1.5"
                  />
                ) : (
                  <div className="w-5 h-5 rounded-full bg-gray-600 flex items-center justify-center text-xs text-white mr-1.5">
                    {(userName || "U").charAt(0).toUpperCase()}
                  </div>
                )}
                <span className="text-xs text-white truncate max-w-24">
                  {userName}
                  {isCurrentUser && " (You)"}
                </span>
                {participantIsMuted && (
                  <MicOff size={10} className="text-red-400 ml-1" />
                )}
                {participant.isSpeaking && (
                  <div className="ml-1 w-1.5 h-1.5 rounded-full bg-green-500 animate-pulse" />
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* Only show visualizer when needed in a very compact form */}
      {isAnySpeaking && activeAudioStream && (
        <div className="h-1.5 mt-0.5 mb-1">
          <AudioVisualizer audioStream={activeAudioStream} />
        </div>
      )}
    </div>
  );
});

function AudioCall({
  callId,
  mode = "fullscreen",
  onCallStateChange,
  className = "",
  autoJoin = true,
  showControls = true,
  participantNames,
}: AudioCallProps) {
  const [client, setClient] = useState<StreamVideoClient | null>(null);
  const [callInstance, setCallInstance] = useState<Call | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isMuted, setIsMuted] = useState(false);
  const [isInCall, setIsInCall] = useState(false);
  const [connectionError, setConnectionError] = useState<string | null>(null);
  const { user, isAuthenticated } = useAuth();
  const clientRef = useRef<StreamVideoClient | null>(null);
  const callRef = useRef<Call | null>(null);
  const initializedRef = useRef(false);
  
  // Critical: Add this to track setup status and prevent multiple setups
  const setupInProgressRef = useRef(false);

  // Handle microphone permission errors
  const handlePermissionError = useCallback((error: any) => {
    console.error("Permission error:", error);
    let message;
    
    if (error.name === "NotReadableError") {
      message = "Microphone is in use by another application";
    } else if (error.name === "NotFoundError") {
      message = "No microphone found";
    } else if (error.name === "NotAllowedError") {
      message = "Microphone access denied";
    } else {
      message = "Unable to access microphone";
    }
    
    setConnectionError(message);
    setIsLoading(false);
    toast.error(message);
  }, []);

  // Mute/unmute microphone
  const toggleMute = useCallback(async () => {
    if (!callRef.current) return;

    try {
      if (isMuted) {
        await callRef.current.microphone?.enable();
        setIsMuted(false);
        onCallStateChange?.({ isInCall, isMuted: false });
        toast.success("Microphone enabled");
      } else {
        await callRef.current.microphone?.disable();
        setIsMuted(true);
        onCallStateChange?.({ isInCall, isMuted: true });
        toast.success("Microphone muted");
      }
    } catch (error) {
      console.error("Error toggling microphone:", error);
      toast.error("Failed to change microphone state");
    }
  }, [isMuted, isInCall, onCallStateChange]);

  // Leave call function
  const leaveCall = useCallback(async () => {
    if (!callRef.current) return;
    
    try {
      console.log("Leaving call:", callId);
      
      // First notify the parent component that we're leaving the call
      // This is important to do BEFORE we attempt to leave, so socket notifications happen immediately
      setIsInCall(false);
      onCallStateChange?.({ isInCall: false, isMuted });
      
      // Then leave the call through Stream's SDK
      await callRef.current.leave();
      
      toast.success("Left call successfully");
    } catch (error) {
      console.error("Error leaving call:", error);
      toast.error("Error leaving call");
      
      // If there was an error leaving, we should still consider ourselves left
      // because the parent component already thinks we left
      setIsInCall(false);
      onCallStateChange?.({ isInCall: false, isMuted });
    } finally {
      // Make sure UI reflects that we're not in the call
      setIsInCall(false);
    }
  }, [callId, isMuted, onCallStateChange]);
  
  // Setup client for audio calls
  const setupClient = useCallback(async () => {
    if (!user || !isAuthenticated || initializedRef.current || setupInProgressRef.current) {
      return;
    }
    
    setupInProgressRef.current = true;
    console.log("Setting up client for user:", user.id);
    
    try {
      setIsLoading(true);
      setConnectionError(null);
      
      // Check microphone permissions directly via getUserMedia instead of the permissions API
      try {
        const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
        console.log("Microphone access granted:", stream.getAudioTracks().length > 0);
        
        // Release the stream immediately since we're just checking permissions
        stream.getTracks().forEach(track => track.stop());
      } catch (micError) {
        console.error("Microphone access error:", micError);
        throw micError;
      }
      
      // Clean up any existing clients first
      if (user.id) {
        await disconnectClient(user.id);
      }
      
      // Initialize client
      const audioClient = await initializeVideoClient(user, true);
      clientRef.current = audioClient;
      setClient(audioClient);
      
      console.log("Client setup complete for:", user.id);
      return audioClient;
    } catch (error) {
      console.error("Error setting up client:", error);
      handlePermissionError(error instanceof Error ? error : new Error("Unknown error"));
      return null;
    } finally {
      setupInProgressRef.current = false;
    }
  }, [user, isAuthenticated, handlePermissionError]);
  
  // Separate function to setup call to avoid race conditions
  const setupCall = useCallback(async (audioClient: StreamVideoClient) => {
    if (!audioClient || !user) return null;
    
    try {
      console.log("Setting up audio call with ID:", callId);
      const newCall = await getOrCreateCall(audioClient, callId, user);
      callRef.current = newCall;
      setCallInstance(newCall);
      
      // Set up call event listeners
      setupCallEventListeners(newCall);
      
      // Handle call ending
      newCall.on('call.ended', (event) => {
        const endedBy = event.user?.id || 'another user';
        const endedByName = event.user?.name || 'Unknown user';
        
        if (endedBy !== user.id) {
          toast.info(`Call ended by ${endedByName}`);
          setIsInCall(false);
          onCallStateChange?.({ isInCall: false, isMuted });
        }
      });
      
      console.log("Audio call setup complete for:", callId);
      return newCall;
    } catch (error) {
      console.error("Error setting up audio call:", error);
      return null;
    }
  }, [callId, user, isMuted, onCallStateChange]);
  
  // Use this function to join the call
  const joinCall = useCallback(async (call: Call) => {
    if (!call) return;
    
    try {
      console.log("=== Starting Audio Call Join Process ===");
      console.log("Call ID:", callId);
      console.log("Call type:", call.type);
      console.log("Call state:", call.state);
      
      // Check if user is call creator
      const isCreator = call.state.createdBy?.id === user?.id;
      console.log(`User role: ${isCreator ? 'creator' : 'participant'}`);
      
      // Log call capabilities 
      console.log("Call capabilities:", call.state.ownCapabilities);
      
      // Check audio devices before joining
      console.log("=== Audio Device Status ===");
      try {
        const devices = await navigator.mediaDevices.enumerateDevices();
        const audioDevices = devices.filter(device => device.kind === 'audioinput');
        console.log("Available audio devices:", audioDevices);
        
        // Check if we have permission for audio
        const permissionStatus = await navigator.permissions.query({ name: 'microphone' as PermissionName });
        console.log("Microphone permission status:", permissionStatus.state);
      } catch (deviceError) {
        console.error("Error checking audio devices:", deviceError);
      }
      
      // Join the call with create option
      console.log("Attempting to join audio call...");
      await call.join({ create: true });
      console.log("Successfully joined audio call");
      
      // After joining, enable microphone
      console.log("=== Setting Up Audio Devices ===");
      try {
        console.log("Enabling microphone...");
        await call.microphone?.enable();
        console.log("Microphone enabled successfully");
        
        // Disable video if it exists (safety check)
        if (call.camera) {
          console.log("Disabling camera (not needed for audio calls)...");
          await call.camera.disable();
          console.log("Camera disabled successfully");
        }
      } catch (deviceError) {
        console.error("Error setting up audio devices:", deviceError);
        // Log specific error details
        if (deviceError instanceof Error) {
          console.error("Device error name:", deviceError.name);
          console.error("Device error message:", deviceError.message);
        }
      }
      
      // Log final device states
      console.log("=== Final Device States ===");
      console.log("Microphone state:", call.microphone?.state);
      console.log("Microphone enabled:", call.microphone?.enabled);
      
      // Update UI state
      setIsInCall(true);
      setIsMuted(false);
      onCallStateChange?.({ isInCall: true, isMuted: false });
      
      console.log("=== Audio Call Join Complete ===");
      console.log(`Successfully joined audio call as ${isCreator ? 'creator' : 'participant'}: ${callId}`);
      
    } catch (error) {
      console.error("=== Audio Call Join Error ===");
      console.error("Error joining audio call:", error);
      if (error instanceof Error) {
        console.error("Error name:", error.name);
        console.error("Error message:", error.message);
        console.error("Error stack:", error.stack);
      }
      toast.error("Failed to join audio call");
    } finally {
      setIsLoading(false);
    }
  }, [callId, onCallStateChange, user]);

  // Reconnect function
  const handleReconnect = useCallback(async () => {
    if (setupInProgressRef.current) {
      console.log("Setup already in progress, ignoring reconnect request");
      return;
    }
    
    console.log("Attempting to reconnect to audio call...");
    setConnectionError(null);
    setIsLoading(true);
    
    try {
      // First setup the client
      const audioClient = await setupClient();
      if (!audioClient) {
        toast.error("Failed to initialize audio client");
        return;
      }
      
      // Then setup the call
      const newCall = await setupCall(audioClient);
      if (!newCall) {
        toast.error("Failed to setup audio call");
        return;
      }
      
      // Join the call if autoJoin is true
      if (autoJoin) {
        await joinCall(newCall);
      } else {
        setIsLoading(false);
      }
      
      initializedRef.current = true;
    } catch (error) {
      console.error("Audio call reconnection failed:", error);
      handlePermissionError(error instanceof Error ? error : new Error("Unknown error"));
    }
  }, [setupClient, setupCall, joinCall, autoJoin, handlePermissionError]);

  // Initialize client and call only once
  useEffect(() => {
    // Only proceed if not initialized and not in progress
    if (initializedRef.current || setupInProgressRef.current || !isAuthenticated || !user) {
      return;
    }
    
    console.log("Initial setup for AudioCall component");
    
    const initialize = async () => {
      // First setup the client
      const audioClient = await setupClient();
      if (!audioClient) return;
      
      // Then setup the call
      const newCall = await setupCall(audioClient);
      if (!newCall) return;
      
      // Join the call if autoJoin is true
      if (autoJoin) {
        await joinCall(newCall);
      } else {
        setIsLoading(false);
      }
      
      initializedRef.current = true;
    };
    
    initialize();
    
    // Cleanup function
    return () => {
      console.log("Unmounting AudioCall component");
      const cleanup = async () => {
        // First notify parent component that we're leaving the call
        // This is critical for socket notifications
        if (isInCall) {
          setIsInCall(false);
          onCallStateChange?.({ isInCall: false, isMuted });
        }
        
        // Then leave the call if we're in one
        if (callRef.current && isInCall) {
          try {
            await callRef.current.leave();
            console.log("Successfully left audio call during cleanup");
          } catch (error) {
            console.error("Error leaving audio call during cleanup:", error);
          }
        }
        
        // Finally disconnect the client
        if (user && user.id) {
          try {
            await disconnectClient(user.id);
            console.log("Successfully disconnected audio client during cleanup");
          } catch (error) {
            console.error("Error disconnecting audio client during cleanup:", error);
          }
        }
      };
      
      // Execute cleanup
      cleanup().catch(err => console.error("Cleanup error:", err));
      
      initializedRef.current = false;
    };
  }, [isAuthenticated, user, setupClient, setupCall, joinCall, autoJoin, isInCall, isMuted, onCallStateChange]);

  // Compact view component
  const CompactView = useCallback(() => (
    <div className="flex items-center gap-2">
      {connectionError ? (
        <>
          <span className="text-red-500 text-sm">{connectionError}</span>
          <Button
            variant="outline"
            size="sm"
            onClick={handleReconnect}
            disabled={isLoading}
          >
            <RefreshCw className="h-4 w-4 mr-1" />
            {isLoading ? "Reconnecting..." : "Reconnect"}
          </Button>
        </>
      ) : isInCall ? (
        <>
          <Button
            variant="outline"
            size="sm"
            onClick={toggleMute}
            disabled={isLoading}
          >
            {isMuted ? <MicOff className="h-4 w-4" /> : <Mic className="h-4 w-4" />}
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={leaveCall}
            disabled={isLoading}
            className="bg-red-100 hover:bg-red-200 text-red-700"
          >
            <PhoneOff className="h-4 w-4" />
          </Button>
        </>
      ) : (
        <Button
          variant="outline"
          size="sm"
          onClick={handleReconnect}
          disabled={isLoading}
          className="bg-green-100 hover:bg-green-200 text-green-700"
        >
          <Phone className="h-4 w-4 mr-1" />
          Join
        </Button>
      )}
    </div>
  ), [connectionError, isInCall, isLoading, handleReconnect, toggleMute, leaveCall, isMuted]);

  // Embedded view component
  const EmbeddedView = useCallback(() => (
    <div className="rounded-md overflow-hidden">
      {isInCall && callInstance ? (
        <StreamVideo client={client!}>
          <StreamCall call={callInstance}>
            <CallContent user={user} participantNames={participantNames} onLeave={leaveCall} />
          </StreamCall>
        </StreamVideo>
      ) : (
        <div className="bg-gray-900 p-3 rounded-md">
          {isLoading ? (
            <div className="flex items-center justify-center">
              <div className="animate-spin mr-2 w-4 h-4 border-2 border-green-500 border-t-transparent rounded-full" />
              <p className="text-sm text-gray-300">Connecting...</p>
            </div>
          ) : connectionError ? (
            <div className="flex flex-col items-center justify-center">
              <span className="text-red-400 text-sm mb-2">{connectionError}</span>
              <Button
                variant="outline"
                size="sm"
                onClick={handleReconnect}
                disabled={isLoading}
              >
                <RefreshCw className="h-3 w-3 mr-1" />
                Reconnect
              </Button>
            </div>
          ) : (
            <Button
              onClick={handleReconnect}
              disabled={isLoading}
              size="sm"
              className="w-full bg-green-600 hover:bg-green-700 text-white"
            >
              <Phone className="h-3 w-3 mr-1" />
              Join Voice Call
            </Button>
          )}
        </div>
      )}
    </div>
  ), [isInCall, callInstance, client, isLoading, connectionError, user, toggleMute, leaveCall, isMuted, handleReconnect, participantNames]);

  // Render based on selected mode
  const renderByMode = useCallback(() => {
    if (!client || !callInstance) {
      return (
        <div className="flex justify-center items-center h-full">
          <div className="text-center">
            <div className="animate-spin mb-4 mx-auto w-12 h-12 border-4 border-primary border-t-transparent rounded-full" />
            <p className="text-lg">Initializing audio call...</p>
            {!isLoading && !isInCall && (
              <Button
                onClick={handleReconnect}
                className="mt-4 bg-green-600 hover:bg-green-700 text-white"
              >
                <Phone className="h-4 w-4 mr-2" />
                Join Audio Call
              </Button>
            )}
          </div>
        </div>
      );
    }

    return (
      <StreamVideo client={client}>
        <StreamCall call={callInstance}>
          <div className="rounded-md overflow-hidden">
            <CallContent 
              user={user} 
              participantNames={participantNames} 
              onLeave={leaveCall} 
            />
          </div>
        </StreamCall>
      </StreamVideo>
    );
  }, [client, callInstance, isLoading, isInCall, handleReconnect, leaveCall, user, participantNames]);

  // Main render
  if (isLoading && !isInCall && !connectionError) {
    return (
      <div className="flex justify-center items-center h-full">
        <div className="text-center">
          <div className="animate-spin mb-4 mx-auto w-12 h-12 border-4 border-primary border-t-transparent rounded-full" />
          <p className="text-lg">Loading audio call...</p>
        </div>
      </div>
    );
  }

  return (
    <div className={`relative ${className}`}>
      {mode === "compact" ? (
        <CompactView />
      ) : mode === "embedded" ? (
        <EmbeddedView />
      ) : (
        renderByMode()
      )}
    </div>
  );
}

export default memo(AudioCall);