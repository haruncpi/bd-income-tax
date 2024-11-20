let app = angular.module("myApp", []);
function sumOf(data, key) {
    if (angular.isUndefined(data) || angular.isUndefined(key)) return 0;
    var sum = 0;
    angular.forEach(data, function (value) {
        sum = sum + Number(value[key]);
    });
    return sum;
}

app.controller("TaxCtrl", function ($scope) {
    $scope.genders = [
        { name: "Male", value: "male", taxFreeAmount: 350000 },
        { name: "Female", value: "female", taxFreeAmount: 400000 }
    ]

    $scope.locations = [
        { name: "Dhaka - Ctg", value: "dhk_ctg", amount: 5000 },
        { name: "Other City", value: "other_city", amount: 4000 },
        { name: "Village", value: "village", amount: 3000 }
    ]

    $scope.assessment_years = []

    let currentYear = new Date().getFullYear();

    $scope.assessment_years.push({
        name: `${currentYear - 1} - ${currentYear}`,
        value: `${currentYear - 1}_${currentYear}`
    })

    $scope.assessment_years.push({
        name: `${currentYear} - ${currentYear + 1}`,
        value: `${currentYear}_${currentYear + 1}`
    })

    $scope.person = {
        name: 'Jhone Doe',
        gender: 'male',
        location: 'dhk_ctg',
        assessment_year: `${currentYear}_${currentYear + 1}`,
        incomes: [],
        investments: []
    }

    if (localStorage.getItem('person')) {
        $scope.person = JSON.parse(localStorage.getItem('person'))
    }

    $scope.minTax = 5000
    $scope.taxFreeAmount = 350000 // for male

    $scope.slaps = [];
    $scope.generateSlaps = generateSlaps;
    $scope.calc = calc
    $scope.sumOf = sumOf;

    $scope.saveData = function () {
        localStorage.setItem('person', JSON.stringify($scope.person))
        alert('Data Saved!')
    }

    $scope.resetData = function () {
        $scope.person = {
            name: 'Jhone Doe',
            gender: 'male',
            location: 'dhk_ctg',
            incomes: [],
            investments: []
        }
    }

    $scope.loadSampleData = function () {
        $scope.person = {
            name: 'Jhone Doe',
            gender: 'male',
            location: 'dhk_ctg',
            incomes: [
                {
                    label: "July 23 - Jun 24",
                    exp: "70000 * 12",
                },
                {
                    label: "Bonus",
                    exp: "70000",
                },
                {
                    label: "Leave cash",
                    exp: "( 70000/30 ) * 10",
                }
            ],
            investments: [
                {
                    label: 'DPS',
                    amount: 60000
                }
            ]
        }
    }

    $scope.removeIncome = function (index) {
        $scope.person.incomes.splice(index, 1);
    }

    $scope.removeInvestment = function (index) {
        $scope.person.investments.splice(index, 1);
    }

    $scope.eval = function (exp) {
        return parseInt(eval(exp), 10);
    }

    $scope.toggleViewMode = function () {
        let el = document.querySelector('meta[name=viewport]')
        let appWrapperEl = document.querySelector('.app-wrapper')
        let content = el.getAttribute('content')

        if (content === 'width=device-width') {
            el.setAttribute('content', 'width=1024')
            appWrapperEl.style.width = "90%"
        } else {
            el.setAttribute('content', 'width=device-width')
            appWrapperEl.removeAttribute('style')
        }
    }

    $scope.print = function () {
        window.print()
    }

    $scope.person.incomes = $scope.person.incomes.map(function (obj) {
        try {
            obj.amount = parseInt(eval(obj.exp), 10);
        } catch (error) {
            obj.amount = 0
        }
        return obj;
    });

    $scope.calculateTaxFreeIncome = function (total) {
        let limit = 450000;
        let taxFree = total * (1 / 3);

        return taxFree < limit ? taxFree : limit;
    };

    function isValidExp(expression) {
        const regex = /(?:(?:^|[-+_*/])(?:\s*-?\d+(\.\d+)?(?:[eE][+-]?\d+)?\s*))+$/;
        return regex.test(expression);
    }

    function calc() {
        $scope.person.incomes.forEach(function (obj) {
            if (!isValidExp(obj.exp)) {
                return;
            }
        })

        switch ($scope.person.location) {
            case 'dhk_ctg':
                $scope.minTax = 5000
                break;
            case 'other_city':
                $scope.minTax = 4000
                break;
            case 'village':
                $scope.minTax = 3000
                break;
        }

        $scope.maxTaxRebate = 1000000;
        $scope.totalInvestment = sumOf($scope.person.investments, 'amount');
        $scope.totalIncome = sumOf($scope.person.incomes, "amount");
        $scope.taxFreeIncome = $scope.calculateTaxFreeIncome($scope.totalIncome);

        $scope.taxableIncome = $scope.totalIncome - $scope.taxFreeIncome;
        $scope.taxable_3_percent = $scope.taxableIncome * (3 / 100);

        $scope.investment_15_percent =  $scope.totalInvestment * (15 / 100);

        $scope.max_investment = ($scope.taxable_3_percent / .15);


        generateSlaps($scope.taxableIncome)

        $scope.totalTax = sumOf($scope.slaps, 'tax')
        $scope.finalRebate = Math.min($scope.investment_15_percent, $scope.taxable_3_percent, $scope.maxTaxRebate);
        $scope.finalTax = $scope.totalTax - $scope.finalRebate


        $scope.person.incomes = $scope.person.incomes.map(function (obj) {
            try {
                obj.amount = parseInt(eval(obj.exp), 10);
            } catch (error) {
                obj.amount = 0
            }
            return obj;
        });

        if ($scope.totalTax < $scope.minTax) {
            $scope.totalTax = $scope.minTax
            $scope.finalTax = $scope.minTax
            $scope.finalRebate = 0
            $scope.max_investment = 0
        }

        // Zero tax calculation.
        if ($scope.person.gender === 'female') {
            $scope.taxFreeAmount = 400000
        }

        if ($scope.taxableIncome <= $scope.taxFreeAmount) {
            $scope.totalTax = 0;
            $scope.finalTax = 0
        }
    }

    $scope.calc()
    generateSlaps($scope.taxableIncome)


    $scope.$watch('person', function (newValue, oldValue, scope) {
        $scope.calc()
    }, true);

    $scope.addIncome = function () {
        $scope.person.incomes.push({
            label: 'Title',
            exp: 0
        })

        setTimeout(() => {
            $('.income-table input.label:last').focus().select()
        })
    }

    $scope.addInvestment = function () {
        $scope.person.investments.push({
            label: 'Title',
            amount: 0
        })

        setTimeout(() => {
            $('.invest-table input.label:last').focus().select()
        })
    }


    function generateSlaps(taxableIncome) {
        $scope.slaps = [];

        let tmp = taxableIncome;
        let amount = 350000;
        if ($scope.person.gender === 'female') {
            amount = 400000;
        }

        let obj = {
            label: "First " + amount,
            amount: tmp < amount ? tmp : amount,
            percent: 0,
        };

        $scope.slaps.push(obj);
        tmp = tmp - obj.amount;

        amount = 100000;
        obj = {
            label: "Next 1 lac",
            amount: tmp < amount ? tmp : amount,
            percent: 5,
        };
        $scope.slaps.push(obj);
        tmp = tmp - obj.amount;

        amount = 400000;
        obj = {
            label: "Next 4 lac",
            amount: tmp < amount ? tmp : amount,
            percent: 10,
        };
        $scope.slaps.push(obj);
        tmp = tmp - obj.amount;

        amount = 500000;
        obj = {
            label: "Next 5 lac",
            amount: tmp < amount ? tmp : amount,
            percent: 15,
        };
        $scope.slaps.push(obj);
        tmp = tmp - obj.amount;

        amount = 500000;
        obj = {
            label: "Next 5 lac",
            amount: tmp < amount ? tmp : amount,
            percent: 20,
        };
        $scope.slaps.push(obj);
        tmp = tmp - obj.amount;

        obj = {
            label: "Remaining",
            amount: tmp,
            percent: 25,
        };
        $scope.slaps.push(obj);
        tmp = tmp - obj.amount;

        $scope.slaps = $scope.slaps.map(function (obj) {
            obj.tax = obj.amount * (obj.percent / 100);
            return obj;
        });
    };

});