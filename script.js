'use strict';

/////////////////////////////////////////////////
/////////////////////////////////////////////////
// Online banking app

// Data
const account1 = {
    owner: 'Thomas Müller',
    movements: [200, 455.23, -306.5, 25000, -642.21, -133.9, 79.97, 1300],
    interestRate: 1.2, // %
    pin: 1111,

    movementsDates: [
        '2023-11-18T21:31:17.178Z',
        '2023-12-23T07:42:02.383Z',
        '2024-01-28T09:15:04.904Z',
        '2024-04-29T13:17:24.185Z',
        '2024-05-20T14:11:59.604Z',
        '2024-05-21T17:01:17.194Z',
        '2024-05-22T23:36:17.929Z',
        '2024-05-23T10:51:36.790Z',
    ],
    currency: 'EUR',
    locale: 'de-DE',
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
    movementsDates: [
        "2023-10-23T08:42:11.513Z",
        "2023-11-23T09:52:12.907Z",
        "2023-12-23T10:22:13.235Z",
        "2024-01-23T11:12:14.513Z",
        "2024-02-23T12:13:15.513Z",
        "2024-03-23T13:34:16.374Z",
        "2024-04-23T14:19:17.513Z",
        "2024-05-23T15:36:18.513Z",
    ],
    currency: 'GBP',
    locale: 'en-GB'
};

const account4 = {
    owner: 'Sergey Naumov',
    movements: [430, 1000, 700, 50, 90],
    interestRate: 2.5,
    pin: 4444,
    movementsDates: [
        "2024-05-15T08:46:23.385Z", 
        "2024-05-20T10:00:03.385Z", 
        "2024-05-20T18:46:53.385Z", 
        "2024-05-22T19:17:17.385Z", 
        "2024-05-22T22:30:00.385Z", 
    ],
    currency: 'RUB',
    locale: 'ru-RU',
};

const accounts = [account1, account2, account3, account4];

let currentAccount, timer, popupTimeoutId, loader;
let sorted = 'default';
const POPUP_TIMEOUT_CLOSE = 300;
const POPUP_TIMEOUT_AUTO_HIDE = 5000;

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
const containerPopup = document.querySelector('.popup_notification');
let popupWrapper;

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

const topBarLoader = document.getElementById('topBar');

const activateLoader = function (show) {
    if (show) {
        topBarLoader.classList.remove('hidden');
        const div = document.createElement('div');
        div.classList.add('topBar__loader');
        loader = topBarLoader.appendChild(div);
    } else {
        setTimeout(() => {
            topBarLoader.classList.add('hidden');
            loader.remove();
        }, 1500);
    }
}

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

const displayMovements = function (account, sort = 'default') {
    containerMovements.innerHTML = '';

    // const sortedMovements = sort ? [...account.movements].sort((a, b) => a - b) : account.movements;
    const sortedMovements = sort === 'default' ? account.movements : [...account.movements].sort((a, b) => sort === 'desc' ? a - b : b - a);

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

const logOutUser = function () {
    currentAccount = '';
    containerMovements.innerHTML = '';
    labelWelcome.textContent = 'Log in to get started';
    containerApp.style.opacity = 0;
    labelDate.textContent = '24/01/2037';
    labelBalance.textContent = labelSumIn.textContent = labelSumOut.textContent = labelSumInterest.textContent = '0000€';
    inputTransferTo.value =
        inputTransferAmount.value =
        inputTransferAmount.value =
        inputLoanAmount.value =
        inputCloseUsername.value =
        inputClosePin.value =
        '';
};

const startLogoutTimer = function () {
    const ticker = function () {
        // In each call, print the remaining time to UI
        const min = String(Math.trunc(time / 60)).padStart(2, 0);
        const sec = String(time % 60).padStart(2, 0);

        labelTimer.textContent = `${min}:${sec}`;

        // When 0 seconds, stop timer and log out user
        if (time === 0) {
            clearInterval(timer);
            logOutUser();
        }

        time--;
    };

    // Set time to 5 minutes
    let time = 300;
    // Call the timer every second
    ticker();
    const timer = setInterval(ticker, 1000);

    return timer;
};

const showPopup = async function (message, type = 'success') {
    if (popupWrapper) {
        await closePopup();
    }

    clearTimeout(popupTimeoutId);

    let messageTypeClass;
    switch (type) {
        case 'success':
            messageTypeClass = 'popup__message--info';
            break;
        case 'error':
            messageTypeClass = 'popup__message--error';
            break;
        default:
            break;
    }
    const popup = `
    <div class="popup__message__wrapper">
      <aside class="popup__message ${messageTypeClass}">
          <div class="popup__message__body">
            <p>${message}</p>
            <svg width="16" height="16" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg"
            class="popup__icon__close">
                <path d="M12 4L4 12M4 4L12 12" stroke="#777" stroke-width="1.33333" stroke-linecap="round"
                stroke-linejoin="round"></path>
            </svg>
        </div>
      </aside>
    </div>  `;
    containerPopup.insertAdjacentHTML('afterbegin', popup);
    popupWrapper = containerPopup.querySelectorAll('.popup__message__wrapper');

    // listen for close popup icon click
    popupWrapper.forEach((el) => {
        const btnPopupClose = containerPopup.querySelector('.popup__icon__close');
        btnPopupClose.addEventListener('click', closePopup);
    });

    popupTimeoutId = setTimeout(closePopup, POPUP_TIMEOUT_AUTO_HIDE);
}

const closePopup = async function() {
    if (!popupWrapper) return;

    popupWrapper.forEach((el) => {
        el.classList.add('popup__message__wrapper--close');
    });
    await new Promise(res => setTimeout(() => res(), POPUP_TIMEOUT_CLOSE));
    containerPopup.innerHTML = '';
    popupWrapper = null;
}

// Event handlers
btnLogin.addEventListener('click', function (e) {
    e.preventDefault();
    activateLoader(true);

    currentAccount = accounts.find(ac => ac.username === inputLoginUsername.value.trim());

    if (currentAccount?.pin === +inputLoginPin.value.trim()) {
        // Display UI and welcome message
        labelWelcome.textContent = `Welcome back, ${currentAccount.owner.split(' ')[0]}`;
        containerApp.style.opacity = 100;

        // Setup current date and time
        const now = new Date();
        labelDate.textContent = new Intl.DateTimeFormat(currentAccount.locale, {
            hour: 'numeric',
            minute: 'numeric',
            day: 'numeric',
            month: 'numeric',
            year: 'numeric',
        }).format(now);

        // Clear input fields
        inputLoginUsername.value = inputLoginPin.value = '';
        inputLoginPin.blur();

        // Timer
        timer && clearInterval(timer);
        timer = startLogoutTimer();

        // Display all necessary information
        updateUI(currentAccount);
    } else {
        showPopup('Incorrect user or pin', 'error');
    }

    activateLoader(false);
});

btnTransfer.addEventListener('click', function (e) {
    e.preventDefault();
    activateLoader(true);

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
        setTimeout(() => {
            // do the transfer
            currentAccount.movements.push(-amount);
            receiverAcc.movements.push(amount);
            // Add transfer date
            currentAccount.movementsDates.push(new Date().toISOString());
            receiverAcc.movementsDates.push(new Date().toISOString());

            updateUI(currentAccount);

            showPopup(`Money was successfully transferred to ${receiverAcc.owner}`);

            // Reset timer
            clearInterval(timer);
            timer = startLogoutTimer();
        }, 1500);
    } else {
        showPopup('Not sufficient funds or wrong username', 'error');
    }

    activateLoader(false);
});

btnLoan.addEventListener('click', function (e) {
    e.preventDefault();
    activateLoader(true);

    const amount = Math.floor(inputLoanAmount.value);

    // the loan is only granted if there is any deposit
    // that's greater or equal 10 % of the requested amount of loan
    if (amount > 0 && currentAccount.movements.some(mov => mov >= amount * 0.1)) {
        setTimeout(() => {
            currentAccount.movements.push(amount);
            // Add loan date
            currentAccount.movementsDates.push(new Date().toISOString());

            updateUI(currentAccount);

            showPopup('Requested successfully');

            // Reset timer
            clearInterval(timer);
            timer = startLogoutTimer();
        }, 1500);
    } else {
        showPopup('Cannot request loan', 'error');
    }

    inputLoanAmount.value = '';
    activateLoader(false);
});

btnClose.addEventListener('click', function (e) {
    e.preventDefault();
    activateLoader(true);

    if (currentAccount.username === inputCloseUsername.value && currentAccount.pin === +inputClosePin.value) {
        setTimeout(() => {
            if (window.confirm('Please confirm that you want to close your account')) {
                accounts.splice(
                    accounts.findIndex(acc => acc.username === currentAccount.username),
                    1
                );
        
                // Hide UI
                clearInterval(timer);
                logOutUser();
            }
        }, 1000);
    } else {
        showPopup('Wrong name or pin', 'error');
    }
    inputCloseUsername.value = inputClosePin.value = '';
    activateLoader(false);
});

btnSort.addEventListener('click', function (e) {
    e.preventDefault();
    
    switch (sorted) {
        case 'desc':
            btnSort.children[1].classList.remove('fa-arrow-down');
            btnSort.children[1].classList.add('fa-arrow-up');
            sorted = 'asc';
            break;
        case 'asc':
            btnSort.children[1].classList.remove('fa-arrow-up');
            btnSort.children[1].classList.add('fa-sort');
            sorted = 'default';
            break;
        case 'default':
            btnSort.children[1].classList.remove('fa-sort');
            btnSort.children[1].classList.add('fa-arrow-down');
            sorted = 'desc';
            break;
        default:
            throw new Error('There is an error in the movements sorting');
    }
    displayMovements(currentAccount, sorted);
});