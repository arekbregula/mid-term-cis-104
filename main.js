"use strict";

const PROMPT = require("readline-sync");

// Initial balance set on every account when the program starts
const INITIAL_BALANCE = 1000;

// Amount of times a user can enter the wrong PIN
const MAX_PIN_TRIES = 3;

// Regex used to validate user's input
const MONEY_VALIDATION_REGEX = /^[0-9]*$/;

// All of the bank's users
const USERS = [
    {name: "Arek", cardNumber: "1234", pin: "1234", balance: INITIAL_BALANCE},
    {name: "Johnny", cardNumber: "4321", pin: "1234", balance: INITIAL_BALANCE}
];

// The main menu
const MENU = [
    {text: "1. Deposit", action: deposit},
    {text: "2. Withdraw", action: withdraw},
    {text: "3. Transfer", action: transfer},
    {text: "4. View Balance", action: viewBalance},
    {text: "5. Quit", action: null}
];

let currentUser;
let isAuthenticated;
let wantsToQuit;
let menuOption;

/**
 * The dispatcher function of the program. Responsible for calling all other functions.
 */
function main() {
    wantsToQuit = false;
    while(wantsToQuit == false) {
        if(isAuthenticated) {
            showMenu();
            setMenuOption();
            doMenuOption(menuOption);
        } else {
            setCurrentUser();
        }
    }

    console.log("Goodbye.");
}

/**
 * Show the main menu based on the MENU constant.
 */
function showMenu() {
    console.log("\n\n------------------------------------------------");
    console.log("You can perform the following actions: ");
    for(let i = 0; i < MENU.length; i++) {
        console.log("\t" + MENU[i].text);
    }
}

/**
 * Ask the user for their main menu option.
 */
function setMenuOption() {
    menuOption = PROMPT.questionInt(">> ");
}

/**
 * Perform the action after based on the user's input.
 * @param  {Number} menuOption The user's menu option.
 */
function doMenuOption(menuOption) {
    if(MENU.length >= menuOption-1) {
        let action = MENU[menuOption-1].action;
        if(action == null) { wantsToQuit = true; }
        else { action(); }
    } else {
        console.log("Invalid choice.");
    }
}

/**
 * Ask for the user's name.
 * @return {String} The user's name.
 */
function askForName() {
    let name = PROMPT.question("Please enter your name: ");
    return name;
}

/** 
 * Ask for the user's card number.
 * @return {String} The user's card number.
 */
function askForCardNumber() {
    let cardNumber = PROMPT.question("Please enter your card number: ");
    return cardNumber;
}

/**
 * Ask for the user's PIN.
 * @return {String} The user's PIN.
 */
function askForPin() {
    let pin = PROMPT.question("Please enter your PIN: ", {
        hideEchoBack: true
    });
    return pin;
}

/**
 * Ask for the user's name, card number, and PIN.
 * Verify their input and if valid, set isAuthenticated to true, and return the current user.
 * @return {Object} The current user, based on the USERS constant.
 */
function authenticate() {
    let name = askForName();
    let cardNumber = askForCardNumber();

    let pinTries = 0;

    let cardNumberSearchResults = USERS.filter((user) => { return user.cardNumber === cardNumber; });
    if(cardNumberSearchResults.length == 1) {
        if(cardNumberSearchResults[0].name === name) {
            while(pinTries < MAX_PIN_TRIES) {
                let pin = askForPin();
                if(cardNumberSearchResults[0].pin === pin) {
                    isAuthenticated = true;
                    return cardNumberSearchResults[0];
                    break;
                } else {
                    pinTries++;
                    console.log("Sorry, try again.");
                }
            }
            wantsToQuit = true;
        }
    }
}

/**
 * Set currentUsers to the output of the authenticate function.
 */
function setCurrentUser() {
    currentUser = authenticate();
}

/**
 * Ask the user for the amount they'd like to deposit,
 * and then add the value to their balance.
 */
function deposit() {
    let depositAmount = askForMoney("How much would you like to deposit (or 0 to cancel): ");
    currentUser.balance += depositAmount;
    console.log(`\n$${depositAmount} has been added to your balance.`);
}

/**
 * Ask the user for the amount they'd like to withdraw,
 * make sure their balance is large enough,
 * then subtract the amount from their balance.
 */
function withdraw() {
    let withdrawAmount = askForMoney("How much would you like to withdraw (or 0 to cancel): ");
    if(currentUser.balance >= withdrawAmount) {
        currentUser.balance -= withdrawAmount;
        console.log(`\n\n$${withdrawAmount} will come out of the ATM in just a moment.`);
    } else {
        console.log("\n\nYou don't have that much in your account.");
    }
}

/**
 * Ask the user for a card number and transfer amount.
 * If the card number is valid, transfer the amount into that account.
 */
function transfer() {
    let destinationCardNumber = PROMPT.question("Which card number would you like to transfer to: ");
    let cardNumberSearchResults = USERS.filter((user) => { return user.cardNumber === destinationCardNumber; });

    if(cardNumberSearchResults.length != 1) {
        console.log("\nThis card number doesn't exist!");
        return;
    } 

    let transferAmount = askForMoney("How much would you like to transfer (or 0 to cancel): ");

    if(currentUser.balance < transferAmount) {
        console.log("\n\nYou don't have enough in your account in order to complete this transfer.");
        return;
    }

    cardNumberSearchResults[0].balance += transferAmount;
    currentUser.balance -= transferAmount;
    console.log(`\n\n$${transferAmount} has been transfered to ${destinationCardNumber}.`);
}

/**
 * Display the current user's balance.
 */
function viewBalance() {
    console.log(`\n\nYour current balance is $${currentUser.balance}`);
}

/**
 * A utility function which asks the question provided,
 * accepts input,
 * and makes sure the input is positive, and a valid integer.
 * @param  {String} question The question to ask the user.
 * @return {Number}          The user's input.
 */
function askForMoney(question) {
    let input = PROMPT.question(question);
    if(MONEY_VALIDATION_REGEX.test(input)) {
        return Number(input);
    } else {
        console.log("\nInvalid amount. Try again.");
        askForMoney(question);
    }

}

main ();