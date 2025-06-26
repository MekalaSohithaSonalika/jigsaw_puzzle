// Tile visualization functions
function getTilePath(tile) {
    const [north, east, south, west] = tile;
    const scale = 5;
    let pathData = 'M0,0 ';

    // North edge: inward curve for negative values
    if (north !== 0) {
        pathData += `Q50,${-north * scale} 100,0 `;
    } else {
        pathData += 'L100,0 ';
    }

    // East edge: inward curve for negative values
    if (east !== 0) {
        pathData += `Q${100 + east * scale},50 100,100 `;
    } else {
        pathData += 'L100,100 ';
    }

    // South edge: inward curve for negative values
    if (south !== 0) {
        pathData += `Q50,${100 + south * scale} 0,100 `;
    } else {
        pathData += 'L0,100 ';
    }

    // West edge: inward curve for negative values
    if (west !== 0) {
        pathData += `Q${-west * scale},50 0,0 `;
    } else {
        pathData += 'L0,0 ';
    }

    return pathData;
}


function displaySolution(solution, index) {
    const container = document.createElement('div');
    container.className = 'solution-container';
    container.innerHTML = `<h2>Solution ${index + 1}</h2>`;
    
    const gridContainer = document.createElement('div');
    gridContainer.className = 'tile-grid';
    
    solution.grid.forEach((row, i) => {
        row.forEach((tile, j) => {
            const tileDiv = document.createElement('div');
            tileDiv.className = 'tile';
            
            if (tile) {
                const svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
                svg.setAttribute('viewBox', '-20 -20 140 140'); // Extra space for outward curves
                svg.setAttribute('class', 'tile-svg');
                
                // Draw tile with edge modifications
                const path = document.createElementNS('http://www.w3.org/2000/svg', 'path');
                path.setAttribute('d', getTilePath(tile));
                path.setAttribute('fill', '#3498db');
                path.setAttribute('stroke', '#2c3e50');
                svg.appendChild(path);
                
                // Add edge value indicators
                tile.forEach((value, edgeIndex) => {
                    const text = document.createElement('div');
                    text.className = `edge-value ${['north','east','south','west'][edgeIndex]}`;
                    text.textContent = value;
                    tileDiv.appendChild(text);
                });
                
                tileDiv.appendChild(svg);
            }
            
            gridContainer.appendChild(tileDiv);
        });
    });
    
    container.appendChild(gridContainer);
    document.getElementById('solutions-container').appendChild(container);
}

// Tile puzzle solver (your original code)
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

const getSolutions = (data) => {
    let size = [5, 5]
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
    
    // Display each solution
    solutions.forEach((solution, index) => {
        displaySolution(solution, index);
    });
    
    return solutions;
}

// Tile data
const tilesData = [
    [0, 1, -1, 0], [0, 1, -2, -1], [0, 1, -5, -1], [0, -3, 5, -1], [0, 0, 6, 3],
    [1, -6, -7, 0], [2, 2, 5, 6], [5, -5, -2, -2], [-5, 4, -3, 5], [-6, 0, -4, -4],
    [7, -6, -7, 0], [-5, -5, -5, 6], [2, -2, 4, 5], [3, -3, -6, 2], [4, 0, 1, 3],
    [7, -4, 4, 0], [5, -2, 3, 4], [-4, -3, -2, 2], [6, -3, -4, 3], [-1, 0, 7, 3],
    [-4, -7, 0, 0], [-3, -7, 0, 7], [2, -6, 0, 7], [4, -1, 0, 6], [-7, 0, 0, 1]
]

// Get the number of solutions and display it at the top
function updateSolutionCount() {
    const count = getSolutions(tilesData).length;
    const countDiv = document.getElementById('solution-count');
    if (countDiv) {
        countDiv.textContent = `Number of possible solutions: ${count}`;
    }
}

// Initialize on load
window.onload = () => {
    updateSolutionCount();
    getSolutions(tilesData);
};

// --- IMAGE PUZZLE PIECE LOGIC ---

// Store the uploaded image globally
let uploadedImage = null;

// Listen for image upload
const imageInput = document.getElementById('image-upload');
if (imageInput) {
    imageInput.addEventListener('change', function(event) {
        const file = event.target.files[0];
        if (!file) return;
        const reader = new FileReader();
        reader.onload = function(e) {
            const img = new Image();
            img.onload = function() {
                uploadedImage = img;
                // After image is loaded, show only Solution 1 with the image as puzzle pieces
                displayImagePuzzle();
            };
            img.src = e.target.result;
        };
        reader.readAsDataURL(file);
    });
}

// Helper: Parse SVG path string (M, L, Q) and draw on canvas context, scaled to w/h
function drawSvgPathOnContext(ctx, svgPath, w, h) {
    // The path is in 100x100 coordinates, scale to w/h
    const scaleX = w / 100;
    const scaleY = h / 100;
    const commands = svgPath.match(/[MLQZmlqz][^MLQZmlqz]*/g);
    let current = [0, 0];
    if (!commands) return;
    ctx.beginPath();
    for (let cmd of commands) {
        const type = cmd[0];
        const nums = cmd.slice(1).trim().split(/[ ,]+/).map(Number);
        if (type === 'M' || type === 'm') {
            current = [nums[0] * scaleX, nums[1] * scaleY];
            ctx.moveTo(current[0], current[1]);
        } else if (type === 'L' || type === 'l') {
            current = [nums[0] * scaleX, nums[1] * scaleY];
            ctx.lineTo(current[0], current[1]);
        } else if (type === 'Q' || type === 'q') {
            // Quadratic curve: Q cx,cy x,y
            const cx = nums[0] * scaleX;
            const cy = nums[1] * scaleY;
            const x = nums[2] * scaleX;
            const y = nums[3] * scaleY;
            ctx.quadraticCurveTo(cx, cy, x, y);
            current = [x, y];
        } else if (type === 'Z' || type === 'z') {
            ctx.closePath();
        }
    }
    ctx.closePath();
}

// Update displayImagePuzzle to show the full image for each solution, and overlay the puzzle-piece borders (in their correct shapes and positions) on top of the image, without cutting the image into pieces.
function displayImagePuzzle() {
    if (!uploadedImage) return;
    // Get all solutions
    const solutions = getSolutions(tilesData);
    if (!solutions.length) return;

    // Clear previous solutions
    const solutionsContainer = document.getElementById('solutions-container');
    solutionsContainer.innerHTML = '';

    // --- Step 1: For solution 1, cut the image into pieces and store them in row-major order ---
    const solution1 = solutions[0];
    const grid1 = solution1.grid;
    const rows = grid1.length;
    const cols = grid1[0].length;
    const pieceWidth = Math.floor(uploadedImage.width / cols);
    const pieceHeight = Math.floor(uploadedImage.height / rows);
    // Array of canvases in row-major order
    const solution1Pieces = [];

    // Prepare solution 1 canvas
    const sol1Div = document.createElement('div');
    sol1Div.className = 'solution-container';
    const label1 = document.createElement('h2');
    label1.textContent = `Solution 1`;
    sol1Div.appendChild(label1);
    const canvas1 = document.createElement('canvas');
    canvas1.width = uploadedImage.width;
    canvas1.height = uploadedImage.height;
    const ctx1 = canvas1.getContext('2d');
    ctx1.drawImage(uploadedImage, 0, 0, uploadedImage.width, uploadedImage.height);

    // For each piece in solution 1, extract the image piece and store it in row-major order
    for (let i = 0; i < rows; i++) {
        for (let j = 0; j < cols; j++) {
            const tile = grid1[i][j];
            if (!tile) continue;
            // Create an offscreen canvas for the piece
            const pieceCanvas = document.createElement('canvas');
            pieceCanvas.width = pieceWidth;
            pieceCanvas.height = pieceHeight;
            const pieceCtx = pieceCanvas.getContext('2d');
            // Draw the shape and clip
            drawSvgPathOnContext(pieceCtx, getTilePath(tile), pieceWidth, pieceHeight);
            pieceCtx.save();
            pieceCtx.clip();
            // Draw the corresponding part of the image
            pieceCtx.drawImage(
                uploadedImage,
                j * pieceWidth, i * pieceHeight, pieceWidth, pieceHeight,
                0, 0, pieceWidth, pieceHeight
            );
            pieceCtx.restore();
            // Draw the border
            drawSvgPathOnContext(pieceCtx, getTilePath(tile), pieceWidth, pieceHeight);
            pieceCtx.strokeStyle = 'black';
            pieceCtx.lineWidth = 2;
            pieceCtx.stroke();
            // Store the piece in row-major order
            solution1Pieces.push(pieceCanvas);
            // Also draw the border on the main canvas
            ctx1.save();
            ctx1.translate(j * pieceWidth, i * pieceHeight);
            drawSvgPathOnContext(ctx1, getTilePath(tile), pieceWidth, pieceHeight);
            ctx1.strokeStyle = 'black';
            ctx1.lineWidth = 2;
            ctx1.stroke();
            ctx1.restore();
        }
    }

    // --- Step 1.5: Reconstruct the image from all pieces and display it beside Solution 1 ---
    // Create a new canvas for the reconstructed image
    const reconstructedCanvas = document.createElement('canvas');
    reconstructedCanvas.width = uploadedImage.width;
    reconstructedCanvas.height = uploadedImage.height;
    const reconstructedCtx = reconstructedCanvas.getContext('2d');

    // Draw each piece in its correct position
    let pieceIdx = 0;
    for (let i = 0; i < rows; i++) {
        for (let j = 0; j < cols; j++) {
            const pieceCanvas = solution1Pieces[pieceIdx++];
            if (pieceCanvas) {
                reconstructedCtx.drawImage(pieceCanvas, j * pieceWidth, i * pieceHeight);
            }
        }
    }

    sol1Div.appendChild(gridContainer);
    solutionsContainer.appendChild(sol1Div);
}

// Helper to compare two arrays for equality
function arraysEqual(a, b) {
    if (a.length !== b.length) return false;
    for (let i = 0; i < a.length; i++) {
        if (a[i] !== b[i]) return false;
    }
    return true;
}

// Get the number of solutions
const numberOfSolutions = getSolutions(tilesData).length;
console.log(`Number of solutions: ${numberOfSolutions}`);

window.onload = function() {
    // Replace with your actual solution data
    const solution = [
      /* Array of tile data for the solution */
    ];
    displaySolution(solution, 0);
  };

// Adjust selector if your grid cells use a different class
const cells = document.querySelectorAll('.tile');
const gridWidth = 5; // Set this to your grid's column count

cells.forEach((cell, i) => {
  const x = i % gridWidth;
  const y = Math.floor(i / gridWidth);
  cell.style.transform = `translateX(${x * -45}px) translateY(${y * -45}px)`;
});
