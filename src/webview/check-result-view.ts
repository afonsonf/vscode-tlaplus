import {
    Button,
    Link,
    provideVSCodeDesignSystem,
    vsCodeButton,
    vsCodeDataGrid,
    vsCodeDataGridCell,
    vsCodeDataGridRow,
    vsCodeDivider,
    vsCodeLink,
    vsCodePanels,
    vsCodePanelTab,
    vsCodePanelView
} from '@vscode/webview-ui-toolkit';

provideVSCodeDesignSystem()
    .register(
        vsCodeButton(),
        vsCodeDataGrid(),
        vsCodeDataGridCell(),
        vsCodeDataGridRow(),
        vsCodeDivider(),
        vsCodeLink(),
        vsCodePanels(),
        vsCodePanelTab(),
        vsCodePanelView());

// Just like a regular webpage we need to wait for the webview
// DOM to load before we can reference any of the HTML elements
// or toolkit components
window.addEventListener('load', main);

// Get access to the VS Code API from within the webview context
const vscode = acquireVsCodeApi();

// Main function that gets executed once the webview DOM loads
function main() {
    const runAgainButton = document.getElementById('act-run-again') as Button;
    runAgainButton.onclick = () => runCheckAgain();

    const showOutputButton = document.getElementById('act-show-output') as Button;
    showOutputButton.onclick = () => showTlcOutput();

    const stopProcessLink = document.getElementById('cmd-stop') as Link;
    stopProcessLink.onclick = () => stopProcess();

    loadOpenFileActions();
    loadRevealErrorTraceActions();
}

function loadOpenFileActions() {
    const linkActions = document.getElementsByName('open-file-action-link');
    for (const link of linkActions.values()) {
        const filepath = String(link.getAttribute('atr-filepath'));
        const line = Number(link.getAttribute('atr-location-line'));
        const character = Number(link.getAttribute('atr-location-character'));
        link.onclick = () => openFile(filepath, {'line': line, 'character': character});
    }
}

function loadRevealErrorTraceActions() {
    const linkActions = document.getElementsByName('reveal-error-trace');
    for (const link of linkActions.values()) {
        const errorTraceId = Number(link.getAttribute('atr-error-trace-id'));
        // const errorTracePanels = document.getElementById('error-trace-panels') as Panels;
        link.onclick = () => {
            console.log('tab-' + errorTraceId);
            // errorTracePanels.activeid = 'tab-' + errorTraceId;
            // errorTracePanels.scrollIntoView();
        };
    }
}

function openFile(filePath: string, location: unknown) {
    vscode.postMessage({
        command: 'openFile',
        filePath,
        location
    });
}

function stopProcess() {
    vscode.postMessage({
        command: 'stop'
    });
}

function runCheckAgain() {
    vscode.postMessage({
        command: 'runAgain'
    });
}

function showTlcOutput() {
    vscode.postMessage({
        command: 'showTlcOutput'
    });
}
