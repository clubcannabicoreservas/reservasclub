import { SUPABASE_URL, SUPABASE_ANON_KEY } from './config-public.js'
import { createClient } from 'https://cdn.jsdelivr.net/npm/@supabase/supabase-js/+esm'

const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY)

// Usuario
const usuario = JSON.parse(localStorage.getItem('usuario'))

// 🔒 VALIDACIÓN DE SESIÓN (MEJORADA)
if (!usuario || !usuario.login) {
    Swal.fire({
        icon: 'error',
        title: 'Sesión expirada',
        text: 'Volvé a iniciar sesión'
    }).then(() => {
        window.location.href = '../index.html'
    })
}

// 🔴 VALIDACIÓN EXTRA (CLAVE)
if(!usuario.usuario){
    Swal.fire({
        icon: 'error',
        title: 'Error de sesión',
        text: 'Datos inválidos, iniciá sesión nuevamente'
    }).then(()=>{
        localStorage.removeItem('usuario')
        window.location.href = '../index.html'
    })
}

// ✅ BIENVENIDA
document.getElementById('bienvenida').textContent = `Bienvenido ${usuario.usuario}`

// LOGOUT
document.getElementById('logout').addEventListener('click', async () => {

    const result = await Swal.fire({
        title: '¿Cerrar sesión?',
        icon: 'question',
        showCancelButton: true,
        confirmButtonText: 'Sí, salir',
        cancelButtonText: 'Cancelar'
    })

    if(result.isConfirmed){
        localStorage.removeItem('usuario')
        window.location.href = '../index.html'
    }

})

// CAMBIAR PASSWORD
document.getElementById('cambiar-pass')?.addEventListener('click', () => {
    window.location.href = 'cambiarclave.html'
})

// Modal
const modal = document.getElementById('modal-reserva')
const cerrarModal = document.getElementById('cerrar-modal')
cerrarModal.addEventListener('click', () => { modal.style.display = 'none' })
window.addEventListener('click', e => { if (e.target === modal) modal.style.display = 'none' })

// Opciones
const variedades = ['Variedad Kush', 'Variedad Haze']
const cantidades = [5, 10, 15, 20]
const horarios = ['12:00', '13:00', '14:00', '15:00', '16:00', '17:00', '18:00']

const selectVariedad = document.getElementById('variedad')
const selectCantidad = document.getElementById('dosis')
const selectHorario = document.getElementById('horario')
const inputFecha = document.getElementById('fecha')
const ulReservas = document.getElementById('reservas-ul')

// Bloquear fechas pasadas
const hoy = new Date().toISOString().split("T")[0]
inputFecha.min = hoy
inputFecha.value = hoy

// Carrito temporal
let carritoTemporal = {
    fecha: inputFecha.value
}

// Llenar selects
variedades.forEach(v => selectVariedad.appendChild(new Option(v, v)))
cantidades.forEach(c => selectCantidad.appendChild(new Option(c, c)))
horarios.forEach(h => selectHorario.appendChild(new Option(h, h)))

// Carrito visual
const carritoVisual = document.createElement('div')
carritoVisual.id = 'carrito-visual'
ulReservas.parentNode.insertBefore(carritoVisual, ulReservas)

// 🔥 Verificar cupos
async function verificarCupos(fecha, horario){
    const { data, error } = await supabase
        .from('reservas')
        .select('*')
        .eq('fecha', fecha)
        .eq('horario', horario)

    if(error) throw error
    return data.length
}

// 🔥 Actualizar horarios
async function actualizarHorariosDisponibles(fecha) {

    Array.from(selectHorario.options).forEach(opt => {
        opt.disabled = false
        opt.textContent = opt.value
    })

    const { data, error } = await supabase
        .from('reservas')
        .select('*')
        .eq('fecha', fecha)

    if(error){
        console.error(error)
        return
    }

    const cuposPorHorario = {}

    data.forEach(r => {
        if(!cuposPorHorario[r.horario]) cuposPorHorario[r.horario] = 0
        cuposPorHorario[r.horario]++
    })

    Array.from(selectHorario.options).forEach(opt => {
        if(cuposPorHorario[opt.value] >= 4){
            opt.disabled = true
            opt.textContent = `${opt.value} (completo)`
        }
    })

    if(selectHorario.value && selectHorario.options[selectHorario.selectedIndex].disabled){
        selectHorario.value = ''
        carritoTemporal.horario = ''
    }
}

// 🔥 Guardar reserva
document.getElementById('form-reserva').addEventListener('submit', async e => {
    e.preventDefault()

    const { fecha, variedad, dosis, horario } = carritoTemporal

    if(!fecha || !variedad || !dosis || !horario){
        Swal.fire({
            icon: 'warning',
            title: 'Campos incompletos',
            text: 'Completa todos los campos'
        })
        return
    }

    try{

        const { data: reservasUsuario } = await supabase
            .from('reservas')
            .select('*')
            .eq('usuario', usuario.usuario)

        if(reservasUsuario && reservasUsuario.length > 0){
            Swal.fire({
                icon: 'info',
                title: 'Ya tienes una reserva',
                text: 'Modifícala o cancélala'
            })
            return
        }

        const cupos = await verificarCupos(fecha, horario)

        if(cupos >= 4){
            Swal.fire({
                icon: 'warning',
                title: 'Horario completo'
            })
            return
        }

        Swal.fire({
            title: 'Guardando reserva...',
            allowOutsideClick: false,
            didOpen: () => Swal.showLoading()
        })

        const { error } = await supabase
            .from('reservas')
            .insert([{ usuario: usuario.usuario, ...carritoTemporal }])

        Swal.close()

        if(error) throw error

        carritoTemporal = { fecha: inputFecha.value }
        selectVariedad.value = ''
        selectCantidad.value = ''
        selectHorario.value = ''

        modal.style.display = 'flex'

        Swal.fire({
            icon: 'success',
            title: 'Reserva creada',
            timer: 1500,
            showConfirmButton: false
        })

        setTimeout(() => { cargarReservaUsuario() }, 300)
        actualizarHorariosDisponibles(inputFecha.value)

    } catch(err){
        console.error(err)

        Swal.fire({
            icon: 'error',
            title: 'Error',
            text: 'No se pudo guardar la reserva'
        })
    }
})

// 🔥 Mostrar reserva
async function cargarReservaUsuario(){

    try{

        const { data, error } = await supabase
            .from('reservas')
            .select('*')
            .eq('usuario', usuario.usuario)

        if(error) throw error

        ulReservas.innerHTML = ''

        if(data.length === 0){
            carritoVisual.innerHTML = `<strong>No tienes reservas activas</strong>`
            return
        }

        const r = data[0]

        carritoVisual.innerHTML = `
        <strong>Tu reserva activa</strong><br><br>
        Fecha: ${r.fecha}<br>
        Variedad: ${r.variedad}<br>
        Dosis: ${r.dosis}g<br>
        Horario: ${r.horario}<br><br>
        <button id="editar-reserva">Modificar</button>
        <button id="cancelar-reserva">Cancelar</button>
        `

        document.getElementById('editar-reserva').addEventListener('click', async ()=>{

            const result = await Swal.fire({
                title: 'Modificar reserva',
                text: 'Se eliminará la actual',
                icon: 'warning',
                showCancelButton: true
            })

            if(!result.isConfirmed) return

            await supabase.from('reservas').delete().eq('id', r.id)

            Swal.fire({
                icon: 'success',
                title: 'Ahora podés crear una nueva',
                timer: 1500,
                showConfirmButton: false
            })

            carritoTemporal = { fecha: inputFecha.value }
            cargarReservaUsuario()
            actualizarHorariosDisponibles(inputFecha.value)
        })

        document.getElementById('cancelar-reserva').addEventListener('click', async ()=>{

            const result = await Swal.fire({
                title: '¿Cancelar reserva?',
                icon: 'warning',
                showCancelButton: true
            })

            if(!result.isConfirmed) return

            await supabase.from('reservas').delete().eq('id', r.id)

            Swal.fire({
                icon: 'success',
                title: 'Reserva cancelada',
                timer: 1500,
                showConfirmButton: false
            })

            carritoTemporal = { fecha: inputFecha.value }
            cargarReservaUsuario()
            actualizarHorariosDisponibles(inputFecha.value)
        })

    } catch(err){
        console.error(err)
    }
}

// Eventos
selectVariedad.addEventListener('change', ()=>{ carritoTemporal.variedad = selectVariedad.value })
selectCantidad.addEventListener('change', ()=>{ carritoTemporal.dosis = selectCantidad.value })
selectHorario.addEventListener('change', ()=>{ carritoTemporal.horario = selectHorario.value })

inputFecha.addEventListener('change', async ()=>{
    carritoTemporal.fecha = inputFecha.value
    await actualizarHorariosDisponibles(inputFecha.value)
})

// Inicializar
actualizarHorariosDisponibles(inputFecha.value)
cargarReservaUsuario()