import WorksheetParser from .worksheetParser.js;

export default class WorkbookParser {

    static parse(xml) {

        const workbookNode = xml.querySelector(Workbook);

        if (!workbookNode) {
            throw new Error(Workbook element not found.);
        }

        const worksheetNodes = workbookNode.querySelectorAll(scope  Worksheet);

        const workbook = {
            worksheets []
        };

        worksheetNodes.forEach((worksheetNode) = {
            workbook.worksheets.push(
                WorksheetParser.parse(worksheetNode)
            );
        });

        return workbook;
    }

}