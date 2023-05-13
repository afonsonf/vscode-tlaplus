import React from 'react';
import { createRoot } from 'react-dom/client';
import { ModelCheckResult } from '../model/check';
import { ErrorTraceSection } from './checkResultView/errorTraceSection';
import { HeaderSection } from './checkResultView/headerSection';
import { OutputSection } from './checkResultView/outputSection';
import { StatsSection } from './checkResultView/statsSection';
import { vscode } from './checkResultView/vscode';

import '@vscode/codicons/dist/codicon.css';
import './check-result-view.css';

interface State {
    checkResult: ModelCheckResult
}

vscode.setState({checkResult: null});

window.addEventListener('message', (event) => {
    const newState = {
        checkResult: event.data.checkResult,
    };
    displayCheckResult(newState);
    vscode.setState(newState);
});

const root = createRoot(document.getElementById('root') as HTMLElement);
function displayCheckResult(newState: State) {
    root.render(
        <section>
            <HeaderSection checkResult={newState.checkResult}/>
            <StatsSection checkResult={newState.checkResult}/>
            <OutputSection checkResult={newState.checkResult}/>
            <ErrorTraceSection checkResult={newState.checkResult}/>
        </section>
    );
}
