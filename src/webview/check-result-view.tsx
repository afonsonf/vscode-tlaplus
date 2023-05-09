import React from 'react';
import { createRoot } from 'react-dom/client';

import { ErrorTraceSection } from './checkResultView/errorTraceSection';
import { HeaderSection } from './checkResultView/headerSection';
import { StatsSection } from './checkResultView/statsSection';
import { vscode } from './checkResultView/vscode';

window.addEventListener('message', (event) => {
    const newState = {
        checkResult: event.data.checkResult,
    };
    displayCheckResult(newState);
    vscode.setState(newState);
});

const root = createRoot(document.getElementById('root') as HTMLElement);
function displayCheckResult(newState) {
    root.render(
        <section>
            <HeaderSection checkResult={newState.checkResult}/>
            <StatsSection checkResult={newState.checkResult}/>
            <ErrorTraceSection checkResult={newState.checkResult}/>
        </section>
    );
}