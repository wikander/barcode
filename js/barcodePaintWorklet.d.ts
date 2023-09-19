declare var registerPaint: any;
declare enum SymbolGroup {
    Guard = 0
}
interface BarcodeSymbol {
    modules: string[];
    symbolGroup?: SymbolGroup;
}
type NumberSetA = "A";
type NumberSetB = "B";
type NumberSetC = "C";
type SpaceModule = "s";
type BarModule = "b";
