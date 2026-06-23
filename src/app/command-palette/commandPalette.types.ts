export type CommandScope = "global" | "ticket";

export type CommandDefinition = {
  id: string;
  title: string;
  description: string;
  scope: CommandScope;
  disabled?: boolean;
  run: () => void;
};
