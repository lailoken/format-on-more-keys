import * as vscode from 'vscode';

export function activate(context: vscode.ExtensionContext) {
    console.log('Extension "format-on-type" is now active.');

    context.subscriptions.push(
        vscode.commands.registerTextEditorCommand('type', async (textEditor, edit, args) => {

            // Allow the default typing behavior to occur
            await vscode.commands.executeCommand('default:type', args);

            if (args.text === '}') {
                const position = textEditor.selection.active;
                const line = position.line;

                const openChar = args.text === '}' ? '{' : '(';
                const closeChar = args.text;
                var startLine = findMatchingStart(line, textEditor.document, openChar, closeChar);

                // If the matching start is found, move the start line up by one to include the opening directive
                if(startLine > 0) startLine--;

                // Select the range from the start of the block to the current line
                const range = new vscode.Range(new vscode.Position(startLine, 0), new vscode.Position(line, textEditor.document.lineAt(line).text.length));
                textEditor.selection = new vscode.Selection(range.start, range.end);

                // Format the selected range
                await vscode.commands.executeCommand('editor.action.formatSelection');

                // Clear the selection
                const newPosition = textEditor.selection.end;
                textEditor.selection = new vscode.Selection(newPosition, newPosition);
            }
        })
    );
}

export function deactivate() {}

function findMatchingStart(line: number, document: vscode.TextDocument, openChar: string, closeChar: string): number {
    let level = 0;
    let inString = false;
    let stringChar = ''; // To track whether we are inside a single-quoted or double-quoted string

    for (let i = line; i >= 0; i--) {
        const text = document.lineAt(i).text.trim();

        for (let j = text.length - 1; j >= 0; j--) {
            const char = text[j];

            // Check for escape characters
            if (char === '\\' && j > 0 && text[j - 1] === '\\') {
                j--; // Skip the escaped character
                continue;
            }

            // Handle string start/end
            if ((char === '"' || char === "'") && (j === 0 || text[j - 1] !== '\\')) {
                if (inString && char === stringChar) {
                    inString = false; // Closing the string
                } else if (!inString) {
                    inString = true;
                    stringChar = char;
                }
            }

            // If we're in a string, skip processing block characters
            if (inString) continue;

            if (char === closeChar) {
                level++;
            } else if (char === openChar) {
                level--;
                if (level === 0) {
                    return i;
                }
            }
        }
    }

    return line; // Return the current line if no matching start is found
}
