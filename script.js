// ==========================================
// 1. INISIALISASI NETWORK
// ==========================================

// Target Vectors
const TARGETS = {
    CERAH: [-1,  1, -1,  1],
    HUJAN: [ 1, -1,  1, -1]
};

// Matrix Dimensions
const NUM_NEURONS = 4;
let W = Array(NUM_NEURONS).fill().map(() => Array(NUM_NEURONS).fill(0));

// Calculate Weights (Hebbian Learning Rule)
function initWeights() {
    const patterns = [TARGETS.CERAH, TARGETS.HUJAN];
    
    // Reset Weights
    W = W.map(row => row.map(() => 0));

    // Sum of outer products
    patterns.forEach(p => {
        for (let i = 0; i < NUM_NEURONS; i++) {
            for (let j = 0; j < NUM_NEURONS; j++) {
                W[i][j] += p[i] * p[j];
            }
        }
    });

    // Zero diagonal (No self-connection)
    for (let i = 0; i < NUM_NEURONS; i++) {
        W[i][i] = 0;
    }
    
    console.log("Bobot Jaringan (W):", W);
}

// ==========================================
// 2. FUNGSI LOGIKA (HOPFIELD)
// ==========================================

// Activation Function (Signum-like)
function activation(x) {
    return x >= 0 ? 1 : -1;
}

// Prediction Logic
function hopfieldPredict(inputVec) {
    let outputVec = new Array(NUM_NEURONS).fill(0);
    
    for (let i = 0; i < NUM_NEURONS; i++) {
        let sum = 0;
        for (let j = 0; j < NUM_NEURONS; j++) {
            sum += inputVec[j] * W[j][i]; // Matrix multiplication
        }
        outputVec[i] = activation(sum);
    }
    
    return outputVec;
}

// Conversion Logic (Matching Python version)
function konversiAngin(v) {
    if (v <= 5) return -1;
    if (v >= 9) return 1;
    return 0;
}

function konversiSuhu(t) {
    if (t <= 22) return -1;
    if (t >= 27) return 1;
    return 0;
}

function konversiLembab(k) {
    if (k <= 70) return -1;
    if (k >= 85) return 1;
    return 0;
}

function konversiTekanan(p) {
    if (p <= 920) return -1;
    if (p >= 955) return 1;
    return 0;
}

// ==========================================
// 3. UI LOGIC
// ==========================================

document.addEventListener('DOMContentLoaded', () => {
    initWeights(); // Calculate weights on load

    const form = document.getElementById('weatherForm');
    const modal = document.getElementById('resultModal');
    const closeModal = document.querySelector('.close-modal');
    const btnReset = document.getElementById('btnReset');

    // Handle Form Submit
    form.addEventListener('submit', (e) => {
        e.preventDefault();

        // 1. Get Values
        const v = parseFloat(document.getElementById('angin').value);
        const t = parseFloat(document.getElementById('suhu').value);
        const k = parseFloat(document.getElementById('lembab').value);
        const p = parseFloat(document.getElementById('tekanan').value);

        // 2. Convert to Bipolar
        const x1 = konversiAngin(v);
        const x2 = konversiSuhu(t);
        const x3 = konversiLembab(k);
        const x4 = konversiTekanan(p);

        const inputVector = [x1, x2, x3, x4];
        
        // 3. Show Loading State (Optional UI flair)
        const btnText = document.querySelector('.btn-text');
        const originalText = btnText.innerText;
        btnText.innerText = "Memproses...";
        
        setTimeout(() => {
            // 4. Run Prediction
            const outputVector = hopfieldPredict(inputVector);
            
            // 5. Update UI with Results
            displayResult(inputVector, outputVector);
            
            btnText.innerText = originalText;
        }, 800); // Artificial delay for effect
    });

    // Close Modal Logic
    closeModal.addEventListener('click', () => {
        modal.classList.remove('visible');
    });

    window.addEventListener('click', (e) => {
        if (e.target === modal) {
            modal.classList.remove('visible');
        }
    });

    // Reset Logic
    btnReset.addEventListener('click', () => {
        form.reset();
        document.getElementById('angin').focus();
    });

    // Theme Toggle Logic
    const themeToggle = document.getElementById('themeToggle');
    themeToggle.addEventListener('click', () => {
        document.body.classList.toggle('light-mode');
        const isLight = document.body.classList.contains('light-mode');
        themeToggle.innerText = isLight ? '☀️' : '🌙';
    });
});

function displayResult(inputVec, outputVec) {
    const modal = document.getElementById('resultModal');
    const icon = document.getElementById('resultIcon');
    const title = document.getElementById('resultTitle');
    const desc = document.getElementById('resultDescription');
    
    const inputDisplay = document.getElementById('inputVectorDisplay');
    const outputDisplay = document.getElementById('outputVectorDisplay');
    const statusBadge = document.getElementById('matchStatus');

    inputDisplay.innerText = `[${inputVec.join(', ')}]`;
    outputDisplay.innerText = `[${outputVec.join(', ')}]`;

    // Compare Vectors
    const isCerah = arraysEqual(outputVec, TARGETS.CERAH);
    const isHujan = arraysEqual(outputVec, TARGETS.HUJAN);

    if (isCerah) {
        icon.innerText = "☀️";
        title.innerText = "Cuaca Cerah";
        title.style.color = "#fcd34d"; // Yellow
        desc.innerText = "Berdasarkan pola data, hari ini diprediksi cerah. Waktunya jalan-jalan!";
        statusBadge.innerText = "Exact Match";
        statusBadge.style.background = "#22c55e";
    } else if (isHujan) {
        icon.innerText = "🌧️";
        title.innerText = "Cuaca Hujan";
        title.style.color = "#60a5fa"; // Blue
        desc.innerText = "Sediakan payung! Pola data menunjukkan potensi hujan turun.";
        statusBadge.innerText = "Exact Match";
        statusBadge.style.background = "#22c55e";
    } else {
        // Calculate Distance (Hamming-like)
        const distCerah = calculateDistance(outputVec, TARGETS.CERAH);
        const distHujan = calculateDistance(outputVec, TARGETS.HUJAN);

        if (distCerah < distHujan) {
            icon.innerText = "🌤️";
            title.innerText = "Kemungkinan Cerah";
            title.style.color = "#fbbf24"; 
            desc.innerText = `Output tidak konvergen sempurna, tapi lebih condong ke pola Cerah (Jarak: ${distCerah}).`;
            statusBadge.innerText = "Partial Match";
            statusBadge.style.background = "#f59e0b";
        } else {
            icon.innerText = "🌦️";
            title.innerText = "Kemungkinan Hujan";
            title.style.color = "#93c5fd";
            desc.innerText = `Output tidak konvergen sempurna, tapi lebih condong ke pola Hujan (Jarak: ${distHujan}).`;
            statusBadge.innerText = "Partial Match";
            statusBadge.style.background = "#f59e0b";
        }
    }

    modal.classList.add('visible');
}

// Utility: Check Array Equality
function arraysEqual(a, b) {
    if (a.length !== b.length) return false;
    for (let i = 0; i < a.length; i++) {
        if (a[i] !== b[i]) return false;
    }
    return true;
}

// Utility: Calculate Absolute Difference Sum
function calculateDistance(a, b) {
    let sum = 0;
    for (let i = 0; i < a.length; i++) {
        sum += Math.abs(a[i] - b[i]);
    }
    return sum;
}
