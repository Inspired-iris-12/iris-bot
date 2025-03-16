
// Note: This is a simulation of AI responses for demonstration
// In a real application, this would connect to Mistral API

type ConversationType = 'idea' | 'feedback' | 'concern' | 'general';

// Simulated responses based on prompt patterns
const getSimulatedResponse = (prompt: string, type: ConversationType): string => {
  // Convert prompt to lowercase for easier matching
  const lowerPrompt = prompt.toLowerCase();
  
  // Responses for idea sharing
  if (type === 'idea') {
    if (lowerPrompt.includes('club') || lowerPrompt.includes('organization')) {
      return "That's an interesting idea for a club! Based on our school's guidelines, you would need at least 5 members and a faculty advisor to start a new student organization. I can help you draft a proposal if you'd like to proceed with this.";
    }
    
    if (lowerPrompt.includes('event') || lowerPrompt.includes('activity')) {
      return "Your event idea sounds promising! The school calendar has some openings next month. You'll need to fill out a facility request form and get approval from the activities director. Would you like me to provide more details about this process?";
    }
    
    return "Thank you for sharing your idea! It sounds like something that could benefit our school community. To move forward, I suggest discussing this with your guidance counselor or the student council representative. They can provide resources and connections to help implement your vision.";
  }
  
  // Responses for feedback
  if (type === 'feedback') {
    if (lowerPrompt.includes('teacher') || lowerPrompt.includes('class')) {
      return "I appreciate you sharing your thoughts about the class. Your feedback is valuable for improving the learning experience. Have you tried discussing your concerns directly with your teacher during office hours? They might be able to provide additional support or clarify their teaching approach.";
    }
    
    if (lowerPrompt.includes('cafeteria') || lowerPrompt.includes('food')) {
      return "Thank you for your feedback about the cafeteria. The nutrition services team is always looking to improve. I'll make sure your comments are forwarded to them. In the meantime, did you know that students can join the cafeteria advisory committee to have direct input on menu planning?";
    }
    
    return "I appreciate your feedback! Your input helps make our school better. I've noted your comments and will share them with the appropriate department. If you have any specific suggestions for improvement, please feel free to share those as well.";
  }
  
  // Responses for concerns
  if (type === 'concern') {
    if (lowerPrompt.includes('stress') || lowerPrompt.includes('anxiety')) {
      return "I understand that school can be stressful at times. Your feelings are valid and you're not alone in experiencing this. Our school counselors are available to provide support and strategies for managing stress. Would you like information about counseling services or some quick stress-relief techniques you can try?";
    }
    
    if (lowerPrompt.includes('bully') || lowerPrompt.includes('harassment')) {
      return "I'm really sorry to hear you're experiencing this. Our school has a zero-tolerance policy for bullying and harassment. You deserve to feel safe at school. I encourage you to speak with a trusted adult like a counselor, teacher, or administrator who can take immediate steps to address the situation. Would you like information on how to report this confidentially?";
    }
    
    return "Thank you for sharing your concern with me. It's important that you feel heard and supported. While I can provide general guidance, remember that the school counselors and teachers are available to help with any specific challenges you're facing. Is there something specific I can help you with today?";
  }
  
  // General responses
  if (lowerPrompt.includes('hello') || lowerPrompt.includes('hi')) {
    return "Hello! I'm here to help. Would you like to share an idea, provide feedback, or express a concern?";
  }
  
  if (lowerPrompt.includes('thank')) {
    return "You're welcome! I'm here to help anytime you need assistance.";
  }
  
  if (lowerPrompt.includes('school hours') || lowerPrompt.includes('schedule')) {
    return "Our school hours are from 8:00 AM to 3:15 PM, Monday through Friday. The main office is open from 7:30 AM to 4:00 PM if you need to speak with staff.";
  }
  
  // Default response
  return "I appreciate your message. Is there something specific about your school experience that you'd like to discuss or get information about? I'm here to help with ideas, feedback, or concerns.";
};

export const getChatResponse = async (
  prompt: string, 
  type: ConversationType = 'general'
): Promise<string> => {
  console.log(`Processing prompt for ${type} conversation: ${prompt}`);
  
  // Simulate API delay
  await new Promise(resolve => setTimeout(resolve, 1500 + Math.random() * 1000));
  
  // In a real implementation, this would call the Mistral API
  // For demo purposes, we use simulated responses
  return getSimulatedResponse(prompt, type);
};

// In a real implementation, this would be the actual Mistral API call
/*
export const getChatResponse = async (
  prompt: string,
  type: ConversationType = 'general'
): Promise<string> => {
  try {
    const response = await fetch('https://api.mistral.ai/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${process.env.MISTRAL_API_KEY}`
      },
      body: JSON.stringify({
        model: 'mistral-large-latest',
        messages: [
          {
            role: 'system',
            content: `You are Iris, a helpful AI assistant for high school students. You help with:
                     - Processing student ideas and providing guidance
                     - Accepting and responding to feedback about the school
                     - Offering consolation and support for concerns
                     Be concise, supportive, and provide accurate information based on the high_school_info.pdf document.
                     Current conversation type: ${type}`
          },
          {
            role: 'user',
            content: prompt
          }
        ],
        temperature: 0.7,
        max_tokens: 1000
      })
    });

    const data = await response.json();
    return data.choices[0].message.content;
  } catch (error) {
    console.error('Error calling Mistral API:', error);
    throw error;
  }
};
*/
