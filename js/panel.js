import { SUPABASE_URL, SUPABASE_ANON_KEY } from './config-public.js'
import { createClient } from 'https://cdn.jsdelivr.net/npm/@supabase/supabase-js/+esm'

const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY)

// Usuario
const usuario = JSON.parse(localStorage.getItem('usuario'))

console.log("Usuario en localStorage:", usuario)

if (!usuario) window.location.href = '../index.html'
document.getElementById('bienvenida').textContent = `Bienvenido ${usuario.usuario}`

// Botones
document.getElementById('logout').addEventListener('click', () => {
    localStorage.removeItem('usuario')
    localStorage.removeItem('rol')
    window.location.href = '../index.html'
})

document.getElementById('cambiar-pass')?.addEventListener('click', () => {
    window.location.href = 'cambiarclave.html'
})

// Modal
const modal = document.getElementById('modal-reserva')
const cerrarModal = document.getElementById('cerrar-modal')

cerrarModal.addEventListener('click', () => {
    modal.style.display = 'none'
})

window.addEventListener('click', e => {
    if (e.target === modal) modal.style.display = 'none'
})

// Opciones
const variedades = ['Variedad Kush', 'Variedad Haze']
const cantidades = [5, 10, 15, 20]
const horarios = ['12:00', '13:00', '14:00', '15:00', '16:00', '17:00', '18:00']

const selectVariedad = document.getElementById('variedad')
const selectCantidad = document.getElementById('dosis')
const selectHorario = document.getElementById('horario')
const ulReservas = document.getElementById('reservas-ul')

// Llenar selects
variedades.forEach(v => selectVariedad.appendChild(new Option(v, v)))
cantidades.forEach(c => selectCantidad.appendChild(new Option(c, c)))
horarios.forEach(h => selectHorario.appendChild(new Option(h, h)))

// Carrito temporal
let carritoTemporal = {}

// Crear carrito visual
const carritoVisual = document.createElement('div')
carritoVisual.id = 'carrito-visual'
carritoVisual.style.cssText = `
max-width:420px;
margin:20px auto;
background:#1a1a1a;
padding:20px;
border-radius:12px;
box-shadow:0 0 20px rgba(0,128,0,0.4);
color:#6eff6e;
font-size:0.95rem;
`

ulReservas.parentNode.insertBefore(carritoVisual, ulReservas)

// Verificar cupos
async function verificarCupos(horario){

console.log("Verificando cupos para horario:", horario)

const { data, error } = await supabase
.from('reservas')
.select('*')
.eq('horario', horario)

if(error) throw error

console.log("Reservas encontradas en ese horario:", data)

return data.length
}

// Guardar reserva
document.getElementById('form-reserva').addEventListener('submit', async e => {

e.preventDefault()

console.log("Formulario enviado")

console.log("Carrito temporal:", carritoTemporal)

if(!carritoTemporal.variedad || !carritoTemporal.dosis || !carritoTemporal.horario){
alert('Completa todos los campos antes de reservar')
return
}

try{

// verificar si ya tiene reserva
const { data: reservasUsuario } = await supabase
.from('reservas')
.select('*')
.eq('usuario', usuario.usuario)

console.log("Reservas actuales del usuario:", reservasUsuario)

if(reservasUsuario.length > 0){
alert('Ya tienes una reserva activa. Cancélala primero.')
return
}

const cupos = await verificarCupos(carritoTemporal.horario)

console.log("Cantidad de cupos ocupados:", cupos)

if(cupos >= 4){
alert('Horario completo')
return
}

console.log("Insertando reserva en Supabase...")

const { data, error } = await supabase
.from('reservas')
.insert([{ usuario, ...carritoTemporal }])
.select()

console.log("Respuesta del insert:", data)

if(error) throw error

// limpiar formulario
carritoTemporal = {}

selectVariedad.value = ''
selectCantidad.value = ''
selectHorario.value = ''

modal.style.display = 'flex'

// esperar un momento y recargar reservas
setTimeout(() => {
console.log("Recargando reservas del usuario...")
cargarReservaUsuario()
}, 300)

}catch(err){

console.error("Error al guardar:", err)
alert('Error al guardar la reserva')

}

})

// Mostrar reserva en carrito
async function cargarReservaUsuario(){

console.log("Cargando reservas para usuario:", usuario)

try{

const { data, error } = await supabase
.from('reservas')
.select('*')
.eq('usuario', usuario)

console.log("Reservas encontradas:", data)

if(error) throw error

ulReservas.innerHTML = ''

if(data.length === 0){

console.log("El usuario no tiene reservas")

carritoVisual.innerHTML = `
<strong>Mis reservas</strong><br><br>
No tienes reservas activas
`

return
}

const r = data[0]

console.log("Reserva que se mostrará en carrito:", r)

carritoVisual.innerHTML = `
<strong>Tu reserva activa</strong><br><br>

Variedad: ${r.variedad}<br>
Dosis: ${r.dosis}g<br>
Horario: ${r.horario}<br><br>

<button id="cancelar-reserva" style="
background:#b71c1c;
padding:8px 14px;
border:none;
border-radius:6px;
color:white;
font-weight:bold;
cursor:pointer;
">Cancelar reserva</button>
`

document.getElementById('cancelar-reserva').addEventListener('click', async ()=>{

console.log("Usuario intenta cancelar reserva", r.id)

if(confirm('¿Cancelar tu reserva?')){

const { error } = await supabase
.from('reservas')
.delete()
.eq('id', r.id)

if(error){
console.error("Error al cancelar:", error)
alert('Error al cancelar')
}else{
console.log("Reserva eliminada")
cargarReservaUsuario()
}

}

})

const li = document.createElement('li')
li.textContent = `Variedad: ${r.variedad} - ${r.dosis}g - ${r.horario}`
ulReservas.appendChild(li)

}catch(err){

console.error("Error cargando reservas:", err)

}

}

// Eventos selects
selectVariedad.addEventListener('change', ()=>{
carritoTemporal.variedad = selectVariedad.value
console.log("Variedad seleccionada:", carritoTemporal.variedad)
})

selectCantidad.addEventListener('change', ()=>{
carritoTemporal.dosis = selectCantidad.value
console.log("Dosis seleccionada:", carritoTemporal.dosis)
})

selectHorario.addEventListener('change', ()=>{
carritoTemporal.horario = selectHorario.value
console.log("Horario seleccionado:", carritoTemporal.horario)
})

// Inicializar
cargarReservaUsuario()