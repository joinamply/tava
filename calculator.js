/* ====================
Settings Values
==================== */
// Basic
let proposedFee_value = $('[proposed-fees]').attr('proposed-fees');
let sessionFee_value = parseFloat($('[session-fee]').attr('session-fee'));
let pepmFee_value = parseFloat($('[pepm-fee]').attr('pepm-fee'));
let sessionCap_value = parseFloat($('[session-cap]').attr('session-cap'));
let turnoverRate_value = parseFloat($('[selected-turnover-rate]').attr('selected-turnover-rate'));
let averageSalary_value = parseFloat($('[average-salary]').attr('average-salary'));
// Medical & Rx
let mentalHealthChallenge_value = parseFloat($('[mental-health-challenge]').attr('mental-health-challenge'));
let savingsPerPerson_value = parseFloat($('[saving-per-person]').attr('saving-per-person'));
// Job Turnover
let tavaReduction_value = parseFloat($('[tava-reduction]').attr('tava-reduction'));
let replacementCostPercentage_value = parseFloat($('[replacement-cost-percentage]').attr('replacement-cost-percentage'));
// Productivity
let workingDaysLost_value = parseFloat($('[working-days-lost]').attr('working-days-lost'));
let fewerDaysLost_value = parseFloat($('[fewer-days-lost]').attr('fewer-days-lost'));
let workDays_value = parseFloat($('[work-days]').attr('work-days'));
// Tava Fees
let proposedFees_value = parseFloat($('[proposed-fees]').attr('proposed-fees'));

/* ====================
Values
==================== */
// Basic
let employees_value;
let industryMultiplier_value;
let dependentsMultiplier_value;
let sessionCapMultiplier_value = parseFloat($(`[session-${sessionCap_value}]`).attr('session-' + sessionCap_value));
let sessionFactor_value;
let employeesUtilizing_value;
let annualSavings_value;
let tavaRoi_value;
// Medical & Rx
let employeesWillUse_value;
let totalEmployeesSavings_value;
let totalMedicalRxSavings_value;
// Job Turnover
let replacementCostPrice_value;
let employeesUseTava_value;
let employeesRetained_value;
let totalTurnoverSavings_value;
// Productivity
let daysSaved_value;
let workDaysPercentage_value;
let savingsPerEmployee_value;
let totalProductivitySavings_value;

/* ====================
Public Inputs
==================== */
let employees_input = $('#employees');
let industry_select = $('#industry');
let dependents_select = $('#dependents');

/* ====================
Functions
==================== */
function formatCurrency(num) {
    return new Intl.NumberFormat('en-US', {
        style: 'currency',
        currency: 'USD',
        maximumFractionDigits: 0,
    }).format(num);
}

function formatPercentage(num) {
    return Math.floor(num) + "%";
}

function formatNumber(num, round = true) {
    let _num = parseFloat(num);
    if (round) {
        _num = Math.round(_num);
    }
    return _num.toLocaleString("en-US");
}

function saveInputValue(input) {
    switch (input.attr("id")) {
        case "employees":
            employees_value = parseFloat(input.val());
            break;
        case "industry":
            industryMultiplier_value = parseFloat($(`[${input.val()}]`).attr(`${input.val()}`));
            break;
        case "dependents":
            dependentsMultiplier_value = parseFloat($(`[${input.val()}]`).attr(`${input.val()}`));
            break;
    }
}

function getInputValue(input) {
    switch (input.attr("id")) {
        case "employees":
            return employees_value
            break;
    }
}

/* ====================
Event Listeners
==================== */
let isInitialized = false;
$("select").on("change", function () {
    saveInputValue($(this));
    if (!isInitialized) { return; }
    calculate();
});

/* Grabs the internal value and set as the input val */
$("input").on("focus", function () {
    $(this).val(getInputValue($(this)));
});

/* Controls the allowed keys for each kind of input */
$("input").on("keydown", function (event) {
    /* Check if the pressed key is Enter (key code 13) */
    if (event.keyCode === 13) {
        /* Blur the input field when Enter is pressed */
        $(this).blur();
        return;
    }
});

/* On blur gets the internal value and format it to display as the input value */
$("input").on("blur", function (event) {
    switch ($(this).attr("format")) {
        case "percentage" || "currency" || "number":
            /* Get the pasted text */
            let _pastedText = event.originalEvent.clipboardData.getData('text');
            /* Remove non-numeric characters */
            var _cleanedText = _pastedText.replace(/[^0-9]/g, '');
            /* Update the input value with the cleaned text */
            $(this).val(_cleanedText);
            /* Prevent the default paste behavior */
            event.preventDefault();
            break;
    }
    /* First check if the input has a value val and if not reset to default */
    if ($(this).val() == "") { $(this).val($(this).attr("default-value")); }
    /* Save the val */
    saveInputValue($(this));
    /* Format and update the input val */
    switch ($(this).attr("format")) {
        case "percentage":
            $(this).val(formatPercentage($(this).val()));
            break;
        case "currency":
            $(this).val(formatCurrency($(this).val()));
            break;
        case "number":
            $(this).val(formatNumber($(this).val()));
            break;
    }
    if (!isInitialized) { return; }
    calculate();
});

/* ====================
Chart.js
==================== */
import Chart from 'chart.js/auto';
import ChartDataLabels from 'chartjs-plugin-datalabels';

let chartData = new Array(4);
let chartDataLabels = new Array(4);
let chart;

Chart.register(ChartDataLabels);

function createChart() {
    chart = new Chart("chart", { 
        data: {
            datasets: [{
                type: "bar",
                label: "Annual Estimate",
                data: chartData,
                borderColor: '#c6efed',
                backgroundColor: '#c6efed',
                yAxisID: "y",
            }],
            labels: ["Medical & Rx", "Job Turnover", "Productivity", "Annual Savings"],
        },
        options: {
            responsive: true,
            scales: {
                y: {
                    type: "linear",
                    display: true,
                    position: "left"
                }
            },
            plugins: {
                tooltip: {
                    enabled: false
                },
                datalabels: {
                    align: 'center',
                    anchor: 'center',
                    color: '#000',
                    formatter: function (value, context) {
                        return formatCurrency(chartDataLabels[context.dataIndex]);
                    }
                }
            }
        }
    });
}

function updateChartData() {
    chartData[0] = [0, totalMedicalRxSavings_value];
    chartData[1] = [totalMedicalRxSavings_value, totalMedicalRxSavings_value + totalTurnoverSavings_value];
    chartData[2] = [chartData[1][1], chartData[1][1] + totalProductivitySavings_value];
    chartData[3] = annualSavings_value;

    chartDataLabels[0] = totalMedicalRxSavings_value;
    chartDataLabels[1] = totalTurnoverSavings_value;
    chartDataLabels[2] = totalProductivitySavings_value;
    chartDataLabels[3] = annualSavings_value;

    chart.update();
}

/* ====================
Star Calculation
==================== */
function init() {
    // prevent the form to be submitted
    $("#roi-calculator").on("submit", function (event) {
        return false;
    });
    // First check for all input that has default values and set those as values
    $("input").each(function () {
        if ($(this).attr("default-value") != undefined) {
            $(this).val($(this).attr("default-value"));
        }
        // Now do a blur to format the value
        $(this).blur();
    });
    // Save the values for select fields
    $('select').each(function () {
        $(this).trigger('change');
    });
    calculate();
    isInitialized = true;
}

function calculateBasic() {
    sessionFactor_value = industryMultiplier_value + dependentsMultiplier_value + sessionCapMultiplier_value;
    employeesUtilizing_value = industryMultiplier_value / 5;
}

function calculateMedicalRx() {
    employeesWillUse_value = employees_value * employeesUtilizing_value;
    totalEmployeesSavings_value = employeesWillUse_value * mentalHealthChallenge_value;
    totalMedicalRxSavings_value = totalEmployeesSavings_value * savingsPerPerson_value;
}

function calculateJobTurnover() {
    replacementCostPrice_value = averageSalary_value * replacementCostPercentage_value;
    employeesUseTava_value = employees_value * employeesUtilizing_value;
    employeesRetained_value = employeesUseTava_value * turnoverRate_value * tavaReduction_value;
    totalTurnoverSavings_value = employeesRetained_value * averageSalary_value * replacementCostPercentage_value;
}

function calculateProductivity() {
    daysSaved_value = workingDaysLost_value * fewerDaysLost_value;
    workDaysPercentage_value = daysSaved_value / workDays_value;
    savingsPerEmployee_value = averageSalary_value * workDaysPercentage_value;
    totalProductivitySavings_value = savingsPerEmployee_value * employeesUseTava_value;
}

function calculateFinalResults() {
    annualSavings_value = totalMedicalRxSavings_value + totalTurnoverSavings_value + totalProductivitySavings_value - proposedFees_value;
    tavaRoi_value = annualSavings_value / proposedFees_value;
}

function displayResults() {
    $('#result-assumed-utilization').text(formatPercentage(employeesUtilizing_value * 100));
    $('#result-medical-rx').text(formatCurrency(totalMedicalRxSavings_value));
    $('#result-job-turnover').text(formatCurrency(totalTurnoverSavings_value));
    $('#result-productivity').text(formatCurrency(totalProductivitySavings_value));
    $('#result-annual-savings').text(formatCurrency(annualSavings_value));
    $('#result-roi-tava').text(formatNumber(tavaRoi_value));
}

function calculate() {
    calculateBasic();
    calculateMedicalRx();
    calculateJobTurnover();
    calculateProductivity();
    calculateFinalResults();
    displayResults();
    if (!isInitialized) return;
    updateChartData();
}

init();
createChart();
updateChartData();