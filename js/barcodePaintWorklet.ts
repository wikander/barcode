declare var registerPaint: any;

enum SymbolGroup {
  Guard,
}
interface BarcodeSymbol {
  modules: string[];
  symbolGroup?: SymbolGroup;
}

registerPaint(
  "barcode",
  class {
    // page 253 -> in standard
    // 7 modules per symbol = digit
    // each GTIN-13 barcode has 11 modules for guards
    // and 12 * 7 modules for the digits
    // in total 95

    setA = [
      "sss.bb.s.b",
      "ss.bb.ss.b",
      "ss.b.ss.bb",
      "s.bbbb.s.b",
      "s.b.sss.bb",
      "s.bb.sss.b",
      "s.b.s.bbbb",
      "s.bbb.s.bb",
      "s.bb.s.bbb",
      "sss.bb.ss",
    ];

    setB = [
      "s.b.ss.bbb",
      "s.bb.ss.bb",
      "ss.bb.s.bb",
      "s.b.ssss.b",
      "ss.bbb.s.b",
      "s.bbb.ss.b",
      "ssss.b.s.b",
      "ss.b.sss.b",
      "sss.b.ss.b",
      "ss.b.s.bbb",
    ];

    setC = [
      "bbb.ss.b.s",
      "bb.ss.bb.s",
      "bb.s.bb.ss",
      "b.ssss.b.s",
      "b.s.bbb.ss",
      "b.ss.bbb.s",
      "b.s.b.ssss",
      "b.sss.b.ss",
      "b.ss.b.sss",
      "bbb.s.b.ss",
    ];

    moduleWidth?: number = undefined;
    barcodeHeight?: number = undefined;
    barcodeFullHeight?: number = undefined;
    xPosition: number = 0;
    normalGuard = "b.s.b";
    centreGuard = "s.b.s.b.s";
    readonly numberOfModules = 95;

    static get inputProperties() {
      return ["--barcode-source-gtin"];
    }

    static get inputArguments() {
      return ["*"];
    }

    paint(
      ctx: any,
      { width, height }: { width: number; height: number },
      props: any
    ) {
      console.log("barcode dimensions", width, height);
      // const lw = props.get("--magello-circle-stroke-width").value;
      // const strokeColor = props.get("--magello-circle-stroke-color").toString();
      // read gs1 general specification https://ref.gs1.org/standards/genspecs/

      const gtinRawInput = props.get("--barcode-source-gtin").value;
      this.moduleWidth = width / this.numberOfModules;
      this.barcodeFullHeight = height;
      this.barcodeHeight = this.barcodeFullHeight - this.moduleWidth * 5;

      const gtin13Arr: number[] = gtinRawInput
        .toString()
        .split("")
        .map((n: string) => Number.parseInt(n, 10));
      if (gtin13Arr.length !== 13) {
        throw new RangeError("Wrong length of gtin");
      }
      console.log("gitn13arr", gtin13Arr);

      const symbols = this.getSymbols(gtin13Arr);
      console.log("symbols", symbols, symbols.length);

      this.xPosition = 0;
      this.print(ctx, symbols);
    }

    getSymbols(gtin13Arr: number[]): BarcodeSymbol[] {
      const symbols: BarcodeSymbol[] = [];

      gtin13Arr.shift();

      symbols.push({
        modules: this.parseSymbolModules(this.normalGuard),
        symbolGroup: SymbolGroup.Guard,
      });
      for (let [index, digit] of gtin13Arr.entries()) {
        if (index === 6) {
          console.log("adding centre guard");
          symbols.push({
            modules: this.parseSymbolModules(this.centreGuard),
            symbolGroup: SymbolGroup.Guard,
          });
        }
        symbols.push({
          modules: this.parseSymbolModules(this.pickSymbol(index, digit)),
        });
      }
      symbols.push({
        modules: this.parseSymbolModules(this.normalGuard),
        symbolGroup: SymbolGroup.Guard,
      });

      return symbols;
    }

    parseSymbolModules(symbol: string): string[] {
      return symbol.split(".");
    }

    pickSymbol(position: number, digit: number) {
      const aOrB = this.getRandomIntInclusive(0, 1); //fake
      if (position < 6) {
        if (aOrB === 0) {
          return this.setA[digit];
        } else {
          return this.setB[digit];
        }
      } else {
        return this.setC[digit];
      }
    }

    getRandomIntInclusive(min: number, max: number) {
      min = Math.ceil(min);
      max = Math.floor(max);
      return Math.floor(Math.random() * (max - min + 1) + min); //The maximum is inclusive and the minimum is inclusive
    }

    print(ctx: any, symbols: BarcodeSymbol[]) {
      if (symbols.length > 0) {
        const [firstSymbol, ...restSymbols] = symbols;
        console.log("type", firstSymbol.symbolGroup);
        const symbolHeight =
          firstSymbol.symbolGroup === SymbolGroup.Guard
            ? this.barcodeFullHeight
            : this.barcodeHeight;
        for (let barModules of firstSymbol.modules) {
          this.printBar(ctx, barModules, symbolHeight, this.moduleWidth);
        }

        this.print(ctx, restSymbols);
      }
    }

    printBar(
      ctx: any,
      modules: string,
      symbolHeight?: number,
      moduleWidth?: number
    ) {
      if (!this.moduleWidth || !symbolHeight || !moduleWidth) {
        throw new Error("Barcode params not defined.");
      }

      const moduleCount = modules.length;
      const symbolWidth = moduleCount * moduleWidth;
      console.log("symbol", moduleCount, moduleWidth);

      ctx.fillStyle = modules.startsWith("s") ? "#fff" : "#000";
      ctx.fillRect(this.xPosition, 0, symbolWidth, symbolHeight);
      this.xPosition += symbolWidth;
      console.log("xPosition", this.xPosition);
    }
  }
);
