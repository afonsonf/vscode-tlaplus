import { Range } from 'vscode';
import { CollectionValue, ErrorInfo, ErrorTraceItem, ModelCheckResult, Value } from '../../model/check';

function displayErrorTrace(errorinfo: ErrorInfo, index: number) {
    if (!errorinfo.errorTrace || errorinfo.errorTrace.length === 0) {
        return '';
    }

    return /*html*/ `
    <vscode-panel-tab id="error-trace-tab-${index}">Error Trace ${index}</vscode-panel-tab>
    <vscode-panel-view id="error-trace-view-${index}" class="flex-direction-column">
        <div class="display-flex align-items-center">
            <vscode-text-field placeholder="Filter" disabled="false">
            </vscode-text-field>
            <vscode-link
                name="togle-modified-visibility"
                atr-trace-id=${index}
                atr-state="show"
                class="margin-left-auto">
                Hide unmodified
            </vscode-link>
        </div>
        <ul class="tree-nodes">
            ${errorinfo.errorTrace.map((v) => displayErrorTraceItem(v, index)).join('\n')}
        </ul>
    </vscode-panel-view>
    `;
}

function displayErrorTraceItem(errorTraceItem: ErrorTraceItem, traceId: number) {
    return /*html*/ `
    <li>
        ${displayErrorTraceItemHeader(errorTraceItem)}
        <ul class="tree-nodes">
            ${errorTraceItem.variables.items.map((v) => displayVariable(v, errorTraceItem.num, traceId)).join('\n')}
        </ul>
    </li>
    `;
}

function displayErrorTraceItemHeader(errorTraceItem: ErrorTraceItem) {
    return /*html*/ `
    <div class="error-trace-item-block">
        <div class="tree-node tree-expandable tree-expandable-down error-trace-item-title">
            ${errorTraceItem.num}: ${errorTraceItem.title}
            ${createCodeLink('>>', errorTraceItem.filePath, errorTraceItem.range)}
        </div>
    </div>
    `;
}

function createCodeLink(line: string, filepath: string | undefined, range: Range): string {
    if (!filepath || !range) {
        return '';
    }

    return /*html*/ `
    <vscode-link
        name="open-file-action-link"
        atr-filepath="${filepath}"
        atr-location-line="${range.start.line}"
        atr-location-character="${range.start.character}">
        ${line}
    </vscode-link>
    `;
}

function displayVariable(value: Value, stateId: number, traceId: number) {
    return /*html*/ `
    <li
        name="error-trace-variable"
        atr-change-type="${value.changeType}"
        atr-index="${stateId}"
        atr-trace-id="${traceId}">
        ${displayVariableTitle(value)}
        ${displayVariableChildren(value, stateId, traceId)}
    </li>
    `;
}

function hasVariableChildrenToDisplay(value: Value) {
    return value instanceof CollectionValue
        && value.items
        && (value.items.length > 1 || value.items.length === 1 && value.expandSingle);
}

function displayVariableChildren(value: Value, stateId: number, traceId: number): string {
    if (!hasVariableChildrenToDisplay(value)) {
        return '';
    }

    return /*html*/ `
    <ul class="tree-nodes hidden">
        ${(value as CollectionValue).items.map((v) => displayVariable(v, stateId, traceId)).join('\n')}
    </ul>
    `;
}

function displayVariableTitle(value: Value) {
    return /*html*/ `
    <div class="var-block">
        <div class="var-name tree-node ${hasVariableChildrenToDisplay(value)? 'tree-expandable' : ''}">
            ${displayVariableTitleKey(value)}
            ${displayVariableTitleItemSize(value)}
            ${displayVariableTitleChangeType(value)}
        </div>
        <div class="var-value">${value.str}</div>
    </div>
    `;
}

function displayVariableTitleKey(value: Value) {
    if (value.changeType === 'D') {
        return /*html*/ `
        <span class="value-deleted">${value.key}</span>
        `;
    }
    return /*html*/ `
    <span>${value.key}</span>
    `;
}

function displayVariableTitleItemSize(value: Value) {
    if (value instanceof CollectionValue && value.items) {
        return /*html*/ `
        <span class="var-size" title="Size of the collection">(${value.items.length})</span>
        `;
    }
    return '';
}

const changeHints = {
    A: 'This item has been added since the previous state',
    M: 'This item has been modified since the previous state',
    D: 'This item has been deleted since the previous state'
};

function displayVariableTitleChangeType(value: Value) {
    if (value.changeType === 'N') {
        return '';
    }
    return /*html*/ `
    <span title="${changeHints[value.changeType]}" class="change-marker change-marker-${value.changeType}">
        ${value.changeType}
    </span>
    `;
}

export function errorTraceSection(checkResult: ModelCheckResult): string {
    if (!checkResult.errors || checkResult.errors.length === 0) {
        return '';
    }

    // Tip: Install the es6-string-html VS Code extension to enable code highlighting below
    /* eslint-disable max-len */
    return /*html*/ `
    <section>
        <vscode-panels id='error-trace-panels'>
        ${checkResult.errors.map((errorTrace: ErrorInfo, index: number) => displayErrorTrace(errorTrace, index))}
        </vscode-panels>
    </section>
    `;
}
