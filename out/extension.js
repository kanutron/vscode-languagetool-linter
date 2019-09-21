"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const vscode = require("vscode");
const rp = require("request-promise-native");
let diagnosticCollection;
let diagnosticMap;
let ltDocumentLanguage = ["markdown", "plaintext"];
let ltUrl = "https://languagetool.org/api/v2/check";
// this method is called when your extension is activated
// your extension is activated the very first time the command is executed
function activate(context) {
    diagnosticCollection = vscode.languages.createDiagnosticCollection("LanguageTool Linter");
    diagnosticMap = new Map();
    function isWriteGoodLanguage(languageId) {
        return (ltDocumentLanguage.indexOf(languageId) > -1);
    }
    context.subscriptions.push(vscode.workspace.onDidChangeTextDocument(event => {
        if (isWriteGoodLanguage(event.document.languageId)) {
            doLint(event.document);
        }
    }));
    context.subscriptions.push(vscode.workspace.onDidCloseTextDocument(event => {
        if (diagnosticMap.has(event.uri.toString())) {
            diagnosticMap.delete(event.uri.toString());
        }
        resetDiagnostics();
    }));
    // Use the console to output diagnostic information (console.log) and errors (console.error)
    // This line of code will only be executed once when your extension is activated
    console.log('Congratulations, your extension "vscode-languagetool-linter" is now active!');
    // The command has been defined in the package.json file
    // Now provide the implementation of the command with registerCommand
    // The commandId parameter must match the command field in package.json
    let disposable = vscode.commands.registerCommand('extension.helloWorld', () => {
        // The code you place here will be executed every time your command is executed
        // Display a message box to the user
        vscode.window.showInformationMessage('Hello World!');
    });
    context.subscriptions.push(disposable);
}
exports.activate = activate;
function resetDiagnostics() {
    console.log("Resetting Diagnostics...");
    diagnosticCollection.clear();
    diagnosticMap.forEach((diags, file) => {
        diagnosticCollection.set(vscode.Uri.parse(file), diags);
    });
}
function doLint(document) {
    let ltConfig = vscode.workspace.getConfiguration("languagetool-linter");
    console.log(ltConfig);
    let diagnostics = [];
    let editorContent = document.getText();
    console.log(editorContent);
    // let motherTongue: string = (isNullOrUndefined(ltConfig.get("languageTool.motherTongue"))) ? "" : ltConfig.get("languageTool.motherTongue");
    let post_data_dict = {
        "language": ltConfig.get("language"),
        "text": editorContent,
        "motherTongue": "en-US"
    };
    console.log(post_data_dict);
    let options = {
        "method": "POST",
        "form": post_data_dict,
        "json": true
    };
    console.log(options);
    rp.post(ltUrl, options)
        .then(function (data) {
        console.log(data);
    })
        .catch(function (err) {
        console.log(err);
    });
    // let lines = document.getText().split(/\r?\n/g);
    // lines.forEach((line, lineCount) => {
    //     let suggestions : Suggestion[] = WriteGood(line, ltConfig);
    //     suggestions.forEach((suggestion, si) => {
    //         let start = new vscode.Position(lineCount, suggestion.index);
    //         let end = new vscode.Position(lineCount, suggestion.index + suggestion.offset);
    //         diagnostics.push(new vscode.Diagnostic(new vscode.Range(start, end), suggestion.reason, vscode.DiagnosticSeverity.Warning));
    //     });
    // });
    diagnosticMap.set(document.uri.toString(), diagnostics);
    // resetDiagnostics();
    console.log(document.getText());
    console.log(document.languageId);
}
// this method is called when your extension is deactivated
function deactivate() { }
exports.deactivate = deactivate;
//# sourceMappingURL=extension.js.map