import { SUPABASE_URL, SUPABASE_ANON_KEY } from './config-public.js'
import { createClient } from 'https://cdn.jsdelivr.net/npm/@supabase/supabase-js/+esm'

const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY)

const formulario = document.getElementById("formCambiarClave")

// 👁 MOSTRAR / OCULTAR PASSWORD
function togglePassword(inputId, toggleId) {
  const input = document.getElementById(inputId)
  const toggle = document.getElementById(toggleId)

  toggle.addEventListener("click", () => {
    input.type = input.type === "password" ? "text" : "password"
  })
}

togglePassword("nuevaPassword", "toggleNueva")
togglePassword("confirmarPassword", "toggleConfirmar")


// 🚀 CAMBIAR CONTRASEÑA
formulario.addEventListener("submit", async (e) => {

  e.preventDefault()

  const nuevaClave = document.getElementById("nuevaPassword").value.trim()
  const confirmarClave = document.getElementById("confirmarPassword").value.trim()

  const usuario = JSON.parse(localStorage.getItem("usuario"))

  // 🔴 Validar sesión
  if(!usuario || !usuario.id){
    await Swal.fire({
      icon: 'error',
      title: 'Sesión inválida',
      text: 'Volvé a iniciar sesión'
    })
    window.location.href = "../index.html"
    return
  }

  // 🔴 Validar contraseñas iguales
  if(nuevaClave !== confirmarClave){
    Swal.fire({
      icon: 'warning',
      title: 'Error',
      text: 'Las contraseñas no coinciden'
    })
    return
  }

  // 🔴 Validar seguridad mínima
  if(nuevaClave.length < 6){
    Swal.fire({
      icon: 'warning',
      title: 'Contraseña débil',
      text: 'Debe tener al menos 6 caracteres'
    })
    return
  }

  try {

    // ⏳ loader
    Swal.fire({
      title: 'Actualizando contraseña...',
      allowOutsideClick: false,
      didOpen: () => Swal.showLoading()
    })

    // 🔥 GUARDAR SIN HASH (CLAVE DEL ARREGLO)
    const { error } = await supabase
      .from("usuarios")
      .update({
        password: nuevaClave,
        cambiar_password: false
      })
      .eq("id", usuario.id)

    Swal.close()

    if(error) throw error

    // ✅ éxito
    await Swal.fire({
      icon: 'success',
      title: 'Contraseña actualizada',
      text: 'Se guardó correctamente',
      confirmButtonColor: '#2e7d32'
    })

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

    Swal.fire({
      icon: 'error',
      title: 'Error',
      text: 'No se pudo actualizar la contraseña'
    })

  }

})