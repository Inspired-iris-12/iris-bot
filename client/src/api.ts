import axios from "axios";
import { OtpResponse } from "@/interfaces/types";
import { ApiResponse, StreamingApiResponse, IdeaCheckResponse, ConcernCheckResponse } from '@/interfaces/types';

//const API_BASE_URL = "https://iris-bot-jr71.onrender.com"; // Flask server
const API_BASE_URL = "https://iris-bot-0r5m.onrender.com"; 
// OTP APIs
export const FetchOtp = async (email: string) => {
    return axios.post(`${API_BASE_URL}/send-otp`, { email });
};

export const VerifyOtp = async (email: string, otp: string) => {
  try {
    const response = await axios.post(`${API_BASE_URL}/verify-otp`, { email, otp });
    return response.data as OtpResponse;  // Type assertion here
  } catch (error) {
    throw error;
  }
};
export const submitIdea = async (input) => {
  const url = `${API_BASE_URL}/submit-idea?input=${encodeURIComponent(input)}`;
  console.log('Submitting GET to:', url);

  const response = await fetch(url, {
    method: "GET",
    headers: {
      "Accept": "text/event-stream",
      "Cache-Control": "no-cache",
      "Connection": "keep-alive",
    },
    cache: "no-store",
  });

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`HTTP error! Status: ${response.status}, Body: ${errorText}`);
  }

  const reader = response.body?.getReader();
  const decoder = new TextDecoder();

  return {
    onData: (callback) => {
      if (!reader) throw new Error('No reader available');
      const readStream = async () => {
        try {
          let buffer = '';
          while (true) {
            const { done, value } = await reader.read();
            console.log('Reader result:', { done, value: value ? `Uint8Array[${value.length}]` : 'undefined' });
            if (done) {
              console.log('Stream ended');
              break;
            }

            const chunk = decoder.decode(value, { stream: true });
            buffer += chunk;

            // Split by double newline (SSE standard)
            const lines = buffer.split('\n\n');
            buffer = lines.pop() || ''; // Keep incomplete line

            lines.forEach(line => {
              const content = line.replace(/^data:\s*/, ''); // Remove 'data: ' once, preserve rest
              if (content) {
                console.log('Processed content:', repr(content)); // Use repr to show spaces/newlines
                callback(content); // Pass raw content with spaces and newlines
              }
            });
          }

          // Process remaining buffer
          if (buffer) {
            const content = buffer.replace(/^data:\s*/, '');
            if (content) {
              console.log('Final buffer content:', repr(content));
              callback(content);
            }
          }
        } catch (error) {
          console.error('Stream reading error:', error);
          throw error;
        }
      };
      return readStream();
    },
    cleanup: () => reader?.cancel(),
  };
};

// Helper to mimic Python's repr for logging
function repr(str) {
  return JSON.stringify(str).slice(1, -1); // Show raw string with escapes
}

// ... existing code ...

export const submitConcern = async (input) => {
  const response = await fetch(`${API_BASE_URL}/submit-concern`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "Accept": "text/event-stream",
      "Cache-Control": "no-cache",
      "Connection": "keep-alive",
    },
    body: JSON.stringify({ input }),
    cache: "no-store",
  });

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`HTTP error! Status: ${response.status}, Body: ${errorText}`);
  }

  const reader = response.body?.getReader();
  const decoder = new TextDecoder();

  return {
    onData: (callback) => {
      if (!reader) throw new Error('No reader available');
      const readStream = async () => {
        try {
          let buffer = '';
          while (true) {
            const { done, value } = await reader.read();
            console.log('Reader result:', { done, value: value ? `Uint8Array[${value.length}]` : 'undefined' });

            if (done) {
              console.log('Stream ended');
              break;
            }

            const chunk = decoder.decode(value, { stream: true });
            buffer += chunk;

            const lines = buffer.split('\n\n');
            buffer = lines.pop() || '';

            lines.forEach(line => {
              const content = line.replace(/^data:\s*/, '');
              if (content) {
                console.log('Processed content:', content);
                callback(content);
              }
            });
          }

          if (buffer) {
            const content = buffer.replace(/^data:\s*/, '');
            if (content) {
              console.log('Final buffer content:', content);
              callback(content);
            }
          }
        } catch (error) {
          console.error('Stream reading error:', error);
          throw error;
        }
      };
      return readStream();
    },
    onError: (errorCallback) => {
      // Placeholder for error handling if needed
      console.error('Stream error occurred');
      errorCallback(new Error('Stream error'));
    },
    cleanup: () => reader?.cancel(),
  };
};

// ... existing code ...

export const submitFeedback = async (input) => {
  const response = await fetch(`${API_BASE_URL}/submit-feedback`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "Accept": "text/event-stream",
      "Cache-Control": "no-cache",
      "Connection": "keep-alive",
    },
    body: JSON.stringify({ input }),
    cache: "no-store",
  });

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`HTTP error! Status: ${response.status}, Body: ${errorText}`);
  }

  const reader = response.body?.getReader();
  const decoder = new TextDecoder();

  let errorCallback = null; // Store error callback

  return {
    onData: async (callback) => {
      if (!reader) throw new Error('No reader available');
      try {
        let buffer = '';
        while (true) {
          const { done, value } = await reader.read();
          console.log('Reader result:', { done, value: value ? `Uint8Array[${value.length}]` : 'undefined' });

          if (done) {
            console.log('Stream ended');
            break;
          }

          const chunk = decoder.decode(value, { stream: true });
          buffer += chunk;

          const lines = buffer.split('\n\n');
          buffer = lines.pop() || '';

          lines.forEach(line => {
            const content = line.replace(/^data:\s*/, '');
            if (content) {
              console.log('Processed content:', content);
              callback(content);
            }
          });
        }

        if (buffer) {
          const content = buffer.replace(/^data:\s*/, '');
          if (content) {
            console.log('Final buffer content:', content);
            callback(content);
          }
        }
      } catch (error) {
        console.error('Stream reading error:', error);
        if (errorCallback) errorCallback(error);
        throw error;
      }
    },
    onError: (cb) => {
      errorCallback = cb;
    },
    cleanup: () => reader?.cancel(),
  };
};

// ... existing code ...

// ... existing code ...
// Non-streaming APIs
export const checkIdea = async (input) => {
  const response = await axios.post(`${API_BASE_URL}/check-idea`, { input });
  return response.data;
};

export const checkConcern = async (input) => {
  const response = await axios.post(`${API_BASE_URL}/check-concern`, { input });
  return response.data;
};

export const shareIdea = async (ideaText: string, email: string) => {
  try {
    const response = await fetch(`${API_BASE_URL}/share-idea`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify({ 
        idea: ideaText, 
        email: email 
      })
    });
    
    if (!response.ok) {
      throw new Error(`HTTP error! Status: ${response.status}`);
    }
    
    return await response.json();
  } catch (error) {
    console.error("Error sharing idea:", error);
    throw error;
  }
};
export const shareConcern = async (concernText: string,email:string) => {
  try {
    const response = await fetch(`${API_BASE_URL}/share-concern`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify({ 
        concern: concernText,
        email:email
      })
    });
    
    if (!response.ok) {
      throw new Error(`HTTP error! Status: ${response.status}`);
    }
    
    return await response.json();
  } catch (error) {
    console.error("Error sharing concern:", error);
    throw error;
  }
};

export const shareFeedback = async (feedbackText: string, email:string) => {
  try {
    const response = await fetch(`${API_BASE_URL}/share-feedback`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify({ 
        feedback: feedbackText,
        email:email 
      })
    });
    
    if (!response.ok) {
      throw new Error(`HTTP error! Status: ${response.status}`);
    }
    
    return await response.json();
  } catch (error) {
    console.error("Error sharing feedback:", error);
    throw error;
  }
};

