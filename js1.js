// Función para generar una matriz aleatoria de tamaño size x size
function generateRandomMatrix(size) {
    var matrix = [];
    for (var i = 0; i < size; i++) {
        matrix.push([]);
        for (var j = 0; j < size; j++) {
            matrix[i].push(Math.round(Math.random()));
        }
    }
    return matrix;
}

// Función para validar una matriz cuadrada
function isSquareMatrix(matrix) {
    var size = matrix.length;
    for (var i = 0; i < size; i++) {
        if (matrix[i].length !== size) {
            return false;
        }
    }
    return true;
}

// Función para generar la matriz en la pantalla
function generateMatrix() {
    var size = parseInt(document.getElementById("size").value);
    var matrixContainer = document.getElementById("matrix-container");
    matrixContainer.innerHTML = "";

    if (isNaN(size) || size < 1) {
        alert("Por favor, ingrese un tamaño válido para la matriz.");
        return;
    }

    var matrix = generateRandomMatrix(size);

    var table = document.createElement("table");
    for (var i = 0; i < size; i++) {
        var row = document.createElement("tr");
        for (var j = 0; j < size; j++) {
            var cell = document.createElement("td");
            cell.innerHTML = '<input type="number" min="0" max="1" step="1" value="' + matrix[i][j] + '">';
            row.appendChild(cell);
        }
        table.appendChild(row);
    }
    matrixContainer.appendChild(table);
    matrixContainer.style.display = "block";
}

// Función para calcular las relaciones y mostrar el grafo dirigido
function calculateRelations() {
    var matrix = [];
    var size = parseInt(document.getElementById("size").value);
    var matrixContainer = document.getElementById("matrix-container");
    var resultDiv = document.getElementById("result");
    var graphContainer = document.getElementById("graph-container");
    var relations = [];

    if (isNaN(size) || size < 1) {
        alert("Por favor, ingrese un tamaño válido para la matriz.");
        return;
    }

    var inputs = matrixContainer.querySelectorAll("input");
    for (var i = 0; i < inputs.length; i += size) {
        matrix.push(Array.from(inputs).slice(i, i + size).map(input => parseInt(input.value)));
    }

    if (!isSquareMatrix(matrix)) {
        alert("La matriz ingresada no es cuadrada.");
        return;
    }

    // Calcula las relaciones
    for (var i = 0; i < size; i++) {
        for (var j = 0; j < size; j++) {
            if (matrix[i][j] === 1) {
                relations.push({ source: i + 1, target: j + 1 }); // Ajuste para iniciar desde 1
            }
        }
    }

    // Calcular propiedades relacionales y tipo de orden
    const reflexive = isReflexive(matrix);
    const irreflexive = isIrreflexive(matrix);
    const symmetric = isSymmetric(matrix);
    const antisymmetric = isAntisymmetric(matrix);
    const transitive = isTransitive(matrix);

    const equivalence = reflexive && symmetric && transitive;
    const partialOrder = reflexive && antisymmetric && transitive;

    var resultDiv = document.getElementById("result");
    resultDiv.innerHTML = `
        <p>Reflexiva: ${reflexive}</p>
        <p>Irreflexiva: ${irreflexive}</p>
        <p>Simétrica: ${symmetric}</p>
        <p>Antisimétrica: ${antisymmetric}</p>
        <p>Transitiva: ${transitive}</p>
        <p>Equivalencia: ${equivalence}</p>
        <p>Tipo de Orden: ${partialOrder}</p>
    `;

    // Mostrar relaciones en el div de resultado
    if (relations.length > 0) {
        resultDiv.innerHTML += "<p>Relaciones encontradas: " + relations.map(rel => "(" + rel.source + ", " + rel.target + ")").join(", ") + "</p>";
    } else {
        resultDiv.innerHTML += "<p>No se encontraron relaciones.</p>";
    }

    // Llamar a la función para generar el grafo
    generateGraph(relations);
}

// Función para generar el grafo dirigido
function generateGraph(relations) {
    var graphContainer = d3.select("#graph-container");

    graphContainer.selectAll("*").remove();

    var svgWidth = graphContainer.node().clientWidth;
    var svgHeight = 400;
    var nodeRadius = 20;

    var svg = graphContainer.append("svg")
                .attr("width", svgWidth)
                .attr("height", svgHeight);

    // Escalas para las posiciones de los nodos
    var xScale = d3.scalePoint()
                   .domain(d3.range(1, d3.max(relations, d => Math.max(d.source, d.target)) + 2))
                   .range([nodeRadius, svgWidth - nodeRadius]);

    var ySource = svgHeight / 3;
    var yTarget = 2 * svgHeight / 3;

    // Dibujar las líneas entre los nodos
    svg.selectAll("line")
        .data(relations)
        .enter().append("line")
        .attr("x1", d => xScale(d.source))
        .attr("y1", ySource)
        .attr("x2", d => xScale(d.target))
        .attr("y2", yTarget)
        .attr("stroke", "#999")
        .attr("stroke-width", 2);

    // Dibujar los nodos fuente
    svg.selectAll("circle.source")
        .data(relations)
        .enter().append("circle")
        .attr("class", "source")
        .attr("cx", d => xScale(d.source))
        .attr("cy", ySource)
        .attr("r", nodeRadius)
        .attr("fill", "#1f77b4")
        .attr("stroke", "#fff")
        .attr("stroke-width", 2);

    // Dibujar los nodos destino
    svg.selectAll("circle.target")
        .data(relations)
        .enter().append("circle")
        .attr("class", "target")
        .attr("cx", d => xScale(d.target))
        .attr("cy", yTarget)
        .attr("r", nodeRadius)
        .attr("fill", "#ff7f0e")
        .attr("stroke", "#fff")
        .attr("stroke-width", 2);

    // Agregar etiquetas a los nodos fuente
    svg.selectAll("text.source")
        .data(relations)
        .enter().append("text")
        .attr("class", "source")
        .attr("x", d => xScale(d.source))
        .attr("y", ySource + 5)
        
        .attr("text-anchor", "middle")
        .attr("fill", "black")
        .attr("font-size", "12px")
        .text(d => "Nodo " + d.source);

    // Agregar etiquetas a los nodos destino
    svg.selectAll("text.target")
        .data(relations)
        .enter().append("text")
        .attr("class", "target")
        .attr("x", d => xScale(d.target))
        .attr("y", yTarget + 5)
        .attr("text-anchor", "middle")
        .attr("fill", "black")
        .attr("font-size", "12px")
        .text(d => "Nodo " + d.target);

    // Agregar leyenda
    var legend = graphContainer.append("div")
                    .attr("class", "legend")
                    .html("<p>Leyenda:</p><p>Nodos fuente: Círculos azules</p><p>Nodos destino: Círculos naranjas</p><p>Relaciones: Líneas</p>");
}

// Función para limpiar todo
function cleareveryone() {
    document.getElementById("matrix-container").innerHTML = "";
    document.getElementById("result").innerHTML = "";
    d3.select("#graph-container").selectAll("*").remove();
}

// Función para verificar si la matriz es reflexiva
function isReflexive(matrix) {
    // Verifica si todos los elementos de la diagonal son 1
    for (var i = 0; i < matrix.length; i++) {
        if (matrix[i][i] !== 1) {
            return false;
        }
    }
    return true;
}

// Función para verificar si la matriz es irreflexiva
function isIrreflexive(matrix) {
    // Verifica si todos los elementos de la diagonal son 0
    for (var i = 0; i < matrix.length; i++) {
        if (matrix[i][i] !== 0) {
            return false;
        }
    }
    return true;
}

// Función para verificar si la matriz es simétrica
function isSymmetric(matrix) {
    // Verifica si la matriz es igual a su transpuesta
    for (var i = 0; i < matrix.length; i++) {
        for (var j = 0; j < i; j++) {
            if (matrix[i][j] !== matrix[j][i]) {
                return false;
            }
        }
    }
    return true;
}

// Función para verificar si la matriz es antisimétrica
function isAntisymmetric(matrix) {
    // Verifica si la matriz es opuesta a su transpuesta
    for (var i = 0; i < matrix.length; i++) {
        for (var j = 0; j < i; j++) {
            if (matrix[i][j] === 1 && matrix[j][i] === 1) {
                return false;
            }
        }
    }
    return true;
}

// Función para verificar si la matriz es transitiva
function isTransitive(matrix) {
    // Verifica si Aij = 1 implica Aik = 1 para algún k
    for (var i = 0; i < matrix.length; i++) {
        for (var j = 0; j < matrix.length; j++) {
            if (matrix[i][j] === 1) {
                for (var k = 0; k < matrix.length; k++) {
                    if (matrix[j][k] === 1 && matrix[i][k] !== 1) {
                        return false;
                    }
                }
            }
        }
    }
    return true;
}
