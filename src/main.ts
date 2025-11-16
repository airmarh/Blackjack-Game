import promptSync from 'prompt-sync';

const prompt = promptSync();
let playerFunds = 100;
let cards: string[] = [];
const blackjack = 21;
const suitArray = ['♣️', '♥️', '♠️', '♦️']
const name = prompt('What is your name? ');

let cardFaceValues: { [key: string]: number } = {
    "2": 2,
    '3': 3,
    '4': 4,
    '5': 5,
    '6': 6,
    '7': 7,
    '8': 8,
    '9': 9,
    '10': 10,
    "J": 10,
    'K': 10,
    'Q': 10,
    'A': 11
};

function createCardDeck() {
    for (const suit of suitArray) {
        for (const cardKey of Object.keys(cardFaceValues)) {
            cards.push(`${cardKey} ${suit}`);
        }
    }
}
createCardDeck();

function shuffleArray(array: string[]) {
    for (let i = array.length - 1; i > 0; i--) {
        // Generate a random index from 0 to i
        const j = Math.floor(Math.random() * (i + 1));
        // Swap elements at indices i and j
        [array[i], array[j]] = [array[j], array[i]];
    }
    return array;
}

function dealCards(noOfCards: number, cards: string[]): string[] {
    let playersCards: string[] = [];
    let shuffledCards = shuffleArray(cards);
    if(shuffledCards.length < noOfCards){
        console.log(`Not enough cards in deck to deal ${noOfCards} card(s). ${shuffledCards.length} card(s) left in the deck`)
        return [];
    }
    for (let i = 0; i < noOfCards; i++) {
        playersCards[i] = shuffledCards.shift() as string
    }
    return playersCards;
}

function calculateTotal(cardArray: string[], sum: number) {
    let faceValues: string[] = [];
    for (const card of cardArray) {
        let contents = card.split(' ');
        faceValues.push(contents[0])
        sum += cardFaceValues[contents[0].trim()];
    }
    if (sum > blackjack) {
        if (faceValues.includes("A")) {
            let aceCount = faceValues.filter(_ => _.startsWith('A')).length
            sum = sum - 10 * aceCount;
        }
    }
    return sum;
}

function CheckForPlayerBust(playerFunds: number, playersTotal: number, bet: number): [boolean, number] {
    if (playersTotal > blackjack) {
        console.log(`You bust and lose $${bet}.`)
        playerFunds -= +bet;
        return [true, playerFunds];
    }

    return [false, playerFunds];
}

function CheckForWin(playerFunds: number, playersTotal: number, dealersTotal: number, bet: number, isFirstDraw: boolean = false): [boolean, number] {
    if (playersTotal == blackjack) {
        if (isFirstDraw) {
            console.log(`You win $${+bet * 1.5}! (3:2 payout for Blackjack).`)
            playerFunds += +bet * 1.5;
        }
        else {
            console.log(`You win $${+bet}!`)
            playerFunds += +bet;
        }
        return [true, playerFunds];
    }

    if (dealersTotal == blackjack) {
        if (isFirstDraw)
            console.log(`Dealer has blackjack. You lose $${bet}.`)
        else
            console.log(`Dealer wins. You lose $${bet}.`)
        playerFunds -= +bet;
        return [true, playerFunds];
    }

    if (playersTotal > blackjack) {
        console.log(`You bust and lose $${bet}.`)
        playerFunds -= +bet;
        return [true, playerFunds];
    }

    if (dealersTotal > blackjack) {
        console.log(`Dealer busts and you win $${bet}.`)
        playerFunds += +bet;
        return [true, playerFunds];
    }

    if (!isFirstDraw) {
        if (dealersTotal > playersTotal) {
            console.log(`Dealer wins. You lose $${bet}.`)
            playerFunds -= +bet;
            return [true, playerFunds];
        }

        if (playersTotal > dealersTotal) {
            console.log(`You win! $${bet}!`)
            playerFunds += +bet;
            return [true, playerFunds];
        }

        if (playersTotal == dealersTotal) {
            console.log('Its a push! Your bet is returned');
            return [true, playerFunds];
        }
    }

    if (playerFunds == 0) {
        console.log(`You have lost all your money, ${name}!`)
        return [true, playerFunds];
    }

    return [false, playerFunds];
}

function generateMessage(cards: string[]): string {
    let message = '';
    for (const card of cards) {
        message = message + card + ', '
        }
    message.substring(0, message.length - 3);
    return message;
}

function validateBetAmount(bet: string): number {
    let validBet = Number(bet)
    if (isNaN(validBet)) {
        bet = prompt('Enter a valid number: $');
        validBet = validateBetAmount(bet);
    }
    if (validBet > playerFunds) {
        bet = prompt('Enter an amount less than or equal to your current balance: $');
        validBet = validateBetAmount(bet);
    }
    return validBet;
}

function IsCardDeckFinished(cardsDealt: string[], playerBalance: number):boolean{
    let isFinished = false;
    if(!Array.isArray(cardsDealt) || !cardsDealt.length){
        console.log(`${name} leaves with $${playerBalance}.`)
        isFinished = true;
    }
    return isFinished;
}

function play() {
    let newDeal: string[] = [];
    let isCardDeckFinished = false;
    cards = shuffleArray(cards);
    console.log(`${name}'s funds: $${playerFunds}`);
    let betString = prompt('Enter your bet: $');
    let bet: number = validateBetAmount(betString);
    var playersCards = dealCards(2, cards);
    isCardDeckFinished = IsCardDeckFinished(playersCards, playerFunds);
    if(isCardDeckFinished) return;
    var playersTotal = calculateTotal(playersCards, 0);
    console.log(`Your hand : ${generateMessage(playersCards)} (Total: ${playersTotal})`);
    var dealersCards = dealCards(2, cards);
    isCardDeckFinished = IsCardDeckFinished(dealersCards, playerFunds);
    if(isCardDeckFinished) return;
    var dealersTotal = calculateTotal(dealersCards, 0);
    console.log(`Dealer's hand : ${dealersCards[0]}, hidden`);
    let gameOver = CheckForWin(playerFunds, playersTotal, dealersTotal, bet as number, true);
    while (!gameOver[0]) {
        playerFunds = gameOver[1];
        cards = shuffleArray(cards);
        var nextAction = prompt('Your action(hit/stand): ');
        if (!(nextAction == null && nextAction == '')) {
            if (nextAction.toLowerCase().trim() == "hit") {
                newDeal = dealCards(1, cards);
                isCardDeckFinished = IsCardDeckFinished(newDeal, playerFunds);
                if(isCardDeckFinished) return;
                playersCards = playersCards.concat(newDeal);
                playersTotal = calculateTotal(newDeal, playersTotal);
                console.log(`Your hand : ${generateMessage(playersCards)} (Total: ${playersTotal})`);
                gameOver = CheckForPlayerBust(playerFunds, playersTotal, bet as number);
            }
            else if (nextAction.toLowerCase().trim() == "stand") {
                console.log(`Dealer's hand : ${generateMessage(dealersCards)} (Total: ${dealersTotal})`);
                while (dealersTotal < 17) {
                    newDeal = dealCards(1, cards);
                    isCardDeckFinished = IsCardDeckFinished(newDeal, playerFunds);
                    if(isCardDeckFinished) return;
                    dealersCards = dealersCards.concat(newDeal);
                    dealersTotal = calculateTotal(newDeal, dealersTotal);
                    console.log(`Dealer's hand : ${generateMessage(dealersCards)} (Total: ${dealersTotal})`);
                }
                if(!gameOver[0])
                    gameOver = CheckForWin(playerFunds, playersTotal, dealersTotal, bet as number);
            }
            else {
                console.log("Invalid Input!!!");
            }
        }
        else {
            console.log("Invalid Input!!!");
        }
    }
    playerFunds = gameOver[1];

    if (playerFunds != 0){
        console.log(`You have $${playerFunds} left.`)
        play();
    }
}

play();