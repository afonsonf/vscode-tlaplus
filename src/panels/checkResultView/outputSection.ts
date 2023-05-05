import { Position } from 'vscode';
import { ErrorInfo, MessageLine, MessageSpan, ModelCheckResult, OutputLine, WarningInfo } from '../../model/check';

function displayOutputLines(checkResult: ModelCheckResult) {
    if (emptyOutputLines(checkResult)) {
        return '';
    }

    return /*html*/ `
    <vscode-panel-tab id="tab-1">Output</vscode-panel-tab>
    <vscode-panel-view id="view-1" class="flex-direction-column">
        ${checkResult.outputLines.map(displayOutputLine).join('\n')}
    </vscode-panel-view>
    `;
}

function displayOutputLine(line: OutputLine) {
    if (line.count === 1) {
        return /*html*/ `
        <p class="margin-0"> ${line.text} </p>
        `;
    }

    return /*html*/ `
    <p class="margin-0">
        <span> ${line.text} </span>
        <span class="opacity-50" title="Number of consecutive occurrences"> (${line.count}) </span>
    </p>
    `;
}

function displayWarnings(checkResult: ModelCheckResult) {
    if (emptyWarnings(checkResult)) {
        return '';
    }

    return /*html*/ `
    <vscode-panel-tab id="tab-2">Warnings</vscode-panel-tab>
    <vscode-panel-view id="view-2" class="flex-direction-column">
        ${checkResult.warnings.map((warning: WarningInfo) => {
        return /*html*/ `
            <p class="margin-0">
                ${warning.lines.map(displayMessageLine).join('\n')}
            </p>
            `;}).join('\n')}
    </vscode-panel-view>
    `;
}

function displayErrors(checkResult: ModelCheckResult) {
    if (emptyErrors(checkResult)) {
        return '';
    }

    return /*html*/ `
    <vscode-panel-tab id="tab-3">Errors</vscode-panel-tab>
    <vscode-panel-view id="view-3" class="flex-direction-column">
        ${checkResult.errors.map((error: ErrorInfo, index: number) => {
        return /*html*/ `
            <p class="margin-0">
                ${error.lines.map(displayMessageLine).join('\n')}
                ${displayErrorLink(error, index)}
            </p>
            `;}).join('\n')}
    </vscode-panel-view>
    `;
}

function displayErrorLink(error: ErrorInfo, index: number) {
    if (error.errorTrace === null || error.errorTrace.length === 0) {
        return '';
    }

    return /*html*/ `
    <vscode-link
        name="reveal-error-trace"
        atr-error-trace-id="${index}"
        href="#">
        Show error trace
    </vscode-link>
    `;
}

function displayMessageLine(message: MessageLine) {
    function displayMessageLineSpan(span: MessageSpan) {
        if (span.type === 'SL') {
            return createMessageLink(span.text, span.filePath, span.location);
        }

        return /*html*/ `
        <span>${span.text}</span>
        `;
    }

    return /*html*/ `
    <p class="margin-0">
        ${message.spans.map(displayMessageLineSpan).join('\n')}
    </p>
    `;
}

function createMessageLink(line: string, filepath: string | undefined, position: Position | undefined): string {
    return /*html*/ `
    <vscode-link
        name="open-file-action-link"
        atr-filepath="${filepath}"
        atr-location-line="${position?.line}"
        atr-location-character="${position?.character}"
        href="#">
        ${line}
    </vscode-link>
    `;
}

function emptyOutputLines(checkResult: ModelCheckResult) {
    return !checkResult.outputLines || checkResult.outputLines.length === 0;
}

function emptyWarnings(checkResult: ModelCheckResult) {
    return !checkResult.warnings || checkResult.warnings.length === 0;
}

function emptyErrors(checkResult: ModelCheckResult) {
    return !checkResult.errors || checkResult.errors.length === 0;
}

export function outputSection(checkResult: ModelCheckResult): string {
    if (emptyOutputLines(checkResult) && emptyWarnings(checkResult) && emptyErrors(checkResult)) {
        return '';
    }

    // Tip: Install the es6-string-html VS Code extension to enable code highlighting below
    /* eslint-disable max-len */
    return /*html*/ `
    <section>
        <vscode-panels class="output-section">
            ${displayOutputLines(checkResult)}
            ${displayWarnings(checkResult)}
            ${displayErrors(checkResult)}
        </vscode-panels>
        <div class="text-line"></div>
        <vscode-divider></vscode-divider>
    </section>
    `;
}
