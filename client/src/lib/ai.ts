
// Note: This is a simulation of AI responses for demonstration
// In a real application, this would connect to Mistral API

type ConversationType = 'idea' | 'feedback' | 'concern' | 'general';
type ConversationStage = 'initial' | 'ongoing' | 'confirmation' | 'completed';

type MessageType = {
  id: string;
  text: string;
  isUser: boolean;
  timestamp: Date;
};

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
- After addressing their feedback, ask if they would like to share an idea, express a concern, or end the conversation

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

// Simulated responses based on prompt patterns and conversation history
const getSimulatedResponse = (
  prompt: string, 
  type: ConversationType, 
  messages: MessageType[] = [],
  stage: ConversationStage = 'initial'
): string => {
  // Convert prompt to lowercase for easier matching
  const lowerPrompt = prompt.toLowerCase();
  
  // Responses for idea sharing
  if (type === 'idea') {
    // If this is a new idea conversation or we're in the ongoing stage without a proposal yet
    if (stage === 'initial' || (stage === 'ongoing' && !messages.some(m => !m.isUser && m.text.includes("**Title/Name of the Idea:**")))) {
      // Generate a full proposal form
      return generateProposalForm(prompt);
    } 
    // If we already have a proposal and the user is making changes
    else if (stage === 'ongoing') {
      // Find the latest proposal form in the messages
      const lastProposal = [...messages]
        .reverse()
        .find(m => !m.isUser && m.text.includes("**Title/Name of the Idea:**"));
      
      if (lastProposal) {
        // Update the proposal based on user's changes
        return updateProposalForm(lastProposal.text, prompt);
      } else {
        // Fallback if we can't find the previous proposal
        return generateProposalForm(prompt);
      }
    }
    
    return generateProposalForm(prompt);
  }
  
  // Responses for feedback
  if (type === 'feedback') {
    if (lowerPrompt.includes('teacher') || lowerPrompt.includes('class')) {
      return "I appreciate you sharing your thoughts about the class. Your feedback is valuable for improving the learning experience. We'll make sure your comments reach the academic team for consideration. Would you like to share an idea, express a concern, or end our conversation now?";
    }
    
    if (lowerPrompt.includes('cafeteria') || lowerPrompt.includes('food')) {
      return "Thank you for your feedback about the cafeteria. The nutrition services team is always looking to improve, and your input is valuable. I'll make sure your comments are forwarded to them. Would you like to share an idea, express a concern, or shall we end our chat?";
    }
    
    return "I appreciate your feedback! Your input helps make our school better. I've noted your comments and will share them with the appropriate department. Is there anything else you'd like to discuss today, perhaps an idea you'd like to share or a concern to express?";
  }
  
  // Responses for concerns
  if (type === 'concern') {
    if (lowerPrompt.includes('stress') || lowerPrompt.includes('anxiety')) {
      return "School can be overwhelming at times, and your feelings of stress are completely valid. Remember that taking care of your wellbeing is just as important as academics. Our school counselor, Ms. Martinez, has an open-door policy every Tuesday and Thursday during lunch. Is there something specific that's causing this stress that you'd like to talk more about?";
    }
    
    if (lowerPrompt.includes('bully') || lowerPrompt.includes('harassment')) {
      return "I'm truly sorry you're experiencing this. Everyone deserves to feel safe at school. Your courage in speaking up is commendable. Please talk to Mr. Thompson, our vice principal, who handles these matters with strict confidentiality. Would you like to discuss this further, or would you prefer to move on to another topic?";
    }
    
    // Check if user seems satisfied and might want to move on
    if (lowerPrompt.includes('thank you') || lowerPrompt.includes('helped') || lowerPrompt.includes('better now')) {
      return "I'm glad I could be of help. Your wellbeing is important to us. Would you like to share an idea for the school, provide some feedback, or is there anything else on your mind?";
    }
    
    return "Thank you for sharing your concern with me. It's important that you feel heard and supported. While I can provide general guidance, remember that the school counselors and teachers are available to help with any specific challenges you're facing. Is there anything else about this concern you'd like to discuss?";
  }
  
  // General responses
  if (lowerPrompt.includes('hello') || lowerPrompt.includes('hi')) {
    return "Hello! I'm here to help. Would you like to share an idea, provide feedback, or express a concern?";
  }
  
  if (lowerPrompt.includes('thank')) {
    return "You're welcome! I'm here to help anytime you need assistance. Would you like to share an idea, provide feedback, or express another concern?";
  }
  
  if (lowerPrompt.includes('school hours') || lowerPrompt.includes('schedule')) {
    return "Our school hours are from 8:00 AM to 3:15 PM, Monday through Friday. The main office is open from 7:30 AM to 4:00 PM if you need to speak with staff. Is there something specific about the schedule you'd like to know?";
  }
  
  // Default response
  return "I appreciate your message. Is there something specific about your school experience that you'd like to discuss or get information about? I'm here to help with ideas, feedback, or concerns.";
};

const generateProposalForm = (prompt: string): string => {
  // Generate a proposal form based on the user's idea
  if (prompt.toLowerCase().includes('club') || prompt.toLowerCase().includes('society')) {
    return "**Title/Name of the Idea:**\nStudent Club Initiative - " + prompt.split(' ').slice(0, 3).join(' ') + "\n\n" +
           "**Explanation:**\nA new student-led club focusing on " + prompt.toLowerCase().replace('club', '').replace('society', '') + 
           ". This would be available to students in grades 9-12, providing opportunities for skill development, social connection, and leadership experience.\n\n" +
           "**Objective:**\nTo create a structured environment for students to explore shared interests while developing organizational and teamwork skills. " +
           "This club addresses the need for more extracurricular activities that connect students with similar interests.\n\n" +
           "**Process:**\n1. Gather at least 5 interested students\n" +
           "2. Approach Mr. Johnson, the Student Activities Coordinator, to discuss your club idea\n" +
           "3. Draft a formal proposal including meeting times, space requirements, and activities\n" +
           "4. Submit your proposal to the Student Council for review\n" +
           "5. Once approved, schedule an initial meeting in the Student Commons area\n" +
           "6. Design posters for the club fair with the help of Ms. Williams from the Arts Department\n" +
           "7. Recruit members during club week in September";
  }
  
  if (prompt.toLowerCase().includes('event') || prompt.toLowerCase().includes('activity')) {
    return "**Title/Name of the Idea:**\nStudent Event - " + prompt.split(' ').slice(0, 3).join(' ') + "\n\n" +
           "**Explanation:**\nA school event designed to engage students across multiple grade levels. " +
           "This activity would provide entertainment, community building, and potentially raise awareness or funds for school initiatives. " +
           "It would be available to students in grades " + (Math.floor(Math.random() * 3) + 9) + "-12.\n\n" +
           "**Objective:**\nTo create a memorable experience that fosters school spirit and student engagement outside the classroom. " +
           "This event addresses the need for more community-building activities and opportunities for creative expression.\n\n" +
           "**Process:**\n1. Complete the Event Proposal Form available from Ms. Williams in the Student Affairs office\n" +
           "2. Select potential dates by checking the school calendar for availability\n" +
           "3. Reserve necessary spaces through the Facilities Department (Mr. Garcia)\n" +
           "4. Arrange for required equipment and materials at least two weeks in advance\n" +
           "5. Recruit student volunteers and faculty supervisors\n" +
           "6. Promote the event through morning announcements and approved poster locations\n" +
           "7. Set up a budget proposal for any necessary funds with help from Ms. Johnson in Accounting";
  }
  
  // Default proposal
  return "**Title/Name of the Idea:**\n" + prompt.split(' ').slice(0, 4).join(' ') + "\n\n" +
         "**Explanation:**\nA new initiative to enhance the student experience at our school. This would benefit students across multiple grade levels " +
         "by providing additional opportunities for growth and engagement. It focuses on " + prompt.toLowerCase() + " which will help students develop important skills.\n\n" +
         "**Objective:**\nTo address an identified need within our school community and implement a solution that improves student life. " +
         "This initiative aims to solve the problem of " + (prompt.includes('lack') ? prompt : "limited opportunities for " + prompt.toLowerCase()) + ".\n\n" +
         "**Process:**\n1. Refine your concept with input from peers and a faculty mentor\n" +
         "2. Schedule a meeting with Mr. Peterson, the Student Life Coordinator, to discuss feasibility\n" +
         "3. Develop a detailed implementation timeline and resource requirements\n" +
         "4. Present your proposal to the Student Council during their monthly review session\n" +
         "5. Upon approval, begin implementation with regular progress updates to your faculty advisor\n" +
         "6. Gather feedback from participants to make improvements\n" +
         "7. Prepare a summary report for school administration";
};

const updateProposalForm = (previousProposal: string, userChanges: string): string => {
  // This function would update the proposal based on user's feedback
  // For simulation, we'll make some simple changes based on keywords
  
  let updatedProposal = previousProposal;
  
  // Extract the sections
  const titleMatch = previousProposal.match(/\*\*Title\/Name of the Idea:\*\*(.*?)(?=\*\*Explanation)/s);
  const explanationMatch = previousProposal.match(/\*\*Explanation:\*\*(.*?)(?=\*\*Objective)/s);
  const objectiveMatch = previousProposal.match(/\*\*Objective:\*\*(.*?)(?=\*\*Process)/s);
  const processMatch = previousProposal.match(/\*\*Process:\*\*(.*?)$/s);
  
  // Apply changes based on user feedback
  if (userChanges.toLowerCase().includes('title')) {
    // User wants to change the title
    const newTitleParts = userChanges.split(' ').slice(userChanges.toLowerCase().indexOf('title') + 1);
    if (newTitleParts.length > 2 && titleMatch) {
      const newTitle = newTitleParts.join(' ').replace(/[.,:;]/g, '');
      updatedProposal = updatedProposal.replace(titleMatch[0], "**Title/Name of the Idea:**\n" + newTitle + "\n\n**Explanation:");
    }
  }
  
  if (userChanges.toLowerCase().includes('grade') || userChanges.toLowerCase().includes('year')) {
    // User wants to change grade levels
    if (explanationMatch) {
      let newExplanation = explanationMatch[1];
      if (userChanges.match(/grade[s]? (\d+)-(\d+)/i)) {
        const gradeMatch = userChanges.match(/grade[s]? (\d+)-(\d+)/i);
        if (gradeMatch) {
          newExplanation = newExplanation.replace(/grade[s]? \d+-\d+/i, "grades " + gradeMatch[1] + "-" + gradeMatch[2]);
        }
      }
      updatedProposal = updatedProposal.replace(explanationMatch[0], "**Explanation:**" + newExplanation + "**Objective:");
    }
  }
  
  if (userChanges.toLowerCase().includes('objective') || userChanges.toLowerCase().includes('problem')) {
    // User wants to change the objective
    if (objectiveMatch && userChanges.length > 20) {
      const objectiveStartIdx = userChanges.toLowerCase().indexOf('objective');
      const problemStartIdx = userChanges.toLowerCase().indexOf('problem');
      const startIdx = objectiveStartIdx > -1 ? objectiveStartIdx : (problemStartIdx > -1 ? problemStartIdx : 0);
      const newObjectivePart = userChanges.substring(startIdx);
      updatedProposal = updatedProposal.replace(objectiveMatch[0], "**Objective:**\nTo address " + newObjectivePart + "\n\n**Process:");
    }
  }
  
  if (userChanges.toLowerCase().includes('process') || userChanges.toLowerCase().includes('step')) {
    // User wants to change the process
    if (processMatch && userChanges.length > 20) {
      // Simply append a new step for simulation
      const steps = processMatch[1].split('\n');
      const lastStepNumber = parseInt(steps[steps.length - 2]?.match(/^\d+/)?.[0] || "0");
      
      if (lastStepNumber) {
        const newStep = (lastStepNumber + 1) + ". " + userChanges.split(' ').slice(3).join(' ');
        const newProcess = processMatch[1].trim() + "\n" + newStep;
        updatedProposal = updatedProposal.replace(processMatch[0], "**Process:**\n" + newProcess);
      }
    }
  }
  
  return updatedProposal;
};

export const getChatResponse = async (
  prompt: string, 
  type: ConversationType = 'general',
  messages: MessageType[] = [],
  stage: ConversationStage = 'initial'
): Promise<string> => {
  console.log(`Processing prompt for ${type} conversation at stage ${stage}: ${prompt}`);
  console.log(`Using system prompt for ${type}:`, systemPrompts[type].substring(0, 100) + '...');
  
  // Simulate API delay
  await new Promise(resolve => setTimeout(resolve, 1500 + Math.random() * 1000));
  
  // In a real implementation, this would call the Mistral API
  // For demo purposes, we use simulated responses
  return getSimulatedResponse(prompt, type, messages, stage);
};

// Simulated proposal submission function
export const submitProposal = async (proposal: string): Promise<void> => {
  console.log("Submitting proposal to server:", proposal);
  
  // Simulate API delay
  await new Promise(resolve => setTimeout(resolve, 2000));
  
  // In a real implementation, this would send the proposal to the server
  // For now, we just log it to the console
  
  // Sample HTTP request that would be implemented
  /*
  try {
    const response = await fetch('https://your-supabase-url/rest/v1/proposals', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'apikey': 'your-supabase-api-key',
        'Authorization': 'Bearer your-supabase-api-key'
      },
      body: JSON.stringify({
        proposal_text: proposal,
        submitted_at: new Date().toISOString(),
        status: 'pending'
      })
    });
    
    if (!response.ok) {
      throw new Error('Failed to submit proposal');
    }
    
    return await response.json();
  } catch (error) {
    console.error('Error submitting proposal:', error);
    throw error;
  }
  */
  
  return Promise.resolve();
};

// In a real implementation, this would be the actual Mistral API call
/*
export const getChatResponse = async (
  prompt: string,
  type: ConversationType = 'general',
  messages: MessageType[] = [],
  stage: ConversationStage = 'initial'
): Promise<string> => {
  try {
    // Prepare message history for context
    const messageHistory = messages
      .filter(m => m.id !== '1' && m.id !== '2') // Filter out initial greeting messages
      .slice(-10) // Take only the last 10 messages for context
      .map(m => ({
        role: m.isUser ? 'user' : 'assistant',
        content: m.text
      }));
    
    // Add system message and current user prompt
    const apiMessages = [
      {
        role: 'system',
        content: systemPrompts[type]
      },
      ...messageHistory,
      {
        role: 'user',
        content: prompt
      }
    ];
    
    const response = await fetch('https://api.mistral.ai/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${process.env.MISTRAL_API_KEY}`
      },
      body: JSON.stringify({
        model: 'mistral-large-latest',
        messages: apiMessages,
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

