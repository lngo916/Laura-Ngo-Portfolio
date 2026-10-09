
// ── Theme ────────────────────────────────────────────────
const root = document.documentElement;
const themeToggle = document.getElementById('themeToggle');

function applyTheme(theme) {
    root.dataset.theme = theme;
    localStorage.setItem('theme', theme);
    const isLight = theme === 'light';
    themeToggle.textContent = isLight ? '☾' : '☼';
    themeToggle.setAttribute('aria-label', isLight ? 'Switch to dark mode' : 'Switch to light mode');
}

const savedTheme = localStorage.getItem('theme');
const initialTheme = savedTheme === 'light' || savedTheme === 'dark'
    ? savedTheme
    : 'dark';
applyTheme(initialTheme);

// ── Chart theme helpers ──────────────────────────────────
function getChartTheme() {
    const styles = getComputedStyle(root);
    return {
        text: styles.getPropertyValue('--text').trim(),
        muted: styles.getPropertyValue('--muted').trim(),
        dim: styles.getPropertyValue('--dim').trim(),
        line: styles.getPropertyValue('--line').trim(),
        grid: styles.getPropertyValue('--chart-grid').trim(),
        border: styles.getPropertyValue('--chart-border').trim(),
        orange: styles.getPropertyValue('--orange').trim(),
        accent: styles.getPropertyValue('--accent').trim(),
        green: styles.getPropertyValue('--green').trim(),
        red: styles.getPropertyValue('--red').trim()
    };
}

function rgba(hex, alpha) {
    const value = hex.replace('#', '');
    if (value.length !== 6) return hex;
    const r = parseInt(value.slice(0, 2), 16);
    const g = parseInt(value.slice(2, 4), 16);
    const b = parseInt(value.slice(4, 6), 16);
    return `rgba(${r},${g},${b},${alpha})`;
}

const chartTheme = getChartTheme();
Chart.defaults.color = chartTheme.muted;
Chart.defaults.borderColor = chartTheme.line;
Chart.defaults.font.family = "'DM Mono', monospace";
Chart.defaults.font.size = 10;

// ── Star distribution bar chart ──
const starChart = new Chart(document.getElementById('starChart'), {
    type: 'bar',
    data: {
        labels: ['1★', '2★', '3★', '4★', '5★'],
        datasets: [{
            data: [5_210_000, 8_370_000, 9_030_000, 17_680_000, 62_610_000],
            backgroundColor: [
                '#f2504a',
                '#f2994a',
                '#f2c94c',
                '#5488e9',
                '#006702'
            ],
            borderWidth: 0,
            borderRadius: 2,
        }]
    },

    options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
            legend: {
                display: false
            }
        },
        scales: {
            x: {
                grid: {
                    color: chartTheme.grid
                },
                ticks: {
                    color: chartTheme.muted
                }
            },
            y: {
                min: 0,
                max: 70_000_000,

                grid: {
                    color: chartTheme.grid
                },
                ticks: {
                    color: chartTheme.muted,

                    callback: function (value) {
                        return (value / 1_000_000) + 'M';
                    }
                }
            }
        }
    }
});

// ── Pie / doughnut ──
const pieChart = new Chart(document.getElementById('pieChart'), {
    type: 'doughnut',
    data: {
        labels: ['1★', '2★', '3★', '4★', '5★'],
        datasets: [{
            data: [5_210_000, 8_370_000, 9_030_000, 17_680_000, 62_610_000],
            backgroundColor: [
                '#f2504a',
                '#f2994a',
                '#f2c94c',
                '#5488e9',
                '#006702'
            ],

            borderWidth: 1,
            borderColor: chartTheme.border
        }]
    },
    options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
            legend: {
                position: 'right',
                labels: {
                    color: chartTheme.muted,
                    boxWidth: 10,
                    padding: 12
                }
            },
            tooltip: {
                callbacks: {
                    label: function (context) {
                        const value = context.raw;
                        const total = context.dataset.data.reduce((sum, v) => sum + v, 0);
                        const percentage = ((value / total) * 100).toFixed(1);
                        return `${context.label}: ${(value / 1_000_000).toFixed(1)}M (${percentage}%)`;
                    }
                }
            }
        },
        cutout: '62%'
    }
});

// ── Train vs Val Accuracy ──

const trees = [1, 3, 5, 7, 9, 11, 13, 15, 17, 19, 21, 23, 25, 27, 29, 31, 33, 35, 37, 39, 41, 43, 45, 47, 49];

const trainAccuracy = [
    0.665744, 0.654113, 0.659351, 0.664171, 0.663712,
    0.662680, 0.665152, 0.664260, 0.665103, 0.665590,
    0.666150, 0.665840, 0.665378, 0.666399, 0.666117,
    0.665530, 0.665942, 0.666640, 0.666675, 0.666259,
    0.665892, 0.666353, 0.666352, 0.665896, 0.666061
];

const validationAccuracy = [
    0.667175, 0.655575, 0.660583, 0.665423, 0.665066,
    0.664242, 0.666928, 0.665780, 0.666773, 0.667298,
    0.667992, 0.667460, 0.667019, 0.667947, 0.667661,
    0.667253, 0.667908, 0.668167, 0.668265, 0.667811,
    0.667720, 0.668090, 0.668129, 0.667408, 0.667382
];

// Convert decimal accuracy → percentage
const trainData = trainAccuracy.map(value => value * 100);
const validationData = validationAccuracy.map(value => value * 100);

const errorChart = new Chart(
    document.getElementById('errorChart'),
    {
        type: 'line',
        data: {
            labels: trees,
            datasets: [
                {
                    label: 'Train Accuracy',
                    data: trainData,

                    borderColor: '#0561bd',
                    backgroundColor: rgba('#0373e2', 0.08),

                    borderWidth: 1.5,
                    pointRadius: 2,
                    tension: 0.4,
                    fill: true
                },
                {
                    label: 'Validation Accuracy',
                    data: validationData,
                    borderColor: '#f78522',
                    backgroundColor: rgba('#f47b11', 0.06),
                    borderWidth: 1.5,
                    pointRadius: 2,
                    tension: 0.4,
                    borderDash: [4, 3],
                    fill: true
                }
            ]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                legend: {
                    labels: {
                        color: chartTheme.muted,
                        boxWidth: 10
                    }
                }
            },
            scales: {
                x: {
                    title: {
                        display: true,
                        text: 'Number of Trees',
                        color: chartTheme.dim,
                        font: {
                            size: 9
                        }
                    },

                    grid: {
                        color: chartTheme.grid
                    },

                    ticks: {
                        color: chartTheme.muted
                    }
                },
                y: {
                    title: {
                        display: true,
                        text: 'Accuracy %',
                        color: chartTheme.dim,
                        font: {
                            size: 9
                        }
                    },
                    grid: {
                        color: chartTheme.grid
                    },
                    ticks: {
                        color: chartTheme.muted
                    },
                    min: 65,
                    max: 67
                }
            }
        }
    }
);

// ── Feature importance ──
const featureLabels = ['review_word_counts', 'review_len', 'helpful_ratio', 'review_headline_len',
    'category_idx', 'total_votes', 'review_headline_word_counts', 'verified_purchase_idx'];

const featureImportances = [0.248081, 0.210397, 0.169301, 0.126052, 0.122743, 0.105226, 0.018200, 0.000000];

const featChart = new Chart(document.getElementById('featChart'), {
    type: 'bar',

    data: {
        labels: featureLabels,

        datasets: [{
            label: 'Importance',
            data: featureImportances,
            backgroundColor: [
                rgba('#3f9dfa', 0.90), rgba('#3f9dfa', 0.90),
                rgba('#3f9dfa', 0.90), rgba('#3f9dfa', 0.90),
                rgba('#3f9dfa', 0.90), rgba('#3f9dfa', 0.90),
                rgba('#3f9dfa', 0.90), rgba('#3f9dfa', 0.90),
            ],
            borderWidth: 0,
            borderRadius: 2
        }]
    },

    options: {
        indexAxis: 'y',
        responsive: true,
        maintainAspectRatio: false,

        plugins: {
            legend: {
                display: false
            },
            tooltip: {
                enabled: true,
                callbacks: {
                    label: function (context) {
                        return `Importance: ${context.raw.toFixed(5)}`;
                    }
                }
            }
        },
        scales: {
            x: {
                beginAtZero: true,
                max: 0.27,
                title: {
                    display: true,
                    text: 'Importance',
                    color: chartTheme.dim,
                    font: {
                        size: 9
                    }
                },
                grid: {
                    color: chartTheme.grid
                },
                ticks: {
                    color: chartTheme.muted
                }
            },

            y: {
                grid: {
                    color: chartTheme.grid
                },
                ticks: {
                    color: chartTheme.muted,
                    font: {
                        size: 9
                    }
                }
            }
        }
    }
});

/* ══════════════════════════════════════════════════════════
   MACHINE LEARNING — MODEL CHARTS
   ══════════════════════════════════════════════════════════ */

const mlCharts = [];

function getMLChartTheme() {
    const styles = getComputedStyle(document.documentElement);

    return {
        text: styles.getPropertyValue("--text").trim(),
        muted: styles.getPropertyValue("--muted").trim(),
        line: styles.getPropertyValue("--line").trim(),
        accent: styles.getPropertyValue("--accent").trim(),
        panel: styles.getPropertyValue("--panel").trim()
    };
}

function hexToRgba(hex, alpha) {
    if (!hex) return `rgba(93,169,255,${alpha})`;

    let value = hex.replace("#", "").trim();

    if (value.length === 3) {
        value = value
            .split("")
            .map(char => char + char)
            .join("");
    }

    const r = parseInt(value.substring(0, 2), 16);
    const g = parseInt(value.substring(2, 4), 16);
    const b = parseInt(value.substring(4, 6), 16);

    return `rgba(${r}, ${g}, ${b}, ${alpha})`;
}

/* ══════════════════════════════════════════════════════════
   INTERACTIVE CONFUSION MATRICES
   ══════════════════════════════════════════════════════════ */

const ratingLabels = ["1★", "2★", "3★", "4★", "5★"];

/*
 * Draw the actual numbers inside each matrix cell.
 */
const matrixValueLabels = {
    id: "matrixValueLabels",

    afterDatasetsDraw(chart) {
        const ctx = chart.ctx;
        const theme = getMLChartTheme();

        chart.data.datasets.forEach((dataset, datasetIndex) => {
            const meta = chart.getDatasetMeta(datasetIndex);
            const maxValue = Math.max(...dataset.data.map(item => item.v));

            meta.data.forEach((cell, index) => {
                const raw = dataset.data[index];
                if (!raw || !cell) return;

                // Get true geometry of the tile
                const { x, y, width, height } =
                    cell.getProps(["x", "y", "width", "height"], true);

                // Center of the tile
                const centerX = x + width / 2;
                const centerY = y + height / 2;

                const intensity = raw.v / maxValue;

                ctx.save();

                const fontSize = Math.max(8, Math.min(11, height * 0.25));
                ctx.font = `600 ${fontSize}px "DM Mono", monospace`;
                ctx.textAlign = "center";
                ctx.textBaseline = "middle";

                // Uses --text from your current theme
                ctx.fillStyle = theme.text;

                ctx.fillText(raw.v.toLocaleString(), centerX, centerY);

                ctx.restore();
            });
        });
    }
};

function buildMatrixData(matrix) {
    const data = [];

    for (let y = 0; y < matrix.length; y++) {
        for (let x = 0; x < matrix[y].length; x++) {
            data.push({
                x: x,
                y: y,
                v: matrix[y][x]
            });
        }
    }

    return data;
}

function matrixBackground(value, maxValue, active = false) {
    const styles = getComputedStyle(document.documentElement);
    const isDark = document.documentElement.dataset.theme === "dark";

    const accent = styles.getPropertyValue("--accent").trim();

    if (value === 0) {
        return isDark
            ? hexToRgba(accent, active ? 0.22 : 0.07)
            : hexToRgba(accent, active ? 0.18 : 0.045);
    }

    const intensity = Math.sqrt(value / maxValue);

    if (isDark) {
        // Dark mode: stronger, richer blue without becoming too bright
        const alpha = 0.14 + (intensity * 0.70);

        return hexToRgba(
            accent,
            Math.min(
                active ? alpha + 0.08 : alpha,
                0.88
            )
        );
    }

    // Light mode
    const alpha = 0.10 + (intensity * 0.82);

    return hexToRgba(
        accent,
        Math.min(
            active ? alpha + 0.10 : alpha,
            0.92
        )
    );
}


/* ── Matrix creator ─────────────────────────────────────── */

function createConfusionMatrix(canvasId, matrix) {
    const canvas = document.getElementById(canvasId);
    if (!canvas) return null;
    const values = buildMatrixData(matrix);
    const maxValue = Math.max(
        ...values.map(item => item.v)
    );
    const chart = new Chart(canvas, {
        type: "matrix",
        data: {
            datasets: [{
                label: "Reviews",
                data: values,
                backgroundColor: function (context) {
                    const raw = context.raw;
                    if (!raw) {
                        return "transparent";
                    }
                    return matrixBackground(
                        raw.v,
                        maxValue,
                        context.active
                    );
                },
                hoverBackgroundColor: function (context) {
                    const raw = context.raw;
                    if (!raw) {
                        return "transparent";
                    }
                    return matrixBackground(
                        raw.v,
                        maxValue,
                        true
                    );
                },
                borderColor: function () {
                    return getMLChartTheme().line;
                },
                borderWidth: 1,
                width: function (context) {
                    const area = context.chart.chartArea;
                    if (!area) {
                        return 35;
                    }
                    return Math.max(
                        12,
                        ((area.right - area.left) / 5) - 4
                    );
                },
                height: function (context) {
                    const area = context.chart.chartArea;
                    if (!area) {
                        return 35;
                    }
                    return Math.max(
                        12,
                        ((area.bottom - area.top) / 5) - 4
                    );
                }
            }]
        },

        options: {
            responsive: true,
            maintainAspectRatio: false,
            animation: false,
            interaction: {
                mode: "nearest",
                intersect: true
            },
            layout: {
                padding: {
                    top: 4,
                    right: 8,
                    bottom: 4,
                    left: 4
                }
            },

            plugins: {
                legend: {
                    display: false
                },

                tooltip: {

                    displayColors: false,

                    callbacks: {

                        title: function (items) {
                            if (!items.length) return "";
                            const raw = items[0].raw;

                            return `Actual ${ratingLabels[raw.y]}`;
                        },

                        label: function (context) {

                            const raw = context.raw;

                            const rowTotal =
                                matrix[raw.y].reduce(
                                    (sum, value) => sum + value,
                                    0
                                );

                            const percentage =
                                rowTotal > 0
                                    ? ((raw.v / rowTotal) * 100).toFixed(1)
                                    : "0.0";

                            return [
                                `Predicted: ${ratingLabels[raw.x]}`,
                            ];
                        }
                    }
                }
            },

            scales: {

                x: {

                    type: "linear",

                    min: -0.5,
                    max: 4.5,

                    offset: false,

                    grid: {
                        display: false
                    },

                    border: {
                        display: false
                    },

                    ticks: {

                        stepSize: 1,

                        color: function () {
                            return getMLChartTheme().muted;
                        },

                        font: {
                            family: "DM Mono",
                            size: 9
                        },

                        callback: function (value) {
                            return ratingLabels[value] || "";
                        }
                    },

                    title: {
                        display: true,
                        text: "Predicted",
                        color: function () {
                            return getMLChartTheme().muted;
                        },

                        font: {
                            family: "DM Mono",
                            size: 8
                        }
                    }
                },

                y: {

                    type: "linear",

                    min: -0.5,
                    max: 4.5,

                    reverse: true,

                    offset: false,

                    grid: {
                        display: false
                    },

                    border: {
                        display: false
                    },

                    ticks: {

                        stepSize: 1,

                        color: function () {
                            return getMLChartTheme().muted;
                        },

                        font: {
                            family: "DM Mono",
                            size: 9
                        },

                        callback: function (value) {
                            return ratingLabels[value] || "";
                        }
                    },

                    title: {
                        display: true,
                        text: "Actual",
                        color: function () {
                            return getMLChartTheme().muted;
                        },

                        font: {
                            family: "DM Mono",
                            size: 8
                        }
                    }
                }
            },

            onHover: function (event, activeElements) {

                const target =
                    event?.native?.target;

                if (target) {
                    target.style.cursor =
                        activeElements.length
                            ? "pointer"
                            : "default";
                }
            }
        },

        plugins: [
            matrixValueLabels
        ]
    });

    mlCharts.push(chart);

    return chart;
}

const standardMatrix = [
    [8951, 40, 64, 0, 4593],
    [3187, 794, 59, 1, 3851],
    [2525, 18, 1471, 1, 8613],
    [1471, 11, 56, 4, 24965],
    [2320, 40, 73, 1, 91440]
];


const pcaMatrix = [
    [0, 0, 0, 0, 13648],
    [0, 0, 0, 0, 7892],
    [0, 0, 0, 0, 12628],
    [0, 0, 0, 0, 26507],
    [0, 0, 0, 0, 93874]
];


/* Create both interactive heat maps */
createConfusionMatrix(
    "matrixStandard",
    standardMatrix
);

createConfusionMatrix(
    "matrixPCA",
    pcaMatrix
);

// LIGHT AND DARK THEME 
const charts = [starChart, pieChart, errorChart, featChart, mlCharts];

function updateChartsForTheme() {
    const t = getChartTheme();

    Chart.defaults.color = t.muted;
    Chart.defaults.borderColor = t.line;

    starChart.options.scales.x.grid.color = t.grid;
    starChart.options.scales.x.ticks.color = t.muted;
    starChart.options.scales.y.grid.color = t.grid;
    starChart.options.scales.y.ticks.color = t.muted;

    pieChart.data.datasets[0].borderColor = t.border;
    pieChart.options.plugins.legend.labels.color = t.muted;

    errorChart.options.plugins.legend.labels.color = t.muted;
    errorChart.options.scales.x.title.color = t.dim;
    errorChart.options.scales.x.grid.color = t.grid;
    errorChart.options.scales.x.ticks.color = t.muted;
    errorChart.options.scales.y.title.color = t.dim;
    errorChart.options.scales.y.grid.color = t.grid;
    errorChart.options.scales.y.ticks.color = t.muted;

    featChart.options.scales.x.grid.color = t.grid;
    featChart.options.scales.x.ticks.color = t.muted;
    featChart.options.scales.y.grid.color = t.grid;
    featChart.options.scales.y.ticks.color = t.muted;

    // Redraw everything immediately
    charts.forEach(chart => {
        chart.update('none');
        chart.draw();
    });
}

themeToggle.addEventListener('click', () => {
    const nextTheme = root.dataset.theme === 'light' ? 'dark' : 'light';
    applyTheme(nextTheme);
    updateChartsForTheme();
});




