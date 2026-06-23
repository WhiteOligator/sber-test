import type { CommandDefinition } from "./commandPalette.types";

const normalize = (value: string) => value.trim().toLowerCase();

export const filterCommands = (
  commands: readonly CommandDefinition[],
  query: string,
) => {
  const normalizedQuery = normalize(query);
  if (!normalizedQuery) return commands;

  return commands.filter((command) => {
    const searchable = normalize(`${command.title} ${command.description}`);
    return searchable.includes(normalizedQuery);
  });
};
