import { SUPABASE_URL, SUPABASE_ANON_KEY } from './config-public.js'
import { createClient } from 'https://cdn.jsdelivr.net/npm/@supabase/supabase-js/+esm'

const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY)

const formulario = document.getElementById("formCambiarClave")

formulario.addEventListener("submit", async (e) => {

  e.preventDefault()

  const nuevaClave = document.getElementById("nuevaPassword").value
  const confirmarClave = document.getElementById("confirmarPassword").value

  const usuario = JSON.parse(localStorage.getItem("usuario"))

  if(nuevaClave !== confirmarClave){
    alert("Las contraseñas no coinciden")
    return
  }

  try {

    const { error } = await supabase
      .from("usuarios")
      .update({
        password: nuevaClave,
        cambiar_password: false
      })
      .eq("id", usuario.id)

    if(error) throw error

    alert("Contraseña actualizada correctamente")

    // 🔥 actualizar localStorage
    usuario.cambiar_password = false
    localStorage.setItem("usuario", JSON.stringify(usuario))

    // 🔥 redirección
    if(usuario.rol === "admin"){
      window.location.href = "admin.html"
    } else {
      window.location.href = "panel.html"
    }

  } catch(err) {

    console.error("Error cambiando contraseña:", err)
    alert("No se pudo actualizar la contraseña")

  }

})

console.error("Error cambiando contraseña:", err)
alert(JSON.stringify(err))