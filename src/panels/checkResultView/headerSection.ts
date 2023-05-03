import { ModelCheckResult, SpecFiles } from '../../model/check';

function displayStatusHeader(showFullOutput: boolean, stillRunning: boolean): string {
    return /*html*/ `
    <div class="flow-div align-items-center">
        <h1 class="header-status">Status</h1>
        <div>
            <vscode-button id="act-run-again" appearance="primary" ${stillRunning? 'disabled' : ''}>
                Check again
            </vscode-button>
            <vscode-button id="act-show-output" appearance="secondary" ${showFullOutput? '' : 'disabled'}>
                Full output
            </vscode-button>
        </div>
    </div>
    `;
}

function displaySpecFiles(specFiles: SpecFiles | unknown): string {
    if (specFiles instanceof SpecFiles) {
        return /*html*/ `
        <div class="text-line">
            Checking ${specFiles.tlaFileName} / ${specFiles.cfgFileName}
        </div>
        `;
    }
    return '';
}

function displayCheckState(checkResult: ModelCheckResult): string {
    return /*html*/ `
    <div class="text-line">
        <span class="state-${checkResult.state}">${checkResult.stateName}</span>
        <span class="${checkResult.state === 'R' ? '' : 'hidden'}">
            (<vscode-link id="cmd-stop" href="#">stop</vscode-link>)
        </span>
        <span class="${checkResult.statusDetails ? '' : 'hidden'}">:
            ${checkResult.statusDetails}
        </span>
    </div>
    `;
}

function displayTimeInfo(checkResult: ModelCheckResult): string {
    return /*html*/ `
    <div class="text-line">
        Start: ${checkResult.startDateTimeStr}, end: ${checkResult.endDateTimeStr}
    </div>
    `;
}

export function headerSection(checkResult: ModelCheckResult): string {
    // Tip: Install the es6-string-html VS Code extension to enable code highlighting below
    /* eslint-disable max-len */
    return /*html*/ `
    <section>
        ${displayStatusHeader(checkResult.showFullOutput, checkResult.state === 'R')}
        ${displaySpecFiles(checkResult.specFiles)}
        ${displayCheckState(checkResult)}
        ${displayTimeInfo(checkResult)}
        <div class="text-line"></div>
    </section>
    `;
}
