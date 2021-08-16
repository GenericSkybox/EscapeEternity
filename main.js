// classes
class Resource {
    constructor(name, timeCost, altCostName, altCostAmount, amount, revealed) {
        this.name = name;
        this.timeCost = timeCost;
        this.altCostName = altCostName;
        this.altCostAmount = altCostAmount;
        this.amount = amount;
        this.revealed = revealed;
    }

    buy(altAmount) {
        if (this.timeCost >= game.timeInSeconds) {
            game.endGame();
        }
        else if (this.altCostAmount <= altAmount || altAmount == -1) {
            this.amount += 1;

            game.timeInSeconds -= this.timeCost;
            this.timeCost = Math.round(this.timeCost / (10 * (this.amount)));

            if (altAmount !== -1) {
                altAmount -= this.altCostAmount;
                this.altCostAmount = Math.round(this.altCostAmount * 1) + 1;
            }
        }

        return altAmount;
    }
}
// end classes

// variables
var game = {
    timeInSeconds: Decimal.NUMBER_MAX_VALUE,
    resources: [
        new Resource("thoughts", new Decimal("1e+308"), "", 0, 0, true),
        new Resource("ideas", new Decimal("6e+307"), "thoughts", 10, 0, false)
    ],

    checkForFeatureUnlock: function() {

    },

    buyResource: function(name) {
        for (i = 0; i < this.resources.length; i++) {
            if (this.resources[i].name == name && this.resources[i].altCostName !== "") {
                for (j = 0; j < this.resources.length; j++) {
                    if (this.resources[j].name == this.resources[i].altCostName) {
                        var altAmount = this.resources[i].buy(this.resources[j].amount);
                        this.resources[j].amount = altAmount;

                        display.updateUIAfterPurchase(i, j);
                        return;
                    }
                }
            }
            else if (this.resources[i].name == name) {
                this.resources[i].buy(-1);
                display.updateUIAfterPurchase(i, -1);
                return;
            }
        }
    },

    endGame: function() {
        alert("You did it. Congrats. You spend an eternity.");
    }
}

var resources = {

}

var display = {
    setupUI: function() {
        document.getElementById("time").innerHTML = game.timeInSeconds;

        for (i = 0; i < game.resources.length; i++) {
            document.getElementById(game.resources[i].name).innerHTML = game.resources[i].amount;
            document.getElementById(game.resources[i].name+'TimeCost').innerHTML = game.resources[i].timeCost;
            if (document.getElementById(game.resources[i].name+'AltCost') !== null) {
                document.getElementById(game.resources[i].name+'AltCost').innerHTML = game.resources[i].altCostAmount;
            }
        }
    },

    updateUIOnTick: function() {
        document.getElementById("time").innerHTML = game.timeInSeconds;
    },

    updateUIAfterPurchase: function(resourcePosition, altResourcePosition) {
        this.updateUIOnTick();

        document.getElementById(game.resources[resourcePosition].name).innerHTML = game.resources[resourcePosition].amount;
        document.getElementById(game.resources[resourcePosition].name+'TimeCost').innerHTML = game.resources[resourcePosition].timeCost;

        if (altResourcePosition !== -1) {
            document.getElementById(game.resources[resourcePosition].name+'AltCost').innerHTML = game.resources[resourcePosition].altCostAmount;
            document.getElementById(game.resources[altResourcePosition].name).innerHTML = game.resources[altResourcePosition].amount;
        }
    }
}
// end variables

// main
display.setupUI();
// end main

setInterval(function() {
    game.timeInSeconds -= 1;
    display.updateUIOnTick();
}, 1000);