import React, { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { ErrorTraceSection } from './checkResultView/errorTraceSection';
import { HeaderSection } from './checkResultView/headerSection';
import { OutputSection } from './checkResultView/outputSection';
import { StatsSection } from './checkResultView/statsSection';
import { vscode } from './checkResultView/vscode';

import '@vscode/codicons/dist/codicon.css';
import { ModelCheckResult } from '../model/check';
import './check-result-view.css';

const receiveState = () => {
    const [state, setState] = React.useState(vscode.getState());

    window.addEventListener('message',
        (event) => {
            setState(event.data.checkResult);
            vscode.setState(event.data.checkResult);
        });

    return state as ModelCheckResult;
};

const CheckResultViewApp = () => {
    const state = receiveState();

    if (!state) {
        return (null);
    }

    return (
        <>
            <HeaderSection checkResult={state}/>
            <StatsSection checkResult={state}/>
            <OutputSection checkResult={state}/>
            <ErrorTraceSection checkResult={state}/>
        </>
    );
};

const root = createRoot(document.getElementById('root') as HTMLElement);
root.render(<StrictMode><CheckResultViewApp/></StrictMode>);
