const agregarCarritoBotones = document.querySelectorAll('.agregar-carrito');
const carritoItemsDiv = document.getElementById('carrito-items');
const carritoVacioParrafo = document.getElementById('carrito-vacio');
const totalCarritoSpan = document.getElementById('total-carrito');
const vaciarCarritoBoton = document.getElementById('vaciar-carrito');
const finalizarCompraBoton = document.getElementById('finalizar-compra');

// Inicializar el carrito
let carrito = JSON.parse(localStorage.getItem('carrito')) || [];
let totalCarrito = 0;

// Funciones
function actualizarCarritoEnDOM() {
  carritoItemsDiv.innerHTML = '';
  totalCarrito = 0;
  if (carrito.length === 0) {
    carritoVacioParrafo.style.display = 'block';
  } else {
    carritoVacioParrafo.style.display = 'none';
    carrito.forEach(item => {
      const itemDiv = document.createElement('div');
      itemDiv.classList.add('carrito-item');
      itemDiv.innerHTML = `
        <p>${item.nombre} - $${item.precio}</p>
        <button class="eliminar-item" data-nombre="${item.nombre}">Eliminar</button>
      `;
      carritoItemsDiv.appendChild(itemDiv);
      totalCarrito += item.precio;
    });
  }
  totalCarritoSpan.textContent = `$${totalCarrito.toFixed(2)}`;

  // Agregar event listeners para eliminar items
  const eliminarItemBotones = document.querySelectorAll('.eliminar-item');
  eliminarItemBotones.forEach(boton => {
    boton.addEventListener('click', eliminarItemDelCarrito);
  });

  // Guardar en localStorage
  localStorage.setItem('carrito', JSON.stringify(carrito));
}

function agregarAlCarrito(nombre, precio) {
  const itemExistente = carrito.find(item => item.nombre === nombre);
  if (!itemExistente) {
    carrito.push({ nombre, precio: parseFloat(precio) });
    actualizarCarritoEnDOM();
  } else {
    alert('Este producto ya está en el carrito.');
  }
}

function eliminarItemDelCarrito(event) {
  const nombreProducto = event.target.dataset.nombre;
  carrito = carrito.filter(item => item.nombre !== nombreProducto);
  actualizarCarritoEnDOM();
}

function vaciarCarrito() {
  if (confirm('¿Está seguro de que desea vaciar el carrito?')) {
    carrito = [];
    actualizarCarritoEnDOM();
  }
}

function finalizarCompra() {
  if (carrito.length === 0) {
    alert('El carrito está vacío. Agrega productos antes de finalizar la compra.');
    return;
  }
  let mensajeCompra = '¡Gracias por tu compra!\n\n';
  carrito.forEach(item => {
    mensajeCompra += `${item.nombre} - $${item.precio}\n`;
  });
  mensajeCompra += `\nTotal: $${totalCarrito.toFixed(2)}`;
  if (confirm(mensajeCompra + '\n\n¿Desea proceder con la compra?')) {
    // Reemplaza esto con la lógica de compra real
    vaciarCarrito();
  }
}

// Event Listeners
agregarCarritoBotones.forEach(boton => {
  boton.addEventListener('click', () => {
    const nombre = boton.dataset.nombre;
    const precio = boton.dataset.precio;
    agregarAlCarrito(nombre, precio);
  });
});

vaciarCarritoBoton.addEventListener('click', vaciarCarrito);
finalizarCompraBoton.addEventListener('click', finalizarCompra);

// Inicializar el carrito en el DOM
actualizarCarritoEnDOM();