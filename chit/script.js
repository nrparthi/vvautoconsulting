document.addEventListener('DOMContentLoaded', () => {

    // Inputs
    const totalChitInput = document.getElementById('totalChit');
    const totalMembersInput = document.getElementById('totalMembers');
    const currentMonthInput = document.getElementById('currentMonth');
    const auctionFrequencyInput = document.getElementById('auctionFrequency');
    const auctionAmountInput = document.getElementById('auctionAmount');

    // Config
    const commissionTypeSelect = document.getElementById('commissionType');
    const commissionPercentGroup = document.getElementById('commissionPercentGroup');
    const commissionPercentInput = document.getElementById('commissionPercent');
    const dividendTypeSelect = document.getElementById('dividendType');

    // UI
    const errorMessage = document.getElementById('errorMessage');
    const calculateBtn = document.getElementById('calculateBtn');
    const resultCard = document.getElementById('resultCard');
    const inputSection = document.getElementById('inputSection');
    const mainHeader = document.getElementById('mainHeader');
    const inputSummaryBar = document.getElementById('inputSummaryBar');
    const editBtn = document.getElementById('editBtn');

    // Summary Spans
    const sumChit = document.getElementById('sumChit');
    const sumInst = document.getElementById('sumInst');
    const sumAuction = document.getElementById('sumAuction');

    // Toggle commission input
    const toggleCommissionInput = () => {
        if (commissionTypeSelect.value === 'percentage') {
            commissionPercentGroup.classList.remove('hidden');
        } else {
            commissionPercentGroup.classList.add('hidden');
        }
    };

    commissionTypeSelect.addEventListener('change', toggleCommissionInput);
    toggleCommissionInput();

    // Format INR
    const formatINR = (amount) => {
        return new Intl.NumberFormat('en-IN', {
            style: 'currency',
            currency: 'INR',
            maximumFractionDigits: 0
        }).format(amount);
    };

    // Main calculation
    calculateBtn.addEventListener('click', () => {

        errorMessage.textContent = '';

        const totalChit = parseFloat(totalChitInput.value);
        const totalMonths = parseInt(totalMembersInput.value);
        const currentMonth = parseInt(currentMonthInput.value);
        const auctionFrequency = parseInt(auctionFrequencyInput.value);
        const auctionAmount = parseFloat(auctionAmountInput.value);

        const commissionType = commissionTypeSelect.value;
        const commissionPercent = parseFloat(commissionPercentInput.value);
        const dividendType = dividendTypeSelect.value;

        // -------- VALIDATION --------

        if (isNaN(auctionFrequency) || auctionFrequency <= 0) {
            errorMessage.textContent = 'Enter valid Auction Frequency';
            return;
        }

        if (isNaN(totalChit) || totalChit <= 0) {
            errorMessage.textContent = 'Enter valid Total Chit Amount';
            return;
        }

        if (isNaN(totalMonths) || totalMonths <= 0) {
            errorMessage.textContent = 'Enter valid Total Months';
            return;
        }

        if (isNaN(currentMonth) || currentMonth <= 0 || currentMonth > totalMonths) {
            errorMessage.textContent = 'Current Month must be between 1 and Total Months';
            return;
        }

        if (isNaN(auctionAmount) || auctionAmount < 0 || auctionAmount >= totalChit) {
            errorMessage.textContent = 'Auction must be less than Total Chit';
            return;
        }

        if (commissionType === 'percentage' &&
            (isNaN(commissionPercent) || commissionPercent < 0 || commissionPercent > 10)) {
            errorMessage.textContent = 'Commission % must be between 0–10';
            return;
        }

        // -------- CALCULATION --------

        // Monthly amount
        const monthly = totalChit / totalMonths;

        // Commission
        let commission = 0;
        if (commissionType === 'percentage') {
            commission = (commissionPercent / 100) * totalChit;
        }

        // Dividend Pool (safe)
        const dividendPool = Math.max(0, auctionAmount - commission);

        // Eligible members
        let eligible = 0;

        if (dividendType === 'all') {
            eligible = totalMonths;
        } else if (dividendType === 'non_winners') {
            // EXCLUDE ONLY PREVIOUS WINNERS
            eligible = totalMonths - (currentMonth - 1);
        } else if (dividendType === 'strict') {
            // EXCLUDE CURRENT AND PREVIOUS WINNERS
            eligible = totalMonths - currentMonth;
        }

        if (eligible <= 0) eligible = 0;

        // Dividend
        let dividend = 0;
        if (eligible > 0) {
            dividend = dividendPool / eligible;
        }

        // Payable
        const payable = monthly - dividend;

        // Net received
        const netReceived = totalChit - auctionAmount;

        // -------- METRICS --------

        const discount = (auctionAmount / totalChit) * 100;

        const effectiveCost = netReceived > 0
            ? (auctionAmount / netReceived) * 100
            : 0;

        const monthlyYield = netReceived > 0
            ? (dividend / netReceived) * 100
            : 0;

        const monthlySavings = monthly - payable;

        // -------- STRATEGY --------

        function calculateStrategy({
            chitValue,
            members,
            commissionAmount,
            auctionAmount,
            currentMonth,
            frequency
        }) {
            const monthlyPayment = chitValue / members;

            // Winner (Loan)
            const received = chitValue - auctionAmount - commissionAmount;
            const totalPaid = monthlyPayment * members;
            const interestPaid = totalPaid - received;
            const flatInterestRate = (interestPaid / received) * 100;

            // Non-Winner (Investment)
            const profit = auctionAmount - commissionAmount;
            const flatReturnRate = (profit / totalPaid) * 100;

            // Frequency Math (Annualization)
            const durationInYears = (members * frequency) / 12;
            const yearlyInterestRate = flatInterestRate / durationInYears;
            const yearlyReturnRate = flatReturnRate / durationInYears;

            return {
                received,
                interestPaid,
                interestRate: flatInterestRate,
                yearlyInterestRate,
                profit,
                returnRate: flatReturnRate,
                yearlyReturnRate
            };
        }

        const strategy = calculateStrategy({
            chitValue: totalChit,
            members: totalMonths,
            commissionAmount: commission,
            auctionAmount: auctionAmount,
            currentMonth: currentMonth,
            frequency: auctionFrequency
        });

        // -------- RENDER --------

        document.getElementById('resNetReceived').textContent = formatINR(netReceived);
        document.getElementById('resDiscount').textContent = discount.toFixed(2) + '%';
        document.getElementById('resEffectiveCost').textContent = effectiveCost.toFixed(2) + '%';
        document.getElementById('resMonthlyYield').textContent = monthlyYield.toFixed(2) + '%';

        document.getElementById('resMonthlyAmount').textContent = formatINR(monthly);
        document.getElementById('resPayable').textContent = formatINR(payable);
        document.getElementById('resSavings').textContent = formatINR(monthlySavings);

        document.getElementById('resAuctionAmount').textContent = formatINR(auctionAmount);
        document.getElementById('resCommission').textContent = formatINR(commission);
        document.getElementById('resDividendPool').textContent = formatINR(dividendPool);
        document.getElementById('resEligibleMembers').textContent = eligible.toString();
        document.getElementById('resDividendPerMember').textContent = formatINR(dividend);

        document.getElementById('resStatusMonth').textContent = currentMonth.toString();

        const membersTaken = currentMonth - 1;
        document.getElementById('resStatusTaken').textContent = membersTaken.toString();
        
        const remainingInstallments = totalMonths - membersTaken;
        document.getElementById('resStatusRemaining').textContent = remainingInstallments.toString();

        const remainingMonths = remainingInstallments * auctionFrequency;
        const yearsLeft = Math.floor(remainingMonths / 12);
        const monthsLeft = remainingMonths % 12;
        let timeLeftStr = '';
        if (yearsLeft > 0) timeLeftStr += `${yearsLeft} yr `;
        if (monthsLeft > 0 || yearsLeft === 0) timeLeftStr += `${monthsLeft} mo`;
        document.getElementById('resTimeRemaining').textContent = timeLeftStr.trim();

        // Render Strategy Block
        document.getElementById("winnerReceived").innerText = formatINR(strategy.received);
        document.getElementById("winnerInterest").innerText = formatINR(strategy.interestPaid);
        document.getElementById("winnerRate").innerText = strategy.interestRate.toFixed(2) + "%";
        document.getElementById("winnerRateYearly").innerText = "~" + strategy.yearlyInterestRate.toFixed(1) + "%";

        document.getElementById("nonWinnerRawDiscount").innerText = formatINR(auctionAmount);
        document.getElementById("nonWinnerProfit").innerText = formatINR(strategy.profit);
        document.getElementById("nonWinnerRate").innerText = strategy.returnRate.toFixed(2) + "%";
        document.getElementById("nonWinnerRateYearly").innerText = "~" + strategy.yearlyReturnRate.toFixed(1) + "%";

        // Update Summary Bar
        sumChit.innerText = formatINR(totalChit);
        sumInst.innerText = `${totalMonths} Inst`;
        sumAuction.innerText = formatINR(auctionAmount);

        // Toggle View
        inputSection.classList.add('hidden');
        mainHeader.classList.add('hidden');
        inputSummaryBar.classList.remove('hidden');
        resultCard.style.display = 'block';

        window.scrollTo(0, 0);
    });

    editBtn.addEventListener('click', () => {
        inputSection.classList.remove('hidden');
        mainHeader.classList.remove('hidden');
        inputSummaryBar.classList.add('hidden');
        resultCard.style.display = 'none';
    });

});