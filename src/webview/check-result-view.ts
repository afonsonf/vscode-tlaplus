import {
    Button,
    Link,
    Panels,
    provideVSCodeDesignSystem,
    vsCodeButton,
    vsCodeDataGrid,
    vsCodeDataGridCell,
    vsCodeDataGridRow,
    vsCodeDivider,
    vsCodeLink,
    vsCodePanels,
    vsCodePanelTab,
    vsCodePanelView,
    vsCodeTextField
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
        vsCodePanelView(),
        vsCodeTextField());

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

    loadAllModifiedVisibilityToggle();

    loadTreeExpandActions();
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
        const errorTracePanels = document.getElementById('error-trace-panels') as Panels;
        link.onclick = () => {
            errorTracePanels.activeid = 'error-trace-tab-' + errorTraceId;
        };
    }
}

function loadAllModifiedVisibilityToggle() {
    const links = document.getElementsByName('togle-modified-visibility');
    links.forEach(element => {
        loadModifiedVisibilityToggle(element as Link);
    });
}

function loadModifiedVisibilityToggle(link: Link) {
    const traceId = link.getAttribute('atr-trace-id');
    const variables =
        Array.from(document.getElementsByName('error-trace-variable'))
            .filter((v) =>
                v.getAttribute('atr-change-type') === 'N'
                && v.getAttribute('atr-index') !== '1'
                && v.getAttribute('atr-trace-id') === traceId);

    link.onclick = () => {
        const linkState = link.getAttribute('atr-state');
        if (linkState === 'show') {
            link.setAttribute('atr-state', 'hide');
            link.textContent = 'Show unmodified';
        } else {
            link.setAttribute('atr-state', 'show');
            link.textContent = 'Hide unmodified';
        }

        variables.forEach((v) => v.classList.toggle('hidden'));
    };
}

function loadTreeExpandActions() {
    const expNodes = document.getElementsByClassName('tree-expandable');
    for (const node of expNodes) {
        (node as HTMLElement).onclick = (e) => {
            const elName = e.target as HTMLElement;
            elName?.parentElement?.parentElement?.querySelector('.tree-nodes')?.classList.toggle('hidden');
            elName?.classList.toggle('tree-expandable-down');
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
