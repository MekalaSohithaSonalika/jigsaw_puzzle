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
                    const tileElement = createTileElement(tile, `${row},${col}`);
                    // Do not override tile styles; use .tile CSS
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

// Visual display functions
const createTileElement = (tile, index) => {
    const tileDiv = document.createElement('div');
    tileDiv.className = 'tile';
    tileDiv.dataset.tileIndex = index;
    
    // Add tile index
    const indexSpan = document.createElement('span');
    indexSpan.className = 'tile-index';
    indexSpan.textContent = index;
    tileDiv.appendChild(indexSpan);
    
    // Add symbols for each edge
    const edges = ['top', 'right', 'bottom', 'left'];
    edges.forEach((edge, i) => {
        const value = tile[i];
        const numberDiv = document.createElement('div');
        numberDiv.className = `tile-number ${edge}`;
        
        // Show + for in (positive) and - for out (negative)
        if (value > 0) {
            numberDiv.textContent = '+' + value;
            numberDiv.classList.add('positive');
        } else if (value < 0) {
            numberDiv.textContent = value; // Already has negative sign
            numberDiv.classList.add('negative');
            // Add visual notch for "out" pieces
            const notchDiv = document.createElement('div');
            notchDiv.className = `tile-notch ${edge}`;
            // Temporarily append to tile to get correct size
            tileDiv.appendChild(notchDiv);
            // Use actual rendered tile size
            const tileSize = tileDiv.offsetWidth || 100;
            const minRadius = tileSize * 0.10; // 10% of tile size
            const maxRadius = tileSize * 0.25; // 25% of tile size
            const absVal = Math.abs(value);
            const clamped = Math.max(1, Math.min(absVal, 10));
            const radius = minRadius + (maxRadius - minRadius) * (clamped - 1) / 9;
            // Set size and position for perfect centering and edge alignment
            notchDiv.style.boxSizing = 'content-box';
            notchDiv.style.pointerEvents = 'none';
            if (edge === 'top' || edge === 'bottom') {
                notchDiv.style.width = `${radius * 2}px`;
                notchDiv.style.height = `${radius}px`;
                notchDiv.style.left = '50%';
                notchDiv.style.transform = 'translateX(-50%)';
                notchDiv.style.position = 'absolute';
                if (edge === 'top') notchDiv.style.top = '0';
                if (edge === 'bottom') notchDiv.style.bottom = '0';
                notchDiv.style.borderRadius = edge === 'top'
                    ? `0 0 ${radius}px ${radius}px`
                    : `${radius}px ${radius}px 0 0`;
            } else {
                notchDiv.style.width = `${radius}px`;
                notchDiv.style.height = `${radius * 2}px`;
                notchDiv.style.top = '50%';
                notchDiv.style.transform = 'translateY(-50%)';
                notchDiv.style.position = 'absolute';
                if (edge === 'left') notchDiv.style.left = '0';
                if (edge === 'right') notchDiv.style.right = '0';
                notchDiv.style.borderRadius = edge === 'left'
                    ? `0 ${radius}px ${radius}px 0`
                    : `${radius}px 0 0 ${radius}px`;
            }
        } else {
            numberDiv.textContent = '0';
            numberDiv.classList.add('zero');
        }
        
        tileDiv.appendChild(numberDiv);
    });
    
    return tileDiv;
};

function displaySingleTile(index) {
    const tilesDisplay = document.getElementById('tilesDisplay');
    tilesDisplay.innerHTML = '';
    const container = document.createElement('div');
    container.className = 'single-tile-container';
    
    const tileElement = createTileElement(tilesData[index], index);
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



