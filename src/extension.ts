import * as vscode from 'vscode';

export function activate(context: vscode.ExtensionContext) {
    console.log('Extension "format-on-type" is now active.');

    context.subscriptions.push(
        vscode.commands.registerTextEditorCommand('type', (textEditor, edit, args) => {
            console.log('Key pressed:', args.text);
            textEditor.insertSnippet(new vscode.SnippetString(args.text)).then(() => {
                if (args.text === '}') {
                    // Format only the changes since last save
                    vscode.commands.executeCommand('editor.action.formatChanges');
                } else if (args.text === ')') {
                    // Format the current line
                    const position = textEditor.selection.active;
                    const line = position.line;
                    const range = new vscode.Range(new vscode.Position(line, 0), new vscode.Position(line, textEditor.document.lineAt(line).text.length));
                    vscode.commands.executeCommand('editor.action.formatSelection', { range });
                }
            });
        })
    );
}

export function deactivate() {}
