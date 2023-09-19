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
        this.numberSets = {
            A: [
                ["sss", "bb", "s", "b"],
                ["ss", "bb", "ss", "b"],
                ["ss", "b", "ss", "bb"],
                ["s", "bbbb", "s", "b"],
                ["s", "b", "sss", "bb"],
                ["s", "bb", "sss", "b"],
                ["s", "b", "s", "bbbb"],
                ["s", "bbb", "s", "bb"],
                ["s", "bb", "s", "bbb"],
                ["sss", "bb", "ss"],
            ],
            B: [
                ["s", "b", "ss", "bbb"],
                ["s", "bb", "ss", "bb"],
                ["ss", "bb", "s", "bb"],
                ["s", "b", "ssss", "b"],
                ["ss", "bbb", "s", "b"],
                ["s", "bbb", "ss", "b"],
                ["ssss", "b", "s", "b"],
                ["ss", "b", "sss", "b"],
                ["sss", "b", "ss", "b"],
                ["ss", "b", "s", "bbb"],
            ],
            C: [
                ["bbb", "ss", "b", "s"],
                ["bb", "ss", "bb", "s"],
                ["bb", "s", "bb", "ss"],
                ["b", "ssss", "b", "s"],
                ["b", "s", "bbb", "ss"],
                ["b", "ss", "bbb", "s"],
                ["b", "s", "b", "ssss"],
                ["b", "sss", "b", "ss"],
                ["b", "ss", "b", "sss"],
                ["bbb", "s", "b", "ss"],
            ],
        };
        this.AorBDecisionTable = [
            ["A", "A", "A", "A", "A", "A"],
            ["A", "A", "B", "A", "B", "B"],
            ["A", "A", "B", "B", "A", "B"],
            ["A", "A", "B", "B", "B", "A"],
            ["A", "B", "A", "A", "B", "B"],
            ["A", "B", "B", "A", "A", "B"],
            ["A", "B", "B", "B", "A", "A"],
            ["A", "B", "A", "B", "A", "B"],
            ["A", "B", "A", "B", "B", "A"],
            ["A", "B", "B", "A", "B", "A"],
        ];
        this.moduleWidth = undefined;
        this.barcodeHeight = undefined;
        this.barcodeFullHeight = undefined;
        this.xPosition = 0;
        this.normalGuard = ["b", "s", "b"];
        this.centreGuard = ["s", "b", "s", "b", "s"];
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
        console.log("gitn13arr", gtin13Arr);
        const symbols = this.getSymbols(gtin13Arr);
        console.log("symbols", symbols, symbols.length);
        this.xPosition = 0;
        this.print(ctx, symbols);
    }
    getSymbols(gtin13Arr) {
        if (gtin13Arr.length !== 13) {
            throw new RangeError("Wrong length of gtin");
        }
        else {
            const symbols = [];
            const [additionalDigit, ...encodedDigits] = gtin13Arr;
            const AorB = this.AorBDecisionTable[additionalDigit];
            symbols.push({
                modules: this.normalGuard,
                symbolGroup: SymbolGroup.Guard,
            });
            for (let [index, digit] of encodedDigits.entries()) {
                if (index === 6) {
                    console.log("adding centre guard");
                    symbols.push({
                        modules: this.centreGuard,
                        symbolGroup: SymbolGroup.Guard,
                    });
                }
                symbols.push({
                    modules: this.pickSymbol(AorB, index, digit),
                });
            }
            symbols.push({
                modules: this.normalGuard,
                symbolGroup: SymbolGroup.Guard,
            });
            return symbols;
        }
    }
    pickSymbol(AorB, position, digit) {
        if (position < 6) {
            return this.numberSets[AorB[position]][digit];
        }
        else {
            return this.numberSets["C"][digit];
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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiYmFyY29kZVBhaW50V29ya2xldC5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbImJhcmNvZGVQYWludFdvcmtsZXQudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IjtBQUVBLElBQUssV0FFSjtBQUZELFdBQUssV0FBVztJQUNkLCtDQUFLLENBQUE7QUFDUCxDQUFDLEVBRkksV0FBVyxLQUFYLFdBQVcsUUFFZjtBQWFELGFBQWEsQ0FDWCxTQUFTLEVBQ1Q7SUFBQTtRQUNFLDBCQUEwQjtRQUMxQiwrQkFBK0I7UUFDL0IsaURBQWlEO1FBQ2pELG9DQUFvQztRQUNwQyxjQUFjO1FBRUwsZUFBVSxHQUFHO1lBQ3BCLENBQUMsRUFBRTtnQkFDRCxDQUFDLEtBQUssRUFBRSxJQUFJLEVBQUUsR0FBRyxFQUFFLEdBQUcsQ0FBQztnQkFDdkIsQ0FBQyxJQUFJLEVBQUUsSUFBSSxFQUFFLElBQUksRUFBRSxHQUFHLENBQUM7Z0JBQ3ZCLENBQUMsSUFBSSxFQUFFLEdBQUcsRUFBRSxJQUFJLEVBQUUsSUFBSSxDQUFDO2dCQUN2QixDQUFDLEdBQUcsRUFBRSxNQUFNLEVBQUUsR0FBRyxFQUFFLEdBQUcsQ0FBQztnQkFDdkIsQ0FBQyxHQUFHLEVBQUUsR0FBRyxFQUFFLEtBQUssRUFBRSxJQUFJLENBQUM7Z0JBQ3ZCLENBQUMsR0FBRyxFQUFFLElBQUksRUFBRSxLQUFLLEVBQUUsR0FBRyxDQUFDO2dCQUN2QixDQUFDLEdBQUcsRUFBRSxHQUFHLEVBQUUsR0FBRyxFQUFFLE1BQU0sQ0FBQztnQkFDdkIsQ0FBQyxHQUFHLEVBQUUsS0FBSyxFQUFFLEdBQUcsRUFBRSxJQUFJLENBQUM7Z0JBQ3ZCLENBQUMsR0FBRyxFQUFFLElBQUksRUFBRSxHQUFHLEVBQUUsS0FBSyxDQUFDO2dCQUN2QixDQUFDLEtBQUssRUFBRSxJQUFJLEVBQUUsSUFBSSxDQUFDO2FBQ3BCO1lBRUQsQ0FBQyxFQUFFO2dCQUNELENBQUMsR0FBRyxFQUFFLEdBQUcsRUFBRSxJQUFJLEVBQUUsS0FBSyxDQUFDO2dCQUN2QixDQUFDLEdBQUcsRUFBRSxJQUFJLEVBQUUsSUFBSSxFQUFFLElBQUksQ0FBQztnQkFDdkIsQ0FBQyxJQUFJLEVBQUUsSUFBSSxFQUFFLEdBQUcsRUFBRSxJQUFJLENBQUM7Z0JBQ3ZCLENBQUMsR0FBRyxFQUFFLEdBQUcsRUFBRSxNQUFNLEVBQUUsR0FBRyxDQUFDO2dCQUN2QixDQUFDLElBQUksRUFBRSxLQUFLLEVBQUUsR0FBRyxFQUFFLEdBQUcsQ0FBQztnQkFDdkIsQ0FBQyxHQUFHLEVBQUUsS0FBSyxFQUFFLElBQUksRUFBRSxHQUFHLENBQUM7Z0JBQ3ZCLENBQUMsTUFBTSxFQUFFLEdBQUcsRUFBRSxHQUFHLEVBQUUsR0FBRyxDQUFDO2dCQUN2QixDQUFDLElBQUksRUFBRSxHQUFHLEVBQUUsS0FBSyxFQUFFLEdBQUcsQ0FBQztnQkFDdkIsQ0FBQyxLQUFLLEVBQUUsR0FBRyxFQUFFLElBQUksRUFBRSxHQUFHLENBQUM7Z0JBQ3ZCLENBQUMsSUFBSSxFQUFFLEdBQUcsRUFBRSxHQUFHLEVBQUUsS0FBSyxDQUFDO2FBQ3hCO1lBRUQsQ0FBQyxFQUFFO2dCQUNELENBQUMsS0FBSyxFQUFFLElBQUksRUFBRSxHQUFHLEVBQUUsR0FBRyxDQUFDO2dCQUN2QixDQUFDLElBQUksRUFBRSxJQUFJLEVBQUUsSUFBSSxFQUFFLEdBQUcsQ0FBQztnQkFDdkIsQ0FBQyxJQUFJLEVBQUUsR0FBRyxFQUFFLElBQUksRUFBRSxJQUFJLENBQUM7Z0JBQ3ZCLENBQUMsR0FBRyxFQUFFLE1BQU0sRUFBRSxHQUFHLEVBQUUsR0FBRyxDQUFDO2dCQUN2QixDQUFDLEdBQUcsRUFBRSxHQUFHLEVBQUUsS0FBSyxFQUFFLElBQUksQ0FBQztnQkFDdkIsQ0FBQyxHQUFHLEVBQUUsSUFBSSxFQUFFLEtBQUssRUFBRSxHQUFHLENBQUM7Z0JBQ3ZCLENBQUMsR0FBRyxFQUFFLEdBQUcsRUFBRSxHQUFHLEVBQUUsTUFBTSxDQUFDO2dCQUN2QixDQUFDLEdBQUcsRUFBRSxLQUFLLEVBQUUsR0FBRyxFQUFF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