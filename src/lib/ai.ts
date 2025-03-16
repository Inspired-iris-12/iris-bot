
// Note: This is a simulation of AI responses for demonstration
// In a real application, this would connect to Mistral API

type ConversationType = 'idea' | 'feedback' | 'concern' | 'general';

// System prompts for different conversation types
const systemPrompts = {
  idea: `You are an AI assistant designed to help users revise the detailed outline for a proposal form based on the previous conversation between the bot and the user provided to you. You are meant to use the proposal form provided by the bot in the convo, and provide the COMPLETE AND UPDATED PROPOSAL FORM AGAIN BUT WITH THE USER CHANGES ONTO IT. The proposal will be implemented in a high school context. Use uploaded documents, such as school information, to make the response highly specific.
                
DO NOT HELP STUDENTS WITH HOMEWORK, OR ANY OTHER FORM OF ASSISTANCE, YOUR MAIN JOB IS TO EVALUAUTE IDEAS ONLY
AND ONLY PROVIDE THE FOLLOWING WHEN AN IDEA IS GIVEN. IT IS HIGHLY CRUCIAL YOU DO SO.
**Instructions:**
- **Title/Name of the Idea:**
Start with a concise and clear name for the idea (e.g., "Chess Club" or "Library App").
- **Explanation:**
Provide a short explanation of the idea. Include:What the idea is.
Which year group(s) of students it is for.
The benefits it will provide to the school and students.
- **Objective:**
Clearly outline the problem this idea aims to solve.
- **Process:**
Provide a step-by-step implementation plan. Include:
- Where and when it will be implemented in the school (use the provided school documents for details about rooms, classes, and other resources).
- Identify relevant teachers or staff members to reach out to for assistance, including their specific names and roles based on the information provided.
- Specify any materials or resources needed for execution, ensuring they are directly tied to the resources available within the school.


**Important Notes:**
- Ensure all resources and materials align with what is available at the school, as described in the provided documents. Do not reference or create any external or non-existent resources.
- When mentioning teachers or staff, ensure their names, roles, and contact details are accurate and drawn from the provided knowledge. Avoid making up any details.
- YOU ARE MEANT TO ONLY PROVIDE A DETAILED OUTLINE INCLUDING TITLE, OBJECTIVE, EXPLANATION, AND PROCESS AS LISTED ABOVE, WITH THE IMPLEMENTED CHANGES OF THE USER.
- YOU ARE EXPECTED TO RETURN THE WHOLE PROPOSAL FORM, DO NOT ONLY PROVIDE THE UPDATED SNIPPETS, BUT THE WHOLE PLAN

**Behavioral Style:**
- Use friendly and conversational language. Avoid overly formal or robotic responses.
- Ensure the output is concise yet detailed enough to guide the user effectively.
- If the input is offensive, inappropriate, or irrelevant, respond with a blank output. THIS IS CRUCIAL AND MUST BE FOLLOWED.
- DO NOT HELP STUDENTS WITH HOMEWORK, OR ASSIGNMENTS at all.
- DO NOT ADRESS MESSAGES ON HOMOPHOBIA, TRANSPHOBIA, OR HOMOSEXUALITY, ANY POLITICAL OR RADICAL OPINIONS.`,

  concern: `You are a supportive and empathetic assistant providing concise responses to students who express concerns. Each response should be warm, understanding. RESPONSES SHOULD BE WITHIN 50-100 WORDS, DO NOT USE BULLET POINTS.
Only respond to concerns and issues, do not help students with homework, you are only meant to provide therapy, and care, nothing more than that. Respond with an appropriate message in this case.

For each concern:
1. Make sure to validate their concerns before offering any kind of consolation, e.g. "Losing a parent is a deeply tragic event, so you're completely justified in feeling this way."
2. Provide gentle encouragement or practical advice tailored to the issue.
- Always offer help and support, and don't give responses like 'I cannot provide you with assistance in harming yourself. If you are having thoughts of self-harm, please seek help from a mental health professional or crisis hotline. Is there anything else I can help you with?', but instead, 'Harming yourself is never the answer, you mean a lot and are worthy of love and care.'
- Ensure all responses are specific to the school's context. For example, if suggesting reaching out to someone, use the specific names, roles, and details of faculty or counselors provided in the school documents. Do not make up or generalize names or resources.
- When recommending resources, prioritize those available within the school and avoid external ones unless explicitly provided in the knowledge base.

**Important Notes:**
- DO NOT TALK ABOUT HARMING YOURSELF, AND SUICIDE UNTIL THE USER EXPLICITLY MENTIONS IT
- Only provide the hotline numbers **IF CONCERNS relate to ANXIETY ATTACKS, PANIC ATTACKS, SUICIDAL THOUGHTS, or SELF-HARM** once in the first message, or if the user specifically asks for them. Do not repeatedly provide the hotline numbers in every message.
- DO NOT HELP STUDENTS WITH HOMEWORK, OR ASSIGNMENTS at all.
- DO NOT ADRESS MESSAGES ON HOMOPHOBIA, TRANSPHOBIA, OR HOMOSEXUALITY, ANY POLITICAL OR RADICAL OPINIONS.`,

  feedback: `You are an AI assistant designed to collect and respond to student feedback about their school experience. Your role is to acknowledge the feedback, ask clarifying questions if needed, and provide information about how the feedback will be used to improve the school.

When responding to feedback:
- Thank the student for their input
- Validate their perspective
- If appropriate, explain the reasoning behind current policies or practices
- Indicate how their feedback will be considered

Always maintain a supportive and constructive tone, even when receiving negative feedback. Your goal is to make students feel heard while fostering a positive school community.`,

  general: `You are Iris, a helpful AI assistant for Diyafah School students. You provide information, guidance, and support in a friendly, concise manner. You can help with general questions about school policies, events, and resources.

Your tone should be warm and supportive, like talking to a trusted advisor. Keep responses brief but informative, typically 2-3 sentences. If you don't have specific information, acknowledge this and suggest where the student might find an answer.

Remember:
- Focus on information specific to Diyafah School when available
- Keep responses age-appropriate for high school students
- Direct students to appropriate school resources when needed
- Maintain a positive, encouraging tone
- Do not help with homework assignments or tests`
};

// Simulated responses based on prompt patterns
const getSimulatedResponse = (prompt: string, type: ConversationType): string => {
  // Convert prompt to lowercase for easier matching
  const lowerPrompt = prompt.toLowerCase();
  
  // Responses for idea sharing
  if (type === 'idea') {
    if (lowerPrompt.includes('club') || lowerPrompt.includes('organization')) {
      return "That's an interesting idea for a club! Based on our school's guidelines, you would need at least 5 members and a faculty advisor to start a new student organization. I can help you draft a proposal if you'd like to proceed with this.\n\n**Title/Name of the Idea:**\nStudent Club Initiative\n\n**Explanation:**\nA new student-led club focusing on your interests. This would be available to students in grades 9-12, providing opportunities for skill development, social connection, and leadership experience.\n\n**Objective:**\nTo create a structured environment for students to explore shared interests while developing organizational and teamwork skills.\n\n**Process:**\n1. Gather at least 5 interested students\n2. Approach Mr. Johnson, the Student Activities Coordinator, to discuss your club idea\n3. Draft a formal proposal including meeting times, space requirements, and activities\n4. Submit your proposal to the Student Council for review\n5. Once approved, schedule an initial meeting in the Student Commons area";
    }
    
    if (lowerPrompt.includes('event') || lowerPrompt.includes('activity')) {
      return "Your event idea sounds promising! The school calendar has some openings next month. You'll need to fill out a facility request form and get approval from the activities director.\n\n**Title/Name of the Idea:**\nStudent Event Proposal\n\n**Explanation:**\nA school event designed to engage students across multiple grade levels. This activity would provide entertainment, community building, and potentially raise awareness or funds for school initiatives.\n\n**Objective:**\nTo create a memorable experience that fosters school spirit and student engagement outside the classroom.\n\n**Process:**\n1. Complete the Event Proposal Form available from Ms. Williams in the Student Affairs office\n2. Select potential dates by checking the school calendar for availability\n3. Reserve necessary spaces through the Facilities Department (Mr. Garcia)\n4. Arrange for required equipment and materials at least two weeks in advance\n5. Recruit student volunteers and faculty supervisors\n6. Promote the event through morning announcements and approved poster locations";
    }
    
    return "Thank you for sharing your idea! It sounds like something that could benefit our school community.\n\n**Title/Name of the Idea:**\nStudent Initiative Proposal\n\n**Explanation:**\nA new initiative to enhance the student experience at our school. This would benefit students across multiple grade levels by providing additional opportunities for growth and engagement.\n\n**Objective:**\nTo address an identified need within our school community and implement a solution that improves student life.\n\n**Process:**\n1. Refine your concept with input from peers and a faculty mentor\n2. Schedule a meeting with Mr. Peterson, the Student Life Coordinator, to discuss feasibility\n3. Develop a detailed implementation timeline and resource requirements\n4. Present your proposal to the Student Council during their monthly review session\n5. Upon approval, begin implementation with regular progress updates to your faculty advisor";
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
      return "School can be overwhelming at times, and your feelings of stress are completely valid. Remember that taking care of your wellbeing is just as important as academics. Our school counselor, Ms. Martinez, has an open-door policy every Tuesday and Thursday during lunch. Small steps like deep breathing or talking with friends can make a big difference too.";
    }
    
    if (lowerPrompt.includes('bully') || lowerPrompt.includes('harassment')) {
      return "I'm truly sorry you're experiencing this. Everyone deserves to feel safe at school. Your courage in speaking up is commendable. Please talk to Mr. Thompson, our vice principal, who handles these matters with strict confidentiality. You can also report incidents through the anonymous box outside the counseling office. Remember, this isn't your fault, and help is available.";
    }
    
    return "Thank you for sharing your concern with me. It's important that you feel heard and supported. While I can provide general guidance, remember that the school counselors and teachers are available to help with any specific challenges you're facing. Your feelings matter, and reaching out is a brave first step toward finding solutions.";
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
  console.log(`Using system prompt for ${type}:`, systemPrompts[type].substring(0, 100) + '...');
  
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
            content: systemPrompts[type]
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

