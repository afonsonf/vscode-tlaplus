const vsCodeApi = acquireVsCodeApi();

class VSCodeWrapper {

    public openFile(filePath: string, location: unknown) {
        vsCodeApi.postMessage({
            command: 'openFile',
            filePath,
            location
        });
    }

    public stopProcess() {
        vsCodeApi.postMessage({
            command: 'stop'
        });
    }

    public checkAgain() {
        vsCodeApi.postMessage({
            command: 'runAgain'
        });
    }

    public showTlcOutput() {
        vsCodeApi.postMessage({
            command: 'showTlcOutput'
        });
    }

    public showVariableValue(id: number) {
        vsCodeApi.postMessage({
            command: 'showVariableValue',
            valueId: id
        });
    }

    public showInfoMessage(text: string) {
        vsCodeApi.postMessage({
            command: 'showInfoMessage',
            text: text
        });
    }

    public setState<T extends unknown | undefined>(newState: T): T {
        return vsCodeApi.setState(newState);
    }

    public getState(): unknown {
        return vsCodeApi.getState();
    }
}

export const vscode = new VSCodeWrapper();
