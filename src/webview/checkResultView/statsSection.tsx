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
import { CodeLink, EmptyLine } from './common';

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
        <VSCodeDataGridRow rowType='sticky-header'>
            <DataGridCellHeader column={1} value='Time' class='' tooltip=''/>
            <DataGridCellHeader column={2} value='Diameter' class='text-align-right'
                tooltip='The diameter of the reachable state graph'/>
            <DataGridCellHeader column={3} value='Found' class='text-align-right'
                tooltip='The total number of states found so far'/>
            <DataGridCellHeader column={4} value='Distinct' class='text-align-right'
                tooltip='The number of distinct states amoung all the states found'/>
            <DataGridCellHeader column={5} value='Queue' class='text-align-right'
                tooltip='The number of states whose successor states have not been found yet'/>
        </VSCodeDataGridRow>
    );

    const Row = ({stat}: {stat: InitialStateStatItem}) => (
        <VSCodeDataGridRow>
            <DataGridCellDefault column={1} value={stat.timeStamp} class='' tooltip=''/>
            <DataGridCellDefault column={2} value={num(stat.diameter)} class='text-align-right' tooltip=''/>
            <DataGridCellDefault column={3} value={num(stat.total)} class='text-align-right' tooltip=''/>
            <DataGridCellDefault column={4} value={num(stat.distinct)} class='text-align-right' tooltip=''/>
            <DataGridCellDefault column={5} value={num(stat.queueSize)} class='text-align-right' tooltip=''/>
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
        <VSCodeDataGridRow rowType='sticky-header'>
            <DataGridCellHeader column={1} value='Module' class='' tooltip=''/>
            <DataGridCellHeader column={2} value='Action' class='' tooltip=''/>
            <DataGridCellHeader column={3} value='Total' class='text-align-right'
                tooltip='Total number of times the action has been used to compute a successor state'/>
            <DataGridCellHeader column={4} value='Distinct' class='text-align-right'
                tooltip='Total number of times the action produced a distinct successor state'/>
        </VSCodeDataGridRow>
    );

    const Row = ({stat}: {stat: CoverageItem}) => {
        const tooltip = stat.total !== 0 ? '':
            'This action has never been used to compute successor states';

        const codeLink = <CodeLink line={stat.action} filepath={stat.filePath} range={stat.range} />;

        return (
            <VSCodeDataGridRow>
                <DataGridCellDefault column={1} value={stat.module} class='' tooltip={tooltip}/>
                <DataGridCellDefault column={2} value={codeLink} class='' tooltip={tooltip}/>
                <DataGridCellDefault column={3} value={num(stat.total)} class='text-align-right' tooltip={tooltip}/>
                <DataGridCellDefault column={4} value={num(stat.distinct)} class='text-align-right' tooltip={tooltip}/>
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

const DataGridCellHeader =
    (props: {column: number, value: React.JSX.Element | string, class: string, tooltip: string}) => (
        <VSCodeDataGridCell
            title={props.tooltip}
            cell-type='columnheader'
            grid-column={props.column}
            className={`${props.class} hidden-overflow-ellipsis`}>
            {props.value}
        </VSCodeDataGridCell>
    );

const DataGridCellDefault =
    (props: {column: number, value: React.JSX.Element | string, class: string, tooltip: string}) => (
        <VSCodeDataGridCell
            title={props.tooltip}
            cell-type='default'
            grid-column={props.column}
            className={`${props.class} hidden-overflow-ellipsis`}>
            {props.value}
        </VSCodeDataGridCell>
    );

function num(n: number): string {
    return Number(n).toLocaleString().split(',').join(' ');
}
