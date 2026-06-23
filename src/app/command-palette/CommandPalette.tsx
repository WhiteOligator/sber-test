import {
  Dialog,
  DialogContent,
  DialogTitle,
  List,
  ListItemButton,
  ListItemText,
  Typography,
  TextField,
} from "@mui/material";
import {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
  type KeyboardEvent as ReactKeyboardEvent,
  type ReactNode,
} from "react";
import { filterCommands } from "./commandPalette.search";
import type { CommandDefinition } from "./commandPalette.types";

type CommandPaletteProps = {
  commands: readonly CommandDefinition[];
  children: ReactNode | ((controls: { openPalette: () => void }) => ReactNode);
};

export function CommandPalette({ commands, children }: CommandPaletteProps) {
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState("");
  const [activeIndex, setActiveIndex] = useState(0);
  const inputRef = useRef<HTMLInputElement | null>(null);
  const restoreFocusRef = useRef<HTMLElement | null>(null);

  const visibleCommands = useMemo(
    () => filterCommands(commands, query),
    [commands, query],
  );

  const openPalette = useCallback(() => {
    restoreFocusRef.current = document.activeElement as HTMLElement | null;
    setOpen(true);
  }, []);

  useEffect(() => {
    const onKeyDown = (event: KeyboardEvent) => {
      if ((event.metaKey || event.ctrlKey) && event.key.toLowerCase() === "k") {
        event.preventDefault();
        openPalette();
      }
    };

    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [openPalette]);

  useEffect(() => {
    if (!open) return;
    setQuery("");
    setActiveIndex(0);
    window.setTimeout(() => inputRef.current?.focus(), 0);
  }, [open]);

  useEffect(() => {
    if (activeIndex >= visibleCommands.length) {
      setActiveIndex(Math.max(visibleCommands.length - 1, 0));
    }
  }, [activeIndex, visibleCommands.length]);

  const closePalette = () => {
    setOpen(false);
    window.setTimeout(() => restoreFocusRef.current?.focus(), 0);
  };

  const runCommand = (command: CommandDefinition) => {
    if (command.disabled) return;
    command.run();
    closePalette();
  };

  const onPaletteKeyDown = (event: ReactKeyboardEvent) => {
    if (event.key === "Escape") {
      event.preventDefault();
      closePalette();
      return;
    }

    if (event.key === "ArrowDown") {
      event.preventDefault();
      if (visibleCommands.length === 0) return;
      setActiveIndex((current) =>
        Math.min(current + 1, visibleCommands.length - 1),
      );
      return;
    }

    if (event.key === "ArrowUp") {
      event.preventDefault();
      if (visibleCommands.length === 0) return;
      setActiveIndex((current) => Math.max(current - 1, 0));
      return;
    }

    if (event.key === "Enter") {
      event.preventDefault();
      const command = visibleCommands[activeIndex];
      if (command) runCommand(command);
    }
  };

  return (
    <>
      {typeof children === "function" ? children({ openPalette }) : children}
      <Dialog
        open={open}
        onClose={closePalette}
        fullWidth
        maxWidth="sm"
        aria-labelledby="command-palette-title"
      >
        <DialogTitle id="command-palette-title">
          Command palette
          <Typography component="span" color="text.secondary" sx={{ ml: 1 }}>
            Ctrl/⌘ K
          </Typography>
        </DialogTitle>
        <DialogContent onKeyDown={onPaletteKeyDown}>
          <TextField
            inputRef={inputRef}
            value={query}
            onChange={(event) => {
              setQuery(event.target.value);
              setActiveIndex(0);
            }}
            placeholder="Search commands"
            fullWidth
            size="small"
            inputProps={{
              role: "combobox",
              "aria-expanded": true,
              "aria-controls": "command-palette-results",
              "aria-activedescendant": visibleCommands[activeIndex]
                ? `command-${visibleCommands[activeIndex].id}`
                : undefined,
            }}
          />
          <List
            id="command-palette-results"
            role="listbox"
            sx={{ mt: 2, maxHeight: 360, overflow: "auto" }}
          >
            {visibleCommands.length === 0 ? (
              <Typography color="text.secondary" sx={{ px: 2, py: 1 }}>
                No commands found
              </Typography>
            ) : null}
            {visibleCommands.map((command, index) => (
              <ListItemButton
                key={command.id}
                id={`command-${command.id}`}
                role="option"
                selected={index === activeIndex}
                disabled={command.disabled}
                onMouseEnter={() => setActiveIndex(index)}
                onClick={() => runCommand(command)}
              >
                <ListItemText
                  primary={command.title}
                  secondary={`${command.description} · ${command.scope}`}
                />
              </ListItemButton>
            ))}
          </List>
        </DialogContent>
      </Dialog>
    </>
  );
}
