import { SUPABASE_URL, SUPABASE_ANON_KEY } from './config-public.js'
import { createClient } from 'https://cdn.jsdelivr.net/npm/@supabase/supabase-js/+esm'

const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY)

const formulario = document.getElementById("formCambiarClave")

formulario.addEventListener("submit", async (e) => {

e.preventDefault()

const nuevaClave = document.getElementById("nuevaPassword").value
const confirmarClave = document.getElementById("confirmarPassword").value

const usuario = localStorage.getItem("usuario")

if(nuevaClave !== confirmarClave){
alert("Las contraseñas no coinciden")
return
}

try{

const { error } = await supabase
.from("usuarios")
.update({
password: nuevaClave,
cambiar_password: false
})
.eq("usuario", usuario)

if(error) throw error

alert("Contraseña actualizada correctamente")

const rol = localStorage.getItem("rol")

if(rol === "admin"){
window.location.href = "admin.html"
}else{
window.location.href = "panel.html"
}

}catch(err){

console.error("Error cambiando contraseña:", err)
alert("No se pudo actualizar la contraseña")

}

})