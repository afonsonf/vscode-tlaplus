import { Range } from 'vscode';
import { CoverageItem, InitialStateStatItem, ModelCheckResult } from '../../model/check';
function displayStatesStat(stats: InitialStateStatItem[]) {
    return /*html*/ `
    <vscode-panel-tab id="tab-1">States</vscode-panel-tab>
    <vscode-panel-view id="view-1">
        <vscode-data-grid aria-label="States statistics">
            ${dataGridHeaderStates()}
            ${stats.map(dataGridRowStates).join('\n')}
        </vscode-data-grid>
    </vscode-panel-view>
    `;
}

function dataGridHeaderStates(): string {
    return /*html*/ `
    <vscode-data-grid-row row-type="sticky-header">
        ${dataGridCellHeader(1, 'Time', '', '')}
        ${dataGridCellHeader(2, 'Diameter', 'The diameter of the reachable state graph', 'text-align-right')}
        ${dataGridCellHeader(3, 'Found', 'The total number of states found so far', 'text-align-right')}
        ${dataGridCellHeader(
        4, 'Distinct', 'The number of distinct states amoung all the states found', 'text-align-right')}
        ${dataGridCellHeader(
        5, 'Queue','The number of states whose successor states have not been found yet', 'text-align-right')}
    </vscode-data-grid-row>
    `;
}

function dataGridRowStates(stat: InitialStateStatItem): string {
    return /*html*/ `
    <vscode-data-grid-row>
        ${dataGridCellDefault(1, stat.timeStamp, '')}
        ${dataGridCellDefault(2, num(stat.diameter), 'text-align-right')}
        ${dataGridCellDefault(3, num(stat.total), 'text-align-right')}
        ${dataGridCellDefault(4, num(stat.distinct), 'text-align-right')}
        ${dataGridCellDefault(5, num(stat.queueSize), 'text-align-right')}
    </vscode-data-grid-row>
    `;
}

function displayCoverageStat(stats: CoverageItem[]) {
    if (stats.length === 0) {
        return '';
    }

    return /*html*/ `
    <vscode-panel-tab id="tab-2">Coverage</vscode-panel-tab>
    <vscode-panel-view id="view-2">
        <vscode-data-grid aria-label="Coverage statistics">
            ${dataGridHeaderCoverage()}
            ${stats.map(dataGridRowCoverage).join('\n')}
        </vscode-data-grid>
    </vscode-panel-view>
    `;
}

function dataGridHeaderCoverage(): string {
    return /*html*/ `
    <vscode-data-grid-row row-type="sticky-header">
        ${dataGridCellHeader(1, 'Module', '', '')}
        ${dataGridCellHeader(2, 'Action', '', '')}
        ${dataGridCellHeader(
        3, 'Total', 'Total number of times the action has been used to compute a successor state', 'text-align-right')}
        ${dataGridCellHeader(
        4, 'Distinct', 'Total number of times the action produced a distinct successor state', 'text-align-right')}
    </vscode-data-grid-row>
    `;
}

function dataGridRowCoverage(stat: CoverageItem): string {
    if (stat.total === 0) {
        // Crate row with a warning
        const tooltip = 'This action has never been used to compute successor states';

        return /*html*/ `
        <vscode-data-grid-row class="coverage-zero">
            ${dataGridCell(1, stat.module, tooltip, 'default', '')}
            ${dataGridCell(2, stat.action, tooltip, 'default', '')}
            ${dataGridCell(3, num(stat.total), tooltip, 'default', 'text-align-right')}
            ${dataGridCell(4, num(stat.distinct), tooltip, 'default', 'text-align-right')}
        </vscode-data-grid-row>
        `;
    }

    return /*html*/ `
    <vscode-data-grid-row>
        ${dataGridCellDefault(1, stat.module, '')}
        ${dataGridCellDefault(2, createCoverageActionLink(stat.action, stat.filePath, stat.range), '')}
        ${dataGridCellDefault(3, num(stat.total), 'text-align-right')}
        ${dataGridCellDefault(4, num(stat.distinct), 'text-align-right')}
    </vscode-data-grid-row>
    `;
}

function createCoverageActionLink(action: string, filepath: string | undefined, range: Range): string {
    return /*html*/ `
    <vscode-link
        name="coverage-action-link"
        atr-filepath="${filepath}"
        atr-location-line="${range.start.line}"
        atr-location-character="${range.start.character}"
        href="#">
        ${action}
    </vscode-link>
    `;
}

function num(n: number): string {
    return Number(n).toLocaleString().split(',').join(' ');
}

function dataGridCellHeader(column: number, value: string, tooltip: string, classes: string) {
    return dataGridCell(column, value, tooltip, 'columnheader', classes);
}

function dataGridCellDefault(column: number, value: string, classes: string) {
    return dataGridCell(column, value, '', 'default', classes);
}

function dataGridCell(column: number, value: string, tooltip: string, type: string, classes: string) {
    return /*html*/ `
    <vscode-data-grid-cell
        title="${tooltip}"
        cell-type="${type}"
        grid-column="${column}"
        class="${classes} hidden-overflow-ellipsis">
        ${value}
    </vscode-data-grid-cell>
    `;
}

export function statsSection(checkResult: ModelCheckResult): string {
    // Tip: Install the es6-string-html VS Code extension to enable code highlighting below
    /* eslint-disable max-len */
    return /*html*/ `
    <section>
        <vscode-panels class="stats-section">
            ${displayStatesStat(checkResult.initialStatesStat)}
            ${displayCoverageStat(checkResult.coverageStat)}
        </vscode-panels>
        <div class="text-line"></div>
    </section>
    `;
}
