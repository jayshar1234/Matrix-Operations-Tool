document.addEventListener('DOMContentLoaded', () => {
    const MIN_DIM = 1;
    const MAX_DIM = 8;

    const elements = {
        rowAInput: document.getElementById('val-row-a'),
        colAInput: document.getElementById('val-col-a'),
        rowBInput: document.getElementById('val-row-b'),
        colBInput: document.getElementById('val-col-b'),
        previewA: document.getElementById('grid-preview-a'),
        previewB: document.getElementById('grid-preview-b'),
        statusText: document.getElementById('setup-status'),
        btnInitialize: document.getElementById('btn-initialize')
    };

    // Link stepper click commands directly to text input manipulation values
    function bindStepperButtons(decBtnId, incBtnId, inputEl) {
        document.getElementById(decBtnId).addEventListener('click', () => {
            let val = parseInt(inputEl.value) || MIN_DIM;
            if (val > MIN_DIM) {
                inputEl.value = val - 1;
                renderUI();
            }
        });

        document.getElementById(incBtnId).addEventListener('click', () => {
            let val = parseInt(inputEl.value) || MIN_DIM;
            if (val < MAX_DIM) {
                inputEl.value = val + 1;
                renderUI();
            }
        });

        // Live validation handler rules on typing content inside fields
        inputEl.addEventListener('input', () => {
            let val = parseInt(inputEl.value);
            if (isNaN(val) || val < MIN_DIM) inputEl.value = MIN_DIM;
            if (val > MAX_DIM) inputEl.value = MAX_DIM;
            renderUI();
        });
    }

    bindStepperButtons('dec-row-a', 'inc-row-a', elements.rowAInput);
    bindStepperButtons('dec-col-a', 'inc-col-a', elements.colAInput);
    bindStepperButtons('dec-row-b', 'inc-row-b', elements.rowBInput);
    bindStepperButtons('dec-col-b', 'inc-col-b', elements.colBInput);

    function renderUI() {
        const rA = parseInt(elements.rowAInput.value) || MIN_DIM;
        const cA = parseInt(elements.colAInput.value) || MIN_DIM;
        const rB = parseInt(elements.rowBInput.value) || MIN_DIM;
        const cB = parseInt(elements.colBInput.value) || MIN_DIM;

        buildGrid(elements.previewA, rA, cA);
        buildGrid(elements.previewB, rB, cB);

        elements.statusText.textContent = `Current Setup: ${rA}×${cA} and ${rB}×${cB}`;
        
        // STRICT SAME-SIZE RULE: Lock progression if grid shapes cross paths
        if (rA !== rB || cA !== cB) {
            elements.btnInitialize.classList.add('btn-disabled');
            elements.statusText.innerHTML = `<span class="text-amber-700 font-medium">⚠️ Dimensions Mismatch: Matrix B must exactly match Matrix A (${rA}×${cA})</span>`;
        } else {
            elements.btnInitialize.classList.remove('btn-disabled');
        }
    }

    function buildGrid(container, rows, cols) {
        container.innerHTML = '';
        container.style.gridTemplateRows = `repeat(${rows}, minmax(0, 1fr))`;
        container.style.gridTemplateColumns = `repeat(${cols}, minmax(0, 1fr))`;

        for (let i = 0; i < rows * cols; i++) {
            const block = document.createElement('div');
            block.className = 'matrix-block-element';
            container.appendChild(block);
        }
    }

    document.getElementById('btn-reset').addEventListener('click', () => {
        elements.rowAInput.value = 3;
        elements.colAInput.value = 3;
        elements.rowBInput.value = 3;
        elements.colBInput.value = 3;
        renderUI();
    });

    elements.btnInitialize.addEventListener('click', () => {
        const rA = elements.rowAInput.value;
        const cA = elements.colAInput.value;
        const rB = elements.rowBInput.value;
        const cB = elements.colBInput.value;
        
        // Check structural equality boundary lines matching strict requirements
        if (rA === rB && cA === cB) {
            // 1. Save the dimensions into the browser's localStorage memory sandbox
            localStorage.setItem('matrixA_rows', rA);
            localStorage.setItem('matrixA_cols', cA);
            localStorage.setItem('matrixB_rows', rB);
            localStorage.setItem('matrixB_cols', cB);
            
            // 2. Redirect the web browser to the operation page studio view automatically
            window.location.href = 'operation.html';
        } else {
            alert("Cannot initialize. Matrix B dimensions must be completely identical to Matrix A!");
        }
    });

    renderUI();
});
