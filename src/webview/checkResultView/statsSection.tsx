import {
    VSCodeDataGrid,
    VSCodeDataGridCell,
    VSCodeDataGridRow,
    VSCodeDivider,
    VSCodePanelTab,
    VSCodePanelView,
    VSCodePanels
} from '@vscode/webview-ui-toolkit/react';
import * as React from 'react';
import { CoverageItem, InitialStateStatItem, ModelCheckResult } from '../../model/check';
import { CodeRangeLink, EmptyLine } from './common';

export const StatsSection = ({checkResult}: {checkResult: ModelCheckResult}) => {
    return (
        <section>
            <VSCodePanels>
                <StatesStats stats={checkResult.initialStatesStat}/>
                <CoverageStats stats={checkResult.coverageStat}/>
            </VSCodePanels>
            <EmptyLine/>
            <VSCodeDivider/>
        </section>
    );
};

const StatesStats = ({stats}: {stats: InitialStateStatItem[]}) => {

    const Header = () => (
        <VSCodeDataGridRow rowType="sticky-header">
            {[{
                value: 'Time', isNumber: false,
                tooltip: ''
            },
            {
                value: 'Diameter', isNumber: true,
                tooltip: 'The diameter of the reachable state graph'
            },
            {
                value: 'Found', isNumber: true,
                tooltip: 'The total number of states found so far'
            },
            {
                value: 'Distinct', isNumber: true,
                tooltip: 'The number of distinct states amoung all the states found'
            },
            {
                value: 'Queue', isNumber: true,
                tooltip: 'The number of states whose successor states have not been found yet'
            }].map(
                (v, id) => <DataGridCellHeader id={id+1} value={v.value} isNumber={v.isNumber} tooltip={v.tooltip}/>)}
        </VSCodeDataGridRow>
    );

    const Row = ({stat}: {stat: InitialStateStatItem}) => (
        <VSCodeDataGridRow>
            <DataGridCellDefault id={1} value={stat.timeStamp} isNumber={false}/>
            <DataGridCellDefault id={2} value={num(stat.diameter)} isNumber={true}/>
            <DataGridCellDefault id={3} value={num(stat.total)} isNumber={true}/>
            <DataGridCellDefault id={4} value={num(stat.distinct)} isNumber={true}/>
            <DataGridCellDefault id={5} value={num(stat.queueSize)} isNumber={true}/>
        </VSCodeDataGridRow>
    );

    return (
        <>
            <VSCodePanelTab id="stats-tab-1">States</VSCodePanelTab>
            <VSCodePanelView id="stats-view-1" style={{maxWidth: 'fit-content'}}>
                <VSCodeDataGrid aria-label="States statistics">
                    <Header/>
                    {stats.map((stat, index) => <Row key={index} stat={stat}/>)}
                </VSCodeDataGrid>
            </VSCodePanelView>
        </>
    );
};

const CoverageStats = ({stats}: {stats: CoverageItem[]}) => {
    if (stats.length === 0) {
        return (null);
    }

    const Header = () => (
        <VSCodeDataGridRow rowType="sticky-header">
            {[{
                value: 'Module', isNumber: false,
                tooltip: ''
            },
            {
                value: 'Action', isNumber: false,
                tooltip: ''
            },
            {
                value: 'Total', isNumber: true,
                tooltip: 'Total number of times the action has been used to compute a successor state'
            },
            {
                value: 'Distinct', isNumber: true,
                tooltip: 'Total number of times the action produced a distinct successor state'
            }].map(
                (v, id) => <DataGridCellHeader id={id+1} value={v.value} isNumber={v.isNumber} tooltip={v.tooltip}/>)}
        </VSCodeDataGridRow>
    );

    const Row = ({stat}: {stat: CoverageItem}) => {
        const tooltip = stat.total !== 0 ? '':
            'This action has never been used to compute successor states';
        const codeLink = <CodeRangeLink line={stat.action} filepath={stat.filePath} range={stat.range}/>;

        return (
            <VSCodeDataGridRow>
                <DataGridCellDefault id={1} value={stat.module} isNumber={false} tooltip={tooltip}/>
                <DataGridCellDefault id={2} value={codeLink} isNumber={false} tooltip={tooltip}/>
                <DataGridCellDefault id={3} value={num(stat.total)} isNumber={true} tooltip={tooltip}/>
                <DataGridCellDefault id={4} value={num(stat.distinct)} isNumber={true} tooltip={tooltip}/>
            </VSCodeDataGridRow>);
    };

    return (
        <>
            <VSCodePanelTab id="stats-tab-2">Coverage</VSCodePanelTab>
            <VSCodePanelView id="stats-view-2" style={{maxWidth: 'fit-content'}}>
                <VSCodeDataGrid aria-label="Coverage statistics">
                    <Header/>
                    {stats.map((stat, index) => <Row key={index} stat={stat}/>)}
                </VSCodeDataGrid>
            </VSCodePanelView>
        </>
    );
};

interface DataGridCellHeaderI {id: number, value: React.JSX.Element | string, isNumber: boolean, tooltip?: string}
const DataGridCellHeader = ({id, value, isNumber, tooltip}: DataGridCellHeaderI) => (
    <VSCodeDataGridCell title={tooltip}
        cell-type="columnheader"
        grid-column={id}
        className={`${isNumber? 'text-align-right': ''} hidden-overflow-ellipsis`}>
        {value}
    </VSCodeDataGridCell>
);

interface DataGridCellDefaultI {id: number, value: React.JSX.Element | string, isNumber: boolean, tooltip?: string}
const DataGridCellDefault = ({id, value, isNumber, tooltip}: DataGridCellDefaultI) => (
    <VSCodeDataGridCell
        title={tooltip}
        cell-type="default"
        grid-column={id}
        className={`${isNumber? 'text-align-right': ''} hidden-overflow-ellipsis`}>
        {value}
    </VSCodeDataGridCell>
);

function num(n: number): string {
    return Number(n).toLocaleString().split(',').join(' ');
}
