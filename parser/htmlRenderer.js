/**
 * ------------------------------------------------------------
 * BillViewer
 * HTML Renderer
 * ------------------------------------------------------------
 * Converts Document Model -> HTML
 * ------------------------------------------------------------
 */

export default class HtmlRenderer {

    /**
     * Render complete document
     */
    static render(model) {

        if (!model) {
            throw new Error("Model is required.");
        }

        return `
<div class="bill-document">

${this.renderHeader(model)}

${this.renderTables(model)}

${this.renderFooter(model)}

</div>
`;
    }

    /**
     * --------------------------------------------------------
     * Header
     * --------------------------------------------------------
     */
    static renderHeader(model) {

        if (!model.header) return "";

        return `
<header class="bill-header">

${model.header.title ? `<h1>${model.header.title}</h1>` : ""}

${model.header.subtitle ? `<p>${model.header.subtitle}</p>` : ""}

</header>
`;
    }

    /**
     * --------------------------------------------------------
     * Tables
     * --------------------------------------------------------
     */
    static renderTables(model) {

        if (!model.tables || model.tables.length === 0) {
            return "";
        }

        return model.tables
            .map(table => this.renderTable(table))
            .join("\n");
    }

    /**
     * --------------------------------------------------------
     * Single Table
     * --------------------------------------------------------
     */
    static renderTable(table) {

        return `
<table class="bill-table">

<tbody>

${table.rows.map(row => this.renderRow(row)).join("\n")}

</tbody>

</table>
`;
    }

    /**
     * --------------------------------------------------------
     * Row
     * --------------------------------------------------------
     */
    static renderRow(row) {

        return `
<tr>

${row.cells.map(cell => this.renderCell(cell)).join("\n")}

</tr>
`;
    }

    /**
     * --------------------------------------------------------
     * Cell
     * --------------------------------------------------------
     */
    static renderCell(cell) {

        const attrs = [];

        if (cell.colspan > 1)
            attrs.push(`colspan="${cell.colspan}"`);

        if (cell.rowspan > 1)
            attrs.push(`rowspan="${cell.rowspan}"`);

        if (cell.className)
            attrs.push(`class="${cell.className}"`);

        if (cell.style)
            attrs.push(`style="${cell.style}"`);

        return `
<td ${attrs.join(" ")}>

${this.escape(cell.value)}

</td>
`;
    }

    /**
     * --------------------------------------------------------
     * Footer
     * --------------------------------------------------------
     */
    static renderFooter(model) {

        if (!model.footer) return "";

        return `
<footer class="bill-footer">

${model.footer.text || ""}

</footer>
`;
    }

    /**
     * --------------------------------------------------------
     * HTML Escape
     * --------------------------------------------------------
     */
    static escape(value) {

        if (value === undefined || value === null)
            return "";

        return String(value)
            .replace(/&/g, "&amp;")
            .replace(/</g, "&lt;")
            .replace(/>/g, "&gt;")
            .replace(/"/g, "&quot;");
    }

}