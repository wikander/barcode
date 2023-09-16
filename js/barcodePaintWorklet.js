"use strict";
var SymbolGroup;
(function (SymbolGroup) {
    SymbolGroup[SymbolGroup["Guard"] = 0] = "Guard";
})(SymbolGroup || (SymbolGroup = {}));
registerPaint("barcode", class {
    constructor() {
        // page 253 -> in standard
        // 7 modules per symbol = digit
        // each GTIN-13 barcode has 11 modules for guards
        // and 12 * 7 modules for the digits
        // in total 95
        this.setA = [
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
        this.setB = [
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
        this.setC = [
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
        this.moduleWidth = undefined;
        this.barcodeHeight = undefined;
        this.barcodeFullHeight = undefined;
        this.xPosition = 0;
        this.normalGuard = "b.s.b";
        this.centreGuard = "s.b.s.b.s";
        this.numberOfModules = 95;
    }
    static get inputProperties() {
        return ["--barcode-source-gtin"];
    }
    static get inputArguments() {
        return ["*"];
    }
    paint(ctx, { width, height }, props) {
        console.log("barcode dimensions", width, height);
        // const lw = props.get("--magello-circle-stroke-width").value;
        // const strokeColor = props.get("--magello-circle-stroke-color").toString();
        // read gs1 general specification https://ref.gs1.org/standards/genspecs/
        const gtinRawInput = props.get("--barcode-source-gtin").value;
        this.moduleWidth = width / this.numberOfModules;
        this.barcodeFullHeight = height;
        this.barcodeHeight = this.barcodeFullHeight - this.moduleWidth * 5;
        const gtin13Arr = gtinRawInput
            .toString()
            .split("")
            .map((n) => Number.parseInt(n, 10));
        if (gtin13Arr.length !== 13) {
            throw new RangeError("Wrong length of gtin");
        }
        console.log("gitn13arr", gtin13Arr);
        const symbols = this.getSymbols(gtin13Arr);
        console.log("symbols", symbols, symbols.length);
        this.xPosition = 0;
        this.print(ctx, symbols);
    }
    getSymbols(gtin13Arr) {
        const symbols = [];
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
    parseSymbolModules(symbol) {
        return symbol.split(".");
    }
    pickSymbol(position, digit) {
        const aOrB = this.getRandomIntInclusive(0, 1); //fake
        if (position < 6) {
            if (aOrB === 0) {
                return this.setA[digit];
            }
            else {
                return this.setB[digit];
            }
        }
        else {
            return this.setC[digit];
        }
    }
    getRandomIntInclusive(min, max) {
        min = Math.ceil(min);
        max = Math.floor(max);
        return Math.floor(Math.random() * (max - min + 1) + min); //The maximum is inclusive and the minimum is inclusive
    }
    print(ctx, symbols) {
        if (symbols.length > 0) {
            const [firstSymbol, ...restSymbols] = symbols;
            console.log("type", firstSymbol.symbolGroup);
            const symbolHeight = firstSymbol.symbolGroup === SymbolGroup.Guard
                ? this.barcodeFullHeight
                : this.barcodeHeight;
            for (let barModules of firstSymbol.modules) {
                this.printBar(ctx, barModules, symbolHeight, this.moduleWidth);
            }
            this.print(ctx, restSymbols);
        }
    }
    printBar(ctx, modules, symbolHeight, moduleWidth) {
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
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiYmFyY29kZVBhaW50V29ya2xldC5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbImJhcmNvZGVQYWludFdvcmtsZXQudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IjtBQUVBLElBQUssV0FFSjtBQUZELFdBQUssV0FBVztJQUNkLCtDQUFLLENBQUE7QUFDUCxDQUFDLEVBRkksV0FBVyxLQUFYLFdBQVcsUUFFZjtBQU1ELGFBQWEsQ0FDWCxTQUFTLEVBQ1Q7SUFBQTtRQUNFLDBCQUEwQjtRQUMxQiwrQkFBK0I7UUFDL0IsaURBQWlEO1FBQ2pELG9DQUFvQztRQUNwQyxjQUFjO1FBRWQsU0FBSSxHQUFHO1lBQ0wsWUFBWTtZQUNaLFlBQVk7WUFDWixZQUFZO1lBQ1osWUFBWTtZQUNaLFlBQVk7WUFDWixZQUFZO1lBQ1osWUFBWTtZQUNaLFlBQVk7WUFDWixZQUFZO1lBQ1osV0FBVztTQUNaLENBQUM7UUFFRixTQUFJLEdBQUc7WUFDTCxZQUFZO1lBQ1osWUFBWTtZQUNaLFlBQVk7WUFDWixZQUFZO1lBQ1osWUFBWTtZQUNaLFlBQVk7WUFDWixZQUFZO1lBQ1osWUFBWTtZQUNaLFlBQVk7WUFDWixZQUFZO1NBQ2IsQ0FBQztRQUVGLFNBQUksR0FBRztZQUNMLFlBQVk7WUFDWixZQUFZO1lBQ1osWUFBWTtZQUNaLFlBQVk7WUFDWixZQUFZO1lBQ1osWUFBWTtZQUNaLFlBQVk7WUFDWixZQUFZO1lBQ1osWUFBWTtZQUNaLFlBQVk7U0FDYixDQUFDO1FBRUYsZ0JBQVcsR0FBWSxTQUFTLENBQUM7UUFDakMsa0JBQWEsR0FBWSxTQUFTLENBQUM7UUFDbkMsc0JBQWlCLEdBQVksU0FBUyxDQUFDO1FBQ3ZDLGNBQVMsR0FBVyxDQUFDLENBQUM7UUFDdEIsZ0JBQVcsR0FBRyxPQUFPLENBQUM7UUFDdEIsZ0JBQVcsR0FBRyxXQUFXLENBQUM7UUFDakIsb0JBQWUsR0FBRyxFQUFFLENBQUM7SUFnSWhDLENBQUM7SUE5SEMsTUFBTSxLQUFLLGVBQWU7UUFDeEIsT0FB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