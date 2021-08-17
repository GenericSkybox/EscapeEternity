// consts
const AUTO_BUY_MULTIPLIER_BASE = 0;
const AUTO_BUY_MULTIPLIER_RATE = 10;
const AUTO_BUY_COST_BASE = 10;
const AUTO_BUY_COST_RATE = 1.2;
const TIME_COST_RATE = 10;
// end consts

// functions
function logbx(b, x) {
    return Math.log(b) / Math.log(x);
}

function normalize(value, max, min) {
    return (1-0) / (max-min) * (value-max) + 1
}
// end functions

// classes
class Resource {
    constructor(name, timeCost, altCostName, altCostAmount, amount, revealed, resourcePosition) {
        this.name = name;
        this.timeCost = timeCost;
        this.altCostName = altCostName;
        this.altCost = altCostAmount;
        this.amount = amount;
        this.revealed = revealed;
        this.resourcePosition = resourcePosition;

        this.autoBuyMultiplier = AUTO_BUY_MULTIPLIER_BASE;
        this.autoBuyCost = AUTO_BUY_COST_BASE;
    }

    buy(altAmount) {
        if (this.timeCost >= game.timeInSeconds) {
            game.endGame();
        }
        else if (this.altCost <= altAmount || altAmount == -1) {
            this.amount += 1;

            game.timeInSeconds -= this.timeCost;
            this.timeCost = Math.floor(this.timeCost * Math.pow((this.resourcePosition + 1) / 10, normalize(this.amount, Math.pow(TIME_COST_RATE, this.resourcePosition), 0)));
            //this.timeCost = logbx(this.timeCost, this.amount / 10);
            //this.timeCost = Math.round(this.timeCost / (10 * this.amount * (this.resourcePosition + 1)));

            if (this.autoBuyMultiplier == 0 && this.timeCost == 0) {
                display.updateEventBox('autobuy', this.name);
                this.autoBuyMultiplier = 1;
            }

            if (altAmount !== -1) {
                altAmount -= this.altCost;
            }
        }

        return altAmount;
    }

    upgrade() {
        if (this.autoBuyCost <= this.amount && this.autoBuyMultiplier > 0) {
            this.amount -= this.autoBuyCost;
            this.autoBuyMultiplier += 1;
            this.autoBuyCost *= Math.round(this.autoBuyMultiplier * AUTO_BUY_COST_RATE) * 10;
        }
    }
}
// end classes

// variables
var game = {
    timeInSeconds: Decimal.NUMBER_MAX_VALUE,
    resources: [
        new Resource("thoughts", new Decimal("1e+308"), "", 0, 0, true, 0),
        new Resource("ideas", new Decimal("2.5e+307"), "thoughts", 10, 0, false, 1),
        new Resource("postulates", new Decimal("2e+306"), "ideas", 10, 0, false, 2),
        new Resource("hypotheses", new Decimal("7e+305"), "postulates", 10, 0, false, 3),
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

                        display.updateAllUI();
                        return;
                    }
                }
            }
            else if (this.resources[i].name == name) {
                this.resources[i].buy(-1);
                display.updateAllUI();
                return;
            }
        }
    },

    upgradeResource: function(name) {
        for (i = 0; i < this.resources.length; i++) {
            if (this.resources[i].name == name) {
                this.resources[i].upgrade();
                display.updateAllUI();
                return;
            }
        }
    },

    updateAllResources: function() {
        game.timeInSeconds -= 1;
        for (i = 0; i < game.resources.length; i++) {
            if (game.resources[i].autoBuyMultiplier > 0) {
                game.resources[i].amount += Math.pow(AUTO_BUY_MULTIPLIER_RATE, (game.resources[i].autoBuyMultiplier - 1));
            }
        }
    },

    endGame: function() {
        alert("You did it. Congrats. You spend an eternity.");
    }
}

var display = {
    setupUI: function() {
        this.updateAllUI();
    },

    updateAllUI: function() {
        document.getElementById("time").innerHTML = game.timeInSeconds;
        for (i = 0; i < game.resources.length; i++) {
            document.getElementById(game.resources[i].name).innerHTML = game.resources[i].amount;

            if (document.getElementById(game.resources[i].name+'TimeCost') !== null) {
                document.getElementById(game.resources[i].name+'TimeCost').innerHTML = game.resources[i].timeCost;
            }

            if (document.getElementById(game.resources[i].name+'AltCost') !== null) {
                document.getElementById(game.resources[i].name+'AltCost').innerHTML = game.resources[i].altCost;
            }

            if (document.getElementById(game.resources[i].name+'UpgradeCost') !== null) {
                document.getElementById(game.resources[i].name+'UpgradeCost').innerHTML = game.resources[i].autoBuyCost;
            }
        }
    },

    updateEventBox: function(eventCategory, eventName) {
        switch(eventCategory) {
            case 'autobuy':
                this.autoBuyEvent(eventName);
                break;
        }
    },

    autoBuyEvent: function(eventName) {
        switch(eventName) {
            case 'thoughts':
                document.getElementById('eventBox').innerHTML = "You've spent what feels like an eternity thinking. It's automatic to you now. [Thoughts +1/s]";
                break;
            case 'ideas':
                document.getElementById('eventBox').innerHTML = "Another eternity come and gone. The ideas keep flowing. [Ideas +1/s]"
                break;
        }
    }
}
// end variables

// main
display.setupUI();
// end main

// intervals
setInterval(function() {
    game.updateAllResources();
    display.updateAllUI();
}, 1000); // runs once per second
// end intervals