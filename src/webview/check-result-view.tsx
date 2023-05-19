import React, { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { ErrorTraceSection } from './checkResultView/errorTraceSection';
import { HeaderSection } from './checkResultView/headerSection';
import { OutputSection } from './checkResultView/outputSection';
import { StatsSection } from './checkResultView/statsSection';

import '@vscode/codicons/dist/codicon.css';
import './check-result-view.css';

const receiveState = () => {
    const [state, setState] = React.useState({checkResult: null});
    window.addEventListener('message', (event) => setState({checkResult: event.data.checkResult}));
    return state;
};

const CheckResultViewApp = () => {
    const state = receiveState();

    if (state.checkResult === null) {
        return (null);
    }

    return (
        <>
            <HeaderSection checkResult={state.checkResult}/>
            <StatsSection checkResult={state.checkResult}/>
            <OutputSection checkResult={state.checkResult}/>
            <ErrorTraceSection checkResult={state.checkResult}/>
        </>
    );
};

const root = createRoot(document.getElementById('root') as HTMLElement);
root.render(<StrictMode><CheckResultViewApp/></StrictMode>);
