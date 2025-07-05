let puzzleImage = null;

// Add at the top with other global variables
let solutionImageMappings = {
    0: {}, // Original solution mapping
    1: {}, // Solution 2 mapping
    2: {}, // Solution 3 mapping
    3: {}  // Solution 4 mapping
};

document.addEventListener('DOMContentLoaded', function() {
    const imageInput = document.getElementById('imageUpload');
    if (imageInput) {
        imageInput.addEventListener('change', function(event) {
            const file = event.target.files[0];
            if (file) {
                const reader = new FileReader();
                reader.onload = function(e) {
                    puzzleImage = new Image();
                    puzzleImage.onload = function() {
                        // Re-map images and redisplay solutions if they exist
                        if (globalSolutions && globalSolutions.length > 0) {
                            mapImagesAcrossSolutions();
                            displaySolutions(globalSolutions);
                        }
                    };
                    puzzleImage.src = e.target.result;
                };
                reader.readAsDataURL(file);
            }
        });
    }

    // Tile position finder logic
    const findBtn = document.getElementById('findTilePositionBtn');
    const mapBtn = document.createElement('button');
    mapBtn.textContent = 'Map Image from Solution 1';
    mapBtn.style.padding = '8px 16px';
    mapBtn.style.marginLeft = '10px';
    const finderDiv = document.getElementById('tilePositionFinder');
    if (finderDiv) finderDiv.appendChild(mapBtn);

    if (findBtn) {
        findBtn.addEventListener('click', function() {
            const input = document.getElementById('tileNumbersInput').value.trim();
            const resultSpan = document.getElementById('tilePositionResult');
            if (!input) {
                resultSpan.textContent = 'Please enter tile numbers.';
                return;
            }
            const nums = input.split(',').map(x => parseInt(x.trim()));
            if (nums.length !== 4 || nums.some(isNaN)) {
                resultSpan.textContent = 'Enter exactly 4 numbers.';
                return;
            }
            if (!globalSolutions[1] || !globalSolutions[1].grid) {
                resultSpan.textContent = 'Solution 2 not available.';
                return;
            }
            // Generate all 4 rotations
            let rotations = [];
            let t = nums.slice();
            for (let i = 0; i < 4; i++) {
                rotations.push(t.join(','));
                t = [t[1], t[2], t[3], t[0]];
            }
            let found = null;
            let grid2 = globalSolutions[1].grid;
            for (let r = 0; r < 10; r++) {
                for (let c = 0; c < 10; c++) {
                    if (grid2[r][c]) {
                        let cellStr = grid2[r][c].join(',');
                        if (rotations.includes(cellStr)) {
                            found = [r, c];
                            break;
                        }
                    }
                }
                if (found) break;
            }
            if (found) {
                resultSpan.textContent = `Position: [${found[0]}, ${found[1]}]`;
            } else {
                resultSpan.textContent = 'Not found in solution 2.';
            }
        });
    }

    // Map image from solution 1 to solution 2 for the entered tile
    mapBtn.addEventListener('click', function() {
        const input = document.getElementById('tileNumbersInput').value.trim();
        const resultSpan = document.getElementById('tilePositionResult');
        if (!input) {
            resultSpan.textContent = 'Please enter tile numbers.';
            return;
        }
        const nums = input.split(',').map(x => parseInt(x.trim()));
        if (nums.length !== 4 || nums.some(isNaN)) {
            resultSpan.textContent = 'Enter exactly 4 numbers.';
            return;
        }
        if (!globalSolutions[1] || !globalSolutions[1].grid || !globalSolutions[0] || !globalSolutions[0].grid) {
            resultSpan.textContent = 'Solutions not available.';
            return;
        }
        // Generate all 4 rotations
        let rotations = [];
        let t = nums.slice();
        for (let i = 0; i < 4; i++) {
            rotations.push(t.join(','));
            t = [t[1], t[2], t[3], t[0]];
        }
        let found2 = null;
        let grid2 = globalSolutions[1].grid;
        for (let r = 0; r < 10; r++) {
            for (let c = 0; c < 10; c++) {
                if (grid2[r][c]) {
                    let cellStr = grid2[r][c].join(',');
                    if (rotations.includes(cellStr)) {
                        found2 = [r, c];
                        break;
                    }
                }
            }
            if (found2) break;
        }
        if (!found2) {
            resultSpan.textContent = 'Not found in solution 2.';
            return;
        }
        // Now find the same tile (any rotation) in solution 1
        let found1 = null;
        let grid1 = globalSolutions[0].grid;
        for (let r = 0; r < 10; r++) {
            for (let c = 0; c < 10; c++) {
                if (grid1[r][c]) {
                    let cellStr1 = grid1[r][c].join(',');
                    if (rotations.includes(cellStr1)) {
                        found1 = [r, c];
                        break;
                    }
                }
            }
            if (found1) break;
        }
        if (!found1) {
            resultSpan.textContent = 'Not found in solution 1.';
            return;
        }
        // Set the override
        solution2ImageOverrides[`${found2[0]},${found2[1]}`] = found1;
        resultSpan.textContent = `Mapped image from Solution 1 [${found1[0]}, ${found1[1]}] to Solution 2 [${found2[0]}, ${found2[1]}]`;
        // Re-render solution 2 if visible
        if (typeof displaySolutions === 'function' && globalSolutions.length > 1) {
            displaySolutions(globalSolutions);
        }
    });

    // Add button to map all pieces automatically
    const mapAllBtn = document.createElement('button');
    mapAllBtn.textContent = 'Map All Images from Solution 1';
    mapAllBtn.style.padding = '8px 16px';
    mapAllBtn.style.marginLeft = '10px';
    if (finderDiv) finderDiv.appendChild(mapAllBtn);

    mapAllBtn.addEventListener('click', function() {
        if (!globalSolutions[1] || !globalSolutions[1].grid || !globalSolutions[0] || !globalSolutions[0].grid) {
            const resultSpan = document.getElementById('tilePositionResult');
            if (resultSpan) resultSpan.textContent = 'Solutions not available.';
            return;
        }
        let grid1 = globalSolutions[0].grid;
        let results = [];
        // Map for solution 2, 3, 4 if available
        for (let solIdx = 1; solIdx <= 3; solIdx++) {
            if (!globalSolutions[solIdx] || !globalSolutions[solIdx].grid) continue;
            let gridN = globalSolutions[solIdx].grid;
            let mappedCount = 0;
            for (let r2 = 0; r2 < 10; r2++) {
                for (let c2 = 0; c2 < 10; c2++) {
                    const tile2 = gridN[r2][c2];
                    if (!tile2) continue;
                    // Generate all 4 rotations of tile2
                    let rotations = [];
                    let t = tile2.slice();
                    for (let i = 0; i < 4; i++) {
                        rotations.push(t.join(','));
                        t = [t[1], t[2], t[3], t[0]];
                    }
                    // Find matching tile in solution 1
                    let found1 = null;
                    for (let r1 = 0; r1 < 10; r1++) {
                        for (let c1 = 0; c1 < 10; c1++) {
                            const tile1 = grid1[r1][c1];
                            if (tile1 && rotations.includes(tile1.join(','))) {
                                found1 = [r1, c1];
                                break;
                            }
                        }
                        if (found1) break;
                    }
                    if (found1) {
                        // Use a separate override map for each solution
                        if (solIdx === 1) solution2ImageOverrides[`${r2},${c2}`] = found1;
                        if (solIdx === 2) {
                            if (!window.solution3ImageOverrides) window.solution3ImageOverrides = {};
                            window.solution3ImageOverrides[`${r2},${c2}`] = found1;
                        }
                        if (solIdx === 3) {
                            if (!window.solution4ImageOverrides) window.solution4ImageOverrides = {};
                            window.solution4ImageOverrides[`${r2},${c2}`] = found1;
                        }
                        mappedCount++;
                    }
                }
            }
            results.push(`Solution ${solIdx+1}: ${mappedCount} images mapped`);
        }
        const resultSpan = document.getElementById('tilePositionResult');
        if (resultSpan) resultSpan.textContent = results.join(' | ');
        if (typeof displaySolutions === 'function' && globalSolutions.length > 1) {
            displaySolutions(globalSolutions);
        }
    });
});

const getBoundary = (x, y, size) => {
    let temp = []
    if (x == 0) {
        temp.push(0)
    }
    if (y == 0) {
        temp.push(3)
    }
    if (x == size[0] - 1) {
        temp.push(2)
    }
    if (y == size[1] - 1) {
        temp.push(1)
    }
    return temp
}

const rotate = (list) => {
    return [list[1], list[2], list[3], list[0]]
}

const nextCell = (x, y, size) => {
    let dy = y + 1
    if (dy >= size[1]) {
        return [x + 1, 0]
    }
    return [x, dy]
}

let check = (x, y, data, grid, size) => {
    let directions = [
        [-1, 0],
        [0, 1],
        [1, 0],
        [0, -1]
    ]
    for (let i = 0; i < 4; i += 1) {
        let dx = x + directions[i][0]
        let dy = y + directions[i][1]
        if (dx < 0 || dx >= size[0] || dy < 0 || dy >= size[1]) {
            if (data[i] != 0) return false
        } else {
            if (!grid[dx][dy]) {
                continue
            }
            if (grid[dx][dy][(i + 2) % 4] + data[i] != 0) {
                return false
            }
        }
    }
    return true
}

// Global variable to store solutions
let globalSolutions = [];
// Global variable to store the mapping of solution 1's pieces and their orientation
let solution1PieceMap = {};
// Global variable for per-cell image overrides in solution 2
let solution2ImageOverrides = {};

const getSolutions = (data) => {
    let size = [10, 10]
    let solutions = []
    let grid = [...Array(size[0])].map((item) => Array(size[1]).fill(null))
    
    const dfs = (x, y, grid, data) => {
        if (data.length==0) {
            solutions.push({
                grid: JSON.parse(JSON.stringify(grid))
            })
            return
        }
        
        let willPlace = {}

        for (let list of data) {
            let key = `${list}`
            willPlace[key] = []
            let boundarys = getBoundary(x, y, size)
            let temptile = JSON.parse(JSON.stringify(list))
            for (let i = 0; i < 4; i += 1) {
                let suit = true
                for (let j of boundarys) {
                    if (temptile[j] != 0) {
                        suit = false
                        break
                    }
                }
                if (suit && check(x, y, temptile, grid, size)) {
                    willPlace[key].push(temptile)
                }
                temptile = rotate(temptile)
            }
        }
        
        for (let i = 0; i < data.length; i += 1) {
            let key = `${data[i]}`
            let tempData = JSON.parse(JSON.stringify(data))
            tempData = tempData.filter((item, inx) => inx != i)
            let [dx, dy] = nextCell(x, y, size)
            for (let tile of willPlace[key]) {
                grid[x][y] = tile
                dfs(dx, dy, grid, tempData)
                grid[x][y] = null
            }
        }
        return
    }
    
    dfs(0, 0, JSON.parse(JSON.stringify(grid)), JSON.parse(JSON.stringify(data)))
    
    // Store solutions globally
    globalSolutions = solutions;
    
    // Map images across all solutions
    mapImagesAcrossSolutions();
    
    // Display solutions visually
    displaySolutions(solutions);
    
    if (solutions.length > 0) {
        const counts = countNumbersInSolution(solutions[0]);
        console.log(counts);
    }
}

const displaySolutions = (solutions) => {
    const tilesDisplay = document.getElementById('tilesDisplay');
    const resultDiv = document.getElementById('result');
    
    if (solutions.length === 0) {
        resultDiv.textContent = 'No solutions found.';
        tilesDisplay.innerHTML = '';
        return;
    }
    
    resultDiv.textContent = `Found ${solutions.length} solution(s).`;
    
    const container = document.createElement('div');
    container.style.marginTop = '20px';
    
    const title = document.createElement('h3');
    title.textContent = 'Solutions:';
    title.style.marginBottom = '15px';
    container.appendChild(title);
    
    // Create navigation controls
    const navContainer = document.createElement('div');
    navContainer.style.display = 'flex';
    navContainer.style.justifyContent = 'center';
    navContainer.style.alignItems = 'center';
    navContainer.style.gap = '15px';
    navContainer.style.marginBottom = '20px';
    
    const prevBtn = document.createElement('button');
    prevBtn.textContent = '← Previous';
    prevBtn.style.padding = '8px 16px';
    prevBtn.style.background = '#4f8cff';
    prevBtn.style.color = 'white';
    prevBtn.style.border = 'none';
    prevBtn.style.borderRadius = '4px';
    prevBtn.style.cursor = 'pointer';
    
    const solutionLabel = document.createElement('span');
    solutionLabel.style.fontWeight = 'bold';
    solutionLabel.style.fontSize = '16px';
    
    const nextBtn = document.createElement('button');
    nextBtn.textContent = 'Next →';
    nextBtn.style.padding = '8px 16px';
    nextBtn.style.background = '#4f8cff';
    nextBtn.style.color = 'white';
    nextBtn.style.border = 'none';
    nextBtn.style.borderRadius = '4px';
    nextBtn.style.cursor = 'pointer';
    
    const blankGridBtn = document.createElement('button');
    blankGridBtn.textContent = 'Blank Grid';
    blankGridBtn.style.padding = '8px 16px';
    blankGridBtn.style.background = '#6c757d';
    blankGridBtn.style.color = 'white';
    blankGridBtn.style.border = 'none';
    blankGridBtn.style.borderRadius = '4px';
    blankGridBtn.style.cursor = 'pointer';
    blankGridBtn.style.marginLeft = '20px';
    
    navContainer.appendChild(prevBtn);
    navContainer.appendChild(solutionLabel);
    navContainer.appendChild(nextBtn);
    navContainer.appendChild(blankGridBtn);
    container.appendChild(navContainer);
    
    // Create solution grid container
    const solutionGridContainer = document.createElement('div');
    solutionGridContainer.style.display = 'flex';
    solutionGridContainer.style.justifyContent = 'center';
    solutionGridContainer.style.gap = '40px';
    solutionGridContainer.style.alignItems = 'flex-start';
    solutionGridContainer.style.overflow = 'auto';
    solutionGridContainer.style.maxWidth = '100vw';
    container.appendChild(solutionGridContainer);
    
    let currentSolutionIndex = 0;
    
    const displaySolution = (index) => {
        const solution = solutions[index];
        const grid = solution.grid;
        
        solutionLabel.textContent = `Solution ${index + 1} of ${solutions.length}`;
        
        // Update button states
        prevBtn.disabled = index === 0;
        nextBtn.disabled = index === solutions.length - 1;
        prevBtn.style.background = index === 0 ? '#ccc' : '#4f8cff';
        nextBtn.style.background = index === solutions.length - 1 ? '#ccc' : '#4f8cff';
        
        // Clear previous solution
        solutionGridContainer.innerHTML = '';
        
        // Create solution grid
        const solutionGrid = document.createElement('div');
        solutionGrid.className = 'tiles-grid';
        
        // Add solution title
        const solutionTitle = document.createElement('h4');
        solutionTitle.textContent = 'Solution Grid:';
        solutionTitle.style.marginBottom = '15px';
        solutionTitle.style.color = '#495057';
        solutionTitle.style.fontSize = '18px';
        solutionTitle.style.textAlign = 'center';
        
        const solutionSection = document.createElement('div');
        solutionSection.appendChild(solutionTitle);
        solutionSection.appendChild(solutionGrid);
        
        for (let row = 0; row < 10; row++) {
            for (let col = 0; col < 10; col++) {
                const tile = grid[row][col];
                if (tile) {
                    // Determine neighbor cuts for tabs
                    let neighborCuts = [0,0,0,0];
                    // Top neighbor (bottom edge)
                    if (row > 0 && grid[row-1][col]) neighborCuts[0] = grid[row-1][col][2] < 0 ? grid[row-1][col][2] : 0;
                    // Right neighbor (left edge)
                    if (col < 9 && grid[row][col+1]) neighborCuts[1] = grid[row][col+1][3] < 0 ? grid[row][col+1][3] : 0;
                    // Bottom neighbor (top edge)
                    if (row < 9 && grid[row+1][col]) neighborCuts[2] = grid[row+1][col][0] < 0 ? grid[row+1][col][0] : 0;
                    // Left neighbor (right edge)
                    if (col > 0 && grid[row][col-1]) neighborCuts[3] = grid[row][col-1][1] < 0 ? grid[row][col-1][1] : 0;
                    const cellIndex = `${row},${col}`;
                    const tileElement = createTileElement(tile, cellIndex, false, neighborCuts, index);
                    // For solution 2, add click event to allow image override
                    if (index === 1) {
                        tileElement.style.cursor = 'pointer';
                        tileElement.addEventListener('click', () => {
                            // Get all 4 rotations of the clicked cell's tile
                            const rotations = getAllRotations(tile);
                            const grid1 = solutions[0].grid;
                            let found = false;
                            let matchPos = null;
                            for (let r1 = 0; r1 < 10 && !found; r1++) {
                                for (let c1 = 0; c1 < 10 && !found; c1++) {
                                    const t1 = grid1[r1][c1];
                                    if (t1) {
                                        for (let rot of rotations) {
                                            if (arraysEqual(t1, rot)) {
                                                matchPos = [r1, c1];
                                                found = true;
                                                break;
                                            }
                                        }
                                    }
                                }
                            }
                            if (matchPos) {
                                solution2ImageOverrides[cellIndex] = matchPos;
                            }
                            // Re-render solution 2
                            displaySolution(1);
                        });
                    }
                    solutionGrid.appendChild(tileElement);
                } else {
                    // Empty cell
                    const emptyCell = document.createElement('div');
                    emptyCell.style.width = '60px';
                    emptyCell.style.height = '60px';
                    emptyCell.style.background = '#ddd';
                    emptyCell.style.border = '0.5px solid #999';
                    emptyCell.style.display = 'flex';
                    emptyCell.style.alignItems = 'center';
                    emptyCell.style.justifyContent = 'center';
                    emptyCell.style.boxSizing = 'border-box';
                    emptyCell.style.margin = '0';
                    emptyCell.style.padding = '0';
                    emptyCell.textContent = '?';
                    emptyCell.style.color = '#999';
                    solutionGrid.appendChild(emptyCell);
                }
            }
        }
        
        // Add download button above the solution
        const downloadBtn = document.createElement('button');
        downloadBtn.textContent = 'Download This Solution';
        downloadBtn.className = 'download-solution-btn';
        downloadBtn.style.marginBottom = '10px';
        downloadBtn.style.background = '#4CAF50';
        downloadBtn.style.color = 'white';
        downloadBtn.style.border = 'none';
        downloadBtn.style.borderRadius = '6px';
        downloadBtn.style.padding = '10px 24px';
        downloadBtn.style.fontSize = '1em';
        downloadBtn.style.cursor = 'pointer';
        downloadBtn.addEventListener('click', () => {
            const jsonString = JSON.stringify(solution, null, 2);
            const blob = new Blob([jsonString], { type: 'application/json' });
            const url = URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = `solution-${index + 1}.json`;
            document.body.appendChild(a);
            a.click();
            document.body.removeChild(a);
            URL.revokeObjectURL(url);
        });
        solutionSection.insertBefore(downloadBtn, solutionSection.firstChild);
        
        // Add download as PNG button above the solution
        const downloadPngBtn = document.createElement('button');
        downloadPngBtn.textContent = 'Download as PNG';
        downloadPngBtn.className = 'download-solution-btn';
        downloadPngBtn.style.marginBottom = '10px';
        downloadPngBtn.style.marginLeft = '10px';
        downloadPngBtn.style.background = '#2563eb';
        downloadPngBtn.style.color = 'white';
        downloadPngBtn.style.border = 'none';
        downloadPngBtn.style.borderRadius = '6px';
        downloadPngBtn.style.padding = '10px 24px';
        downloadPngBtn.style.fontSize = '1em';
        downloadPngBtn.style.cursor = 'pointer';
        downloadPngBtn.addEventListener('click', async () => {
            const tileSize = 100;
            const rows = 10, cols = 10;
            const canvas = document.createElement('canvas');
            canvas.width = cols * tileSize;
            canvas.height = rows * tileSize;
            const ctx = canvas.getContext('2d');
            for (let row = 0; row < rows; row++) {
                for (let col = 0; col < cols; col++) {
                    const tile = grid[row][col];
                    if (tile) {
                        let showImage = false;
                        let overrideRow = row, overrideCol = col;
                        if (index === 0) {
                            showImage = true;
                        } else if (index === 1 && solution2ImageOverrides && solution2ImageOverrides[`${row},${col}`]) {
                            showImage = true;
                            [overrideRow, overrideCol] = solution2ImageOverrides[`${row},${col}`];
                        } else if (index === 2 && window.solution3ImageOverrides && window.solution3ImageOverrides[`${row},${col}`]) {
                            showImage = true;
                            [overrideRow, overrideCol] = window.solution3ImageOverrides[`${row},${col}`];
                        } else if (index === 3 && window.solution4ImageOverrides && window.solution4ImageOverrides[`${row},${col}`]) {
                            showImage = true;
                            [overrideRow, overrideCol] = window.solution4ImageOverrides[`${row},${col}`];
                        } else {
                            const key = `${row},${col}`;
                            if (solution1PieceMap && solution1PieceMap[key] && solution1PieceMap[key] === tile.join(',')) {
                                showImage = true;
                            }
                        }
                        if (showImage && window.puzzleImage && window.puzzleImage.complete) {
                            // Draw the mapped image portion
                            ctx.drawImage(
                                window.puzzleImage,
                                overrideCol * tileSize, overrideRow * tileSize, tileSize, tileSize, // source
                                col * tileSize, row * tileSize, tileSize, tileSize // destination
                            );
                        } else {
                            // Draw the green SVG shape fallback
                            const svgString = (() => {
                                const size = tileSize;
                                const base = size;
                                const tabMin = size * 0.10;
                                const tabMax = size * 0.25;
                                const center = size / 2;
                                function getRadius(val) {
                                    const absVal = Math.abs(val);
                                    const clamped = Math.max(1, Math.min(absVal, 10));
                                    return tabMin + (tabMax - tabMin) * (clamped - 1) / 9;
                                }
                                let path = '';
                                let x = 0, y = 0;
                                path += `M${x},${y}`;
                                // Top edge
                                let topVal = tile[0];
                                if (topVal !== 0) {
                                    path += ` H${center - getRadius(topVal)}`;
                                    if (topVal > 0) {
                                        path += ` A${getRadius(topVal)},${getRadius(topVal)} 0 0,1 ${center + getRadius(topVal)},0`;
                                    } else {
                                        path += ` A${getRadius(topVal)},${getRadius(topVal)} 0 0,0 ${center + getRadius(topVal)},0`;
                                    }
                                    path += ` H${base}`;
                                } else {
                                    path += ` H${base}`;
                                }
                                // Right edge
                                let rightVal = tile[1];
                                if (rightVal !== 0) {
                                    path += ` V${center - getRadius(rightVal)}`;
                                    if (rightVal > 0) {
                                        path += ` A${getRadius(rightVal)},${getRadius(rightVal)} 0 0,1 ${base},${center + getRadius(rightVal)}`;
                                    } else {
                                        path += ` A${getRadius(rightVal)},${getRadius(rightVal)} 0 0,0 ${base},${center + getRadius(rightVal)}`;
                                    }
                                    path += ` V${base}`;
                                } else {
                                    path += ` V${base}`;
                                }
                                // Bottom edge
                                let bottomVal = tile[2];
                                if (bottomVal !== 0) {
                                    path += ` H${center + getRadius(bottomVal)}`;
                                    if (bottomVal > 0) {
                                        path += ` A${getRadius(bottomVal)},${getRadius(bottomVal)} 0 0,1 ${center - getRadius(bottomVal)},${base}`;
                                    } else {
                                        path += ` A${getRadius(bottomVal)},${getRadius(bottomVal)} 0 0,0 ${center - getRadius(bottomVal)},${base}`;
                                    }
                                    path += ` H0`;
                                } else {
                                    path += ` H0`;
                                }
                                // Left edge
                                let leftVal = tile[3];
                                if (leftVal !== 0) {
                                    path += ` V${center + getRadius(leftVal)}`;
                                    if (leftVal > 0) {
                                        path += ` A${getRadius(leftVal)},${getRadius(leftVal)} 0 0,1 0,${center - getRadius(leftVal)}`;
                                    } else {
                                        path += ` A${getRadius(leftVal)},${getRadius(leftVal)} 0 0,0 0,${center - getRadius(leftVal)}`;
                                    }
                                    path += ` V0`;
                                } else {
                                    path += ` V0`;
                                }
                                path += ' Z';
                                return `<svg xmlns='http://www.w3.org/2000/svg' width='${size}' height='${size}'><path d='${path}' fill='#4ade80' stroke='#22c55e' stroke-width='2'/></svg>`;
                            })();
                            const img = new window.Image();
                            await new Promise((resolve) => {
                                img.onload = resolve;
                                img.src = 'data:image/svg+xml;base64,' + btoa(svgString);
                            });
                            ctx.drawImage(img, col * tileSize, row * tileSize, tileSize, tileSize);
                        }
                    }
                }
            }
            // Download canvas as PNG
            const link = document.createElement('a');
            link.download = `solution-${index + 1}.png`;
            link.href = canvas.toDataURL('image/png');
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
        });
        solutionSection.insertBefore(downloadPngBtn, solutionSection.firstChild);
        
        // Add solution section to container
        solutionGridContainer.appendChild(solutionSection);
    };
    
    // Add event listeners
    prevBtn.addEventListener('click', () => {
        if (currentSolutionIndex > 0) {
            currentSolutionIndex--;
            displaySolution(currentSolutionIndex);
        }
    });
    
    nextBtn.addEventListener('click', () => {
        if (currentSolutionIndex < solutions.length - 1) {
            currentSolutionIndex++;
            displaySolution(currentSolutionIndex);
        }
    });
    
    blankGridBtn.addEventListener('click', () => {
        displayBlankGrid();
    });
    
    // Display first solution
    displaySolution(0);
    
    tilesDisplay.innerHTML = '';
    tilesDisplay.appendChild(container);
};

const countNumbersInSolution = (solution) => {
    const counts = {};
    for (let row of solution.grid) {
        for (let tile of row) {
            if (tile) {
                for (let num of tile) {
                    counts[num] = (counts[num] || 0) + 1;
                }
            }
        }
    }
    return counts;
};


function mergePieces(grid, x, y, direction) {
    let dx = x, dy = y;
    if (direction === 'right') dy += 1;
    else if (direction === 'left') dy -= 1;
    else if (direction === 'top') dx -= 1;
    else if (direction === 'bottom') dx += 1;
  
    if (dx < 0 || dx >= grid.length || dy < 0 || dy >= grid[0].length) return grid;
    if (!grid[x][y] || !grid[dx][dy]) return grid;
  
    console.log('Piece at (' + x + ',' + y + '):', grid[x][y]);
    console.log('Neighbor at (' + dx + ',' + dy + '):', grid[dx][dy]);
    // No actual merge is performed
  
    return grid;
  }
// Visual display functions
const createTileElement = (tile, index, highlight = false, neighborCuts = [0,0,0,0], solutionIndex = 0) => {
    const size = 100;
    const base = size;
    const tabMin = size * 0.10;
    const tabMax = size * 0.25;
    const center = size / 2;
  
    function getRadius(val) {
      const absVal = Math.abs(val);
      const clamped = Math.max(1, Math.min(absVal, 10));
      return tabMin + (tabMax - tabMin) * (clamped - 1) / 9;
    }
  
    let path = '';
    let x = 0, y = 0;
    path += `M${x},${y}`;
  
    // Top edge
    let topVal = tile[0];
    let topNeighbor = neighborCuts[0];
    if (topVal === 0 && topNeighbor !== 0) {
      path += ` H${center - getRadius(topNeighbor)}`;
      if (topNeighbor > 0) {
        path += ` A${getRadius(topNeighbor)},${getRadius(topNeighbor)} 0 0,1 ${center + getRadius(topNeighbor)},0`;
      } else {
        path += ` A${getRadius(topNeighbor)},${getRadius(topNeighbor)} 0 0,0 ${center + getRadius(topNeighbor)},0`;
      }
      path += ` H${base}`;
    } else if (topVal !== 0) {
      path += ` H${center - getRadius(topVal)}`;
      if (topVal > 0) {
        path += ` A${getRadius(topVal)},${getRadius(topVal)} 0 0,1 ${center + getRadius(topVal)},0`;
      } else {
        path += ` A${getRadius(topVal)},${getRadius(topVal)} 0 0,0 ${center + getRadius(topVal)},0`;
      }
      path += ` H${base}`;
    } else {
      path += ` H${base}`;
    }
    // Right edge
    let rightVal = tile[1];
    let rightNeighbor = neighborCuts[1];
    if (rightVal === 0 && rightNeighbor !== 0) {
        path += ` V${center - getRadius(rightNeighbor)}`;
        if (rightNeighbor > 0) {
            path += ` A${getRadius(rightNeighbor)},${getRadius(rightNeighbor)} 0 0,1 ${base},${center + getRadius(rightNeighbor)}`;
        } else {
            path += ` A${getRadius(rightNeighbor)},${getRadius(rightNeighbor)} 0 0,0 ${base},${center + getRadius(rightNeighbor)}`;
        }
        path += ` V${base}`;
    } else if (rightVal !== 0) {
        path += ` V${center - getRadius(rightVal)}`;
        if (rightVal > 0) {
            path += ` A${getRadius(rightVal)},${getRadius(rightVal)} 0 0,1 ${base},${center + getRadius(rightVal)}`;
        } else {
            path += ` A${getRadius(rightVal)},${getRadius(rightVal)} 0 0,0 ${base},${center + getRadius(rightVal)}`;
        }
        path += ` V${base}`;
    } else {
        path += ` V${base}`;
    }
    // Bottom edge
    let bottomVal = tile[2];
    let bottomNeighbor = neighborCuts[2];
    if (bottomVal === 0 && bottomNeighbor !== 0) {
        path += ` H${center + getRadius(bottomNeighbor)}`;
        if (bottomNeighbor > 0) {
            path += ` A${getRadius(bottomNeighbor)},${getRadius(bottomNeighbor)} 0 0,1 ${center - getRadius(bottomNeighbor)},${base}`;
        } else {
            path += ` A${getRadius(bottomNeighbor)},${getRadius(bottomNeighbor)} 0 0,0 ${center - getRadius(bottomNeighbor)},${base}`;
        }
        path += ` H0`;
    } else if (bottomVal !== 0) {
        path += ` H${center + getRadius(bottomVal)}`;
        if (bottomVal > 0) {
            path += ` A${getRadius(bottomVal)},${getRadius(bottomVal)} 0 0,1 ${center - getRadius(bottomVal)},${base}`;
        } else {
            path += ` A${getRadius(bottomVal)},${getRadius(bottomVal)} 0 0,0 ${center - getRadius(bottomVal)},${base}`;
        }
        path += ` H0`;
    } else {
        path += ` H0`;
    }
    // Left edge
    let leftVal = tile[3];
    let leftNeighbor = neighborCuts[3];
    if (leftVal === 0 && leftNeighbor !== 0) {
        path += ` V${center + getRadius(leftNeighbor)}`;
        if (leftNeighbor > 0) {
            path += ` A${getRadius(leftNeighbor)},${getRadius(leftNeighbor)} 0 0,1 0,${center - getRadius(leftNeighbor)}`;
        } else {
            path += ` A${getRadius(leftNeighbor)},${getRadius(leftNeighbor)} 0 0,0 0,${center - getRadius(leftNeighbor)}`;
        }
        path += ` V0`;
    } else if (leftVal !== 0) {
        path += ` V${center + getRadius(leftVal)}`;
        if (leftVal > 0) {
            path += ` A${getRadius(leftVal)},${getRadius(leftVal)} 0 0,1 0,${center - getRadius(leftVal)}`;
        } else {
            path += ` A${getRadius(leftVal)},${getRadius(leftVal)} 0 0,0 0,${center - getRadius(leftVal)}`;
        }
        path += ` V0`;
    } else {
        path += ` V0`;
    }
    path += ' Z';

    // SVG for notches: use a mask to cut out notches
    const svgNS = 'http://www.w3.org/2000/svg';
    const svg = document.createElementNS(svgNS, 'svg');
    svg.setAttribute('width', size);
    svg.setAttribute('height', size);
    svg.setAttribute('viewBox', `0 0 ${size} ${size}`);
    svg.style.display = 'block';
    svg.style.position = 'absolute';
    svg.style.top = '0';
    svg.style.left = '0';

    // Create a unique mask id
    const maskId = `mask-tile-${Math.random().toString(36).substr(2, 9)}`;
    const defs = document.createElementNS(svgNS, 'defs');
    const mask = document.createElementNS(svgNS, 'mask');
    mask.setAttribute('id', maskId);

    // Main tile shape in white (visible)
    const maskTile = document.createElementNS(svgNS, 'path');
    maskTile.setAttribute('d', path);
    maskTile.setAttribute('fill', 'white');
    mask.appendChild(maskTile);

    // For each edge, if it's a notch (negative value), add a black circle to the mask to cut it out
    const edges = ['top', 'right', 'bottom', 'left'];
    [tile[0], tile[1], tile[2], tile[3]].forEach((val, i) => {
        if (val < 0) {
            const r = getRadius(val);
            let cx = 0, cy = 0;
            if (i === 0) { cx = center; cy = 0; }
            if (i === 1) { cx = size; cy = center; }
            if (i === 2) { cx = center; cy = size; }
            if (i === 3) { cx = 0; cy = center; }
            const notchCircle = document.createElementNS(svgNS, 'circle');
            notchCircle.setAttribute('cx', cx);
            notchCircle.setAttribute('cy', cy);
            notchCircle.setAttribute('r', r);
            notchCircle.setAttribute('fill', 'black');
            mask.appendChild(notchCircle);
        }
    });
    defs.appendChild(mask);
    svg.appendChild(defs);

    // Draw the tile shape, using the mask
    const shape = document.createElementNS(svgNS, 'path');
    shape.setAttribute('d', path);
    shape.setAttribute('mask', `url(#${maskId})`);
    if (highlight) {
        shape.setAttribute('fill', '#4f8cff');
        shape.setAttribute('stroke', '#2563eb');
    } else {
        shape.setAttribute('fill', 'transparent');
    }
    shape.setAttribute('stroke-width', '2');
    svg.appendChild(shape);

    // For each edge, if neighborCuts has a negative value, add a tab (protrusion) to the SVG, reversed (mirrored)
    neighborCuts.forEach((val, i) => {
        if (val < 0) {
            const r = Math.abs(getRadius(val));
            let cx = 0, cy = 0, tabPath = '';
            if (i === 0) { // Top (tab should be upward)
                cx = center; cy = 0;
                // Draw upward semicircle (mirrored)
                tabPath = `M${cx + r},${cy} A${r},${r} 0 0,0 ${cx - r},${cy} Q${cx},${cy - r * 1.2} ${cx + r},${cy}`;
            } else if (i === 1) { // Right (tab should be rightward)
                cx = size; cy = center;
                // Draw rightward semicircle (mirrored)
                tabPath = `M${cx},${cy + r} A${r},${r} 0 0,0 ${cx},${cy - r} Q${cx + r * 1.2},${cy} ${cx},${cy + r}`;
            } else if (i === 2) { // Bottom (tab should be downward)
                cx = center; cy = size;
                // Draw downward semicircle (mirrored)
                tabPath = `M${cx - r},${cy} A${r},${r} 0 0,0 ${cx + r},${cy} Q${cx},${cy + r * 1.2} ${cx - r},${cy}`;
            } else if (i === 3) { // Left (tab should be leftward)
                cx = 0; cy = center;
                // Draw leftward semicircle (mirrored)
                tabPath = `M${cx},${cy - r} A${r},${r} 0 0,0 ${cx},${cy + r} Q${cx - r * 1.2},${cy} ${cx},${cy - r}`;
            }
            const tab = document.createElementNS(svgNS, 'path');
            tab.setAttribute('d', tabPath);
            tab.setAttribute('fill', '#e53935'); // Red fill for tabs
            tab.setAttribute('stroke', '#b71c1c'); // Darker red stroke
            tab.setAttribute('stroke-width', '2');
            svg.appendChild(tab);
        }
    });

    // For each edge, if the tile itself has a positive value, add a filled red outward semicircular tab (protrusion) to the SVG
    [tile[0], tile[1], tile[2], tile[3]].forEach((val, i) => {
        if (val > 0) {
            const r = getRadius(val);
            let tabPath = '';
            if (i === 0) { // Top (upwards)
                // Arc above the tile
                tabPath = `M${center - r},0 A${r},${r} 0 0,1 ${center + r},0 L${center},${-r} Z`;
            } else if (i === 1) { // Right (rightwards)
                tabPath = `M${size},${center - r} A${r},${r} 0 0,1 ${size},${center + r} L${size + r},${center} Z`;
            } else if (i === 2) { // Bottom (downwards)
                tabPath = `M${center + r},${size} A${r},${r} 0 0,1 ${center - r},${size} L${center},${size + r} Z`;
            } else if (i === 3) { // Left (leftwards)
                tabPath = `M0,${center + r} A${r},${r} 0 0,1 0,${center - r} L${-r},${center} Z`;
            }
            const tab = document.createElementNS(svgNS, 'path');
            tab.setAttribute('d', tabPath);
            tab.setAttribute('fill', '#e53935'); // Red fill for tabs
            tab.setAttribute('stroke', 'none');
            svg.appendChild(tab);
        }
    });

    
    // Draw the outline (stroke) as a separate path, omitting the arc, diameter, and edge line for notched edges (true gap for the cut)
    let outlinePath = '';
    let x0 = 0, y0 = 0;
    let x1 = size, y1 = 0;
    let x2 = size, y2 = size;
    let x3 = 0, y3 = size;
    let c = center;
    // Top edge
    if (tile[0] < 0) {
        let r = getRadius(tile[0]);
        // Draw from top-left to start of notch
        outlinePath += `M${x0},${y0}L${c - r},${y0}`;
        // Skip the notch (no line, no arc, no diameter, no edge)
        // Resume from end of notch to top-right
        outlinePath += `M${c + r},${y0}L${x1},${y1}`;
    } else {
        outlinePath += `M${x0},${y0}L${x1},${y1}`;
    }
    // Right edge
    if (tile[1] < 0) {
        let r = getRadius(tile[1]);
        // Draw from top-right to start of notch
        outlinePath += `M${x1},${y1}L${x1},${c - r}`;
        // Skip the notch (no line, no arc, no diameter, no edge)
        // Resume from end of notch to bottom-right
        outlinePath += `M${x1},${c + r}L${x2},${y2}`;
    } else {
        outlinePath += `M${x1},${y1}L${x2},${y2}`;
    }
    // Bottom edge
    if (tile[2] < 0) {
        let r = getRadius(tile[2]);
        // Draw from bottom-right to start of notch
        outlinePath += `M${x2},${y2}L${c + r},${y2}`;
        // Skip the notch (no line, no arc, no diameter, no edge)
        // Resume from end of notch to bottom-left
        outlinePath += `M${c - r},${y2}L${x3},${y3}`;
    } else {
        outlinePath += `M${x2},${y2}L${x3},${y3}`;
    }
    // Left edge
    if (tile[3] < 0) {
        let r = getRadius(tile[3]);
        // Draw from bottom-left to start of notch
        outlinePath += `M${x3},${y3}L${x3},${c + r}`;
        // Skip the notch (no line, no arc, no diameter, no edge)
        // Resume from end of notch to top-left
        outlinePath += `M${x3},${c - r}L${x0},${y0}`;
    } else {
        outlinePath += `M${x3},${y3}L${x0},${y0}`;
    }
    const outline = document.createElementNS(svgNS, 'path');
    outline.setAttribute('d', outlinePath);
    outline.setAttribute('fill', 'none');
    outline.setAttribute('stroke', highlight ? '#2563eb' : '#333');
    outline.setAttribute('stroke-width', '2');
    svg.appendChild(outline);

    // Create a container div for positioning
    const tileDiv = document.createElement('div');
    tileDiv.className = 'tile';
    tileDiv.style.position = 'relative';
    tileDiv.style.width = size + 'px';
    tileDiv.style.height = size + 'px';
    tileDiv.dataset.tileIndex = index;
    tileDiv.appendChild(svg);

    // Add tile index
    const indexSpan = document.createElement('span');
    indexSpan.className = 'tile-index';
    indexSpan.textContent = index;
    tileDiv.appendChild(indexSpan);

    // Add edge numbers (as before)
    edges.forEach((edge, i) => {
        const value = tile[i];
        const numberDiv = document.createElement('div');
        numberDiv.className = `tile-number ${edge}`;
        if (value > 0) {
            numberDiv.textContent = '+' + value;
            numberDiv.classList.add('positive');
        } else if (value < 0) {
            numberDiv.textContent = value;
            numberDiv.classList.add('negative');
        } else {
            numberDiv.textContent = '0';
            numberDiv.classList.add('zero');
        }
        tileDiv.appendChild(numberDiv);
    });

    // Replace the existing image display logic in createTileElement
    if (puzzleImage) {
        let row = 0, col = 0;
        if (typeof index === 'string' && index.includes(',')) {
            [row, col] = index.split(',').map(Number);
        } else if (!isNaN(index)) {
            row = Math.floor(index / 10);
            col = index % 10;
        }

        let showImage = false;
        let imagePosition = [row, col];

        // Check solution-specific mappings
        if (solutionImageMappings[solutionIndex] && 
            solutionImageMappings[solutionIndex][`${row},${col}`]) {
            showImage = true;
            imagePosition = solutionImageMappings[solutionIndex][`${row},${col}`];
        }
        // Default to showing image for first solution
        else if (solutionIndex === 0) {
            showImage = true;
        }

        if (showImage) {
            tileDiv.style.backgroundImage = `url('${puzzleImage.src}')`;
            tileDiv.style.backgroundSize = `1000px 1000px`;
            tileDiv.style.backgroundPosition = `-${imagePosition[1] * 100}px -${imagePosition[0] * 100}px`;
            tileDiv.style.backgroundRepeat = 'no-repeat';
        }
    }

    return tileDiv;
};

function displaySingleTile(index) {
    const tilesDisplay = document.getElementById('tilesDisplay');
    tilesDisplay.innerHTML = '';
    const container = document.createElement('div');
    container.className = 'single-tile-container';
    
    const tileElement = createTileElement(tilesData[index], index, true);
    tileElement.style.width = '200px';
    tileElement.style.height = '200px';
    
    container.appendChild(tileElement);
    
    // Add title
    const titleDiv = document.createElement('h3');
    titleDiv.textContent = `Tile #${index}`;
    titleDiv.style.marginBottom = '20px';
    container.insertBefore(titleDiv, container.firstChild);
    
    // Add explanation
    const explanationDiv = document.createElement('div');
    explanationDiv.innerHTML = '<p>+ indicates "in" (tab)</p><p>- indicates "out" (notch)</p><p>0 indicates flat edge</p>';
    explanationDiv.className = 'tile-explanation';
    container.appendChild(explanationDiv);
    
    // Add rotation controls
    const rotationControls = document.createElement('div');
    rotationControls.className = 'rotation-controls';
    rotationControls.innerHTML = `
        <button class="rotate-btn" data-direction="left">↺ Rotate Left</button>
        <button class="rotate-btn" data-direction="right">↻ Rotate Right</button>
    `;
    container.appendChild(rotationControls);
    
    // Add event listeners for rotation
    rotationControls.querySelectorAll('.rotate-btn').forEach(btn => {
        btn.addEventListener('click', () => {
            const direction = btn.dataset.direction;
            const currentTile = tilesData[index];
            
            // Rotate the tile data
            if (direction === 'left') {
                tilesData[index] = [currentTile[3], currentTile[0], currentTile[1], currentTile[2]];
            } else {
                tilesData[index] = [currentTile[1], currentTile[2], currentTile[3], currentTile[0]];
            }
            
            // Re-display the tile with new rotation
            displaySingleTile(index);
        });
    });
    
    tilesDisplay.appendChild(container);
}

const displayManualSolvingInterface = () => {
    const tilesDisplay = document.getElementById('tilesDisplay');
    tilesDisplay.innerHTML = '';
    
    const container = document.createElement('div');
    container.className = 'manual-solving-area';
    
    // Add header
    const header = document.createElement('h3');
    header.textContent = 'Manual Puzzle Solving';
    container.appendChild(header);
    
    // Add instructions
    const instructions = document.createElement('p');
    instructions.innerHTML = 'Drag pieces from below and drop them onto the grid. <br>Remember: + (blue tab) connects with - (red notch).';
    container.appendChild(instructions);
    
    // Add pieces container
    const piecesContainer = document.createElement('div');
    piecesContainer.className = 'pieces-container';
    
    // Add puzzle pieces
    tilesData.forEach((tile, index) => {
        const tileElement = createTileElement(tile, index);
        tileElement.classList.add('draggable');
        tileElement.style.transform = 'scale(0.8)';
        
        // Add drag functionality
        tileElement.setAttribute('draggable', true);
        tileElement.addEventListener('dragstart', (e) => {
            e.dataTransfer.setData('text/plain', index);
            setTimeout(() => {
                tileElement.classList.add('dragging');
            }, 0);
        });
        tileElement.addEventListener('dragend', () => {
            tileElement.classList.remove('dragging');
        });
        
        piecesContainer.appendChild(tileElement);
    });
    
    container.appendChild(piecesContainer);
    
    // Add puzzle grid
    const puzzleGrid = document.createElement('div');
    puzzleGrid.className = 'puzzle-grid';
    
    // Create 10x10 grid
    for (let row = 0; row < 10; row++) {
        for (let col = 0; col < 10; col++) {
            const cell = document.createElement('div');
            cell.className = 'grid-cell';
            cell.dataset.row = row;
            cell.dataset.col = col;
            
            // Add drop functionality
            cell.addEventListener('dragover', (e) => {
                e.preventDefault();
                cell.classList.add('highlight');
            });
            
            cell.addEventListener('dragleave', () => {
                cell.classList.remove('highlight');
            });
            
            cell.addEventListener('drop', (e) => {
                e.preventDefault();
                cell.classList.remove('highlight');
                const tileIndex = e.dataTransfer.getData('text/plain');
                
                // Check if this is a valid placement
                // For now, just place the tile
                if (!cell.hasChildNodes()) {
                    const tileElement = createTileElement(tilesData[tileIndex], tileIndex);
                    tileElement.style.width = '58px';
                    tileElement.style.height = '58px';
                    tileElement.style.margin = '0';
                    cell.appendChild(tileElement);
                }
            });
            
            puzzleGrid.appendChild(cell);
        }
    }
    
    container.appendChild(puzzleGrid);
    
    // Add button to check solution
    const checkButton = document.createElement('button');
    checkButton.textContent = 'Check Solution';
    checkButton.className = 'check-solution-btn';
    checkButton.style.marginTop = '20px';
    checkButton.style.padding = '10px 20px';
    checkButton.style.background = '#4f8cff';
    checkButton.style.color = '#fff';
    checkButton.style.border = 'none';
    checkButton.style.borderRadius = '6px';
    checkButton.style.cursor = 'pointer';
    
    checkButton.addEventListener('click', () => {
        // Logic to check if the manual solution is correct
        alert('This feature is still being developed!');
    });
    
    container.appendChild(checkButton);
    
    tilesDisplay.appendChild(container);
};

const displayAllTiles = () => {
    const tilesDisplay = document.getElementById('tilesDisplay');
    tilesDisplay.innerHTML = '';
    
    const container = document.createElement('div');
    container.style.textAlign = 'center';
    
    const explanation = document.createElement('div');
    explanation.innerHTML = '<h3>Jigswan Puzzle Pieces</h3><p>+ (blue) indicates "in" (tab)</p><p>- (red) indicates "out" (notch)</p><p>0 (gray) indicates flat edge</p>';
    explanation.style.marginBottom = '20px';
    container.appendChild(explanation);
    
    const grid = document.createElement('div');
    grid.className = 'tiles-grid';
    
    tilesData.forEach((tile, index) => {
        const tileElement = createTileElement(tile, index);
        grid.appendChild(tileElement);
    });
    
    container.appendChild(grid);
    
    // Add manual solving button
    const manualSolveButton = document.createElement('button');
    manualSolveButton.textContent = 'Try Solving Manually';
    manualSolveButton.style.marginTop = '20px';
    manualSolveButton.style.padding = '10px 20px';
    manualSolveButton.style.background = '#4CAF50';
    manualSolveButton.style.color = 'white';
    manualSolveButton.style.border = 'none';
    manualSolveButton.style.borderRadius = '4px';
    manualSolveButton.style.cursor = 'pointer';
    
    manualSolveButton.addEventListener('click', displayManualSolvingInterface);
    
    container.appendChild(manualSolveButton);
    tilesDisplay.appendChild(container);
};

const displayBlankGrid = () => {
    const tilesDisplay = document.getElementById('tilesDisplay');
    tilesDisplay.innerHTML = '';
    
    const container = document.createElement('div');
    container.style.padding = '20px';
    container.style.maxWidth = '800px';
    container.style.margin = '0 auto';
    container.style.textAlign = 'center';
    
    const title = document.createElement('h2');
    title.textContent = 'Blank 10x10 Grid';
    title.style.color = '#495057';
    title.style.marginBottom = '30px';
    container.appendChild(title);
    
    const grid = document.createElement('div');
    grid.style.display = 'grid';
    grid.style.gridTemplateColumns = 'repeat(10, 1fr)';
    grid.style.gap = '4px';
    grid.style.maxWidth = 'fit-content';
    grid.style.margin = '0 auto';
    grid.style.padding = '10px';
    grid.style.background = 'white';
    grid.style.borderRadius = '6px';
    
    // Get the first solution grid
    const solutionGrid = globalSolutions.length > 0 ? globalSolutions[0].grid : null;
    
    for (let row = 0; row < 10; row++) {
        for (let col = 0; col < 10; col++) {
            const cell = document.createElement('div');
            cell.style.width = '60px';
            cell.style.height = '60px';
            cell.style.background = 'white';
            cell.style.display = 'flex';
            cell.style.alignItems = 'center';
            cell.style.justifyContent = 'center';
            cell.style.cursor = 'pointer';
            cell.style.border = '1px solid #000';
            cell.style.position = 'relative';
            
            // Check edges for -1 and add semicircle cuts for all tiles in the solution
            if (solutionGrid && solutionGrid[row][col]) {
                const tile = solutionGrid[row][col];
                const edgeLength = 60;
                const radius = edgeLength / 6; // 10px radius
                const cx = edgeLength / 2;
                const cy = edgeLength / 2;
                // For each edge: 0=top, 1=right, 2=bottom, 3=left
                tile.forEach((value, index) => {
                    if (value === -1) {
                        const cut = document.createElementNS("http://www.w3.org/2000/svg", "svg");
                        cut.setAttribute("width", `${edgeLength}`);
                        cut.setAttribute("height", `${edgeLength}`);
                        cut.style.position = "absolute";
                        cut.style.left = "0";
                        cut.style.top = "0";
                        cut.style.pointerEvents = "none";
                        let pathStr = "";

                        // Add path data based on edge
                        switch(index) {
                            case 0: // Top
                                pathStr = `M${cx},${cy} m${-radius},0 a${radius},${radius} 0 0,0 ${radius*2},0`;
                                break;
                            case 1: // Right
                                pathStr = `M${cx},${cy} m0,${-radius} a${radius},${radius} 0 0,0 0,${radius*2}`;
                                break;
                            case 2: // Bottom
                                pathStr = `M${cx},${cy} m${-radius},0 a${radius},${radius} 0 0,1 ${radius*2},0`;
                                break;
                            case 3: // Left
                                pathStr = `M${cx},${cy} m0,${-radius} a${radius},${radius} 0 0,1 0,${radius*2}`;
                                break;
                        }

                        const path = document.createElementNS("http://www.w3.org/2000/svg", "path");
                        path.setAttribute("d", pathStr);
                        path.setAttribute("fill", "none");
                        path.setAttribute("stroke", "#000");
                        path.setAttribute("stroke-width", "2");

                        cut.appendChild(path);
                        cell.appendChild(cut);
                    }
                });
            }
            
            // Add hover effect
            cell.addEventListener('mouseenter', () => {
                cell.style.background = '#e9ecef';
            });
            cell.addEventListener('mouseleave', () => {
                cell.style.background = 'white';
            });
            
            grid.appendChild(cell);
        }
    }
    
    container.appendChild(grid);
    
    // Add back button
    const backBtn = document.createElement('button');
    backBtn.textContent = '← Back';
    backBtn.style.padding = '10px 20px';
    backBtn.style.background = '#007bff';
    backBtn.style.color = 'white';
    backBtn.style.border = 'none';
    backBtn.style.borderRadius = '4px';
    backBtn.style.cursor = 'pointer';
    backBtn.style.marginTop = '20px';
    backBtn.addEventListener('click', () => {
        tilesDisplay.innerHTML = '';
    });
    
    container.appendChild(backBtn);
    tilesDisplay.appendChild(container);
};

let tilesData = [
    [0, -1, 1, 0], [0, -6, -9, 1], [0, -3, -5, 6], [0, 8, 9, 3], [0, 2, -5, -8], [0, -6, 3, -2], [0, -2, 2, 6], [0, 1, -5, 2], [0, 8, 8, -1], [0, 0, 9, -8],
    [-1, 10, -8, 0], [9, 10, -1, -10], [5, 10, -10, -10], [-9, 7, 1, -10], [5, -3, 9, -7], [-3, -2, -5, 3], [-2, 8, 6, 2], [5, 10, -9, -8], [-8, -2, 2, -10], [-9, 0, 4, 2],
    [8, 7, -2, 0], [1, 1, 1, -7], [10, 1, -10, -1], [-1, -3, 10, -1], [-9, -4, -4, 3], [5, 5, -5, 4], [-6, -8, 9, -5], [9, 2, -4, 8], [-2, 8, 6, -2], [-4, 0, 7, -8],
    [2, 7, 5, 0], [-1, -4, -4, -7], [10, 9, -3, 4], [-10, -4, -7, -9], [4, 4, 10, 4], [5, -5, 7, -4], [-9, -1, 5, 5], [4, 5, 10, 1], [-6, 3, 3, -5], [-7, 0, 4, -3],
    [-5, 1, -5, 0], [4, -2, -3, -1], [3, -1, -10, 2], [7, -6, 5, 1], [-10, 1, 6, 6], [-7, 7, 10, -1], [-5, 9, 8, -7], [-10, -7, -4, -9], [-3, -1, 1, 7], [-4, 0, 8, 1],
    [5, 10, 7, 0], [3, 3, -10, -10], [10, 3, -8, -3], [-5, 2, -2, -3], [-6, -3, -9, -2], [-10, -7, 7, 3], [-8, -6, 4, 7], [4, -10, 9, 6], [-1, 5, -6, 10], [-8, 0, -4, -5],
    [-7, -2, -10, 0], [10, 5, 1, 2], [8, -5, 4, -5], [2, -7, -5, 5], [9, 5, -10, 7], [-7, 1, 4, -5], [-4, -7, 8, -1], [-9, -1, -5, 7], [6, 3, 5, 1], [4, 0, -8, -3],
    [10, 6, 9, 0], [-1, 9, -8, -6], [-4, -4, 9, -9], [5, -5, -10, 4], [10, 10, 5, 5], [-4, 2, 1, -10], [-8, 5, -8, -2], [5, 7, -9, -5], [-5, -7, 1, -7], [8, 0, -10, 7],
    [-9, 2, -5, 0], [8, 5, 4, -2], [-9, -7, 9, -5], [10, 3, 1, 7], [-5, -7, 6, -3], [-1, -1, -5, 7], [8, 9, 5, 1], [9, -6, 7, -9], [-1, -6, 8, 6], [10, 0, 7, 6],
    [5, 2, 0, 0], [-4, -1, 0, -2], [-9, 8, 0, 1], [-1, -6, 0, -8], [-6, 4, 0, 6], [5, 3, 0, -4], [-5, 8, 0, -3], [-7, -6, 0, -8], [-8, 4, 0, 6], [-7, 0, 0, -4]
]  
getSolutions(tilesData)
console.log(tilesData.length)

// Helper function to check if two arrays have the same elements (ignoring order)
function arraysHaveSameElements(arr1, arr2) {
    if (!arr1 || !arr2 || arr1.length !== arr2.length) return false;
    const sorted1 = [...arr1].sort((a, b) => a - b);
    const sorted2 = [...arr2].sort((a, b) => a - b);
    for (let i = 0; i < sorted1.length; i++) {
        if (sorted1[i] !== sorted2[i]) return false;
    }
    return true;
}

// Helper function to get all 4 rotations of a tile
function getAllRotations(tile) {
    let rots = [];
    let t = tile.slice();
    for (let i = 0; i < 4; i++) {
        rots.push(t.slice());
        t = [t[3], t[0], t[1], t[2]]; // rotate clockwise
    }
    return rots;
}

// Helper function to check if two arrays are equal
function arraysEqual(a, b) {
    if (!a || !b || a.length !== b.length) return false;
    for (let i = 0; i < a.length; i++) {
        if (a[i] !== b[i]) return false;
    }
    return true;
}

let target = [0,2,-5,-8].join(',');
let found = null;
let grid2 = globalSolutions[1].grid;
for (let r = 0; r < 10; r++) {
  for (let c = 0; c < 10; c++) {
    if (grid2[r][c] && grid2[r][c].join(',') === target) {
      found = [r, c];
      break;
    }
  }
  if (found) break;
}
console.log('The position of [0,2,-5,-8] in solution 2 is:', found);

async function processImage(file) {
    return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = async function(e) {
            try {
                const img = new Image();
                img.onload = function() {
                    // Process the image and extract tile data
                    const tiles = extractTilesFromImage(img);
                    resolve(tiles);
                };
                img.onerror = reject;
                img.src = e.target.result;
            } catch (error) {
                reject(error);
            }
        };
        reader.onerror = reject;
        reader.readAsDataURL(file);
    });
}

async function findPuzzleSolutions(tilesData) {
    // Implement your puzzle solving algorithm here
    // This should return an array of solutions
    return new Promise((resolve) => {
        // Example solution format:
        const solutions = [
            {
                grid: [], // 2D array of tile positions
                rotation: [], // Rotation information for each tile
                score: 100 // Solution score/fitness
            }
        ];
        resolve(solutions);
    });
}

function extractTilesFromImage(img) {
    // Implement image processing logic here
    // This should return an array of tile data
    return [];
}

function mapImagesAcrossSolutions() {
    if (!globalSolutions || globalSolutions.length === 0) return;

    const solution1Grid = globalSolutions[0].grid;
    // Reset mappings
    solutionImageMappings = { 0: {} };

    // Map all solutions after the first
    for (let solIdx = 1; solIdx < globalSolutions.length; solIdx++) {
        solutionImageMappings[solIdx] = {};
        const currentGrid = globalSolutions[solIdx].grid;
        for (let row = 0; row < 10; row++) {
            for (let col = 0; col < 10; col++) {
                const currentTile = currentGrid[row][col];
                if (!currentTile) continue;
                // Get all rotations of current tile
                const rotations = [];
                let t = [...currentTile];
                for (let i = 0; i < 4; i++) {
                    rotations.push(t.join(','));
                    t = [t[3], t[0], t[1], t[2]];
                }
                // Find matching tile in solution 1
                let found = false;
                for (let r1 = 0; r1 < 10 && !found; r1++) {
                    for (let c1 = 0; c1 < 10 && !found; c1++) {
                        const tile1 = solution1Grid[r1][c1];
                        if (tile1 && rotations.includes(tile1.join(','))) {
                            solutionImageMappings[solIdx][`${row},${col}`] = [r1, c1];
                            found = true;
                        }
                    }
                }
            }
        }
    }
}



