export type PromptType = 'system' | 'title' | 'fileAttachments';

export interface DefaultPrompts {
  system: string;
  title: string;
  fileAttachments: string;
}
