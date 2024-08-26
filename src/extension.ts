import * as vscode from 'vscode';

export function activate(context: vscode.ExtensionContext) {
    console.log('Extension "format-on-type" is now active.');

    context.subscriptions.push(
        vscode.commands.registerTextEditorCommand('type', async (textEditor, edit, args) => {
            const keyPressed = args.text;

            // Allow the default typing behavior to occur
            await vscode.commands.executeCommand('default:type', args);

            // Now apply your custom logic
            if (keyPressed === '}') {
                // Format only the changes since the last save
                await vscode.commands.executeCommand('editor.action.formatChanges');
            } else if (keyPressed === ')') {
                // Format the current line
                const position = textEditor.selection.active;
                const line = position.line;
                const range = new vscode.Range(
                    new vscode.Position(line, 0),
                    new vscode.Position(line, textEditor.document.lineAt(line).text.length)
                );
                await vscode.commands.executeCommand('editor.action.formatSelection', { range });
            }
        })
    );
}

export function deactivate() {}
