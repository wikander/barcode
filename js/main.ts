window.CSS.registerProperty({
  name: "--barcode-source-gtin",
  syntax: "<integer>",
  inherits: false,
  initialValue: "4008871209832",
});

declare namespace CSS {
  namespace paintWorklet {
    export function addModule(url: string): void;
  }
}

CSS.paintWorklet.addModule("js/barcodePaintWorklet.js");

const baseHref = `${window.location.origin}${window.location.pathname}`;

type QueryParams = Record<string, string>;

function parseQueryParams(): QueryParams {
  const queryString = window.location.search;
  var query: QueryParams = {};
  var pairs = (
    queryString[0] === "?" ? queryString.substr(1) : queryString
  ).split("&");

  if (!pairs[0]) {
    return {};
  } else {
    for (var i = 0; i < pairs.length; i++) {
      var pair = pairs[i].split("=");
      query[decodeURIComponent(pair[0])] = decodeURIComponent(pair[1] || "");
    }
    return query;
  }
}

function setQueryParams(queryParams: QueryParams) {
  if (queryParams) {
    history.replaceState(
      null,
      "",
      `${baseHref}?${Object.entries(queryParams)
        .map(([key, value]) => `${key}=${value}`)
        .join("&")}${window.location.hash}`
    );
  }
}

function resetUrl() {
  history.replaceState(null, "", `${baseHref}`);
}

const parsedQueryParams = parseQueryParams();
console.log("queryParams", parsedQueryParams);

const barcodeElm: HTMLElement | null = document.querySelector(".barcode");
if (barcodeElm) {
  barcodeElm.style.setProperty("--barcode-source-gtin", parsedQueryParams.gtin);
}
