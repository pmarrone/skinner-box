/*global levelController, clickActions, jsGFwk */

var levels;

var parseColor = function (color) {
    color.a = color.a || 1;
    return "rgba(" + parseInt(color.r) + ", " + parseInt(color.g) + ", " + parseInt(color.b) + ", " + color.a + ")";
};

(function () {
    
    function createGridLevel(xOffset, width, height, number, gutter, player, trueBlockColor, otherColor, margins, update) {
        if (typeof xOffset === 'object') {
            var params = xOffset;
            xOffset = params.xOffset;
            width = params.width;
            height = params.height;
            number = params.number;
            gutter = params.gutter;
            player = params.player;
            trueBlockColor = params.trueBlockColor;
            otherColor = params.otherColor;
            margins = params.margins;
            update = params.update;
        }
        margins = margins || 0;
        
        var blocks = [];
        var blockWidth = ((width - 2 * margins) / number) - gutter;
        var blockHeight = ((height - 2 * margins) / number) - gutter;
        var trueBlock = parseInt(Math.random() * number * number);
        
        function getOtherColor() {
            if (Array.isArray(otherColor)) {
                return otherColor[parseInt(Math.random() * otherColor.length)];
            }
            return otherColor;
        }
        
        function fadeToGray() {
            
        }
        
        for (var i = 0; i < number; i ++) {
            for (var j = 0; j < number; j++) {
                var isTrueBlock = (i * number + j === trueBlock);
                
                var block = {
                    update: update || function () {},
                    trueBlockColor: trueBlockColor,
                    otherColor: getOtherColor(),
                    isClickable: true,
                    player: player,
                    x: xOffset + margins + gutter / 2 + (gutter + blockWidth) * i,
                    y: margins + gutter / 2 + (gutter + blockHeight) * j,
                    width: blockWidth,
                    height: blockHeight,
                    isTrueBlock: isTrueBlock,
                    clickAction: isTrueBlock ? clickActions.updateGame : clickActions.penalizePlayer,
                    //FIXME
                    draw: function (context) {
                        context.fillStyle = this.isTrueBlock ? parseColor(this.trueBlockColor) : parseColor(this.otherColor);
                        context.fillRect(this.x, this.y, this.width, this.height);
                    }
                };
                blocks.push(block);
            }
        }
        return blocks;
    }
    
    /**
     Niveles habilitados
    */
    var levelsEnabled = {
        colors1: true,
        colors2: true,
        fade: true
    };
    
    function addGridLevel(params) {
        var i = 0;
        
        var number = params.number || 1;
        var trueBlockColor1 = params.trueBlockColor1 || {r: 0, g: 0, b: 255};
        var otherColor1 = params.otherColor1 || {r: 255, g: 0, b: 0};
        var trueBlockColor2 = params.trueBlockColor2 || {r: 255, g: 0, b: 0};
        var otherColor2 = params.otherColor2 || {r: 0, g: 0, b: 255};
        var update = params.update;

        return {
            player1: function () {
                return createGridLevel(0, jsGFwk.settings.width / 2, jsGFwk.settings.height, number, 20, 'player1',  trueBlockColor1, otherColor1, 50, update);
            },
            player2: function () {
                return createGridLevel(jsGFwk.settings.width / 2, jsGFwk.settings.width / 2, jsGFwk.settings.height, number, 20, 'player2', trueBlockColor2, otherColor2, 50, update);
            },
            player1target: function (context) {
                context.fillStyle = parseColor(trueBlockColor1);
                context.fillRect(10, jsGFwk.settings.height - 50, 30, 30);
            },
            player2target: function (context) {
                context.fillStyle = parseColor(trueBlockColor2);
                context.fillRect(jsGFwk.settings.width - 40, 50, 30, 30);
            }
        };
    }
    
    
    levels = []; 
    if (levelsEnabled.colors1) {
        for (i = 1; i <= 7; i++) {
            levels.push(addGridLevel({number: i}));    
        }
    }
    var otherReds = [{r: 200, g: 0, b: 0}, {r: 230, g: 40, b: 0}, {r: 150, g: 30, b: 20}, {r: 100, g: 20, b: 60}];
    var otherBlues = [{r: 0, g: 0, b: 210}, {r: 0, g: 40, b: 200}, {r: 50, g: 50, b: 200}, {r: 60, g: 60, b: 150}];
    var otherColor1 = [{r: 255, g: 0, b: 0}];
    var otherColor2 = [{r: 0, g: 0, b: 255}];
    
    if (levelsEnabled.colors2) {
        for (i = 3; i <= 8; i++) {
            levels.push(addGridLevel({number: i, trueBlockColor1: {r: 230, g: 40, b: 80}, trueBlockColor2: {r: 80, g: 80, b: 210}, otherColor1: otherColor1.slice(), otherColor2: otherColor2.slice()}));
            if (otherReds.length > 0) {
                otherColor1.push(otherReds.shift());  
            }
            if (otherBlues.length > 0) {
                otherColor2.push(otherBlues.shift());
            }
        }   
    }
    
    function fadeToGrey(originalColor,delta) {
        
        color = {
            a: originalColor.a,
            b: originalColor.b,
            r: originalColor.r,
            g: originalColor.g
        }
        delta = delta || 1;
        delta = Math.min(1, delta);
        delta *= 10;
        var magicalFactor = 10;
        var grayTone = 60;
        color.r += (grayTone - color.r) / magicalFactor * delta;
        color.g += (grayTone - color.g) / magicalFactor * delta;
        color.b += (grayTone - color.b) / magicalFactor * delta;

        return color;
    }
    
    var fadeBlock = function (delta) {
        this.trueBlockColor = fadeToGrey(this.trueBlockColor, delta);
        this.otherColor = fadeToGrey(this.otherColor, delta);
    };
    
    if (levelsEnabled.fade) {
        for (var i = 3; i <= 8; i++) {
            levels.push(addGridLevel({number: i, trueBlockColor1: {r: 230, g: 40, b: 80}, trueBlockColor2: {r: 80, g: 80, b: 210}, otherColor1: otherColor1.slice(), otherColor2: otherColor2.slice(), update: fadeBlock }));

            if (otherReds.length > 0) {
                otherColor1.push(otherReds.shift());  
            }
            if (otherBlues.length > 0) {
                otherColor2.push(otherBlues.shift());
            }
        }        
    }

       
}());
