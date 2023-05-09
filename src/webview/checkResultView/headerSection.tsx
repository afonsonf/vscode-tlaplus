import { VSCodeButton, VSCodeDivider, VSCodeLink } from '@vscode/webview-ui-toolkit/react';
import * as React from 'react';
import { ModelCheckResult, SpecFiles } from '../../model/check';
import { EmptyLine } from './common';
import { vscode } from './vscode';

export const HeaderSection = ({checkResult}: {checkResult: ModelCheckResult}) => {

    const StatusHeader = () => {
        const stillRunning = checkResult.state === 'R';
        const disableShowOutput = !checkResult.showFullOutput;
        return (
            <div style={{display: 'flex', alignItems: 'center'}}>
                <h1 style={{display: 'inline-block', margin: '0.5em auto 0.5em 0em'}}>Status</h1>
                <div>
                    <VSCodeButton onClick={vscode.checkAgain} appearance="primary" disabled={stillRunning}>
                        Check again
                    </VSCodeButton>
                    <VSCodeButton onClick={vscode.showTlcOutput} appearance="secondary" disabled={disableShowOutput}>
                        Full output
                    </VSCodeButton>
                </div>
            </div>
        );
    };

    const SpecFilesLine = () => {
        const specFiles = checkResult.specFiles as SpecFiles;
        return (
            <div style={{marginTop: '1em'}}> Checking {specFiles.tlaFileName} / {specFiles.cfgFileName}</div>
        );
    };

    const CheckingState = () => {
        return (
            <div style={{marginTop: '1em'}}>
                <span className={`state-${checkResult.state}`}>{checkResult.stateName}</span>
                <span hidden={checkResult.state !== 'R'}>
                    (<VSCodeLink onClick={vscode.stopProcess} href="#">stop</VSCodeLink>)
                </span>
                <span hidden={(checkResult.statusDetails !== null)}>:
                    {checkResult.statusDetails}
                </span>
            </div>
        );
    };

    const TimeInfo = () => {
        return (
            <div style={{marginTop: '1em'}}>
                Start: {checkResult.startDateTimeStr}, end: {checkResult.endDateTimeStr}
            </div>
        );
    };

    return (
        <section>
            <StatusHeader/>
            <SpecFilesLine/>
            <CheckingState/>
            <TimeInfo/>
            <EmptyLine/>
            <VSCodeDivider/>
        </section>
    );
};
