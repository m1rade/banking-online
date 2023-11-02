'use strict';

/////////////////////////////////////////////////
/////////////////////////////////////////////////
// BANKIST APP

// Data
const account1 = {
    owner: 'Jonas Schmedtmann',
    movements: [200, 455.23, -306.5, 25000, -642.21, -133.9, 79.97, 1300],
    interestRate: 1.2, // %
    pin: 1111,

    movementsDates: [
        '2022-11-18T21:31:17.178Z',
        '2022-12-23T07:42:02.383Z',
        '2023-01-28T09:15:04.904Z',
        '2023-10-29T13:17:24.185Z',
        '2023-10-29T14:11:59.604Z',
        '2023-10-30T17:01:17.194Z',
        '2023-10-31T23:36:17.929Z',
        '2023-11-01T10:51:36.790Z',
    ],
    currency: 'EUR',
    locale: 'pt-PT', // de-DE
};

const account2 = {
    owner: 'Jessica Davis',
    movements: [5000, 3400, -150, -790, -3210, -1000, 8500, -30],
    interestRate: 1.5,
    pin: 2222,

    movementsDates: [
        '2022-08-01T13:15:33.035Z',
        '2022-09-30T09:48:16.867Z',
        '2022-09-25T06:04:23.907Z',
        '2023-09-25T14:18:46.235Z',
        '2023-10-05T16:33:06.386Z',
        '2023-10-10T14:43:26.374Z',
        '2023-10-31T11:49:59.371Z',
        '2023-11-01T12:01:20.894Z',
    ],
    currency: 'USD',
    locale: 'en-US',
};

const account3 = {
    owner: 'Steven Thomas Williams',
    movements: [200, -200, 340, -300, -20, 50, 400, -460],
    interestRate: 0.7,
    pin: 3333,
};

const account4 = {
    owner: 'Sarah Smith',
    movements: [430, 1000, 700, 50, 90],
    interestRate: 1,
    pin: 4444,
};

const accounts = [account1, account2, account3, account4];

let currentAccount;
let sorted = false;

// Elements
const labelWelcome = document.querySelector('.welcome');
const labelDate = document.querySelector('.date');
const labelBalance = document.querySelector('.balance__value');
const labelSumIn = document.querySelector('.summary__value--in');
const labelSumOut = document.querySelector('.summary__value--out');
const labelSumInterest = document.querySelector('.summary__value--interest');
const labelTimer = document.querySelector('.timer');

const containerApp = document.querySelector('.app');
const containerMovements = document.querySelector('.movements');

const btnLogin = document.querySelector('.login__btn');
const btnTransfer = document.querySelector('.form__btn--transfer');
const btnLoan = document.querySelector('.form__btn--loan');
const btnClose = document.querySelector('.form__btn--close');
const btnSort = document.querySelector('.btn--sort');

const inputLoginUsername = document.querySelector('.login__input--user');
const inputLoginPin = document.querySelector('.login__input--pin');
const inputTransferTo = document.querySelector('.form__input--to');
const inputTransferAmount = document.querySelector('.form__input--amount');
const inputLoanAmount = document.querySelector('.form__input--loan-amount');
const inputCloseUsername = document.querySelector('.form__input--user');
const inputClosePin = document.querySelector('.form__input--pin');

const calcDaysPassed = (date1, date2) => Math.round(Math.abs(date2 - date1) / (1000 * 60 * 60 * 24));

const formatCurrency = function (value, locale, currency) {
    return new Intl.NumberFormat(locale, { style: 'currency', currency }).format(value);
};

const formatMovementsDate = function (date, locale) {
    const daysPassed = calcDaysPassed(new Date(), date);

    if (daysPassed === 0) return 'Today';
    if (daysPassed === 1) return 'Yesterday';
    if (daysPassed <= 3) return `${daysPassed} days ago`;

    return new Intl.DateTimeFormat(locale).format(date);
};

const displayMovements = function (account, sort = false) {
    containerMovements.innerHTML = '';

    const sortedMovements = sort ? [...account.movements].sort((a, b) => a - b) : account.movements;

    sortedMovements.forEach((m, i) => {
        const type = m > 0 ? 'deposit' : 'withdrawal';

        const date = new Date(account.movementsDates[i]);
        const displayDate = formatMovementsDate(date, account.locale);

        const formattedMov = formatCurrency(m, account.locale, account.currency);

        const html = `
      <div class="movements__row">
        <div class="movements__type movements__type--${type}">${i + 1} ${type}</div>
        <div class="movements__date">${displayDate}</div>
        <div class="movements__value">${formattedMov}</div>
      </div>`;

        containerMovements.insertAdjacentHTML('afterbegin', html);
    });
};

const calcDisplayBalance = function (account) {
    account.balance = account.movements.reduce((acc, mov) => acc + mov, 0);
    labelBalance.textContent = `${formatCurrency(account.balance, account.locale, account.currency)}`;
};

const calcDisplaySummary = function (account) {
    const incomes = account.movements.filter(mov => mov > 0).reduce((acc, mov) => acc + mov, 0);
    labelSumIn.textContent = `${formatCurrency(incomes, account.locale, account.currency)}`;

    const outcomes = account.movements.filter(mov => mov < 0).reduce((acc, mov) => acc + mov, 0);
    labelSumOut.textContent = `${formatCurrency(Math.abs(outcomes), account.locale, account.currency)}`;

    const interest = account.movements
        .filter(mov => mov > 0)
        .map(deposit => (deposit * account.interestRate) / 100)
        .filter(int => int >= 1)
        .reduce((acc, int) => acc + int, 0);
    labelSumInterest.textContent = `${formatCurrency(interest, account.locale, account.currency)}`;
};

const createUsernames = function (accounts) {
    accounts.forEach(acc => {
        acc.username = acc.owner
            .toLowerCase()
            .split(' ')
            .map(word => word[0])
            .join('');
    });
};
createUsernames(accounts);

const updateUI = function (account) {
    displayMovements(account);

    calcDisplayBalance(account);

    calcDisplaySummary(account);
};

// Event handlers

const now = new Date();
labelDate.textContent = new Intl.DateTimeFormat(currentAccount.locale, {
    hour: 'numeric',
    minute: 'numeric',
    day: 'numeric',
    month: 'numeric',
    year: 'numeric',
}).format(now);

btnLogin.addEventListener('click', function (e) {
    e.preventDefault();

    currentAccount = accounts.find(ac => ac.username === inputLoginUsername.value.trim());

    if (currentAccount?.pin === +inputLoginPin.value.trim()) {
        // Display UI and welcome message
        labelWelcome.textContent = `Welcome back, ${currentAccount.owner.split(' ')[0]}`;
        containerApp.style.opacity = 100;

        // Clear input fields
        inputLoginUsername.value = inputLoginPin.value = '';
        inputLoginPin.blur();

        // Display all necessary information
        updateUI(currentAccount);
    }
});

btnTransfer.addEventListener('click', function (e) {
    e.preventDefault();

    const amount = +inputTransferAmount.value;
    const receiverAcc = accounts.find(acc => acc.username === inputTransferTo.value);

    // Clear inputs
    inputTransferTo.value = inputTransferAmount.value = '';

    // Do all the validation before transfer
    if (
        amount > 0 &&
        receiverAcc &&
        currentAccount.balance >= amount &&
        receiverAcc.username !== currentAccount.username
    ) {
        // do the transfer
        currentAccount.movements.push(-amount);
        receiverAcc.movements.push(amount);
        // Add transfer date
        currentAccount.movementsDates.push(new Date().toISOString());
        receiverAcc.movementsDates.push(new Date().toISOString());

        updateUI(currentAccount);
    }
});

btnLoan.addEventListener('click', function (e) {
    e.preventDefault();

    const amount = Math.floor(inputLoanAmount.value);

    // the loan is only granted if there is any deposit
    // that's greater or equal 10 % of the requested amount of loan
    if (amount > 0 && currentAccount.movements.some(mov => mov >= amount * 0.1)) {
        currentAccount.movements.push(amount);
        // Add loan date
        currentAccount.movementsDates.push(new Date().toISOString());

        updateUI(currentAccount);
    }

    inputLoanAmount.value = '';
});

btnClose.addEventListener('click', function (e) {
    e.preventDefault();

    if (currentAccount.username === inputCloseUsername.value && currentAccount.pin === +inputClosePin.value) {
        accounts.splice(
            accounts.findIndex(acc => acc.username === currentAccount.username),
            1
        );

        // Hide UI
        containerApp.style.opacity = 0;
        labelWelcome.textContent = 'Log in to get started';
    }
    inputCloseUsername.value = inputClosePin.value = '';
});

btnSort.addEventListener('click', function (e) {
    e.preventDefault();

    displayMovements(currentAccount, !sorted);
    sorted = !sorted;
});
