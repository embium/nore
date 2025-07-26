import { observable } from '@legendapp/state';
import { persistObservable } from '@legendapp/state/persist';

// Types
import { DefaultPrompts } from '@/types/defaultPrompts';

// Initialize with default values
const defaultSystemPrompt = `You are an AI assistant helping the user with their notes and ideas.
Be concise, helpful, and suggest connections between topics when appropriate.
Prioritize clarity and accuracy in your responses.`;

const defaultTitlePrompt = `Generate a concise and descriptive title for the following chat. The title should only contain 3-6 short words and reflect the main topic or purpose of the initial chat message. Do not provide any punctuation or other formatting.`;

const defaultFileAttachmentsPrompt = `My request may include attached file(s). These files are important and likely the primary subject or essential context for the task I need you to perform. Please follow these guidelines:

1. **Examine Attachments First:** If files are attached to my request, your first step should be to carefully examine their content and type in relation to what I'm asking.
2. **Prioritize File Content for Relevant Tasks:**
    - If my request directly involves or refers to the attached file(s) (e.g., asking for a summary, extracting information, answering questions based on the file content, transforming the content), your response **must** be based on the information contained within those files.
    - Be accurate and faithful to the content of the attached file(s). Do not infer, invent, or add information that is not explicitly present in the files themselves when addressing file-specific aspects of my request.
3. **Addressing Different Types of Requests:**
    - **File-Specific Requests:** If my entire request is about the attached file(s) (e.g., "Summarize this document," "What are the key findings in the attached data?"), focus exclusively on the file content. If the file(s) do not contain the specific information needed to answer, clearly state that the information is not found in the provided file(s).
    - **Mixed Requests:** If my request contains parts that relate to the file(s) and other parts that are general knowledge questions or tasks, address each part accordingly. Use the file(s) for the relevant portions and your general knowledge for the others.
    - **General Requests (even with attachments):** If files are attached, but my specific question or task appears to be of a general nature and unrelated to the file content (e.g., "What time is it?", "Tell me a joke."), use your general knowledge to respond. In such cases, you generally do not need to mention the attached files unless you need to clarify their relevance to the unrelated query.
4. **Seek Clarification When Needed:** If my request is ambiguous about how or whether to use the attached file(s), please ask for clarification before proceeding. It's better to ask than to make an incorrect assumption about the files' role.
5. **State Limitations Clearly:** If you are technically unable to process a file (e.g., unsupported format, corrupted file) or a specific part of a file, please state this clearly.

--- START OF ATTACHED FILES ---

[FILE_ATTACHMENTS]

--- END OF ATTACHED FILES ---`;

// Create the observable state
export const defaultPromptsState$ = observable<DefaultPrompts>({
  system: defaultSystemPrompt,
  title: defaultTitlePrompt,
  fileAttachments: defaultFileAttachmentsPrompt,
});

// Configure persistence
persistObservable(defaultPromptsState$, {
  local: 'notebit-default-prompts',
});
