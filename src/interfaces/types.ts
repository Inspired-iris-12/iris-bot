export interface OtpResponse {
    message: string;
  }
  
  export interface BotMessage {
    response: string;
  }
  
  export interface IdeaCheckResponse {
    approved: boolean;
    message?: string;
  }
  
  export interface ConcernCheckResponse {
    resolved: boolean;
    message?: string;
  }
  

export interface ApiResponse {
    text: string;
    success?: boolean;
  }
  
  export interface StreamingApiResponse extends ApiResponse {
    stream?: ReadableStream<Uint8Array>;
  }
  
  export interface IdeaCheckResponse {
    approved: boolean;
    message?: string;
  }
  
  export interface ConcernCheckResponse {
    resolved: boolean;
    message?: string;
  }