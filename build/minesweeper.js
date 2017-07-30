var Sweeper = Sweeper || function(options) {
    this.fieldSelector = options.selector || '.mine-field';
    this.width = options.width || 300;
    this.recursive = !!options.recursive;
    this.rowCount = options.rowCount || 15;
    this.columnCount = options.columnCount || 15;
    this.useHeatMap = !!options.useHeatMap;
}; 

Sweeper.prototype.init = function() {
    this.gameEl = document.querySelector('.game'); //fix this
    this.fieldEl = document.querySelector(this.fieldSelector);
    if (!this.fieldEl) {
        console.error('Could not find element with class', this.fieldSelector);
        return;
    }
    this.fieldEl.style.width = this.width + 'px';
    this.spaceBetween = 6;
    this.cells = [];
    this.rows = [];
    this.mappedCells = {};
    for(var row = 0; row < this.rowCount; row++) {
        var newRow = [];
        for(var col = 0; col < this.columnCount; col++) {
            var cell = {
                id: row + '-' + col,
                block: document.createElement('div'),
                input: document.createElement('input'),
                label: document.createElement('label'),
                isMine: false,
                touchingMines: 0,
                index: this.cells.length
            };
            cell.block.style.width = this.width / this.columnCount + 'px';
            cell.block.style.height = this.width / this.columnCount + 'px';
            cell.block.style.lineHeight = (this.width / this.columnCount) - this.spaceBetween + 'px';
            cell.block.classList.add('block');
            cell.label.setAttribute('for', cell.id);
            cell.input.setAttribute('id', cell.id);
            cell.input.setAttribute('type', 'checkbox');
            cell.input.setAttribute('name', 'block');
            cell.block.appendChild(cell.input);
            cell.block.appendChild(cell.label);
            cell.input.addEventListener('change', function(event) {
                this.onChange(event);
            }.bind(this), false);
            
            this.initCellState(cell);
            
            this.cells.push(cell);
            newRow.push(cell);
            this.mappedCells[cell.id] = cell;
            this.fieldEl.appendChild(cell.block);
        }
        this.rows.push(newRow);
    }
    
    this.setCellsIfTouchingMines();
    
    //add reset button
    this.resetBtn = document.createElement('button');
    this.resetBtn.classList.add('reset');
    this.resetBtn.appendChild(document.createTextNode('Reset'));
    this.resetBtn.addEventListener('click', function() {
        this.resetAll();
    }.bind(this));
    this.gameEl.appendChild(this.resetBtn);
}

Sweeper.prototype._validateIndexs = function(indexes) {
    var newList = [];
    for (var i = 0; i < indexes.length; i++) {
        if(indexes[i] >= 0 && indexes[i] < this.cells.length) {
            newList.push(indexes[i])
        }
    }
    return newList;
}

Sweeper.prototype.getCellsAroundIndex = function(loc) {
    // 3 x 3 grid matrix
    return [
        {row: loc.row-1 , col: loc.col-1}, {row: loc.row-1, col: loc.col}, {row: loc.row-1, col: loc.col+1},
        {row: loc.row, col: loc.col-1},    loc,                            {row: loc.row, col: loc.col+1},
        {row: loc.row+1, col: loc.col-1},  {row: loc.row+1, col: loc.col}, {row: loc.row+1, col: loc.col+1}
    ];
}

Sweeper.prototype.setCellsIfTouchingMines = function() {
    var rows = this.rows;
    for (var r = 0;  r < rows.length; r++) {
        for (var c = 0; c < rows[r].length; c++) {
            if(!rows[r][c].isMine) this.setCellMineTouchCount({row: r, col: c});
        }
    }    
}

Sweeper.prototype.setCellMineTouchCount = function(loc) {
    var cell = this.rows[loc.row][loc.col];
    var cellsToCheck = this.getCellsAroundIndex(loc);
    for (var i = 0; i < cellsToCheck.length; i++) {
        var cellLoc = cellsToCheck[i]
        if(cellLoc.row >= 0 && cellLoc.row < this.rowCount && 
            cellLoc.col >= 0 && cellLoc.col < this.columnCount &&
            this.rows[cellLoc.row][cellLoc.col].isMine) {
            cell.touchingMines++   
        }
    }

    if(!cell.labelTextNode) {
        cell.labelTextNode = document.createTextNode(cell.touchingMines);
        cell.label.appendChild(cell.labelTextNode);
    } else {
        cell.labelTextNode.nodeValue = cell.touchingMines;
    }
    if(this.useHeatMap) {
        cell.block.classList.add('touching-'+cell.touchingMines);
    }
}

Sweeper.prototype.initCellState = function(cell, isMine) {
    cell.block.className = 'block';
    cell.input.classList.remove('mine'); // clear first
    if(Math.random() > 0.85){
        cell.input.classList.add('mine');
        cell.isMine = true;
    }
}

Sweeper.prototype.resetAll = function() {
    var cells = this.cells;
    for (var i = 0;  i < cells.length; i++) {
        cells[i].input.checked = false;
        cells[i].isMine = false;
        cells[i].touchingMines = 0;
        cells[i].labelTextNode && (cells[i].labelTextNode.nodeValue = '');
        this.initCellState(cells[i]);
    }     
    
    this.setCellsIfTouchingMines();
};

Sweeper.prototype.onChange = function(event) {
    event.preventDefault();
    var el = event.target;
    if (el.classList.contains('mine')) {
        this.lost();    
    } else {
        var coordAr = el.id.split('-');
        var loc = {
            row: ~~coordAr[0],
            col: ~~coordAr[1]
        }
        this._checkBleed(loc);
    }
}

Sweeper.prototype._checkBleed = function(loc) {
    var cellsToCheck = this.getCellsAroundIndex(loc);

    for (var i = 0; i < cellsToCheck.length; i++) {
        var cellLoc = cellsToCheck[i]
        if(cellLoc.row >= 0 && cellLoc.row < this.rowCount && 
            cellLoc.col >= 0 && cellLoc.col < this.columnCount) {
            var center = this.rows[loc.row][loc.col];
            var relToCenter = this.rows[cellLoc.row][cellLoc.col];
            if (center.touchingMines === relToCenter.touchingMines && !relToCenter.input.checked) {
                relToCenter.input.checked = true;
                this.recursive && this._checkBleed(cellLoc);
            }
        }
    }    
}

Sweeper.prototype.lost = function() {
    var cells = this.cells;
    for (var i = 0;  i < cells.length; i++) {
        setTimeout(function(index){
            cells[index].input.checked = true;    
        }, ~~(Math.random() * 1000), i);
        
    }  
};
