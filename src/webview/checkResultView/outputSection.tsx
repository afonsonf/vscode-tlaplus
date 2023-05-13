import { Panels } from '@vscode/webview-ui-toolkit';
import {
    VSCodeDivider,
    VSCodeLink,
    VSCodePanelTab,
    VSCodePanelView,
    VSCodePanels
} from '@vscode/webview-ui-toolkit/react';
import * as React from 'react';
import { ErrorInfo, MessageLine, ModelCheckResult, OutputLine, WarningInfo } from '../../model/check';
import { CodePositionLink } from './common';

export const OutputSection = ({checkResult}: {checkResult: ModelCheckResult}) => {
    if (emptyOutputLines(checkResult) && emptyWarnings(checkResult) && emptyErrors(checkResult)) {
        return (null);
    }

    const OutputLines = emptyOutputLines(checkResult) ? () => (null) :
        () => (
            <>
                <VSCodePanelTab id="output-tab-1">Output</VSCodePanelTab>
                <VSCodePanelView id="output-view-1" style={{flexDirection: 'column'}}>
                    {checkResult.outputLines.map((v, index) => <OutputLineElement key={index} line={v} />)}
                </VSCodePanelView>
            </>
        );

    const Warnings = emptyWarnings(checkResult) ? () => (null) :
        () => (
            <>
                <VSCodePanelTab id="output-tab-2">Warnings</VSCodePanelTab>
                <VSCodePanelView id="output-view-2" style={{flexDirection: 'column'}}>
                    {checkResult.warnings.map((warning: WarningInfo, warningId: number) => (
                        <p key={warningId} style={{margin: '0'}}>
                            {warning.lines.map((v, messageId) => <MessageLineSpan key={messageId} message={v}/>)}
                        </p>))
                    }
                </VSCodePanelView>
            </>
        );

    const Errors = emptyErrors(checkResult) ? () => (null) :
        () => (
            <>
                <VSCodePanelTab id="output-tab-3">Errors</VSCodePanelTab>
                <VSCodePanelView id="output-view-3" style={{flexDirection: 'column'}}>
                    {checkResult.errors.map((error: ErrorInfo, index: number) => (
                        <div key={index} style={{margin: '0'}}>
                            {error.lines.map((v, errorId) => <MessageLineSpan key={errorId} message={v}/>)}
                            <ErrorLink error={error} index={index}/>
                        </div>))
                    }
                </VSCodePanelView>
            </>
        );

    return (
        <section>
            <VSCodePanels id='output-panels'>
                <OutputLines/>
                <Warnings/>
                <Errors/>
            </VSCodePanels>
            <VSCodeDivider/>
        </section>
    );
};

const OutputLineElement = ({line}: {line: OutputLine}) => {
    if (line.count === 1) {
        return (<p style={{margin: '0'}}> {line.text} </p>);
    }

    return (
        <p style={{margin: '0'}}>
            <span> {line.text} </span>
            <span style={{opacity: '0.5'}} title="Number of consecutive occurrences"> ({line.count}) </span>
        </p>
    );
};

const ErrorLink = ({error, index}: {error: ErrorInfo, index: number}) => {
    if (error.errorTrace === null || error.errorTrace.length === 0) {
        return (null);
    }

    const panels = document.getElementById('error-trace-panels') as Panels;
    const switchTab = () => panels.activeid = 'error-trace-tab-' + index;
    return (
        <VSCodeLink onClick={switchTab} href="#error-trace-panels">Show error trace</VSCodeLink>
    );
};

const MessageLineSpan = ({message}: {message: MessageLine}) => (
    <p style={{margin: '0'}}>
        {message.spans.map((span, index) => (
            span.type !== 'SL' ? <span key={index}>{span.text}</span> :
                <CodePositionLink key={index} line={span.text} filepath={span.filePath} position={span.location} />
        ))}
    </p>
);

export function emptyOutputLines(checkResult: ModelCheckResult) {
    return !checkResult.outputLines || checkResult.outputLines.length === 0;
}

export function emptyWarnings(checkResult: ModelCheckResult) {
    return !checkResult.warnings || checkResult.warnings.length === 0;
}

export function emptyErrors(checkResult: ModelCheckResult) {
    return !checkResult.errors || checkResult.errors.length === 0;
}
