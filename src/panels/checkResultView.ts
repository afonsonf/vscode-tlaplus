import * as vscode from 'vscode';
import { CMD_CHECK_MODEL_RUN_AGAIN, CMD_CHECK_MODEL_STOP, CMD_SHOW_TLC_OUTPUT } from '../commands/checkModel';
import { ModelCheckResult, ModelCheckResultSource } from '../model/check';
import { headerSection } from './checkResultView/headerSection';
import { getNonce } from './utilities/getNonce';
import { getUri } from './utilities/getUri';

export function updateCheckResultView(checkResult: ModelCheckResult): void {
    CheckResultViewPanel.updateCheckResult(checkResult);
}

export function revealEmptyCheckResultView(_source: ModelCheckResultSource, extContext: vscode.ExtensionContext): void {
    CheckResultViewPanel.render(extContext.extensionUri);
}

export function revealLastCheckResultView(extContext: vscode.ExtensionContext): void {
    CheckResultViewPanel.render(extContext.extensionUri);
}

class CheckResultViewPanel {
    private static readonly viewType = 'modelChecking';
    private static currentPanel: CheckResultViewPanel | undefined;

    private readonly _panel: vscode.WebviewPanel;
    private readonly _extensionUri: vscode.Uri;
    private _checkResult: ModelCheckResult;
    private _disposables: vscode.Disposable[] = [];

    private constructor(extensionUri: vscode.Uri) {
        this._extensionUri = extensionUri;
        this._checkResult = ModelCheckResult.createEmpty(ModelCheckResultSource.Process);

        this._panel = vscode.window.createWebviewPanel(
            CheckResultViewPanel.viewType,
            'TLA+ model checking',
            vscode.ViewColumn.Beside,
            {
                enableScripts: true,
                localResourceRoots: [vscode.Uri.joinPath(extensionUri, 'out')]
            }
        );

        // Set an event listener to listen for when the panel is disposed
        this._panel.onDidDispose(() => this.dispose(), null, this._disposables);

        // Set the HTML content for the webview panel
        this._panel.webview.html = this.getWebviewContent();

        // Set message listener
        this._panel.webview.onDidReceiveMessage((message) => this.handleWebviewMessage(message));
    }

    public static render(extensionUri: vscode.Uri) {
        if (CheckResultViewPanel.currentPanel) {
            CheckResultViewPanel.currentPanel._panel.reveal();
        } else {
            CheckResultViewPanel.currentPanel = new CheckResultViewPanel(extensionUri);
        }
    }

    public static updateCheckResult(checkResult: ModelCheckResult) {
        if (CheckResultViewPanel.currentPanel) {
            CheckResultViewPanel.currentPanel.updateView(checkResult);
        }
    }

    private updateView(checkResult: ModelCheckResult) {
        this._checkResult = checkResult;
        this._panel.webview.html = this.getWebviewContent();
    }

    private dispose() {
        CheckResultViewPanel.currentPanel = undefined;

        // Dispose of the current webview panel
        this._panel.dispose();

        // Dispose of all disposables (i.e. commands) associated with the current webview panel
        while (this._disposables.length) {
            const disposable = this._disposables.pop();
            if (disposable) {
                disposable.dispose();
            }
        }
    }

    private getWebviewContent() {
        const webview = this._panel.webview;

        const webviewUri = getUri(webview, this._extensionUri, ['out', 'check-result-view.js']);
        const styleUri = getUri(webview, this._extensionUri, ['out', 'check-result-view.css']);
        const nonce = getNonce();

        // Tip: Install the es6-string-html VS Code extension to enable code highlighting below
        /* eslint-disable max-len */
        return /*html*/ `
        <!DOCTYPE html>
        <html lang="en">
            <head>
                <meta charset="UTF-8">
                <meta name="viewport" content="width=device-width, initial-scale=1.0">
                <meta http-equiv="Content-Security-Policy" content="default-src 'none'; style-src ${webview.cspSource}; font-src ${webview.cspSource}; script-src 'nonce-${nonce}';">
                <link rel="stylesheet" href="${styleUri}">
                <title>Model checking</title>
            </head>
            <body>
                ${headerSection(this._checkResult)}
                <vscode-divider></vscode-divider>
                <script type="module" nonce="${nonce}" src="${webviewUri}"></script>
            </body>
        </html>
        `;
    }

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    private handleWebviewMessage(message: any) {
        if (message.command === 'stop') {
            vscode.commands.executeCommand(CMD_CHECK_MODEL_STOP);
        } else if (message.command === 'showTlcOutput') {
            vscode.commands.executeCommand(CMD_SHOW_TLC_OUTPUT);
        } else if (message.command === 'runAgain') {
            vscode.commands.executeCommand(CMD_CHECK_MODEL_RUN_AGAIN);
        } else if (message.command === 'openFile') {
            // `One` is used here because at the moment, VSCode doesn't provide API
            // for revealing existing document, so we're speculating here to reduce open documents duplication.
            this.revealFile(message.filePath, vscode.ViewColumn.One, message.location.line, message.location.character);
        } else if (message.command === 'showInfoMessage') {
            vscode.window.showInformationMessage(message.text);
        } else if (message.command === 'showVariableValue') {
            const valStr = this._checkResult ? this._checkResult.formatValue(message.valueId) : undefined;
            if (valStr) {
                this.createDocument(valStr);
            }
        }
    }

    private revealFile(filePath: string, viewColumn: vscode.ViewColumn, line: number, character: number) {
        const location = new vscode.Position(line, character);
        const showOpts: vscode.TextDocumentShowOptions = {
            selection: new vscode.Range(location, location),
            viewColumn: viewColumn
        };
        vscode.workspace.openTextDocument(filePath)
            .then(doc => vscode.window.showTextDocument(doc, showOpts));
    }

    private async createDocument(text: string) {
        const doc = await vscode.workspace.openTextDocument();
        const editor = await vscode.window.showTextDocument(doc, vscode.ViewColumn.One);
        const zero = new vscode.Position(0, 0);
        await editor.edit((edit) => edit.insert(zero, text));
        editor.selection = new vscode.Selection(zero, zero);
        editor.revealRange(new vscode.Range(zero, zero), vscode.TextEditorRevealType.AtTop);
    }
}
