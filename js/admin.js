import { SUPABASE_URL, SUPABASE_ANON_KEY } from './config-public.js'
import { createClient } from 'https://cdn.jsdelivr.net/npm/@supabase/supabase-js/+esm'

const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY)

const tbody = document.querySelector("#tablaReservas tbody")

async function mostrarReservas(){

    tbody.innerHTML = ""

    try{

        const { data, error } = await supabase
        .from('reservas')
        .select('*')
        .order('horario', { ascending: true })

        if(error) throw error

        data.forEach((reserva) => {

            const fila = document.createElement("tr")

            fila.innerHTML = `
                <td data-label="Socio">${reserva.usuario}</td>
                <td data-label="Dosis">${reserva.dosis}</td>
                <td data-label="Horario">${reserva.horario}</td>
                <td data-label="Variedad">${reserva.variedad}</td>
                <td data-label="Acción">
                    <button onclick="eliminarReserva('${reserva.id}')">
                        Eliminar
                    </button>
                </td>
            `

            tbody.appendChild(fila)

        })

    }catch(err){
        console.error("Error cargando reservas:", err)
    }

}

async function eliminarReserva(id){

    if(!confirm("¿Eliminar esta reserva?")) return

    try{

        const { error } = await supabase
        .from('reservas')
        .delete()
        .eq('id', id)

        if(error) throw error

        mostrarReservas()

    }catch(err){
        console.error("Error eliminando reserva:", err)
    }

}

function cerrarSesion(){
    localStorage.removeItem("usuario")
    localStorage.removeItem("rol")
    window.location.href = "../index.html"
}

window.eliminarReserva = eliminarReserva
window.cerrarSesion = cerrarSesion

mostrarReservas()