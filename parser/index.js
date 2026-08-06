import XmlLoader from "./xmlLoader.js";
import WorkbookParser from "./workbookParser.js";
import ModelBuilder from "./modelBuilder.js";
import HtmlRenderer from "./htmlRenderer.js";

export async function parseExcelXml(xmlPath) {

    const xml = await XmlLoader.load(xmlPath);

    const workbook = WorkbookParser.parse(xml);

    const model = ModelBuilder.build(workbook);

    return HtmlRenderer.render(model);

}