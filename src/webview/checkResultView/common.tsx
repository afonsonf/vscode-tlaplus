import { VSCodeLink } from '@vscode/webview-ui-toolkit/react';
import * as React from 'react';
import { Position, Range } from 'vscode';
import { vscode } from './vscode';

export const EmptyLine = () => {
    return (<div style={{marginTop: '1em'}}/>);
};

export const CodeRangeLink = ({line, filepath, range}: {line: string, filepath: string | undefined, range: Range}) => (
    (!filepath || !range)? (null) : <CodePositionLink line={line} filepath={filepath} position={range[0]}/>
);

interface CodePositionLinkI {line: string, filepath: string | undefined, position: Position | undefined}
export const CodePositionLink = ({line, filepath, position}: CodePositionLinkI) => {
    if (!filepath || !position) {
        return (null);
    }

    const location = {'line': position.line, 'character': position.character};
    const openFileAtLocation = () => vscode.openFile(filepath, location);
    return (<VSCodeLink onClick={openFileAtLocation}>{line}</VSCodeLink>);
};