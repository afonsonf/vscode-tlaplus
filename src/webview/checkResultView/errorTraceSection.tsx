import {
    VSCodeLink,
    VSCodePanelTab,
    VSCodePanelView,
    VSCodePanels,
    VSCodeTextField
} from '@vscode/webview-ui-toolkit/react';
import * as React from 'react';
import { CollectionValue, ErrorInfo, ErrorTraceItem, ModelCheckResult } from '../../model/check';
import { CodeRangeLink } from './common';
import { vscode } from './vscode';

export const ErrorTraceSection = ({checkResult}: {checkResult: ModelCheckResult}) => {
    if (!checkResult.errors || checkResult.errors.length === 0) {
        return (null);
    }

    return (
        <section>
            <VSCodePanels id='error-trace-panels'>
                {checkResult.errors.map(
                    (errorinfo, index) => <ErrorTrace key={index} errorinfo={errorinfo} traceId={index}/>)}
            </VSCodePanels>
        </section>
    );
};

interface Settings {
    readonly hideModified: boolean;
    readonly filter: string[];
}

const useSettings = () => {
    function parseFilter(filter: string): string[] {
        if (!filter) {
            return [];
        }
        return filter.trim().split(/\s|,/g).filter(p => p !== '').map(p => p.toLowerCase());
    }

    const [hideModified, _setHideModified] = React.useState(false);
    const [filter, _setFilter] = React.useState(parseFilter(''));

    const setFilter = (newFilter: string) => {
        _setFilter(parseFilter(newFilter));
    };

    const setHideModified = (newHideModified: boolean) => {
        _setHideModified(newHideModified);
    };


    const settings = {hideModified: hideModified, filter: filter};
    return {settings, setHideModified, setFilter};
};

const ErrorTrace = ({errorinfo, traceId}: {errorinfo: ErrorInfo, traceId: number}) => {
    if (!errorinfo.errorTrace || errorinfo.errorTrace.length === 0) {
        return (null);
    }

    const {settings, setHideModified, setFilter} = useSettings();
    const swapModifiedVisibility = () => setHideModified(!settings.hideModified);
    const handleFilterChange = (e) => setFilter(e.currentTarget.value);
    const handleSearchClick = (e) =>setFilter(e.currentTarget.parentNode.value);

    const errorTraceElements = errorinfo.errorTrace.map(
        (v) => <ErrorTraceElement key={v.num} errorTraceItem={v} settings={settings}/>);

    return (
        <>
            <VSCodePanelTab id={`error-trace-tab-${traceId}`}>Error Trace {traceId}</VSCodePanelTab>
            <VSCodePanelView id={`error-trace-view-${traceId}`} style={{flexDirection: 'column'}}>
                <div style={{display: 'flex', alignItems: 'center'}}>
                    <VSCodeTextField onChange={handleFilterChange} placeholder="Filter">
                        <span slot="end" className="codicon codicon-search cursor-pointer" onClick={handleSearchClick}/>
                    </VSCodeTextField>
                    <VSCodeLink onClick={swapModifiedVisibility} style={{marginLeft: 'auto'}}>
                        {settings.hideModified? 'Show': 'Hide'} unmodified
                    </VSCodeLink>
                </div>
                <ul style={{listStyleType: 'none', paddingInlineStart: '1em'}}>
                    {errorTraceElements}
                </ul>
            </VSCodePanelView>
        </>
    );
};

enum TreeNodeState { EXPANDED, COLLAPSED }

function switchState(state: TreeNodeState): TreeNodeState {
    return state === TreeNodeState.EXPANDED? TreeNodeState.COLLAPSED : TreeNodeState.EXPANDED;
}

const ErrorTraceElement = ({errorTraceItem, settings}: {errorTraceItem: ErrorTraceItem, settings: Settings}) => {

    const [treeNodeState, setTreeNodeState] = React.useState(TreeNodeState.EXPANDED);
    const setState = () => {
        setTreeNodeState(switchState(treeNodeState));
    };

    const ErrorTraceElementHeader = () => {
        const treeClass = treeNodeState === TreeNodeState.EXPANDED? 'tree-expandable-down' : '';
        const classes = 'tree-node tree-expandable error-trace-item-title ' + treeClass;
        return (
            <div style={{marginTop: '0.5em'}}>
                <span className={classes} onClick={setState}>
                    {errorTraceItem.num}: {errorTraceItem.title}
                </span>
                <CodeRangeLink line='>>' filepath={errorTraceItem.filePath} range={errorTraceItem.range} />
            </div>
        );
    };

    const errorTraceVariables = (treeNodeState === TreeNodeState.COLLAPSED) ? (null) :
        errorTraceItem.variables.items
            .map(
                (value) =>
                    <ErrorTraceElementVariable
                        key={value.id}
                        value={value as CollectionValue}
                        stateId={errorTraceItem.num}
                        settings={settings}/>);

    return (
        <li>
            <ErrorTraceElementHeader/>
            <ul style={{listStyleType: 'none', paddingInlineStart: '1em'}}>
                {errorTraceVariables}
            </ul>
        </li>
    );
};

function hasVariableChildrenToDisplay(value: CollectionValue) {
    return value.items && (value.items.length > 1 || value.items.length === 1 && value.expandSingle);
}

const changeHints = {
    A: 'This item has been added since the previous state',
    M: 'This item has been modified since the previous state',
    D: 'This item has been deleted since the previous state'
};

function checkFilter(str: string, filterItems: string[]): boolean {
    if (filterItems.length === 0) {
        return true;
    }
    const eKey = str.toLowerCase();
    for (const filter of filterItems) {
        if (eKey.indexOf(filter) >= 0) {
            return true;
        }
    }
    return false;
}

interface ErrorTraceElementVariableI {value: CollectionValue, stateId: number, settings: Settings}
const ErrorTraceElementVariable = ({value, stateId, settings}: ErrorTraceElementVariableI) => {

    if (stateId !== 1 && settings.hideModified && value.changeType === 'N') {
        return (null);
    }

    if (!checkFilter(value.key.toString(), settings.filter)) {
        return (null);
    }

    const hasChildren = hasVariableChildrenToDisplay(value);

    const [treeNodeState, setTreeNodeState] = React.useState(TreeNodeState.COLLAPSED);
    const setState = () => {
        setTreeNodeState(switchState(treeNodeState));
    };

    const ErrorTraceElementVariableTitle = () => {
        const variableTitleKeyClass = value.changeType === 'D'? 'value-deleted': '';
        const variableTitleKey = <span className={variableTitleKeyClass}>{value.key}</span>;

        const variableTitleItemSize = !(value.items) ? (null) :
            <span className="var-size" title="Size of the collection">({value.items.length})</span>;

        const changeTypeClass = `change-marker change-marker-${value.changeType}`;
        const variableTitleChangeType = value.changeType === 'N' ? (null) :
            <span title={changeHints[value.changeType]} className={changeTypeClass}>{value.changeType}</span>;

        let classes = 'var-name tree-node';
        if (hasChildren) {
            const treeClass = treeNodeState === TreeNodeState.EXPANDED? 'tree-expandable-down' : '';
            classes += ' tree-expandable ' + treeClass;
        }

        const displayValue = () => vscode.showVariableValue(value.id);
        const copyToClipboard = () => {
            navigator.clipboard.writeText(value.str);
            vscode.showInfoMessage('Value has been copied to clipboard');
        };

        return (
            <div className="var-block">
                <div className={classes} onClick={setState}>
                    {variableTitleKey}
                    {variableTitleItemSize}
                    {variableTitleChangeType}
                </div>
                <div className="var-value">{value.str}</div>
                <div className="var-menu">
                    <span
                        hidden={value.changeType !== 'D'}
                        title="Dislpay value"
                        onClick={displayValue}
                        className="var-button codicon codicon-link-external"/>
                    <span
                        title="Copy value to clipboard"
                        onClick={copyToClipboard}
                        className="var-button codicon codicon-copy"/>
                </div>
            </div>
        );
    };

    const ErrorTraceElementVariableTitleChildren = () => {
        if (!hasVariableChildrenToDisplay(value) || treeNodeState===TreeNodeState.COLLAPSED) {
            return (null);
        }

        return (
            <ul className="tree-nodes">
                {(value as CollectionValue).items.map(
                    (value) =>
                        <ErrorTraceElementVariable
                            key={value.id}
                            value={value as CollectionValue}
                            stateId={stateId}
                            settings={settings}/>)}
            </ul>
        );
    };

    return (
        <li>
            <ErrorTraceElementVariableTitle/>
            <ErrorTraceElementVariableTitleChildren/>
        </li>
    );
};
