// App State
let projectDatabase = {};     
let currentProjectId = "";     
let isContractOpen = true;     

// Static project Configuration (baseline data)
const PROJECTS_CONFIG = {
    "proj-101": { name: "Enterprise Mobile App", contractRevenue: 30000 },
    "proj-102": { name: "SaaS Dashboard Replatform", contractRevenue: 15000 }
};

// App Initialization
async function bootstrapApplication() {
    const selector = document.getElementById("project-selector");
    const container = document.getElementById("ledger-rows-container");
    if (!selector || !container) return;

    
    container.innerHTML = `
        <tr>
            <td colspan="6" class="table-empty-message">
                <span style="display: inline-block; animation: spin 1s linear infinite; margin-right: 0.5rem;">⏳</span>
                Establishing connection and rehydrating secure ledger arrays...
            </td>
        </tr>
    `;

    try {
        // Asynchronous Execution
        const response = await fetch("https://jsonplaceholder.typicode.com/users");
        if (!response.ok) throw new Error(`Network handshake aborted. Status code: ${response.status}`);
        
        const backupMockUsers = await response.json();

        // Initialize project database entries
        Object.keys(PROJECTS_CONFIG).forEach((id, index) => {
            projectDatabase[id] = {
                id: id,
                name: PROJECTS_CONFIG[id].name,
                revenue: PROJECTS_CONFIG[id].contractRevenue,
                ledgerRecords: [
                    {
                        id: 5001 + index,
                        description: `Initial Infrastructure Setup by ${backupMockUsers[index]?.name || "Senior Consultant"}`,
                        hourlyCost: 75,
                        hoursSpent: 12,
                        scopeAlignment: "in-scope",
                        totalComputedCost: 900,
                        hasLeakage: false
                    }
                ]
            };
        });
    

        currentProjectId = selector.value;

        setupInteractionListeners();

        executeMarginCalculations();
    
    } catch (networkException) {
        console.error("Critical Runtime System Abort:", networkException.message);
        container.innerHTML = `
            <tr>
                <td colspan="6" class="table-empty-message text-danger" style="background-color: rgba(239, 68, 68, 0.05)">
                    ⚠️ <strong>Data Sync Failure:</strong> ${networkException.message}. Please reload interface page.
                </td>
            </tr>
        `;
    }
}

// Event Listeners
function setupInteractionListeners() {
    const selector = document.getElementById("project-selector");
    const form = document.getElementById("resource-log-form");
    const filter = document.getElementById("ledger-filter");

    selector.addEventListener("change", (e) => {
        currentProjectId = e.target.value;
        if (filter) filter.value = "all";
        executeMarginCalculations();
    });

    if (filter) {
        filter.addEventListener("change", () => {
            renderLedgerTable();
        });
    }

    if (form) {
        form.removeEventListener("submit", processNewHoursSubmission);
        form.addEventListener("submit", processNewHoursSubmission);
    }
}

 // Form submission
function processNewHoursSubmission(event) {
    event.preventDefault();

    if (!isContractOpen) {
        alert("Transaction Aborted: This contract environment is locked. Profit parameters depleted.");
        return;
    }

    const rateField = document.getElementById("employee-rate");
    const hoursField = document.getElementById("hours-worked");
    const descField = document.getElementById("task-description");
    const scopeField = document.querySelector('input[name="scope-alignment"]:checked');

    if (!rateField || !hoursField || !descField || !scopeField) return;

    const hourlyCost = parseFloat(rateField.value);
    const hoursSpent = parseFloat(hoursField.value);
    const description = descField.value.trim();
    const scopeAlignment = scopeField.value;

    if (isNaN(hourlyCost) || hourlyCost <= 0 || isNaN(hoursSpent) || hoursSpent <= 0 || description === "") {
        alert("Input error discovered. Operational hours and cost metrics must be positive numbers.");
        return;
    }

    const baselineMaxHourAllocation = 15;
    const hasLeakage = hoursSpent > baselineMaxHourAllocation;

    const newRecord = {
        id: Date.now(),
        description: description,
        hourlyCost: hourlyCost,
        hoursSpent: hoursSpent,
        scopeAlignment: scopeAlignment,
        totalComputedCost: hourlyCost * hoursSpent,
        hasLeakage: hasLeakage
    };

    addLedgerRecord(currentProjectId, newRecord);
    recalculateProject(currentProjectId);

    document.getElementById("resource-log-form").reset();
} 
// State updates & Metrics  
function addLedgerRecord(projectId, record) {
    if (!projectDatabase[projectId]) return; 
    
    projectDatabase[projectId].ledgerRecords.push(record);
}

function recalculateProject(projectId) {
    currentProjectId = projectId;
    executeMarginCalculations();
}

function executeMarginCalculations() {
    const project = projectDatabase[currentProjectId];
    if (!project) return;


    let totalOperationalCost = 0;
    let totalInScopeCost = 0;
    let totalOutofScopeCost = 0;
    let totalHoursLogged = 0;

    // Accumulator Loop: Scan records to generate mathematical totals
    project.ledgerRecords.forEach(record => {
        totalOperationalCost += record.totalComputedCost;
        totalHoursLogged += record.hoursSpent;

        if (record.scopeAlignment === "out-of-scope") {
            totalOutofScopeCost += record.totalComputedCost;
        } else {
            totalInScopeCost += record.totalComputedCost;
        }
    });

    // Calculate profit & margin metrics
    const grossProfit = project.revenue - totalOperationalCost;
    const netMarginPercentage = project.revenue > 0 ? (grossProfit / project.revenue) * 100 : 0;

    // Compute budget burn rate forecast
    const budgetBurnRate = totalHoursLogged > 0 ? (totalOperationalCost / totalHoursLogged) : 0;
    
    // Estimate remaining contract capacity (hours) 
    const remainingBudget = project.revenue - totalOperationalCost;
    const estimatedHoursRemaining = budgetBurnRate > 0 ? (remainingBudget / budgetBurnRate) : 0;

    // Update dashboard metric displays
    const profitNode = document.getElementById("metric-gross-profit");
    const marginNode = document.getElementById("metric-net-margin");
    const scopeNode = document.getElementById("metric-scope-creep");
    const predictionNode = document.getElementById("metric-burn-prediction");

    if (profitNode) profitNode.textContent = `$${grossProfit.toLocaleString()}`;
    if (marginNode) marginNode.textContent = `${netMarginPercentage.toFixed(1)}%`;
    if (scopeNode) scopeNode.textContent = `$${totalOutofScopeCost.toLocaleString()}`;
    if (predictionNode) {
        predictionNode.textContent = `${Math.max(0, estimatedHoursRemaining).toFixed(1)} hrs left`;
    }

    // Refresh the Table View Elements
    renderLedgerTable();
}

// Table Rendering Logic
function renderLedgerTable() {
    const container = document.getElementById("ledger-rows-container");
    const filter = document.getElementById("ledger-filter");
    const project = projectDatabase[currentProjectId];

    if (!container || !project) return;

    const filterValue = filter ? filter.value : "all";
    container.innerHTML = "";

    // Filter records based on selected dropdown parameters
    const filteredRecords = project.ledgerRecords.filter(record => {
        if (filterValue === "in-scope") return record.scopeAlignment === "in-scope";
        if (filterValue === "out-of-scope") return record.scopeAlignment === "out-of-scope";
        if (filterValue === "leakage") return record.hasLeakage === true;
        return true;
    });

    if (filteredRecords.length === 0) {
        container.innerHTML = `
            <tr>
                <td colspan="6" class="table-empty-message" style="text-align: center; padding: 2rem; color: #6b7280;">
                    No matching ledger items found for this filter criteria.
                </td>
            </tr>
        `;
        return;
    }

    // Iterative DOM Injection Loop
    filteredRecords.forEach(record => {
        const row = document.createElement("tr");
        
        if (record.hasLeakage) {
            row.style.backgroundColor = "rgba(239, 68, 68, 0.08)";
            row.className = "leakage-warning-row";
        }

        row.innerHTML = `
            <td><strong>#${record.id.toString().slice(-4)}</strong></td>
            <td>${record.description}</td>
            <td>$${record.hourlyCost}/hr</td>
            <td>${record.hoursSpent} hrs</td>
            <td>
                <span class="badge ${record.scopeAlignment === 'in-scope' ? 'bg-success' : 'bg-warning'}">
                    ${record.scopeAlignment}
                </span>
            </td>
            <td style="text-align: right;">
                <strong>$${record.totalComputedCost.toLocaleString()}</strong>
                ${record.hasLeakage ? ' <span title="Leakage Warning: Task exceeded 15 hours!" style="cursor:help;">⚠️</span>' : ''}
            </td>
        `;
        
        container.appendChild(row);
    });
}

// Start Application
document.addEventListener("DOMContentLoaded", bootstrapApplication);
        
    