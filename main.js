// consts
const STARTING_AMOUNT = new Decimal("1e+308")

const ALT_COST_BASE = 2;

const AUTO_BUYER_COST_BASE = 10;
const AUTO_BUYER_COST_RATE = 1.1;
// end consts

// functions
// end functions

// classes
class Resource {
    constructor(name, revealed, position) {
        this.name = name;
        this.amount = 0;
        this.revealed = revealed;
        
        this.position = position;
        this.resetCounter = 0;

        this.timeCost = this.calculateTimeCostBase();

        this.autoBuyersToggle = false;
        this.autoBuyers = 0;
        this.autoBuyerCost = AUTO_BUYER_COST_BASE;
    }

    calculateTimeCostBase() {
        return STARTING_AMOUNT / Math.pow(10, this.position + this.resetCounter);
    }

    getResourceCost() {
        if (this.position !== 0) {
            return Math.pow(ALT_COST_BASE, this.position + this.resetCounter);
        }
        else {
            return Math.pow(ALT_COST_BASE, this.position);
        }
    }

    getResetMultiplier() {
        return (10 - this.resetCounter) / 10;
    }

    getTimeCostMin() {
        return Math.pow(2, (this.position + 1) * (this.resetCounter + 1));
    }

    getAutoBuyerMultiplier() {
        return 1;
    }

    getResourceCostPerAutoBuy() {
        return this.getResourceCost() * this.autoBuyers * this.getAutoBuyerMultiplier();
    }

    buy() {
        if (this.timeCost >= game.timeInSeconds) {
            game.endGame();
        }
        else if (this.position == 0 || this.getResourceCost() <= game.resources[this.position-1].amount) {
            this.amount += 1;

            game.timeInSeconds -= this.timeCost;

            if (this.timeCost > this.getTimeCostMin()) {
                this.timeCost = Math.floor(this.timeCost / Math.pow(10, this.getResetMultiplier() * (game.resources.length - this.position)));

                if (this.timeCost <= this.getTimeCostMin()) {
                    this.timeCost = this.getTimeCostMin();
                    display.updateEventBox('autobuy', this.name);
                    this.autoBuyers = 1;
                    this.autoBuyersToggle = true;
                }
            }

            if (this.position > 0) {
                game.resources[this.position-1].amount -= this.getResourceCost();
            }
        }
    }

    upgrade() {
        if (this.amount >= this.autoBuyerCost && this.autoBuyers > 0) {
            this.amount -= this.autoBuyerCost;
            this.autoBuyers += 1;
            this.autoBuyerCost = Math.round(this.autoBuyerCost * AUTO_BUYER_COST_RATE);
        }
    }

    reset() {
        if (this.resetCounter < 9) {
            this.resetCounter++;
            this.timeCost = this.calculateTimeCostBase();
        }
    }
}
// end classes

// variables
var game = {
    timeInSeconds: Decimal.NUMBER_MAX_VALUE,
    ticSpeed: 1,
    resources: [
        new Resource("thoughts", true, 0),
        new Resource("ideas", false, 1),
        new Resource("notions", false, 2),
        new Resource("hypotheses", false, 3),
        new Resource("theories", false, 4),
        new Resource("deductions", false, 5),
        new Resource("postulates", false, 6),
        new Resource("rules", false, 7),
        new Resource("realities", false, 8)
    ],

    buyResource: function(name) {
        for (i = 0; i < this.resources.length; i++) {
            if (this.resources[i].name == name) {
                this.resources[i].buy();
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
        game.timeInSeconds -= this.ticSpeed;
        for (i = 0; i < game.resources.length; i++) {
            if (game.resources[i].autoBuyers > 0 && game.resources[i].autoBuyersToggle && i !== 0) {
                if (game.resources[i-1].amount >= game.resources[i].getResourceCostPerAutoBuy()) {
                    game.resources[i].amount += (game.resources[i].autoBuyers * game.resources[i].getAutoBuyerMultiplier());
                    game.timeInSeconds -= game.resources[i].getTimeCostMin();
                    game.resources[i-1].amount -= game.resources[i].getResourceCostPerAutoBuy();
                }
            }
            else if (game.resources[i].autoBuyers > 0 && game.resources[i].autoBuyersToggle) {
                game.resources[i].amount += (game.resources[i].autoBuyers * game.resources[i].getAutoBuyerMultiplier());
                game.timeInSeconds -= game.resources[i].getTimeCostMin();
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
                document.getElementById(game.resources[i].name+'AltCost').innerHTML = game.resources[i].getResourceCost();
            }

            if (document.getElementById(game.resources[i].name+'UpgradeCost') !== null) {
                document.getElementById(game.resources[i].name+'UpgradeCost').innerHTML = game.resources[i].autoBuyerCost;
            }

            if (document.getElementById(game.resources[i].name+'UpgradeMultiplier') !== null) {
                document.getElementById(game.resources[i].name+'UpgradeMultiplier').innerHTML = ((game.resources[i].autoBuyers + 1) * game.resources[i].getAutoBuyerMultiplier());
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