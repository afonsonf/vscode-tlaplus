import { VSCodeLink } from '@vscode/webview-ui-toolkit/react';
import * as React from 'react';
import { Range } from 'vscode';
import { vscode } from './vscode';

export const EmptyLine = () => {
    return (<div style={{marginTop: '1em'}}/>);
};

export const CodeLink = ({line, filepath, range}: {line: string, filepath: string | undefined, range: Range}) => {
    if (!filepath || !range) {
        return (null);
    }

    const openFileAtLocation =
        () => vscode.openFile(filepath, {'line': range[0].line, 'character': range[0].character});

    return (<VSCodeLink onClick={openFileAtLocation}>{line}</VSCodeLink>);
};