document.addEventListener('DOMContentLoaded', () => {
    // Simulated state pulled from your previous dimension configuration page.
    // If not found, defaults directly to standard 3x3 shapes.
    let rowsA = parseInt(localStorage.getItem('matrixA_rows')) || 3;
    let colsA = parseInt(localStorage.getItem('matrixA_cols')) || 3;
    let rowsB = parseInt(localStorage.getItem('matrixB_rows')) || 3;
    let colsB = parseInt(localStorage.getItem('matrixB_cols')) || 3;

    // Elements Dom Links
    const containerA = document.getElementById('container-matrix-a');
    const containerB = document.getElementById('container-matrix-b');
    const tagA = document.getElementById('dim-tag-a');
    const tagB = document.getElementById('dim-tag-b');
    const resultSection = document.getElementById('result-display-section');
    const resultContent = document.getElementById('result-content');

    // UI Label Initialization
    tagA.textContent = `${rowsA} × ${colsA}`;
    tagB.textContent = `${rowsB} × ${colsB}`;

    // Generate functional Comma-separated row boxes based on properties
    function generateInputRows(container, rowCount, colCount, placeholderName) {
        container.innerHTML = '';
        for (let i = 0; i < rowCount; i++) {
            const input = document.createElement('input');
            input.type = 'text';
            input.className = 'matrix-string-row-input';
            
            // Helpful dynamically computed placeholder hint text values
            let hintValues = Array(colCount).fill('0').join(', ');
            input.placeholder = `${placeholderName} Row ${i + 1} (${hintValues})`;
            
            container.appendChild(input);
        }
    }

    // Build functional UI elements on workspace launch
    generateInputRows(containerA, rowsA, colsA, 'A');
    generateInputRows(containerB, rowsB, colsB, 'B');

    /**
     * Extracts values from text inputs, splitting on commas,
     * and converting elements to integers or floats as appropriate.
     */
    function parseMatrixStructure(container, expectedCols) {
        const inputElements = container.querySelectorAll('.matrix-string-row-input');
        let parsedMatrix = [];

        for (let i = 0; i < inputElements.length; i++) {
            let rowString = inputElements[i].value.trim();
            
            // Treat empty inputs as zeros fallback configuration
            if (!rowString) {
                parsedMatrix.push(Array(expectedCols).fill(0));
                continue;
            }

            // Split string items strictly based on user requested ',' token
            let rawTokens = rowString.split(',');
            if (rawTokens.length !== expectedCols) {
                alert(`Error: Row ${i + 1} requires exactly ${expectedCols} values separated by commas.`);
                return null;
            }

            let numericRow = rawTokens.map(token => {
                let trimmed = token.trim();
                if (trimmed === '') return 0;
                
                let num = Number(trimmed);
                if (isNaN(num)) {
                    alert(`Invalid number layout detected: "${trimmed}"`);
                    return null;
                }
                // Differentiates automatically between integer or decimal format configuration
                return Number.isInteger(num) ? parseInt(trimmed, 10) : parseFloat(trimmed);
            });

            if (numericRow.includes(null)) return null;
            parsedMatrix.push(numericRow);
        }
        return parsedMatrix;
    }

    // Setup action listener on click commands for operations buttons
    document.querySelectorAll('.op-card').forEach(card => {
        card.addEventListener('click', async () => {
            const operationType = card.getAttribute('data-operation');
            
            const matrixAData = parseMatrixStructure(containerA, colsA);
            const matrixBData = parseMatrixStructure(containerB, colsB);

            // Halt transaction logic pipeline execution if tracking validations fail
            if (!matrixAData || !matrixBData) return;

            // Prepare transaction item structure payload
            const payload = {
                operation: operationType,
                matrixA: matrixAData,
                matrixB: matrixBData,
                dimensions: {
                    rowsA: rowsA, colsA: colsA,
                    rowsB: rowsB, colsB: colsB
                }
            };

            try {
                // Submit transaction fetch call request structure to Flask route backend endpoint
                const response = await fetch('/api/calculate-matrix', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify(payload)
                });

                const apiResult = await response.json();

                if (!response.ok || apiResult.error) {
                    alert(`Computation Error: ${apiResult.error || 'Unknown server fault.'}`);
                    return;
                }

                displayComputationResult(apiResult.result);

            } catch (err) {
                console.error(err);
                alert('Connection failure link dropped while processing computations with Flask backend server.');
            }
        });
    });

        // Display formatted results inside target viewport panel blocks
    function displayComputationResult(data) {
        resultContent.innerHTML = '';
        resultSection.classList.remove('hidden');

        // Handle dual matrix outputs (like Transpose of both A and B together)
        if (data && typeof data === 'object' && data.matrixA && data.matrixB) {
            renderSingleResultMatrix("Transpose of Matrix A:", data.matrixA);
            renderSingleResultMatrix("Transpose of Matrix B:", data.matrixB);
            return;
        }

        // Handle scalar outputs (like Determinant calculation results)
        if (!Array.isArray(data)) {
            const scalarDiv = document.createElement('div');
            scalarDiv.className = 'result-row';
            scalarDiv.style.fontWeight = '700';
            scalarDiv.textContent = `Value = ${data}`;
            resultContent.appendChild(scalarDiv);
            return;
        }

        // Handle standard single structural matrix grids rows (Addition, Subtraction, Multiplication)
        data.forEach(row => {
            const rowDiv = document.createElement('div');
            rowDiv.className = 'result-row';
            let rowText = row.map(val => Number.isInteger(val) ? val : val.toFixed(2)).join('   ');
            rowDiv.textContent = `[  ${rowText}  ]`;
            resultContent.appendChild(rowDiv);
        });
    }

    // Helper utility function to render clean titled matrices inside the output area
    function renderSingleResultMatrix(titleText, matrixArray) {
        const titleEl = document.createElement('div');
        titleEl.style.fontSize = '14px';
        titleEl.style.color = '#715530';
        titleEl.style.fontWeight = '600';
        titleEl.style.marginTop = '12px';
        titleEl.style.marginBottom = '6px';
        titleEl.style.textAlign = 'center';
        titleEl.textContent = titleText;
        resultContent.appendChild(titleEl);

        matrixArray.forEach(row => {
            const rowDiv = document.createElement('div');
            rowDiv.className = 'result-row';
            let rowText = row.map(val => Number.isInteger(val) ? val : val.toFixed(2)).join('   ');
            rowDiv.textContent = `[  ${rowText}  ]`;
            resultContent.appendChild(rowDiv);
        });
    }

    // Handle systemic data field clearing inputs 
    document.getElementById('btn-clear-values').addEventListener('click', () => {
        document.querySelectorAll('.matrix-string-row-input').forEach(input => input.value = '');
        resultSection.classList.add('hidden');
        resultContent.innerHTML = '';
    });
});
