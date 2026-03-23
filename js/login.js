import { SUPABASE_URL, SUPABASE_ANON_KEY } from './config-public.js'
import { createClient } from 'https://cdn.jsdelivr.net/npm/@supabase/supabase-js/+esm'

const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY)

const formulario = document.getElementById("loginForm")

formulario.addEventListener("submit", async function(e){

e.preventDefault()

const usuarioIngresado = document.getElementById("usuario").value
const passwordIngresado = document.getElementById("password").value

try{

const { data, error } = await supabase
.from("usuarios")
.select("*")
.eq("usuario", usuarioIngresado)
.eq("password", passwordIngresado)
.single()

if(error || !data){

alert("Usuario o contraseña incorrectos")
return

}

// guardar sesión
localStorage.setItem("usuario", JSON.stringify(data))

console.log("Login correcto:", data)

// verificar si debe cambiar contraseña
if(data.cambiar_password){

window.location.href = "pages/cambiarclave.html"
return

}

// redirección según rol
if(data.rol === "admin"){

window.location.href = "pages/admin.html"

}else{

window.location.href = "pages/panel.html"

}

}catch(err){

console.error("Error en login:", err)
alert("Error al iniciar sesión")

}

})