import { ConfigurationTarget, ExtensionContext, Terminal, Uri, commands, window, workspace } from "vscode";

import {
  Executable,
  LanguageClient,
  LanguageClientOptions,
  ServerOptions,
  TransportKind,
} from "vscode-languageclient/node";

let client: LanguageClient;

function addPynkHeart() {
  const config = workspace.getConfiguration();
  const editorConfig: { rules?: object } = config.get(
    "editor.semanticTokenColorCustomizations"
  );

  // Modify editor.semanticTokenColorCustomizations here
  // This is just a placeholder example
  const updatedSettings = {
    ...editorConfig,
    // Add or modify settings
    rules: {
      ...editorConfig.rules,
      "enumMember:fysh": { foreground: "#e83d96", bold: true },
    },
  };

  config.update(
    "editor.semanticTokenColorCustomizations",
    updatedSettings,
    ConfigurationTarget.Global
  );
}

let terminal: Terminal;

export function activate(context: ExtensionContext) {
  const cmd = 'fysh.execInTerminal';
  const commandHandler = (file: Uri) => {
    console.log(file)
    if (!terminal) {
      terminal = window.createTerminal({
        name: 'Fysh',
      })
    }
    terminal.show();
    // TODO: Make this work on Windows?
    terminal.sendText(`go-fysh "${file.path}"`)
  };
  context.subscriptions.push(commands.registerCommand(cmd, commandHandler));
  console.log(context)

  addPynkHeart();

  // If the extension is launched in debug mode then the debug server options are used
  // Otherwise the run options are used
  const executable: Executable = {
    command: "fyshls",
    transport: TransportKind.stdio,
  };
  const serverOptions: ServerOptions = {
    run: executable,
    debug: executable,
  };

  // Options to control the language client
  const clientOptions: LanguageClientOptions = {
    // Register the server for plain text documents
    documentSelector: [{ scheme: "file", language: "fysh" }],
  };

  // Create the language client and start the client.
  client = new LanguageClient(
    "fyshls",
    "Fysh Language Server",
    serverOptions,
    clientOptions
  );

  // Start the client. This will also launch the server
  client.start();
}

export function deactivate(): Thenable<void> | undefined {
  if (!client) {
    return undefined;
  }
  return client.stop();
}
