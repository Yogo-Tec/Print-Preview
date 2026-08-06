/**
 * ------------------------------------------------------------
 * BillViewer
 * Model Builder
 * ------------------------------------------------------------
 * Converts Workbook -> Render Model
 * ------------------------------------------------------------
 */

export default class ModelBuilder {

    static build(workbook) {

        if (!workbook || !workbook.worksheets?.length) {
            throw new Error("Workbook is empty.");
        }

        const sheet = workbook.worksheets[0];

        return {

            page: {
                size: "A4",
                orientation: "portrait"
            },

            header: this.buildHeader(sheet),

            tables: this.buildTables(sheet),

            footer: this.buildFooter(sheet)

        };

    }

    /**
     * Header
     */

    static buildHeader(sheet) {

        return {

            title: sheet.name || "Invoice",

            subtitle: ""

        };

    }

    /**
     * Tables
     */

    static buildTables(sheet) {

        if (!sheet.table) {

            return [];

        }

        return [

            {

                rows: sheet.table.rows.map(row => ({

                    cells: row.cells.map(cell => ({

                        value: cell.value ?? "",

                        colspan: cell.colspan ?? 1,

                        rowspan: cell.rowspan ?? 1,

                        className: cell.className ?? "",

                        style: cell.inlineStyle ?? ""

                    }))

                }))

            }

        ];

    }

    /**
     * Footer
     */

    static buildFooter() {

        return {

            text: ""

        };

    }

}
