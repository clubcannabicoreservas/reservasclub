import { SUPABASE_URL, SUPABASE_ANON_KEY } from './config-public.js'
import { createClient } from 'https://cdn.jsdelivr.net/npm/@supabase/supabase-js/+esm'

const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY)

const tbody = document.querySelector("#tablaReservas tbody")

// 🔴 validar sesión admin
const usuario = JSON.parse(localStorage.getItem("usuario"))

if (!usuario || usuario.rol !== "admin") {
    Swal.fire({
        icon: 'error',
        title: 'Acceso denegado',
        text: 'No tenés permisos para entrar aquí'
    }).then(() => {
        window.location.href = "../index.html"
    })
}

// 🔥 cargar reservas
async function mostrarReservas() {

    tbody.innerHTML = ""

    try {

        Swal.fire({
            title: 'Cargando reservas...',
            allowOutsideClick: false,
            didOpen: () => Swal.showLoading()
        })

        const { data, error } = await supabase
            .from('reservas')
            .select('*')
            .order('fecha', { ascending: true })

        Swal.close()

        if (error) throw error

        if (!data || data.length === 0) {
            tbody.innerHTML = `
                <tr>
                    <td colspan="5">No hay reservas</td>
                </tr>
            `
            return
        }

        data.forEach((reserva) => {

            const fila = document.createElement("tr")

            fila.innerHTML = `
                <td>${reserva.usuario}</td>
                <td>${reserva.dosis}</td>
                <td>${reserva.horario}</td>
                <td>${reserva.variedad}</td>
                <td>
                    <button class="btnEliminar" data-id="${reserva.id}">
                        Eliminar
                    </button>
                </td>
            `

            tbody.appendChild(fila)
        })

        // eventos eliminar
        document.querySelectorAll(".btnEliminar").forEach(btn => {
            btn.addEventListener("click", () => {
                eliminarReserva(btn.dataset.id)
            })
        })

    } catch (err) {
        console.error(err)

        Swal.fire({
            icon: 'error',
            title: 'Error',
            text: 'No se pudieron cargar las reservas'
        })
    }
}

// 🔥 eliminar reserva
async function eliminarReserva(id) {

    const result = await Swal.fire({
        title: '¿Eliminar reserva?',
        icon: 'warning',
        showCancelButton: true,
        confirmButtonColor: '#2e7d32',
        cancelButtonColor: '#d33',
        confirmButtonText: 'Sí, eliminar'
    })

    if (!result.isConfirmed) return

    try {

        Swal.fire({
            title: 'Eliminando...',
            allowOutsideClick: false,
            didOpen: () => Swal.showLoading()
        })

        const { error } = await supabase
            .from('reservas')
            .delete()
            .eq('id', id)

        Swal.close()

        if (error) throw error

        Swal.fire({
            icon: 'success',
            title: 'Eliminado',
            timer: 1200,
            showConfirmButton: false
        })

        mostrarReservas()

    } catch (err) {
        console.error(err)

        Swal.fire({
            icon: 'error',
            title: 'Error',
            text: 'No se pudo eliminar la reserva'
        })
    }
}

// 🔥 cerrar sesión
function cerrarSesion() {

    Swal.fire({
        title: '¿Cerrar sesión?',
        icon: 'question',
        showCancelButton: true,
        confirmButtonText: 'Sí, salir',
        cancelButtonText: 'Cancelar'
    }).then(result => {

        if (result.isConfirmed) {
            localStorage.removeItem("usuario")
            window.location.href = "../index.html"
        }

    })
}

window.cerrarSesion = cerrarSesion

// 🚀 init
mostrarReservas()