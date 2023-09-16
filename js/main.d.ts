declare namespace CSS {
    namespace paintWorklet {
        function addModule(url: string): void;
    }
}
declare const baseHref: string;
type QueryParams = Record<string, string>;
declare function parseQueryParams(): QueryParams;
declare function setQueryParams(queryParams: QueryParams): void;
declare function resetUrl(): void;
declare const parsedQueryParams: QueryParams;
declare const barcodeElm: HTMLElement | null;
