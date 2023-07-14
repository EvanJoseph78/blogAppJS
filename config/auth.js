const localStrategy = require("passport-local").Strategy // usado para autenticar o usuário
const mongoose = require("mongoose")
const bcrypt = require("bcryptjs")  // usado aqui para comparar os hashs

// Model do usuário
require("../models/Usuario")
const Usuario = mongoose.model("usuarios")

module.exports = function (passport) {
    passport.use(new localStrategy({ usernameField: 'email', passwordField: 'senha' }, (email, senha, done) => {
        Usuario.findOne({ email: email }).then((usuario) => {
            // verifica se o usuário não está no sistema
            if (!usuario) {
                return done(null, false, { message: "Esta conta não existe!" })
            }

            // se estiver compara as senhas com a senha do email cadastrado no banco

            bcrypt.compare(senha, usuario.senha, (erro, batem) => {
                if (batem) {
                    // se as senhas forem iguais retorna o usuário
                    return done(null, usuario)

                } else {
                    // se não forem iguais retorna false e a mensagem de senha incorreta
                    return done(null, false, { message: "Senha incorreta" })
                }
            })
        })
    }))

    passport.serializeUser((usuario, done) => {
        done(null, usuario.id)
    })


    passport.deserializeUser((id, done) => {
        Usuario.findById(id).then((usuario) => {
            done(null, usuario)
        }).catch((err) => {
            done(null, false, {message: 'Algo deu errado'})
        })

    })

    


}