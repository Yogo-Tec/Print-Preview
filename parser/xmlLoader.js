/**
 * ------------------------------------------------------------
 * BillViewer XML Loader
 * ------------------------------------------------------------
 * Loads Excel SpreadsheetML (.xml)
 * Returns XML DOM
 * ------------------------------------------------------------
 */

export default class XmlLoader {

    /**
     * Load XML from URL
     */

    static async load(url) {

        const response = await fetch(url);

        if (!response.ok) {
            throw new Error(`Unable to load XML : ${url}`);
        }

        const xmlText = await response.text();

        return this.parse(xmlText);

    }

    /**
     * Parse XML string
     */

    static parse(xmlString) {

        const parser = new DOMParser();

        const xml = parser.parseFromString(
            xmlString,
            "application/xml"
        );

        const error = xml.querySelector("parsererror");

        if (error) {

            throw new Error(
                error.textContent
            );

        }

        return xml;

    }

}