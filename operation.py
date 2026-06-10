import os
import numpy as np
from flask import Flask, request, jsonify, send_from_directory

# Explicitly find the absolute directory path of your project folder
PROJECT_ROOT = os.path.abspath(os.path.dirname(__file__))

# Configure Flask using absolute system paths to prevent 404 file path issues
app = Flask(__name__, static_folder=PROJECT_ROOT, template_folder=PROJECT_ROOT)

@app.route('/')
def home():
    """Serves the main landing page directly from the absolute root directory."""
    return send_from_directory(PROJECT_ROOT, 'index.html')

@app.route('/operation.html')
def operation_page():
    """Serves the calculation studio page."""
    return send_from_directory(PROJECT_ROOT, 'operation.html')

@app.route('/<path:path>')
def serve_static_files(path):
    """Serves your script.js, styles.css and other static files smoothly."""
    return send_from_directory(PROJECT_ROOT, path)

@app.route('/api/calculate-matrix', methods=['POST'])
def calculate_matrix():
    """Handles all computations sent from operation.js."""
    data = request.json
    op = data.get('operation')
    
    # Convert input list arrays into NumPy matrices
    try:
        mat_a = np.array(data.get('matrixA'), dtype=float)
        mat_b = np.array(data.get('matrixB'), dtype=float)
    except Exception:
        return jsonify({'error': 'Failed parsing matrix values to numbers.'}), 400
    
    try:
        if op == 'addition':
            res = mat_a + mat_b
            return jsonify({'result': res.tolist()})
            
        elif op == 'subtraction':
            res = mat_a - mat_b
            return jsonify({'result': res.tolist()})
            
        elif op == 'multiplication':
            res = np.dot(mat_a, mat_b)
            return jsonify({'result': res.tolist()})
            
        elif op == 'transpose':
            # Transposes both Matrix A and Matrix B into a structured dictionary
            return jsonify({
                'result': {
                    'matrixA': mat_a.T.tolist(),
                    'matrixB': mat_b.T.tolist()
                }
            })
            
        elif op == 'determinant':
            # Both matrices are strictly the same size now based on front-end config
            if mat_a.shape[0] != mat_a.shape[1]:
                return jsonify({'error': 'Determinant requires square matrices (Rows = Columns).'}), 400
            
            det_a = np.linalg.det(mat_a)
            det_b = np.linalg.det(mat_b)
            
            # Formats clean output values for both matrices back to operation.js
            return jsonify({
                'result': f"Det(A): {round(float(det_a), 4)}  |  Det(B): {round(float(det_b), 4)}"
            })
            
        else:
            return jsonify({'error': f'Unknown operation: {op}'}), 400
            
    except Exception as e:
        return jsonify({'error': str(e)}), 400

if __name__ == '__main__':
    print("🚀 MatrixOps Engine Starting Up...")
    app.run(debug=True, port=5500)
