import RowParser from "./rowParser.js";

export default class TableParser {

    static parse(tableNode) {

        const rows = [];

        if (!tableNode) {
            return { rows };
        }

        const rowNodes = tableNode.querySelectorAll(":scope > Row");

        rowNodes.forEach((rowNode, index) => {
            rows.push(RowParser.parse(rowNode, index + 1));
        });

        return { rows };
    }

}