import { SUPABASE_URL, SUPABASE_ANON_KEY } from './config-public.js'
import { createClient } from 'https://cdn.jsdelivr.net/npm/@supabase/supabase-js/+esm'

const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY)

const formulario = document.getElementById("loginForm")

// 👁 MOSTRAR / OCULTAR PASSWORD
const passwordInput = document.getElementById("password")
const togglePassword = document.getElementById("togglePassword")

togglePassword.addEventListener("click", () => {
  passwordInput.type = passwordInput.type === "password" ? "text" : "password"
})

// 🚀 LOGIN
formulario.addEventListener("submit", async function(e){

  e.preventDefault()

  const usuarioIngresado = document.getElementById("usuario").value.trim()
  const passwordIngresado = document.getElementById("password").value.trim()

  if(!usuarioIngresado || !passwordIngresado){
    Swal.fire({
      icon: 'warning',
      title: 'Campos incompletos',
      text: 'Ingresá usuario y contraseña'
    })
    return
  }

  try{

    Swal.fire({
      title: 'Ingresando...',
      text: 'Verificando datos',
      allowOutsideClick: false,
      didOpen: () => Swal.showLoading()
    })

    const { data, error } = await supabase
      .from("usuarios")
      .select("id, rol, cambiar_password")
      .eq("usuario", usuarioIngresado)
      .eq("password", passwordIngresado)
      .single()

    Swal.close()

    if(error || !data){
      Swal.fire({
        icon: 'error',
        title: 'Error',
        text: 'Usuario o contraseña incorrectos'
      })
      return
    }

    // 🔥 FIX CLAVE
    localStorage.setItem("usuario", JSON.stringify({
      id: data.id,
      usuario: usuarioIngresado,
      rol: data.rol,
      cambiar_password: data.cambiar_password,
      login: true
    }))

    await Swal.fire({
      icon: 'success',
      title: 'Bienvenido',
      text: 'Acceso correcto',
      timer: 1200,
      showConfirmButton: false
    })

    if(data.cambiar_password){
      window.location.href = "pages/cambiarclave.html"
      return
    }

    if(data.rol === "admin"){
      window.location.href = "pages/admin.html"
    } else {
      window.location.href = "pages/panel.html"
    }

  } catch(err){

    console.error("Error en login:", err)

    Swal.fire({
      icon: 'error',
      title: 'Error',
      text: 'No se pudo iniciar sesión'
    })

  }

})