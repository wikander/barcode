declare var registerPaint: any;
declare enum SymbolGroup {
    Guard = 0
}
interface BarcodeSymbol {
    modules: string[];
    symbolGroup?: SymbolGroup;
}
