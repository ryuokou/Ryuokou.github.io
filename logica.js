const agregarCarritoBotones = document.querySelectorAll('.agregar-carrito');
const carritoItemsDiv = document.getElementById('carrito-items');
const carritoVacioParrafo = document.getElementById('carrito-vacio');
const totalCarritoSpan = document.getElementById('total-carrito');
const vaciarCarritoBoton = document.getElementById('vaciar-carrito');
const finalizarCompraBoton = document.getElementById('finalizar-compra');
const imagenSeleccionadaContenedor = document.getElementById('imagen-seleccionada-contenedor');

// Inicializar el carrito
let carrito = JSON.parse(localStorage.getItem('carrito')) || [];
let totalCarrito = 0;
let imagenSeleccionadaActual = null;

// Funciones
function actualizarCarritoEnDOM() {
  carritoItemsDiv.innerHTML = '';
  totalCarrito = 0;
  if (carrito.length === 0) {
    carritoVacioParrafo.style.display = 'block';
  } else {
    carritoVacioParrafo.style.display = 'none';
    carrito.forEach(item => {
      // Buscar la imagen del producto en el DOM
      let imgSrc = '';
      const productosDOM = document.querySelectorAll('.producto');
      productosDOM.forEach(prod => {
        const btn = prod.querySelector('button.agregar-carrito');
        if (btn && btn.dataset.nombre === item.nombre) {
          const img = prod.querySelector('img');
          if (img) imgSrc = img.getAttribute('src');
        }
      });
      const itemDiv = document.createElement('div');
      itemDiv.classList.add('carrito-item');
      itemDiv.innerHTML = `
        ${imgSrc ? `<img src="${imgSrc}" alt="${item.nombre}">` : ''}
        <p>${item.nombre} x${item.cantidad} - $${(item.precio * item.cantidad).toLocaleString('es-CO')}</p>
        <button class="eliminar-item" data-nombre="${item.nombre}">Eliminar</button>
      `;
      carritoItemsDiv.appendChild(itemDiv);
      totalCarrito += item.precio * item.cantidad;
    });
  }
  totalCarritoSpan.textContent = `$${totalCarrito.toLocaleString('es-CO')}`;

  // Agregar event listeners para eliminar items
  const eliminarItemBotones = document.querySelectorAll('.eliminar-item');
  eliminarItemBotones.forEach(boton => {
    boton.addEventListener('click', eliminarItemDelCarrito);
  });

  // Guardar en localStorage
  localStorage.setItem('carrito', JSON.stringify(carrito));
}

function agregarAlCarrito(nombre, precio) {
  // Buscar si ya existe el producto en el carrito
  const itemExistente = carrito.find(item => item.nombre === nombre);
  if (!itemExistente) {
    carrito.push({ nombre, precio: parseFloat(precio), cantidad: 1 });
  } else {
    itemExistente.cantidad += 1;
  }
  actualizarCarritoEnDOM();
}

function eliminarItemDelCarrito(event) {
  const nombreProducto = event.target.dataset.nombre;
  // Si hay más de uno, resta cantidad, si no, elimina
  const item = carrito.find(i => i.nombre === nombreProducto);
  if (item && item.cantidad > 1) {
    item.cantidad -= 1;
  } else {
    carrito = carrito.filter(item => item.nombre !== nombreProducto);
  }
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

  // Formulario de datos del cliente
  const formHtml = `
    <div id="formulario-cliente" style="background: #fff; padding: 2em; border-radius: 16px; box-shadow: 0 2px 12px #6366f133; max-width: 350px; margin: 2em auto; z-index: 9999; position: fixed; left: 50%; top: 50%; transform: translate(-50%, -50%);">
      <h3 style="margin-top:0">Datos para finalizar compra</h3>
      <input type="text" id="nombre-cliente" placeholder="Nombre" style="width:100%;margin-bottom:1em;padding:0.5em;">
      <input type="text" id="apellido-cliente" placeholder="Apellido" style="width:100%;margin-bottom:1em;padding:0.5em;">
      <input type="tel" id="telefono-cliente" placeholder="Teléfono" style="width:100%;margin-bottom:1em;padding:0.5em;">
      <input type="text" id="direccion-cliente" placeholder="Dirección" style="width:100%;margin-bottom:1em;padding:0.5em;">
      <button id="enviar-whatsapp" style="background:#25d366;color:#fff;padding:0.7em 1.5em;border:none;border-radius:8px;cursor:pointer;font-weight:600;">Enviar pedido por WhatsApp</button>
      <button id="cancelar-form" style="margin-left:1em;background:#ccc;color:#222;padding:0.7em 1.5em;border:none;border-radius:8px;cursor:pointer;font-weight:600;">Cancelar</button>
      <div style="margin-top:1.5em;padding:1em;background:#f3f4f6;border-radius:8px;">
        <strong>Medios de pago:</strong>
        <ul style="padding-left:1.2em;margin:0;">
          <li>Nequi: <b>3053033674</b> (Nidia Rivera)</li>
          <li>Daviplata: <b>3024207398</b> (Ewdny)</li>
        </ul>
        <small>Realiza el pago y envía el comprobante por WhatsApp para procesar tu pedido.</small>
      </div>
    </div>
    <div id="fondo-modal" style="position:fixed;top:0;left:0;width:100vw;height:100vh;background:rgba(0,0,0,0.45);z-index:9998;"></div>
  `;
  document.body.insertAdjacentHTML('beforeend', formHtml);

  document.getElementById('cancelar-form').onclick = function() {
    document.getElementById('formulario-cliente').remove();
    document.getElementById('fondo-modal').remove();
  };

  document.getElementById('enviar-whatsapp').onclick = function() {
    const nombre = document.getElementById('nombre-cliente').value.trim();
    const apellido = document.getElementById('apellido-cliente').value.trim();
    const telefono = document.getElementById('telefono-cliente').value.trim();
    const direccion = document.getElementById('direccion-cliente').value.trim();
    if (!nombre || !apellido || !telefono || !direccion) {
      alert('Por favor completa todos los campos.');
      return;
    }
    let mensaje = `¡Hola! Quiero hacer un pedido en CREA JOYAS:%0A`;
    mensaje += `Nombre: ${nombre} %0AApellido: ${apellido} %0ATeléfono: ${telefono} %0ADirección: ${direccion} %0A`;
    mensaje += `%0AProductos:%0A`;
    // Buscar imágenes de productos en el DOM
    carrito.forEach(item => {
      let imgUrl = '';
      let productoEncontrado = false;
      const productosDOM = document.querySelectorAll('.producto');
      productosDOM.forEach(prod => {
        const btn = prod.querySelector('button.agregar-carrito');
        const h3 = prod.querySelector('h3');
        // Coincidencia exacta por data-nombre
        if (btn && btn.dataset.nombre === item.nombre) {
          const img = prod.querySelector('img');
          if (img) imgUrl = window.location.origin + '/' + img.getAttribute('src');
          productoEncontrado = true;
        }
      });
      // Si no se encontró por data-nombre, buscar por h3 (nombre visual)
      if (!imgUrl) {
        productosDOM.forEach(prod => {
          const h3 = prod.querySelector('h3');
          if (h3 && h3.textContent.trim().toLowerCase() === item.nombre.trim().toLowerCase()) {
            const img = prod.querySelector('img');
            if (img) imgUrl = window.location.origin + '/' + img.getAttribute('src');
            productoEncontrado = true;
          }
        });
      }
      // Formatear precio con separador de miles
      let precioFormateado = '';
      if (!isNaN(item.precio)) {
        precioFormateado = parseFloat(item.precio).toLocaleString('es-CO');
      } else {
        precioFormateado = item.precio;
      }
      mensaje += `- ${item.nombre} x${item.cantidad} ($${(item.precio * item.cantidad).toLocaleString('es-CO')})`;
      if (imgUrl) {
        mensaje += `%0AImagen: ${imgUrl}`;
      } else {
        mensaje += `%0AImagen: No encontrada`;
      }
      mensaje += `%0A`;
    });
    // Formatear total con separador de miles
    mensaje += `%0ATotal: $${totalCarrito.toLocaleString('es-CO')}`;
    // Cambia el número de WhatsApp aquí:
    const numeroWhatsApp = '573053033674'; // <--- TU NÚMERO AQUÍ (código país+celular)
    const url = `https://wa.me/${numeroWhatsApp}?text=${mensaje}`;
    window.open(url, '_blank');
    document.getElementById('formulario-cliente').remove();
    document.getElementById('fondo-modal').remove();
    vaciarCarrito();
  };
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

// Renderizar lista de catálogo y manejar selección múltiple
window.addEventListener('DOMContentLoaded', () => {
  const listaCatalogo = document.getElementById('lista-catalogo');
  const listaSeleccionados = document.getElementById('lista-seleccionados');
  let seleccionados = [];

  if (listaCatalogo) {
    productos.forEach((producto, idx) => {
      const li = document.createElement('li');
      li.style.display = 'flex';
      li.style.alignItems = 'center';
      li.style.justifyContent = 'space-between';
      li.style.padding = '0.7em 0.5em';
      li.style.marginBottom = '0.5em';
      li.style.borderBottom = '1px solid #e0e7ff';
      li.innerHTML = `
        <span><strong>${producto.nombre}</strong> - $${producto.precio.toLocaleString('es-CO')}</span>
        <button class="seleccionar-producto" data-idx="${idx}" style="margin-left:1em;">Seleccionar</button>
      `;
      listaCatalogo.appendChild(li);
    });
  }

  function renderSeleccionados() {
    listaSeleccionados.innerHTML = '';
    seleccionados.forEach(idx => {
      const producto = productos[idx];
      const li = document.createElement('li');
      li.style.display = 'flex';
      li.style.alignItems = 'center';
      li.style.justifyContent = 'space-between';
      li.style.padding = '0.7em 0.5em';
      li.style.marginBottom = '0.5em';
      li.style.borderBottom = '1px solid #e0e7ff';
      li.innerHTML = `
        <span><strong>${producto.nombre}</strong> - $${producto.precio.toLocaleString('es-CO')}</span>
        <button class="quitar-seleccionado" data-idx="${idx}" style="margin-left:1em; background:#e53e3e; color:#fff; border-radius:6px; border:none; padding:0.3em 1em;">Quitar</button>
      `;
      listaSeleccionados.appendChild(li);
    });
  }

  // Seleccionar producto
  listaCatalogo.addEventListener('click', function(e) {
    if (e.target.classList.contains('seleccionar-producto')) {
      const idx = parseInt(e.target.dataset.idx);
      if (!seleccionados.includes(idx)) {
        seleccionados.push(idx);
        renderSeleccionados();
      }
    }
  });

  // Quitar producto seleccionado
  listaSeleccionados.addEventListener('click', function(e) {
    if (e.target.classList.contains('quitar-seleccionado')) {
      const idx = parseInt(e.target.dataset.idx);
      seleccionados = seleccionados.filter(i => i !== idx);
      renderSeleccionados();
    }
  });
});

document.addEventListener('DOMContentLoaded', function() {
  const buscador = document.getElementById('buscador-productos');
  const contenedor = document.getElementById('contenedor-productos');
  if (!buscador || !contenedor) return;

  buscador.addEventListener('input', function() {
    const valor = buscador.value.trim().toLowerCase();
    const productos = Array.from(contenedor.getElementsByClassName('producto'));
    if (!valor) {
      productos.forEach(p => contenedor.appendChild(p));
      return;
    }
    // Ordenar: primero los que coinciden, luego el resto
    const coinciden = productos.filter(p => p.querySelector('h3').textContent.toLowerCase().includes(valor));
    const noCoinciden = productos.filter(p => !p.querySelector('h3').textContent.toLowerCase().includes(valor));
    // Limpiar y reordenar
    contenedor.innerHTML = '';
    coinciden.forEach(p => contenedor.appendChild(p));
    noCoinciden.forEach(p => contenedor.appendChild(p));
  });

  // Selección de imagen de producto
  const productos = document.querySelectorAll('.producto img');
  productos.forEach(img => {
    img.style.cursor = 'pointer';
    img.addEventListener('click', function() {
      // Quitar imagen anterior si existe
      if (imagenSeleccionadaActual) {
        imagenSeleccionadaActual.remove();
        imagenSeleccionadaActual = null;
      }
      // Crear y mostrar la nueva imagen seleccionada
      const nuevaImg = document.createElement('img');
      nuevaImg.src = img.src;
      nuevaImg.alt = img.alt;
      nuevaImg.style.maxWidth = '220px';
      nuevaImg.style.maxHeight = '220px';
      nuevaImg.style.margin = '1em auto';
      nuevaImg.style.display = 'block';
      nuevaImg.style.borderRadius = '20px';
      nuevaImg.style.boxShadow = '0 2px 12px #a5d6a7';
      imagenSeleccionadaContenedor.innerHTML = '';
      imagenSeleccionadaContenedor.appendChild(nuevaImg);
      imagenSeleccionadaActual = nuevaImg;
    });
  });

  // Lista de nombres de productos para filtrar
  const listaNombresDiv = document.getElementById('lista-nombres-productos');
  const contenedorProductos = document.getElementById('contenedor-productos');
  if (listaNombresDiv && contenedorProductos) {
    // Obtener todos los productos del DOM
    const productos = Array.from(contenedorProductos.getElementsByClassName('producto'));
    // Crear lista de nombres
    const nombres = productos.map(p => p.querySelector('h3').textContent.trim());
    // Eliminar duplicados
    const nombresUnicos = [...new Set(nombres)];
    // Crear lista HTML
    let html = `<button type="button" class="filtro-nombre" data-nombre="__todos__" style="margin-right:1em;">Todos</button>`;
    nombresUnicos.forEach(nombre => {
      html += `<button type="button" class="filtro-nombre" data-nombre="${nombre}">${nombre}</button> `;
    });
    listaNombresDiv.innerHTML = html;

    // Evento para filtrar productos por nombre
    listaNombresDiv.addEventListener('click', function(e) {
      if (e.target.classList.contains('filtro-nombre')) {
        const nombre = e.target.dataset.nombre;
        productos.forEach(p => {
          if (nombre === '__todos__') {
            p.style.display = '';
          } else {
            const h3 = p.querySelector('h3');
            if (h3 && h3.textContent.trim() === nombre) {
              p.style.display = '';
            } else {
              p.style.display = 'none';
            }
          }
        });
      }
    });
  }
});